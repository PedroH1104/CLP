import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

test("rota de transcricao possui limite de upload configuravel para audio", () => {
	const codigoFonte = fs.readFileSync(new URL("./agenteRoutes.js", import.meta.url), "utf-8");

	assert.match(codigoFonte, /AUDIO_MAX_BYTES/);
	assert.match(codigoFonte, /5 \* 1024 \* 1024/);
});
