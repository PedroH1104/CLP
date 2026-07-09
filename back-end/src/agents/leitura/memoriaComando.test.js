import test from "node:test";
import assert from "node:assert/strict";
import {
	aplicarMemoriaPendente,
	avaliarCamposFaltantes
} from "./memoriaComando.js";

test("identifica campos faltantes para criar livro", () => {
	const faltantes = avaliarCamposFaltantes("criar_livro", {
		titulo: "Dom Casmurro",
		paginas: 0,
		categoria: "Romance"
	});

	assert.deepEqual(faltantes, ["paginas"]);
});

test("identifica categoria faltante ao criar livro quando categoria nao foi informada", () => {
	const faltantes = avaliarCamposFaltantes("criar_livro", {
		titulo: "Dom Casmurro",
		paginas: 256,
		categoria: "Outro"
	});

	assert.deepEqual(faltantes, ["categoria"]);
});

test("identifica avaliacao e descricao faltantes para concluir livro", () => {
	const faltantes = avaliarCamposFaltantes("concluir_livro", {
		titulo: "Dom Casmurro",
		avaliacao: 0,
		descricao: ""
	});

	assert.deepEqual(faltantes, ["avaliacao", "descricao"]);
});

test("marca memoria quando OpenAI devolve plano final usando pendencia", () => {
	const interpretacao = aplicarMemoriaPendente({
		texto: "Tem 256 paginas e e romance",
		interpretacaoAtual: {
			acao: "criar_livro",
			origem: "openai",
			parametros: {
				titulo: "Dom Casmurro",
				paginas: 256,
				categoria: "Romance"
			},
			deliberacaoLLM: {
				usouPendenciaNoPrompt: true
			}
		},
		pendencia: {
			ativa: true,
			acao: "criar_livro",
			parametrosParciais: {
				titulo: "Dom Casmurro",
				paginas: 0,
				categoria: "Outro"
			},
			camposFaltantes: ["paginas", "categoria"]
		}
	});

	assert.equal(interpretacao.acao, "criar_livro");
	assert.equal(interpretacao.parametros.titulo, "Dom Casmurro");
	assert.equal(interpretacao.parametros.paginas, 256);
	assert.equal(interpretacao.parametros.categoria, "Romance");
	assert.equal(interpretacao.memoria.usouPendencia, true);
	assert.deepEqual(interpretacao.memoria.camposPreenchidosPelaIA, ["paginas", "categoria"]);
});

test("nao completa pendencia por regex quando OpenAI nao devolve parametros finais", () => {
	const interpretacao = aplicarMemoriaPendente({
		texto: "Ele possui duzentas e cinquenta e seis paginas e e romance",
		interpretacaoAtual: {
			acao: "desconhecida",
			origem: "openai",
			parametros: {
				titulo: "",
				paginas: 256,
				categoria: "Romance"
			}
		},
		pendencia: {
			ativa: true,
			acao: "criar_livro",
			parametrosParciais: {
				titulo: "Dom Casmurro",
				paginas: 0,
				categoria: "Outro"
			},
			camposFaltantes: ["paginas"]
		}
	});

	assert.equal(interpretacao.acao, "desconhecida");
	assert.equal(interpretacao.parametros.titulo, "");
	assert.equal(interpretacao.parametros.paginas, 256);
	assert.equal(interpretacao.parametros.categoria, "Romance");
	assert.equal(interpretacao.memoria, undefined);
});

test("mantem parametros finais da OpenAI sem sobrescrever titulo no backend", () => {
	const interpretacao = aplicarMemoriaPendente({
		texto: "Achei ele quatro estrelas e pode colocar que e muito bom",
		interpretacaoAtual: {
			acao: "concluir_livro",
			origem: "openai",
			parametros: {
				titulo: "",
				avaliacao: 4,
				descricao: "muito bom"
			},
			deliberacaoLLM: {
				usouPendenciaNoPrompt: true
			}
		},
		pendencia: {
			ativa: true,
			acao: "concluir_livro",
			parametrosParciais: {
				titulo: "Dom Casmurro",
				avaliacao: 0,
				descricao: ""
			},
			camposFaltantes: ["avaliacao", "descricao"]
		}
	});

	assert.equal(interpretacao.acao, "concluir_livro");
	assert.equal(interpretacao.parametros.titulo, "");
	assert.equal(interpretacao.parametros.avaliacao, 4);
	assert.equal(interpretacao.parametros.descricao, "muito bom");
	assert.equal(interpretacao.memoria.usouPendencia, true);
});

test("nao troca titulo proposto pela OpenAI por titulo pendente no backend", () => {
	const interpretacao = aplicarMemoriaPendente({
		texto: "Achei quatro estrelas e pode colocar que e muito bom",
		interpretacaoAtual: {
			acao: "concluir_livro",
			origem: "openai",
			parametros: {
				titulo: "Achei",
				avaliacao: 4,
				descricao: "muito bom"
			}
		},
		pendencia: {
			ativa: true,
			acao: "concluir_livro",
			parametrosParciais: {
				titulo: "O Senhor dos Aneis",
				avaliacao: 0,
				descricao: ""
			},
			camposFaltantes: ["avaliacao", "descricao"]
		}
	});

	assert.equal(interpretacao.acao, "concluir_livro");
	assert.equal(interpretacao.parametros.titulo, "Achei");
	assert.equal(interpretacao.parametros.avaliacao, 4);
	assert.equal(interpretacao.parametros.descricao, "muito bom");
	assert.equal(interpretacao.memoria.usouPendencia, true);
});

test("nao extrai avaliacao e descricao no backend quando OpenAI nao trouxe dados", () => {
	const interpretacao = aplicarMemoriaPendente({
		texto: "Achei ele quatro estrelas e pode colocar que e muito bom",
		interpretacaoAtual: {
			acao: "desconhecida",
			origem: "openai",
			parametros: {}
		},
		pendencia: {
			ativa: true,
			acao: "concluir_livro",
			parametrosParciais: {
				titulo: "Dom Casmurro",
				avaliacao: 0,
				descricao: ""
			},
			camposFaltantes: ["avaliacao", "descricao"]
		}
	});

	assert.equal(interpretacao.acao, "desconhecida");
	assert.deepEqual(interpretacao.parametros, {});
	assert.equal(interpretacao.memoria, undefined);
});

test("nao extrai descricao livre no backend quando OpenAI nao trouxe dados", () => {
	const interpretacao = aplicarMemoriaPendente({
		texto: "quatro estrelas, livro muito bom, recomendo a todos",
		interpretacaoAtual: {
			acao: "desconhecida",
			origem: "openai",
			parametros: {}
		},
		pendencia: {
			ativa: true,
			acao: "concluir_livro",
			parametrosParciais: {
				titulo: "Marley e Eu",
				avaliacao: 0,
				descricao: ""
			},
			camposFaltantes: ["avaliacao", "descricao"]
		}
	});

	assert.equal(interpretacao.acao, "desconhecida");
	assert.deepEqual(interpretacao.parametros, {});
	assert.equal(interpretacao.memoria, undefined);
});

test("nao extrai pagina no backend quando OpenAI nao trouxe dados", () => {
	const interpretacao = aplicarMemoriaPendente({
		texto: "na pagina 256",
		interpretacaoAtual: {
			acao: "desconhecida",
			origem: "openai",
			parametros: {}
		},
		pendencia: {
			ativa: true,
			acao: "atualizar_pagina",
			parametrosParciais: {
				titulo: "Harry Potter",
				paginaAtual: 0
			},
			camposFaltantes: ["paginaAtual"]
		}
	});

	assert.equal(interpretacao.acao, "desconhecida");
	assert.deepEqual(interpretacao.parametros, {});
	assert.equal(interpretacao.memoria, undefined);
});

test("nao prioriza pendencia quando OpenAI escolhe outra ferramenta", () => {
	const interpretacao = aplicarMemoriaPendente({
		texto: "Tem 256 paginas",
		interpretacaoAtual: {
			acao: "atualizar_pagina",
			origem: "openai",
			parametros: {
				titulo: "",
				paginaAtual: 0
			}
		},
		pendencia: {
			ativa: true,
			acao: "criar_livro",
			parametrosParciais: {
				titulo: "Dom Casmurro",
				paginas: 0,
				categoria: "Romance"
			},
			camposFaltantes: ["paginas"]
		}
	});

	assert.equal(interpretacao.acao, "atualizar_pagina");
	assert.equal(interpretacao.parametros.titulo, "");
	assert.equal(interpretacao.parametros.paginaAtual, 0);
	assert.equal(interpretacao.memoria, undefined);
});

test("nao limpa erro de interpretacao por heuristica de memoria", () => {
	const interpretacao = aplicarMemoriaPendente({
		texto: "Tem 576 paginas e e fantasia",
		interpretacaoAtual: {
			acao: "desconhecida",
			origem: "openai",
			parametros: {},
			erroInterpretacao: true,
			mensagem: "A OpenAI nao escolheu uma ferramenta para esse comando."
		},
		pendencia: {
			ativa: true,
			acao: "criar_livro",
			parametrosParciais: {
				titulo: "O Senhor dos Aneis",
				paginas: 0,
				categoria: "Outro"
			},
			camposFaltantes: ["paginas", "categoria"]
		}
	});

	assert.equal(interpretacao.acao, "desconhecida");
	assert.deepEqual(interpretacao.parametros, {});
	assert.equal(interpretacao.erroInterpretacao, true);
	assert.equal(interpretacao.memoria, undefined);
});

test("OpenAI pode devolver plano final completo apos considerar historico", () => {
	const interpretacao = aplicarMemoriaPendente({
		texto: "Tem quinhentas e setenta e seis paginas e e fantasia",
		interpretacaoAtual: {
			acao: "criar_livro",
			origem: "openai",
			parametros: {
				titulo: "O Senhor dos Aneis",
				paginas: 576,
				categoria: "Fantasia"
			},
			deliberacaoLLM: {
				usouPendenciaNoPrompt: true
			}
		},
		pendencia: {
			ativa: true,
			acao: "criar_livro",
			parametrosParciais: {
				titulo: "O Senhor dos Aneis",
				paginas: 0,
				categoria: "Outro"
			},
			camposFaltantes: ["paginas", "categoria"]
		}
	});

	assert.equal(interpretacao.acao, "criar_livro");
	assert.equal(interpretacao.parametros.titulo, "O Senhor dos Aneis");
	assert.equal(interpretacao.parametros.paginas, 576);
	assert.equal(interpretacao.parametros.categoria, "Fantasia");
	assert.equal(interpretacao.erroInterpretacao, undefined);
	assert.equal(interpretacao.memoria.usouPendencia, true);
});

test("promove solicitar dados para acao final quando parametros da pendencia ficaram completos", () => {
	const interpretacao = aplicarMemoriaPendente({
		texto: "350, drama",
		interpretacaoAtual: {
			acao: "solicitar_dados",
			origem: "openai",
			parametros: {
				acaoPretendida: "criar_livro",
				camposFaltantes: ["paginas", "categoria"],
				parametrosParciais: {
					titulo: "Marley e Eu",
					paginas: 350,
					categoria: "Drama"
				},
				mensagem: "Ainda preciso da quantidade de paginas e categoria."
			}
		},
		pendencia: {
			ativa: true,
			acao: "criar_livro",
			parametrosParciais: {
				titulo: "Marley e Eu",
				paginas: 0,
				categoria: "Outro"
			},
			camposFaltantes: ["paginas", "categoria"]
		}
	});

	assert.equal(interpretacao.acao, "criar_livro");
	assert.equal(interpretacao.parametros.titulo, "Marley e Eu");
	assert.equal(interpretacao.parametros.paginas, 350);
	assert.equal(interpretacao.parametros.categoria, "Drama");
	assert.deepEqual(interpretacao.memoria.camposPreenchidosPelaIA, ["paginas", "categoria"]);
});
