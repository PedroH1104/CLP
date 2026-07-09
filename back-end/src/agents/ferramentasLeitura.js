import { livro, post } from "../models/index.js";

import { buscarImagemLivro, imagemPadrao } from "../services/imagemLivro.js";



const normalizar = (texto = "") =>

	texto

		.toString()

		.normalize("NFD")

		.replace(/[\u0300-\u036f]/g, "")

		.toLowerCase()

		.trim();

export const normalizarTituloParaBusca = (texto = "") =>

	normalizar(texto)

		.replace(/&/g, " e ")

		.replace(/[^a-z0-9]+/g, " ")

		.replace(/\s+/g, " ")

		.trim();



const escaparRegex = (texto = "") => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");



const stopwordsTitulo = new Set(["a", "o", "os", "as", "de", "do", "da", "dos", "das", "e", "um", "uma", "livro", "obra"]);



const palavrasRelevantes = (texto = "") =>

	normalizarTituloParaBusca(texto)

		.split(/\s+/)

		.map((palavra) => palavra.trim())

		.filter((palavra) => palavra.length > 1 && !stopwordsTitulo.has(palavra));



// Busca tolerante para ligar o titulo falado pelo usuario ao livro salvo.
async function encontrarLivroDoUsuario(usuarioId, titulo) {

	const livrosDoUsuario = await livro.find({ usuarioId });

	const tituloNormalizado = normalizarTituloParaBusca(titulo);



	return livrosDoUsuario.find((item) =>

		normalizarTituloParaBusca(item.titulo).includes(tituloNormalizado)

	);

}



// Ferramenta real: cria um livro no banco e tenta buscar a capa no Google Books.
export async function criarLivroPorComando(usuarioId, parametros) {

	if (!parametros.titulo || !parametros.paginas) {

		return {

			sucesso: false,

			mensagem: "Preciso do titulo e da quantidade de paginas para criar o livro."

		};

	}



	const imagem = parametros.imagem || await buscarImagemLivro(parametros.titulo);



	const novoLivro = await livro.create({

		usuarioId,

		titulo: parametros.titulo,

		paginas: parametros.paginas,

		categoria: parametros.categoria || "Outro",

		imagem: imagem || imagemPadrao

	});



	return {

		sucesso: true,

		mensagem: `Livro "${novoLivro.titulo}" criado com sucesso.`,

		dados: novoLivro

	};

}



export async function atualizarPaginaPorComando(usuarioId, parametros) {

	if (!parametros.titulo || Number.isNaN(parametros.paginaAtual)) {

		return {

			sucesso: false,

			mensagem: "Preciso saber o livro e a pagina atual para atualizar a leitura."

		};

	}



	const livroEncontrado = await encontrarLivroDoUsuario(usuarioId, parametros.titulo);



	if (!livroEncontrado) {

		return {

			sucesso: false,

			mensagem: `Nao encontrei um livro parecido com "${parametros.titulo}" na sua lista.`

		};

	}



	if (parametros.paginaAtual < 0 || parametros.paginaAtual > livroEncontrado.paginas) {

		return {

			sucesso: false,

			mensagem: `A pagina precisa estar entre 0 e ${livroEncontrado.paginas}.`

		};

	}



	livroEncontrado.paginaAtual = parametros.paginaAtual;

	livroEncontrado.concluido = false;

	await livroEncontrado.save();



	return {

		sucesso: true,

		mensagem: `Atualizei "${livroEncontrado.titulo}" para a pagina ${parametros.paginaAtual}.`,

		dados: livroEncontrado

	};

}



export async function excluirLivroPorComando(usuarioId, parametros, confirmar = false) {

	if (!parametros.titulo) {

		return {

			sucesso: false,

			mensagem: "Preciso saber qual livro voce quer excluir."

		};

	}



	const livroEncontrado = await encontrarLivroDoUsuario(usuarioId, parametros.titulo);



	if (!livroEncontrado) {

		return {

			sucesso: false,

			mensagem: `Nao encontrei um livro parecido com "${parametros.titulo}" na sua lista.`

		};

	}



	if (!confirmar) {

		return {

			sucesso: false,

			precisaConfirmacao: true,

			mensagem: `Voce quer mesmo excluir "${livroEncontrado.titulo}"? Essa acao nao pode ser desfeita.`,

			dados: { livroId: livroEncontrado._id, titulo: livroEncontrado.titulo }

		};

	}



	await livro.findByIdAndDelete(livroEncontrado._id);



	return {

		sucesso: true,

		mensagem: `Livro "${livroEncontrado.titulo}" excluido com sucesso.`

	};

}



// Ferramenta real: conclui a leitura e gera uma publicacao social com avaliacao.
export async function concluirLivroPorComando(usuarioId, nomeUsuario, parametros) {

	if (!parametros.titulo) {

		return {

			sucesso: false,

			mensagem: "Preciso saber qual livro voce concluiu."

		};

	}



	const livroEncontrado = await encontrarLivroDoUsuario(usuarioId, parametros.titulo);



	if (!livroEncontrado) {

		return {

			sucesso: false,

			mensagem: `Nao encontrei um livro parecido com "${parametros.titulo}" na sua lista.`

		};

	}



	const avaliacao = Math.min(Math.max(Number(parametros.avaliacao) || 5, 1), 5);



	livroEncontrado.paginaAtual = livroEncontrado.paginas;

	livroEncontrado.concluido = true;

	livroEncontrado.avaliacao = avaliacao;

	await livroEncontrado.save();



	const novoPost = await post.create({

		autor: usuarioId,

		nomeAutor: nomeUsuario || "Leitor",

		nomeLivro: livroEncontrado.titulo,

		descricao: parametros.descricao || "",

		avaliacao,

		imagem: livroEncontrado.imagem,

		data: new Date()

	});



	return {

		sucesso: true,

		mensagem: `Parabens pela leitura! Conclui "${livroEncontrado.titulo}" e publiquei sua avaliacao.`,

		dados: { livro: livroEncontrado, post: novoPost }

	};

}



// Ferramenta real: le publicacoes sociais e devolve um resumo para a interface.
export async function consultarSocialPorComando(parametros) {

	if (!parametros.titulo) {

		return {

			sucesso: false,

			mensagem: "Preciso saber sobre qual livro voce quer ver opinioes."

		};

	}



	const termosBusca = palavrasRelevantes(parametros.titulo);



	if (termosBusca.length === 0) {

		return {

			sucesso: false,

			mensagem: "Preciso saber sobre qual livro voce quer ver opinioes."

		};

	}



	const regexPalavras = termosBusca.map((termo) => new RegExp(escaparRegex(termo), "i"));

	const postsCandidatos = await post.find({

		$and: regexPalavras.map((regex) => ({ nomeLivro: regex }))

	}).sort({ data: -1 }).limit(5);



	const postsEncontrados = postsCandidatos.length > 0

		? postsCandidatos

		: await post.find({ nomeLivro: new RegExp(escaparRegex(parametros.titulo), "i") }).sort({ data: -1 }).limit(5);



	if (postsEncontrados.length === 0) {

		return {

			sucesso: true,

			mensagem: `Ainda nao encontrei avaliacoes sobre "${parametros.titulo}".`,

			dados: []

		};

	}



	const resumo = postsEncontrados.map((publicacao) => ({

		id: publicacao._id,

		autor: publicacao.nomeAutor,

		livro: publicacao.nomeLivro,

		avaliacao: publicacao.avaliacao,

		descricao: publicacao.descricao,

		imagem: publicacao.imagem,

		data: publicacao.data,

		curtidas: publicacao.curtidas || [],

		comentarios: publicacao.comentarios || []

	}));



	const livroEncontrado = resumo[0]?.livro || parametros.titulo;

	const media = resumo.reduce((total, publicacao) => total + (Number(publicacao.avaliacao) || 0), 0) / resumo.length;

	const totalPublicacoes = postsEncontrados.length;

	const termoPublicacao = totalPublicacoes === 1 ? "publicacao" : "publicacoes";



	return {

		sucesso: true,

		mensagem: `Encontrei ${totalPublicacoes} ${termoPublicacao} sobre "${livroEncontrado}". Nota media: ${media.toFixed(1)}.`,

		dados: resumo

	};

}
