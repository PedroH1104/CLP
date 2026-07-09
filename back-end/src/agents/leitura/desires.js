// Desejo: traduz a acao proposta pelo LLM para o objetivo interno do agente.
const desejosPorAcao = {
	criar_livro: "manter_biblioteca",
	atualizar_pagina: "acompanhar_progresso",
	excluir_livro: "manter_biblioteca",
	concluir_livro: "registrar_conclusao",
	consultar_social: "consultar_opinioes",
	solicitar_dados: "coletar_dados_faltantes",
	desconhecida: "esclarecer_pedido"
};

export function detectarDesejo(interpretacao) {
	return {
		nome: desejosPorAcao[interpretacao.acao] || "esclarecer_pedido",
		acaoSolicitada: interpretacao.acao,
		parametros: interpretacao.parametros || {}
	};
}
