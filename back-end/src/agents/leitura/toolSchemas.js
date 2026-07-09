export const nomesFerramentasLeitura = [
	"criar_livro",
	"atualizar_pagina",
	"excluir_livro",
	"concluir_livro",
	"consultar_social",
	"solicitar_dados",
	"comando_desconhecido"
];

// Catalogo de acoes que o LLM pode escolher. Para a apresentacao, este arquivo
// representa o espaco de ferramentas disponivel para o agente de leitura.
export const categoriasPermitidas = [
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

const propriedadesBase = {
	titulo: {
		type: "string",
		description: "Nome exato do livro, sem incluir pagina, genero, nota ou comentario."
	},
	paginas: {
		type: "integer",
		description: "Quantidade total de paginas do livro. Use 0 se nao for informada."
	},
	paginaAtual: {
		type: "integer",
		description: "Pagina atual de leitura. Use 0 se nao for informada."
	},
	categoria: {
		type: "string",
		enum: categoriasPermitidas,
		description: "Genero ou categoria do livro. Use Outro se nao for informado."
	},
	avaliacao: {
		type: "integer",
		description: "Nota de 1 a 5 estrelas. Use 0 se nao for informada."
	},
	descricao: {
		type: "string",
		description: "Comentario textual da avaliacao. Use string vazia se nao for informado."
	},
	acaoPretendida: {
		type: "string",
		enum: [
			"criar_livro",
			"atualizar_pagina",
			"excluir_livro",
			"concluir_livro",
			"consultar_social"
		],
		description: "Acao de leitura que o usuario deseja executar depois que os dados faltantes forem informados."
	},
	camposFaltantes: {
		type: "array",
		items: {
			type: "string",
			enum: ["titulo", "paginas", "categoria", "paginaAtual", "avaliacao", "descricao"]
		},
		description: "Campos obrigatorios que ainda faltam para executar a acao pretendida."
	},
	mensagem: {
		type: "string",
		description: "Mensagem curta pedindo que o usuario reformule o comando quando nao houver intencao de leitura clara."
	}
};

function criarTool({ nome, descricao, propriedades, obrigatorios }) {
	return {
		type: "function",
		function: {
			name: nome,
			description: descricao,
			strict: true,
			parameters: {
				type: "object",
				additionalProperties: false,
				properties: propriedades,
				required: obrigatorios
			}
		}
	};
}

// Essas definicoes sao enviadas para a OpenAI via tool calling. O modelo nao
// recebe apenas texto solto: ele recebe ferramentas nomeadas, descricoes e schemas.
export const ferramentasOpenAI = [
	criarTool({
		nome: "criar_livro",
		descricao: "Cadastrar um novo livro na biblioteca do usuario.",
		propriedades: {
			titulo: propriedadesBase.titulo,
			paginas: propriedadesBase.paginas,
			categoria: propriedadesBase.categoria
		},
		obrigatorios: ["titulo", "paginas", "categoria"]
	}),
	criarTool({
		nome: "atualizar_pagina",
		descricao: "Atualizar a pagina atual de leitura de um livro existente.",
		propriedades: {
			titulo: propriedadesBase.titulo,
			paginaAtual: propriedadesBase.paginaAtual
		},
		obrigatorios: ["titulo", "paginaAtual"]
	}),
	criarTool({
		nome: "excluir_livro",
		descricao: "Excluir um livro da biblioteca do usuario.",
		propriedades: {
			titulo: propriedadesBase.titulo
		},
		obrigatorios: ["titulo"]
	}),
	criarTool({
		nome: "concluir_livro",
		descricao: "Concluir uma leitura, registrar avaliacao e publicar na area social.",
		propriedades: {
			titulo: propriedadesBase.titulo,
			avaliacao: propriedadesBase.avaliacao,
			descricao: propriedadesBase.descricao
		},
		obrigatorios: ["titulo", "avaliacao", "descricao"]
	}),
	criarTool({
		nome: "consultar_social",
		descricao: "Consultar avaliacoes, comentarios ou publicacoes sociais sobre um livro.",
		propriedades: {
			titulo: propriedadesBase.titulo
		},
		obrigatorios: ["titulo"]
	}),
	criarTool({
		nome: "solicitar_dados",
		descricao: "Usar quando existe uma acao de leitura clara, mas faltam dados obrigatorios para executar a ferramenta final.",
		propriedades: {
			acaoPretendida: propriedadesBase.acaoPretendida,
			camposFaltantes: propriedadesBase.camposFaltantes,
			titulo: propriedadesBase.titulo,
			paginas: propriedadesBase.paginas,
			paginaAtual: propriedadesBase.paginaAtual,
			categoria: propriedadesBase.categoria,
			avaliacao: propriedadesBase.avaliacao,
			descricao: propriedadesBase.descricao,
			mensagem: {
				type: "string",
				description: "Mensagem curta pedindo os campos faltantes ao usuario."
			}
		},
		obrigatorios: [
			"acaoPretendida",
			"camposFaltantes",
			"titulo",
			"paginas",
			"paginaAtual",
			"categoria",
			"avaliacao",
			"descricao",
			"mensagem"
		]
	}),
	criarTool({
		nome: "comando_desconhecido",
		descricao: "Usar quando o comando nao indicar claramente uma acao de leitura suportada pelo CLP.",
		propriedades: {
			mensagem: propriedadesBase.mensagem
		},
		obrigatorios: ["mensagem"]
	})
];
