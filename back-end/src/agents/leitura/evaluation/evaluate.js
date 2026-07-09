import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	avaliarComandos,
	avaliarSequencias,
	gerarRelatorioTexto
} from "./avaliador.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lerJson = (arquivo) => JSON.parse(fs.readFileSync(path.join(__dirname, arquivo), "utf-8"));

const comandos = avaliarComandos(lerJson("comandos.json"));
const sequencias = avaliarSequencias(lerJson("sequencias.json"));
const relatorio = gerarRelatorioTexto({ comandos, sequencias });
const possuiFalhas = comandos.falhas.length > 0 || sequencias.some((sequencia) => !sequencia.sucesso);

console.log(relatorio);

if (possuiFalhas) {
	process.exitCode = 1;
}
