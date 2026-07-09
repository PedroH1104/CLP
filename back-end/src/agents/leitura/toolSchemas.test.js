import test from "node:test";
import assert from "node:assert/strict";
import { ferramentasOpenAI, nomesFerramentasLeitura } from "./toolSchemas.js";

test("catalogo de tools expoe ferramentas de leitura para OpenAI", () => {
	assert.deepEqual(nomesFerramentasLeitura, [
		"criar_livro",
		"atualizar_pagina",
		"excluir_livro",
		"concluir_livro",
		"consultar_social",
		"solicitar_dados",
		"comando_desconhecido"
	]);

	assert.equal(ferramentasOpenAI.length, nomesFerramentasLeitura.length);
	assert.ok(ferramentasOpenAI.every((ferramenta) => ferramenta.type === "function"));
	assert.ok(ferramentasOpenAI.every((ferramenta) => ferramenta.function?.parameters?.additionalProperties === false));
});

test("catalogo expoe tool de controle para solicitar dados faltantes", () => {
	const ferramenta = ferramentasOpenAI.find((item) => item.function.name === "solicitar_dados");

	assert.ok(ferramenta);
	assert.match(ferramenta.function.description, /faltam dados/i);
	assert.deepEqual(ferramenta.function.parameters.required, [
		"acaoPretendida",
		"camposFaltantes",
		"titulo",
		"paginas",
		"paginaAtual",
		"categoria",
		"avaliacao",
		"descricao",
		"mensagem"
	]);
});
