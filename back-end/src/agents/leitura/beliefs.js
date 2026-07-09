import { agenteLog, livro, post } from "../../models/index.js";

// Crencas do agente: estado observado antes da decisao.
// Inclui biblioteca do usuario, posts sociais e historico recente do agente.

export async function construirCrenças({ usuarioId, texto, interpretacao }) {
	const [livrosDoUsuario, postsRecentes, historicoRecente] = await Promise.all([
		usuarioId ? livro.find({ usuarioId }).limit(50) : [],
		post.find({}).sort({ data: -1 }).limit(20),
		usuarioId ? agenteLog.find({ usuarioId }).sort({ data: -1 }).limit(10) : []
	]);

	return {
		usuarioId,
		textoOriginal: texto,
		interpretacao,
		livrosDoUsuario: livrosDoUsuario.map((item) => ({
			id: item._id,
			titulo: item.titulo,
			paginas: item.paginas,
			paginaAtual: item.paginaAtual,
			categoria: item.categoria,
			concluido: item.concluido,
			avaliacao: item.avaliacao
		})),
		postsRecentes: postsRecentes.map((item) => ({
			id: item._id,
			livro: item.nomeLivro,
			autor: item.nomeAutor,
			avaliacao: item.avaliacao,
			descricao: item.descricao
		})),
		historicoRecente: historicoRecente.map((item) => ({
			texto: item.texto,
			acao: item.acao,
			parametros: item.parametros || {},
			sucesso: item.sucesso,
			mensagem: item.mensagem,
			data: item.data,
			pendencia: item.pendencia
		}))
	};
}
