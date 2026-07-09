// Memoria sequencial: define quais dados uma acao precisa para poder ser executada.
const camposObrigatoriosPorAcao = {
	criar_livro: ["titulo", "paginas", "categoria"],
	atualizar_pagina: ["titulo", "paginaAtual"],
	excluir_livro: ["titulo"],
	concluir_livro: ["titulo", "avaliacao", "descricao"],
	consultar_social: ["titulo"]
};

const normalizar = (texto = "") =>
	texto
		.toString()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();

function valorInformado(valor) {
	if (typeof valor === "number") {
		return Number.isFinite(valor) && valor > 0;
	}

	return Boolean(valor);
}

function parametroUtil(campo, valor) {
	if (campo === "categoria" && normalizar(valor) === "outro") {
		return false;
	}

	return valorInformado(valor);
}

export function avaliarCamposFaltantes(acao, parametros = {}) {
	const camposObrigatorios = camposObrigatoriosPorAcao[acao] || [];
	return camposObrigatorios.filter((campo) => !parametroUtil(campo, parametros[campo]));
}

// Quando o LLM usa solicitar_dados mas ja trouxe tudo que faltava, promovemos
// a resposta para a ferramenta final. Isso evita pedir de novo o que ja chegou.
function promoverSolicitacaoCompleta({ interpretacaoAtual, pendencia }) {
	const parametros = interpretacaoAtual.parametros || {};
	const acaoPretendida = parametros.acaoPretendida;

	if (!pendencia?.ativa || interpretacaoAtual.acao !== "solicitar_dados" || acaoPretendida !== pendencia.acao) {
		return null;
	}

	const parametrosFinais = {
		...(pendencia.parametrosParciais || {}),
		...(parametros.parametrosParciais || {})
	};
	const camposAindaFaltantes = avaliarCamposFaltantes(acaoPretendida, parametrosFinais);

	if (camposAindaFaltantes.length > 0) {
		return null;
	}

	const camposFaltantesAntes = pendencia.camposFaltantes || [];

	return {
		...interpretacaoAtual,
		acao: acaoPretendida,
		parametros: parametrosFinais,
		memoria: {
			usouPendencia: true,
			camposFaltantesAntes,
			parametrosPendentes: pendencia.parametrosParciais || {},
			parametrosPropostosPelaIA: parametrosFinais,
			camposPreenchidosPelaIA: camposFaltantesAntes
		}
	};
}

export function aplicarMemoriaPendente({ interpretacaoAtual, pendencia }) {
	// A memoria nao extrai dados por regra. Ela apenas registra que o LLM usou
	// a pendencia e preserva os parametros finais propostos por ele.
	const solicitacaoCompleta = promoverSolicitacaoCompleta({ interpretacaoAtual, pendencia });

	if (solicitacaoCompleta) {
		return solicitacaoCompleta;
	}

	if (!pendencia?.ativa || interpretacaoAtual.acao !== pendencia.acao) {
		return interpretacaoAtual;
	}

	const camposFaltantesAntes = pendencia.camposFaltantes || [];
	const camposPreenchidosPelaIA = camposFaltantesAntes.filter((campo) =>
		parametroUtil(campo, interpretacaoAtual.parametros?.[campo])
	);

	return {
		...interpretacaoAtual,
		memoria: {
			usouPendencia: true,
			camposFaltantesAntes,
			parametrosPendentes: pendencia.parametrosParciais || {},
			parametrosPropostosPelaIA: interpretacaoAtual.parametros || {},
			camposPreenchidosPelaIA
		}
	};
}

export function obterPendenciaMaisRecente(historicoRecente = []) {
	const ultimoRegistro = historicoRecente[0];
	return ultimoRegistro?.pendencia?.ativa ? ultimoRegistro.pendencia : null;
}
