import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { transcreverAudio } from "./transcricaoAudio.js";

test("transcricao de audio usa OPENAI_API_KEY como chave obrigatoria", async () => {
	const chaveOriginal = process.env.OPENAI_API_KEY;
	delete process.env.OPENAI_API_KEY;

	const resposta = await transcreverAudio("audio-inexistente.m4a");

	assert.equal(resposta.sucesso, false);
	assert.match(resposta.mensagem, /OPENAI_API_KEY/);

	if (chaveOriginal) {
		process.env.OPENAI_API_KEY = chaveOriginal;
	}
});

test("cliente OpenAI de transcricao desativa retries automaticos", () => {
	const codigoFonte = fs.readFileSync(new URL("./transcricaoAudio.js", import.meta.url), "utf-8");
	assert.match(codigoFonte, /maxRetries:\s*0/);
});

test("transcricao envia arquivo para OpenAI com nome e mimetype explicitos", () => {
	const codigoFonte = fs.readFileSync(new URL("./transcricaoAudio.js", import.meta.url), "utf-8");
	assert.match(codigoFonte, /toFile/);
	assert.match(codigoFonte, /nomeArquivo/);
	assert.match(codigoFonte, /mimeType/);
});
