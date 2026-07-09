import {
	interpretarComandoComIA
} from "../interpretadorIA.js";
import { construirCrenças as construirCrencas } from "./beliefs.js";
import { detectarDesejo } from "./desires.js";
import { planejarIntenção as planejarIntencao } from "./intentions.js";
import { avaliarSegurança as avaliarSeguranca } from "./safetyGuard.js";
import { montarTraceSequencial } from "./trace.js";
import {
	aplicarMemoriaPendente,
	avaliarCamposFaltantes,
	obterPendenciaMaisRecente
} from "./memoriaComando.js";
import {
	atualizarPaginaPorComando,
	concluirLivroPorComando,
	consultarSocialPorComando,
	criarLivroPorComando,
	excluirLivroPorComando
} from "./tools.js";

const executoresFerramentas = {
	// Mapa entre a ferramenta proposta pelo LLM e a funcao real do CLP.
	// Isso evita um switch de decisao: a ferramenta escolhida vira execucao.
	criar_livro: ({ intencao, usuarioId }) => criarLivroPorComando(usuarioId, intencao.parametros),
	atualizar_pagina: ({ intencao, usuarioId }) => atualizarPaginaPorComando(usuarioId, intencao.parametros),
	excluir_livro: ({ intencao, usuarioId, confirmar }) => excluirLivroPorComando(usuarioId, intencao.parametros, confirmar),
	concluir_livro: ({ intencao, usuarioId, nomeUsuario }) => concluirLivroPorComando(usuarioId, nomeUsuario, intencao.parametros),
	consultar_social: ({ intencao }) => consultarSocialPorComando(intencao.parametros)
};

async function executarFerramenta({ intencao, usuarioId, nomeUsuario, confirmar }) {
	const executor = executoresFerramentas[intencao.acao];

	if (!executor) {
		return {
			sucesso: false,
			mensagem: "Nao entendi o pedido. Tente falar algo como: crie um livro, atualize a pagina, conclua ou mostre avaliacoes."
		};
	}

	return executor({ intencao, usuarioId, nomeUsuario, confirmar });
}

function montarMensagemPendencia(camposFaltantes) {
	const nomesCampos = {
		titulo: "titulo do livro",
		paginas: "quantidade de paginas",
		categoria: "genero ou categoria",
		paginaAtual: "pagina atual",
		avaliacao: "avaliacao",
		descricao: "comentario da avaliacao"
	};

	const campos = camposFaltantes.map((campo) => nomesCampos[campo] || campo).join(" e ");
	return `Preciso que voce informe ${campos} para continuar.`;
}

function normalizarInterpretacaoConfirmada(interpretacaoConfirmada) {
	if (!interpretacaoConfirmada?.acao) {
		return null;
	}

	return {
		acao: interpretacaoConfirmada.acao,
		parametros: interpretacaoConfirmada.parametros || {},
		origem: interpretacaoConfirmada.origem || "openai"
	};
}

function montarPendenciaDeclaradaPeloLLM({ texto, intencao }) {
	const parametros = intencao.parametros || {};

	return {
		sucesso: false,
		mensagem: parametros.mensagem || "Preciso de mais informacoes para continuar.",
		pendencia: {
			ativa: true,
			acao: parametros.acaoPretendida,
			parametrosParciais: parametros.parametrosParciais || {},
			camposFaltantes: parametros.camposFaltantes || [],
			textoOriginal: texto
		}
	};
}

function montarRespostaAgente({ texto, interpretacao, crencas, desejo, intencao, seguranca, resultado }) {
	return {
		agente: "Assistente de Leitura BDI",
		acao: intencao.acao,
		origemInterpretacao: interpretacao.origem,
		parametros: intencao.parametros,
		...resultado,
		traceBDI: montarTraceSequencial({
			texto,
			interpretacao,
			crencas,
			desejo,
			intencao,
			seguranca,
			resultado
		})
	};
}

export async function executarAgenteBDI({ texto, usuarioId, nomeUsuario, confirmar, interpretacaoConfirmada }) {
	// 1) Crencas: observa o estado atual do sistema antes de decidir.
	const crencas = await construirCrencas({ usuarioId, texto, interpretacao: null });
	const pendenciaMaisRecente = obterPendenciaMaisRecente(crencas.historicoRecente);
	const interpretacaoConfirmadaNormalizada = normalizarInterpretacaoConfirmada(interpretacaoConfirmada);

	// 2) Percepcao via LLM: a OpenAI interpreta a observacao e escolhe uma tool.
	const interpretacaoInicial = interpretacaoConfirmadaNormalizada
		|| await interpretarComandoComIA(texto, {
			pendenciaAtiva: pendenciaMaisRecente,
			historicoRecente: crencas.historicoRecente,
			livrosDoUsuario: crencas.livrosDoUsuario
		});

	// 3) Memoria: se havia uma pendencia, o BDI registra que ela foi considerada.
	const interpretacao = aplicarMemoriaPendente({
		texto,
		interpretacaoAtual: interpretacaoInicial,
		pendencia: pendenciaMaisRecente
	});

	crencas.interpretacao = interpretacao;

	// 4) BDI: desejo, intencao e avaliacao de seguranca antes de agir.
	const desejo = detectarDesejo(interpretacao);
	const intencao = planejarIntencao({ desejo, crenças: crencas });
	const seguranca = avaliarSeguranca(intencao, confirmar);

	// 5) Se o LLM nao encontrou uma acao clara, o agente responde sem executar ferramenta.
	if (interpretacao.erroInterpretacao) {
		return montarRespostaAgente({
			texto,
			interpretacao,
			crencas,
			desejo,
			intencao,
			seguranca,
			resultado: {
				sucesso: false,
				mensagem: interpretacao.mensagem
			}
		});
	}

	// 6) Se o LLM identificou a acao mas faltam dados, criamos uma pendencia sequencial.
	if (interpretacao.acao === "solicitar_dados") {
		return montarRespostaAgente({
			texto,
			interpretacao,
			crencas,
			desejo,
			intencao,
			seguranca,
			resultado: montarPendenciaDeclaradaPeloLLM({ texto, intencao })
		});
	}

	// 7) Defesa adicional: se ainda faltou campo obrigatorio, nao executa acao incompleta.
	const camposFaltantes = avaliarCamposFaltantes(intencao.acao, intencao.parametros);

	if (camposFaltantes.length > 0) {
		const resultadoPendente = {
			sucesso: false,
			mensagem: montarMensagemPendencia(camposFaltantes),
			pendencia: {
				ativa: true,
				acao: intencao.acao,
				parametrosParciais: intencao.parametros,
				camposFaltantes,
				textoOriginal: pendenciaMaisRecente?.textoOriginal || texto
			}
		};

		return montarRespostaAgente({
			texto,
			interpretacao,
			crencas,
			desejo,
			intencao,
			seguranca,
			resultado: resultadoPendente
		});
	}

	// 8) Acoes sensiveis, como exclusao, exigem confirmacao do usuario.
	if (!seguranca.permitido) {
		const resultadoBloqueado = {
			sucesso: false,
			precisaConfirmacao: true,
			mensagem: seguranca.mensagem
		};

		return montarRespostaAgente({
			texto,
			interpretacao,
			crencas,
			desejo,
			intencao,
			seguranca,
			resultado: resultadoBloqueado
		});
	}

	// 9) Acao: com tudo validado, o BDI aciona a ferramenta interna do CLP.
	const resultado = await executarFerramenta({ intencao, usuarioId, nomeUsuario, confirmar });

	return montarRespostaAgente({
		texto,
		interpretacao,
		crencas,
		desejo,
		intencao,
		seguranca,
		resultado
	});
}
