import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import {
	adaptarToolCall,
	montarMensagensAgente
} from "./interpretadorIA.js";

test("interpretador OpenAI desativa retries automaticos", () => {
	const codigoFonte = fs.readFileSync(new URL("./interpretadorIA.js", import.meta.url), "utf-8");
	assert.match(codigoFonte, /maxRetries:\s*0/);
});

test("interpretador OpenAI usa tool calling nativo", () => {
	const codigoFonte = fs.readFileSync(new URL("./interpretadorIA.js", import.meta.url), "utf-8");
	assert.match(codigoFonte, /ferramentasOpenAI/);
	assert.match(codigoFonte, /tools:\s*ferramentasOpenAI/);
	assert.match(codigoFonte, /tool_choice:\s*"required"/);
	assert.doesNotMatch(codigoFonte, /response_format/);
});

test("interpretador nao aceita categoria inferida quando usuario nao informou genero", () => {
	const interpretacao = adaptarToolCall({
		id: "call_1",
		function: {
			name: "criar_livro",
			arguments: JSON.stringify({
				titulo: "O Senhor dos Aneis",
				paginas: 0,
				categoria: "Fantasia"
			})
		}
	}, "Crie o livro O Senhor dos Aneis");

	assert.equal(interpretacao.acao, "criar_livro");
	assert.equal(interpretacao.parametros.categoria, "Outro");
});

test("interpretador registra o plano proposto pelo LLM", () => {
	const interpretacao = adaptarToolCall({
		id: "call_plano",
		function: {
			name: "atualizar_pagina",
			arguments: JSON.stringify({
				titulo: "Dom Casmurro",
				paginaAtual: 90
			})
		}
	}, "Atualize Dom Casmurro para a pagina 90", {
		pendenciaAtiva: {
			acao: "atualizar_pagina"
		},
		historicoRecente: [
			{
				texto: "Atualize Dom Casmurro",
				acao: "atualizar_pagina"
			}
		],
		livrosDoUsuario: [
			{
				titulo: "Dom Casmurro"
			}
		]
	});

	assert.equal(interpretacao.deliberacaoLLM.ferramentaProposta, "atualizar_pagina");
	assert.equal(interpretacao.deliberacaoLLM.parametrosPropostos.titulo, "Dom Casmurro");
	assert.equal(interpretacao.deliberacaoLLM.usouPendenciaNoPrompt, true);
	assert.equal(interpretacao.deliberacaoLLM.totalHistoricoConsiderado, 1);
	assert.equal(interpretacao.deliberacaoLLM.totalLivrosConsiderados, 1);
});

test("interpretador aceita tool de comando desconhecido escolhida pela OpenAI", () => {
	const interpretacao = adaptarToolCall({
		id: "call_2",
		function: {
			name: "comando_desconhecido",
			arguments: JSON.stringify({
				mensagem: "Nao consegui entender o que voce quis dizer. Por favor, informe uma acao de leitura mais clara."
			})
		}
	}, "so teste no audio");

	assert.equal(interpretacao.acao, "desconhecida");
	assert.equal(interpretacao.erroInterpretacao, true);
	assert.match(interpretacao.mensagem, /Nao consegui entender/);
});

test("interpretador adapta tool solicitar dados para pendencia declarada pelo LLM", () => {
	const interpretacao = adaptarToolCall({
		id: "call_solicitar",
		function: {
			name: "solicitar_dados",
			arguments: JSON.stringify({
				acaoPretendida: "concluir_livro",
				camposFaltantes: ["avaliacao", "descricao"],
				titulo: "Pequeno Principe",
				paginas: 0,
				paginaAtual: 0,
				categoria: "Outro",
				avaliacao: 0,
				descricao: "",
				mensagem: "Preciso da avaliacao e do comentario para concluir esse livro."
			})
		}
	}, "Conclua o livro Pequeno Principe");

	assert.equal(interpretacao.acao, "solicitar_dados");
	assert.equal(interpretacao.parametros.acaoPretendida, "concluir_livro");
	assert.deepEqual(interpretacao.parametros.camposFaltantes, ["avaliacao", "descricao"]);
	assert.equal(interpretacao.parametros.parametrosParciais.titulo, "Pequeno Principe");
	assert.match(interpretacao.parametros.mensagem, /avaliacao/);
	assert.equal(interpretacao.deliberacaoLLM.ferramentaProposta, "solicitar_dados");
});

test("interpretador normaliza categoria em minusculo ao completar pendencia de criacao", () => {
	const interpretacao = adaptarToolCall({
		id: "call_criar_complemento",
		function: {
			name: "criar_livro",
			arguments: JSON.stringify({
				titulo: "Marley e Eu",
				paginas: 350,
				categoria: "drama"
			})
		}
	}, "350, drama", {
		pendenciaAtiva: {
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
	assert.equal(interpretacao.parametros.paginas, 350);
	assert.equal(interpretacao.parametros.categoria, "Drama");
});

test("interpretador normaliza categoria em minusculo dentro de solicitar dados", () => {
	const interpretacao = adaptarToolCall({
		id: "call_solicitar_minusculo",
		function: {
			name: "solicitar_dados",
			arguments: JSON.stringify({
				acaoPretendida: "criar_livro",
				camposFaltantes: ["paginas", "categoria"],
				titulo: "Marley e Eu",
				paginas: 350,
				paginaAtual: 0,
				categoria: "drama",
				avaliacao: 0,
				descricao: "",
				mensagem: "Ainda preciso da quantidade de paginas e categoria."
			})
		}
	}, "350, drama");

	assert.equal(interpretacao.parametros.parametrosParciais.paginas, 350);
	assert.equal(interpretacao.parametros.parametrosParciais.categoria, "Drama");
});

test("interpretador monta prompt contextual com pendencia e historico", () => {
	const mensagens = montarMensagensAgente("tem 700 paginas", {
		pendenciaAtiva: {
			ativa: true,
			acao: "criar_livro",
			parametrosParciais: {
				titulo: "Harry Potter",
				paginas: 0,
				categoria: "Fantasia"
			},
			camposFaltantes: ["paginas"]
		},
		historicoRecente: [
			{
				texto: "crie o livro Harry Potter",
				acao: "criar_livro",
				sucesso: false
			}
		]
	});
	const payload = JSON.parse(mensagens[1].content);

	assert.match(mensagens[0].content, /observacao atual/i);
	assert.equal(payload.comandoAtual, "tem 700 paginas");
	assert.equal(payload.contexto.pendenciaAtiva.acao, "criar_livro");
	assert.equal(payload.contexto.pendenciaAtiva.parametrosParciais.titulo, "Harry Potter");
	assert.equal(payload.contexto.historicoRecente[0].texto, "crie o livro Harry Potter");
	assert.match(mensagens[0].content, /analise as ferramentas disponiveis/i);
	assert.doesNotMatch(mensagens[0].content, /Use criar_livro para cadastrar livro/);
});

test("prompt orienta OpenAI a devolver parametros finais quando usa memoria", () => {
	const mensagens = montarMensagensAgente("quatro estrelas, livro muito bom", {
		pendenciaAtiva: {
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

	assert.match(mensagens[0].content, /parametros finais/i);
	assert.match(mensagens[0].content, /nao deixe/i);
	assert.match(mensagens[0].content, /parametrosParciais/i);
});

test("prompt orienta OpenAI a usar solicitar dados quando faltarem campos", () => {
	const mensagens = montarMensagensAgente("Conclua o livro Pequeno Principe");

	assert.match(mensagens[0].content, /solicitar_dados/i);
	assert.match(mensagens[0].content, /acao clara/i);
	assert.match(mensagens[0].content, /campos faltantes/i);
});

test("prompt orienta OpenAI a nao repetir solicitar dados quando complemento preenche pendencia", () => {
	const mensagens = montarMensagensAgente("350, drama", {
		pendenciaAtiva: {
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

	assert.match(mensagens[0].content, /nao use solicitar_dados/i);
	assert.match(mensagens[0].content, /ferramenta final/i);
	assert.match(mensagens[0].content, /criar_livro/i);
	assert.match(mensagens[0].content, /350, drama/i);
	assert.match(mensagens[0].content, /paginas=350/i);
});
