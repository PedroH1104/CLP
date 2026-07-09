const categorias = [
	"Romance",
	"Ficção científica",
	"Fantasia",
	"Terror",
	"Suspense",
	"Drama",
	"Comédia",
	"Biografia",
	"Autobiografia",
	"Fábula",
	"Aventura",
	"Infantil",
	"Outro"
];

const normalizar = (texto = "") =>
	texto
		.toString()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();

const removerPontas = (texto = "") =>
	texto
		.replace(/^[\s,.;:!?]+|[\s,.;:!?]+$/g, "")
		.trim();

const limparTitulo = (titulo = "") =>
	removerPontas(titulo)
		.replace(/^(?:o\s+|a\s+|um\s+|uma\s+)?(?:livro|obra)\s+/i, "")
		.replace(/\b(?:d[ao]s?\s+)?(?:genero|gênero|categoria)\b.*$/i, "")
		.replace(/\b(?:com|de|possui|tem)\s+\d+\s*p[aá]ginas?\b.*$/i, "")
		.replace(/\b(?:para\s+a?\s*)?p[aá]gina\s*\d+\b.*$/i, "")
		.replace(/\b(?:nota|avaliacao|avaliação|comentario|comentário)\b.*$/i, "")
		.replace(/\b(d[ao]s?|de)\s*$/i, "")
		.replace(/^[\s,.;:!?]+|[\s,.;:!?]+$/g, "")
		.trim();

const extrairTitulo = (texto) => {
	const padroes = [
		/(?:conclui|concluir|terminei|finalizei|finalizar)\s+(?:o\s+livro\s+)?(.+?)(?:\s+com\s+nota|\s+nota|\s+coment[aá]rio|$)/i,
		/(?:achando|acharam|falaram|pensam|opinam)\s+(?:sobre|do|da|de)\s+(?:o\s+livro\s+|a\s+obra\s+)?(.+)$/i,
		/(?:busca|buscar|busque|mostre|mostrar|procure|ver)\s+(?:coment[aá]rios|avalia[cç][oõ]es|opini[oõ]es|posts|publica[cç][oõ]es)?\s*(?:sobre|do|da|de)\s+(?:o\s+livro\s+|a\s+obra\s+)?(.+)$/i,
		/(?:atualize|atualizar|coloque)\s+(?:o\s+progresso\s+de\s+|o\s+livro\s+|a\s+obra\s+)?(.+?)(?:\s+para\s+a?\s*p[aá]gina|\s+na\s+p[aá]gina|$)/i,
		/(?:estou)\s+(?:na\s+)?p[aá]gina\s*\d+\s+(?:do|da|de)\s+(?:o\s+livro\s+|a\s+obra\s+)?(.+)$/i,
		/(?:exclua|excluir|delete|deletar|remova|remover)\s+(?:o\s+livro\s+|a\s+obra\s+)?(.+?)(?:\s+da\s+minha\s+lista|\s+do\s+meu\s+catalogo|$)/i,
		/(?:chamado|chamada|titulo|título)\s+(.+?)(?:\s*,?\s+(?:com|de|possui|tem)\s+\d+\s*p[aá]ginas?|\s*,?\s+d[ao]s?\s+(?:genero|gênero|categoria)|\s+(?:genero|gênero|categoria)|$)/i,
		/(?:crie|criar|adicione|adicionar|cadastre|cadastrar)\s+(?:o\s+|um\s+|uma\s+)?(?:livro\s+|obra\s+)?(.+?)(?:\s*,?\s+(?:com|de|possui|tem)\s+\d+\s*p[aá]ginas?|\s*,?\s+d[ao]s?\s+(?:genero|gênero|categoria)|\s+(?:genero|gênero|categoria)|$)/i,
		/(?:livro)\s+(.+?)(?:\s+para\s+a?\s*p[aá]gina|\s+na\s+p[aá]gina|\s*,?\s+(?:com|de)\s+\d+\s*p[aá]ginas?|\s*,?\s+d[ao]s?\s+(?:genero|gênero|categoria)|\s+(?:genero|gênero|categoria)|$)/i,
		/(?:sobre|do|da)\s+(?:o\s+livro\s+|a\s+obra\s+)?(.+)$/i
	];

	for (const padrao of padroes) {
		const encontrado = texto.match(padrao);
		if (encontrado?.[1]) return limparTitulo(encontrado[1]);
	}

	return "";
};

const extrairCategoria = (texto) => {
	const textoNormalizado = normalizar(texto);
	const categoriaEncontrada = categorias.find((categoria) =>
		textoNormalizado.includes(normalizar(categoria))
	);

	return categoriaEncontrada || "Outro";
};

const extrairComentario = (texto) => {
	const encontrado = texto.match(/(?:coment[aá]rio|descri[cç][aã]o)\s*:?\s*(.+)$/i);
	return encontrado?.[1]?.trim() || "";
};

export function interpretarComandoDataset(texto = "") {
	const textoNormalizado = normalizar(texto);
	const titulo = extrairTitulo(texto);
	const paginas = Number(texto.match(/(\d+)\s*p[aá]ginas?/i)?.[1]);
	const matchPagina = texto.match(/p[aá]gina\s*(\d+)|para\s+a?\s*p[aá]gina\s*(\d+)/i);
	const paginaAtual = Number(matchPagina?.[1] || matchPagina?.[2]);
	const avaliacao = Number(texto.match(/(?:nota|avalia[cç][aã]o)\s*(\d+)/i)?.[1]);

	if (/(crie|criar|adicione|adicionar|cadastre|cadastrar)/.test(textoNormalizado)) {
		return {
			acao: "criar_livro",
			parametros: {
				titulo,
				paginas,
				categoria: extrairCategoria(texto)
			}
		};
	}

	if (/(exclua|excluir|delete|deletar|remova|remover)/.test(textoNormalizado)) {
		return {
			acao: "excluir_livro",
			parametros: { titulo }
		};
	}

	if (/(conclui|concluir|terminei|finalizei|finalizar)/.test(textoNormalizado)) {
		return {
			acao: "concluir_livro",
			parametros: {
				titulo,
				avaliacao: avaliacao || 5,
				descricao: extrairComentario(texto)
			}
		};
	}

	if (/(pagina|página|progresso|atualize|atualizar|coloque)/.test(textoNormalizado)) {
		return {
			acao: "atualizar_pagina",
			parametros: {
				titulo,
				paginaAtual
			}
		};
	}

	if (/(comentarios|comentários|avaliacoes|avaliações|opinioes|opiniões|postagens|posts|social|mostre|buscar|busque|achando|acharam|falaram|pensam|opinam)/.test(textoNormalizado)) {
		return {
			acao: "consultar_social",
			parametros: { titulo }
		};
	}

	return {
		acao: "desconhecida",
		parametros: { titulo }
	};
}
