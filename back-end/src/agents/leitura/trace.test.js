import test from "node:test";
import assert from "node:assert/strict";
import { montarTraceSequencial } from "./trace.js";

test("monta um ciclo sequencial com observacao, decisao, acao e resultado", () => {
	const trace = montarTraceSequencial({
		texto: "Crie o livro Harry Potter com 700 paginas do genero fantasia",
		interpretacao: {
			acao: "criar_livro",
			origem: "openai",
			parametros: {
				titulo: "Harry Potter",
				paginas: 700,
				categoria: "fantasia"
			}
		},
		crencas: {
			livrosDoUsuario: [{ titulo: "1984" }],
			postsRecentes: [{ nomeLivro: "Harry Potter" }]
		},
		desejo: {
			nome: "manter_biblioteca",
			acaoSolicitada: "criar_livro"
		},
		intencao: {
			acao: "criar_livro",
			desejo: "manter_biblioteca",
			parametros: {
				titulo: "Harry Potter",
				paginas: 700,
				categoria: "fantasia"
			},
			plano: ["validar_campos", "buscar_capa", "criar_livro"]
		},
		seguranca: {
			permitido: true,
			precisaConfirmacao: false
		},
		resultado: {
			sucesso: true,
			mensagem: "Livro criado com sucesso.",
			dados: {
				titulo: "Harry Potter",
				imagem: "https://example.com/capa.jpg"
			}
		}
	});

	assert.deepEqual(
		trace.etapas.map((etapa) => etapa.tipo),
		[
			"observacao",
			"percepcao",
			"deliberacao",
			"plano",
			"seguranca",
			"acao",
			"observacao_resultado"
		]
	);
	assert.equal(trace.resumo.ferramentaEscolhida, "criarLivroPorComando");
	assert.equal(trace.resumo.totalEtapas, 7);
	assert.equal(trace.etapas[3].detalhes.passos.join(","), "validar_campos,buscar_capa,criar_livro");
	assert.equal(trace.etapas[6].detalhes.imagemEncontrada, true);
});

test("inclui consulta de memoria quando comando completa uma pendencia", () => {
	const trace = montarTraceSequencial({
		texto: "Achei quatro estrelas e pode colocar que eu esperava um pouco mais",
		interpretacao: {
			acao: "concluir_livro",
			origem: "openai",
			parametros: {
				titulo: "O Senhor dos Aneis",
				avaliacao: 4,
				descricao: "eu esperava um pouco mais"
			},
			memoria: {
				usouPendencia: true,
				camposFaltantesAntes: ["avaliacao", "descricao"],
				camposPreenchidosPelaIA: ["avaliacao", "descricao"],
				parametrosPendentes: {
					titulo: "O Senhor dos Aneis",
					avaliacao: 0,
					descricao: ""
				},
				parametrosPropostosPelaIA: {
					titulo: "O Senhor dos Aneis",
					avaliacao: 4,
					descricao: "eu esperava um pouco mais"
				}
			},
			deliberacaoLLM: {
				ferramentaProposta: "concluir_livro",
				parametrosPropostos: {
					titulo: "O Senhor dos Aneis",
					avaliacao: 4,
					descricao: "eu esperava um pouco mais"
				},
				usouPendenciaNoPrompt: true,
				totalHistoricoConsiderado: 4,
				totalLivrosConsiderados: 6
			}
		},
		crencas: {
			livrosDoUsuario: [{ titulo: "O Senhor dos Aneis" }],
			postsRecentes: []
		},
		desejo: {
			nome: "registrar_conclusao",
			acaoSolicitada: "concluir_livro"
		},
		intencao: {
			acao: "concluir_livro",
			desejo: "registrar_conclusao",
			parametros: {
				titulo: "O Senhor dos Aneis",
				avaliacao: 4,
				descricao: "eu esperava um pouco mais"
			},
			plano: ["localizar_livro", "registrar_conclusao", "publicar_post"]
		},
		seguranca: {
			permitido: true,
			precisaConfirmacao: false
		},
		resultado: {
			sucesso: true,
			mensagem: "Parabens pela leitura! Conclui \"O Senhor dos Aneis\" e publiquei sua avaliacao.",
			dados: {
				livro: { titulo: "O Senhor dos Aneis" },
				post: { id: "post-1" }
			}
		}
	});

	assert.deepEqual(
		trace.etapas.map((etapa) => etapa.tipo),
		[
			"observacao",
			"memoria",
			"plano_llm",
			"percepcao",
			"deliberacao",
			"plano",
			"seguranca",
			"acao",
			"observacao_resultado"
		]
	);
	assert.equal(trace.etapas[1].titulo, "Memoria recuperada");
	assert.equal(trace.etapas[1].detalhes.usouPendencia, true);
	assert.deepEqual(trace.etapas[1].detalhes.camposFaltantesAntes, ["avaliacao", "descricao"]);
	assert.deepEqual(trace.etapas[1].detalhes.camposPreenchidosPelaIA, ["avaliacao", "descricao"]);
	assert.equal(trace.etapas[1].detalhes.parametrosPropostosPelaIA.titulo, "O Senhor dos Aneis");
	assert.equal(trace.etapas[2].titulo, "Plano proposto pelo LLM");
	assert.equal(trace.etapas[3].titulo, "Percepcao contextual");
	assert.equal(trace.etapas[3].detalhes.contextoAplicado, "pendencia_ativa");
	assert.equal(trace.resumo.usouMemoria, true);
	assert.equal(trace.resumo.totalEtapas, 9);
});

test("inclui plano proposto pelo LLM antes da deliberacao BDI", () => {
	const trace = montarTraceSequencial({
		texto: "Atualize Dom Casmurro para a pagina 90",
		interpretacao: {
			acao: "atualizar_pagina",
			origem: "openai",
			parametros: {
				titulo: "Dom Casmurro",
				paginaAtual: 90
			},
			deliberacaoLLM: {
				ferramentaProposta: "atualizar_pagina",
				parametrosPropostos: {
					titulo: "Dom Casmurro",
					paginaAtual: 90
				},
				usouPendenciaNoPrompt: false,
				totalHistoricoConsiderado: 2,
				totalLivrosConsiderados: 4
			}
		},
		crencas: {
			livrosDoUsuario: [{ titulo: "Dom Casmurro" }],
			postsRecentes: []
		},
		desejo: {
			nome: "acompanhar_progresso",
			acaoSolicitada: "atualizar_pagina"
		},
		intencao: {
			acao: "atualizar_pagina",
			desejo: "acompanhar_progresso",
			parametros: {
				titulo: "Dom Casmurro",
				paginaAtual: 90
			},
			plano: ["localizar_livro", "validar_pagina", "atualizar_progresso"]
		},
		seguranca: {
			permitido: true,
			precisaConfirmacao: false
		},
		resultado: {
			sucesso: true,
			mensagem: "Atualizei Dom Casmurro para a pagina 90.",
			dados: {
				titulo: "Dom Casmurro"
			}
		}
	});

	assert.deepEqual(
		trace.etapas.map((etapa) => etapa.tipo),
		[
			"observacao",
			"percepcao",
			"plano_llm",
			"deliberacao",
			"plano",
			"seguranca",
			"acao",
			"observacao_resultado"
		]
	);
	assert.equal(trace.etapas[2].titulo, "Plano proposto pelo LLM");
	assert.equal(trace.etapas[2].detalhes.ferramentaProposta, "atualizar_pagina");
	assert.equal(trace.resumo.planoLLM, true);
	assert.equal(trace.resumo.totalEtapas, 8);
});
