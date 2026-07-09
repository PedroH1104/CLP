import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import {
	avaliarComandos,
	avaliarSequencias,
	gerarRelatorioTexto
} from "./avaliador.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lerJson = (arquivo) => JSON.parse(fs.readFileSync(path.join(__dirname, arquivo), "utf-8"));

test("avaliador mede comandos completos por campo e por grupo", () => {
	const resultado = avaliarComandos([
		{
			grupo: "completo",
			texto: "Crie o livro Marley e eu, com 350 paginas do genero drama",
			esperado: {
				acao: "criar_livro",
				titulo: "Marley e eu",
				paginas: 350,
				categoria: "Drama"
			}
		}
	]);

	assert.equal(resultado.metricas.acao.acertos, 1);
	assert.equal(resultado.metricas.titulo.acertos, 1);
	assert.equal(resultado.grupos.completo.acertos, 1);
	assert.equal(resultado.falhas.length, 0);
});

test("avaliador executa sequencias com memoria de comandos incompletos", () => {
	const sequencias = avaliarSequencias(lerJson("sequencias.json"));

	assert.equal(sequencias.length, 2);
	assert.equal(sequencias.every((sequencia) => sequencia.sucesso), true);
});

test("relatorio textual resume comandos e sequencias", () => {
	const comandos = avaliarComandos(lerJson("comandos.json"));
	const sequencias = avaliarSequencias(lerJson("sequencias.json"));
	const relatorio = gerarRelatorioTexto({ comandos, sequencias });

	assert.match(relatorio, /Avaliacao do agente de leitura/);
	assert.match(relatorio, /Metricas por campo/);
	assert.match(relatorio, /Sequencias com memoria/);
});
