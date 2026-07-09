const ferramentasPorAcao = {
	criar_livro: "criarLivroPorComando",
	atualizar_pagina: "atualizarPaginaPorComando",
	excluir_livro: "excluirLivroPorComando",
	concluir_livro: "concluirLivroPorComando",
	consultar_social: "consultarSocialPorComando",
	solicitar_dados: "registrarPendenciaDoAgente",
	desconhecida: "nenhuma"
};

// Trace de auditoria: transforma o ciclo interno do agente em etapas legiveis
// para a aba administrativa e para a apresentacao do projeto.
function resumirDadosResultado(resultado = {}) {
	if (Array.isArray(resultado.dados)) {
		return {
			totalItens: resultado.dados.length,
			imagemEncontrada: resultado.dados.some((item) => Boolean(item.imagem))
		};
	}

	return {
		id: resultado.dados?._id?.toString?.() || resultado.dados?.id || resultado.dados?.livroId,
		titulo: resultado.dados?.titulo || resultado.dados?.livro?.titulo,
		imagemEncontrada: Boolean(resultado.dados?.imagem || resultado.dados?.livro?.imagem),
		postGerado: Boolean(resultado.dados?.post)
	};
}

function montarEtapaMemoria(interpretacao = {}) {
	const memoria = interpretacao.memoria;

	if (!memoria?.usouPendencia) {
		return null;
	}

	return {
		tipo: "memoria",
		titulo: "Memoria recuperada",
		descricao: "O BDI recuperou uma pendencia anterior e enviou esse contexto para o LLM antes da decisao.",
		detalhes: {
			usouPendencia: true,
			camposFaltantesAntes: memoria.camposFaltantesAntes || [],
			camposPreenchidosPelaIA: memoria.camposPreenchidosPelaIA || [],
			parametrosPendentes: memoria.parametrosPendentes || {},
			parametrosPropostosPelaIA: memoria.parametrosPropostosPelaIA || interpretacao.parametros || {}
		}
	};
}

function montarEtapaPercepcao(interpretacao = {}) {
	const usouMemoria = Boolean(interpretacao.memoria?.usouPendencia);

	return {
		tipo: "percepcao",
		titulo: usouMemoria ? "Percepcao contextual" : "Percepcao",
		descricao: usouMemoria
			? "O comando foi interpretado pelo LLM junto com a pendencia recuperada."
			: "O comando foi interpretado para identificar intencao e parametros.",
		detalhes: {
			origem: interpretacao.origem,
			acaoDetectada: interpretacao.acao,
			contextoAplicado: usouMemoria ? "pendencia_ativa" : "nenhum",
			parametrosExtraidos: interpretacao.parametros || {},
			memoria: interpretacao.memoria || null
		}
	};
}

function montarEtapaPlanoLLM(interpretacao = {}) {
	const plano = interpretacao.deliberacaoLLM;

	if (!plano) {
		return null;
	}

	return {
		tipo: "plano_llm",
		titulo: "Plano proposto pelo LLM",
		descricao: "O modelo analisou a observacao, o historico e as ferramentas disponiveis para propor uma acao.",
		detalhes: {
			ferramentaProposta: plano.ferramentaProposta || "nenhuma",
			parametrosPropostos: plano.parametrosPropostos || {},
			usouPendenciaNoPrompt: Boolean(plano.usouPendenciaNoPrompt),
			totalHistoricoConsiderado: Number(plano.totalHistoricoConsiderado) || 0,
			totalLivrosConsiderados: Number(plano.totalLivrosConsiderados) || 0
		}
	};
}

export function montarTraceSequencial({
	texto,
	interpretacao,
	crencas,
	desejo,
	intencao,
	seguranca,
	resultado
}) {
	// Ordem que aparece na aba Agente: observacao -> interpretacao/memoria
	// -> deliberacao BDI -> planejamento -> seguranca -> acao -> resultado.
	const ferramentaEscolhida = ferramentasPorAcao[intencao.acao] || "nenhuma";
	const etapaPlanoLLM = montarEtapaPlanoLLM(interpretacao);
	const etapaMemoria = montarEtapaMemoria(interpretacao);
	const etapaPercepcao = montarEtapaPercepcao(interpretacao);
	const etapasInterpretacao = etapaMemoria
		? [
			etapaMemoria,
			...(etapaPlanoLLM ? [etapaPlanoLLM] : []),
			etapaPercepcao
		]
		: [
			etapaPercepcao,
			...(etapaPlanoLLM ? [etapaPlanoLLM] : [])
		];

	const etapas = [
		{
			tipo: "observacao",
			titulo: "Observacao recebida",
			descricao: "O agente recebeu um comando externo do usuario.",
			detalhes: {
				texto
			}
		},
		...etapasInterpretacao,
		{
			tipo: "deliberacao",
			titulo: "Deliberacao",
			descricao: "O agente comparou a intencao com o estado atual do sistema.",
			detalhes: {
				desejo: desejo.nome,
				acaoSolicitada: desejo.acaoSolicitada,
				totalLivrosUsuario: crencas.livrosDoUsuario.length,
				totalPostsRecentes: crencas.postsRecentes.length
			}
		},
		{
			tipo: "plano",
			titulo: "Planejamento",
			descricao: "O agente definiu uma sequencia de passos antes de agir.",
			detalhes: {
				acao: intencao.acao,
				passos: intencao.plano || [],
				parametros: intencao.parametros || {}
			}
		},
		{
			tipo: "seguranca",
			titulo: "Avaliacao de seguranca",
			descricao: "O agente verificou se a acao podia ser executada diretamente.",
			detalhes: {
				permitido: Boolean(seguranca.permitido),
				precisaConfirmacao: Boolean(seguranca.precisaConfirmacao),
				mensagem: seguranca.mensagem || ""
			}
		},
		{
			tipo: "acao",
			titulo: "Acao executada",
			descricao: "O agente acionou a ferramenta interna escolhida.",
			detalhes: {
				ferramenta: ferramentaEscolhida,
				executada: Boolean(seguranca.permitido),
				sucesso: Boolean(resultado.sucesso),
				mensagem: resultado.mensagem,
				pendencia: resultado.pendencia || null
			}
		},
		{
			tipo: "observacao_resultado",
			titulo: "Observacao do resultado",
			descricao: "O agente observou o retorno da ferramenta e registrou o estado final.",
			detalhes: {
				sucesso: Boolean(resultado.sucesso),
				mensagem: resultado.mensagem,
				...resumirDadosResultado(resultado)
			}
		}
	];

	return {
		modelo: "observacao-percepcao-deliberacao-acao",
		resumo: {
			acao: intencao.acao,
			origemInterpretacao: interpretacao.origem,
			ferramentaEscolhida,
			sucesso: Boolean(resultado.sucesso),
			usouMemoria: Boolean(etapaMemoria),
			planoLLM: Boolean(etapaPlanoLLM),
			precisaConfirmacao: Boolean(resultado.precisaConfirmacao || seguranca.precisaConfirmacao),
			totalEtapas: etapas.length
		},
		etapas
	};
}
