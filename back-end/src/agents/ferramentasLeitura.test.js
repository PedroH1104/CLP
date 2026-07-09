import test from "node:test";
import assert from "node:assert/strict";
import { normalizarTituloParaBusca } from "./ferramentasLeitura.js";

test("normaliza e comercial como conectivo do titulo", () => {
	assert.equal(
		normalizarTituloParaBusca("Marley & Eu"),
		normalizarTituloParaBusca("Marley e Eu")
	);
});

