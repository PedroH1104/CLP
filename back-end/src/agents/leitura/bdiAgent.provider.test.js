import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

test("agente BDI usa interpretador OpenAI como provedor principal", () => {
	const codigo = fs.readFileSync(new URL("./bdiAgent.js", import.meta.url), "utf-8");

	assert.match(codigo, /interpretadorIA\.js/);
});

test("agente BDI aceita interpretacao confirmada para evitar nova chamada OpenAI em confirmacoes", () => {
	const codigo = fs.readFileSync(new URL("./bdiAgent.js", import.meta.url), "utf-8");

	assert.match(codigo, /interpretacaoConfirmada/);
	assert.match(codigo, /normalizarInterpretacaoConfirmada/);
});

test("agente BDI executa ferramenta escolhida sem switch de decisao", () => {
	const codigo = fs.readFileSync(new URL("./bdiAgent.js", import.meta.url), "utf-8");

	assert.match(codigo, /executoresFerramentas/);
	assert.doesNotMatch(codigo, /switch\s*\(intencao\.acao\)/);
});

test("agente BDI deixa comando desconhecido ser decidido pelo tool calling", () => {
	const codigo = fs.readFileSync(new URL("./bdiAgent.js", import.meta.url), "utf-8");

	assert.doesNotMatch(codigo, /textoParecePedidoLeitura/);
	assert.doesNotMatch(codigo, /deveInterpretar/);
});

test("agente BDI envia memoria e historico recente ao interpretador OpenAI", () => {
	const codigo = fs.readFileSync(new URL("./bdiAgent.js", import.meta.url), "utf-8");

	assert.match(codigo, /interpretarComandoComIA\(texto,\s*\{/);
	assert.match(codigo, /pendenciaAtiva:\s*pendenciaMaisRecente/);
	assert.match(codigo, /historicoRecente:\s*crencas\.historicoRecente/);
});

test("agente BDI registra solicitacao de dados declarada pelo LLM", () => {
	const codigo = fs.readFileSync(new URL("./bdiAgent.js", import.meta.url), "utf-8");

	assert.match(codigo, /interpretacao\.acao\s*===\s*"solicitar_dados"/);
	assert.match(codigo, /acaoPretendida/);
	assert.match(codigo, /parametrosParciais/);
	assert.match(codigo, /camposFaltantes/);
});
