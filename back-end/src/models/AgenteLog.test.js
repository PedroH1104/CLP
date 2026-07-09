import test from "node:test";
import assert from "node:assert/strict";
import agenteLog from "./AgenteLog.js";

test("schema do log do agente possui campo traceBDI para registrar o ciclo sequencial", () => {
	assert.ok(agenteLog.schema.path("traceBDI"));
	assert.equal(agenteLog.schema.path("traceBDI").defaultValue, undefined);
});

test("schema do log do agente possui campo pendencia para continuar comandos incompletos", () => {
	assert.ok(agenteLog.schema.path("pendencia"));
});

test("schema do log registra apenas OpenAI como origem de interpretacao", () => {
	const enumValues = agenteLog.schema.path("origemInterpretacao").enumValues;
	assert.deepEqual(enumValues, ["openai"]);
	assert.equal(agenteLog.schema.path("origemInterpretacao").defaultValue, "openai");
});
