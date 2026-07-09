// Intencao: define o plano interno que o BDI pretende seguir para realizar o desejo.
const planosPorAcao = {
	criar_livro: ["validar_campos", "buscar_capa", "criar_livro"],
	atualizar_pagina: ["localizar_livro", "validar_pagina", "atualizar_progresso"],
	excluir_livro: ["localizar_livro", "confirmar_exclusao", "excluir_livro"],
	concluir_livro: ["localizar_livro", "registrar_conclusao", "publicar_post"],
	consultar_social: ["buscar_publicacoes", "resumir_opinioes"],
	solicitar_dados: ["registrar_pendencia", "pedir_dados_faltantes"],
	desconhecida: ["pedir_reformulacao"]
};

export function planejarIntenção({ desejo, crenças }) {
	const acao = desejo.acaoSolicitada;

	return {
		acao,
		desejo: desejo.nome,
		parametros: desejo.parametros,
		plano: planosPorAcao[acao] || planosPorAcao.desconhecida,
		contexto: {
			totalLivrosUsuario: crenças.livrosDoUsuario.length,
			totalPostsRecentes: crenças.postsRecentes.length
		}
	};
}
