import { interpretarComandoDataset } from "./interpretadorDataset.js";
import {
	aplicarMemoriaPendente,
	avaliarCamposFaltantes
} from "../memoriaComando.js";

const camposPadrao = ["acao", "titulo", "paginas", "paginaAtual", "categoria", "avaliacao", "descricao"];

const normalizar = (valor = "") =>
	valor
		.toString()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();

function compararValor(esperado, recebido) {
	if (typeof esperado === "string") {
		return normalizar(esperado) === normalizar(recebido);
	}

	if (Array.isArray(esperado)) {
		return Array.isArray(recebido)
			&& esperado.length === recebido.length
			&& esperado.every((item, index) => compararValor(item, recebido[index]));
	}

	if (typeof esperado === "boolean") {
		return Boolean(recebido) === esperado;
	}

	return Number(esperado) === Number(recebido);
}

function resultadoPlano(resultado) {
	return {
		acao: resultado.acao,
		...resultado.parametros
	};
}

function criarMetricas(campos) {
	return Object.fromEntries(campos.map((campo) => [campo, { acertos: 0, total: 0 }]));
}

function registrarComparacao({ metricas, falhas, caso, campo, esperado, recebido }) {
	metricas[campo] ??= { acertos: 0, total: 0 };
	metricas[campo].total += 1;

	if (compararValor(esperado, recebido)) {
		metricas[campo].acertos += 1;
		return;
	}

	falhas.push({
		texto: caso.texto,
		grupo: caso.grupo || "completo",
		campo,
		esperado,
		recebido
	});
}

export function avaliarComandos(dataset, interpretar = interpretarComandoDataset) {
	const metricas = criarMetricas(camposPadrao);
	const grupos = {};
	const falhas = [];

	for (const caso of dataset) {
		const grupo = caso.grupo || "completo";
		grupos[grupo] ??= { acertos: 0, total: 0 };

		const atual = resultadoPlano(interpretar(caso.texto));
		let casoAcertou = true;

		for (const campo of camposPadrao) {
			if (!(campo in caso.esperado)) continue;

			const totalFalhasAntes = falhas.length;
			registrarComparacao({
				metricas,
				falhas,
				caso,
				campo,
				esperado: caso.esperado[campo],
				recebido: atual[campo]
			});

			if (falhas.length > totalFalhasAntes) {
				casoAcertou = false;
			}
		}

		grupos[grupo].total += 1;
		if (casoAcertou) {
			grupos[grupo].acertos += 1;
		}
	}

	return { metricas, grupos, falhas };
}

export function avaliarSequencias(sequencias) {
	const resultados = [];

	for (const sequencia of sequencias) {
		let pendencia = null;
		let sucesso = true;
		const passos = [];

		for (const passo of sequencia.passos) {
			const interpretacaoInicial = passo.planoOpenAI || interpretarComandoDataset(passo.texto);
			const interpretacao = aplicarMemoriaPendente({
				texto: passo.texto,
				interpretacaoAtual: {
					...interpretacaoInicial,
					origem: passo.planoOpenAI ? "openai" : "dataset"
				},
				pendencia
			});

			const faltantes = avaliarCamposFaltantes(interpretacao.acao, interpretacao.parametros);
			const atual = {
				acao: interpretacao.acao,
				...interpretacao.parametros,
				pendencia: faltantes.length > 0,
				camposFaltantes: faltantes,
				usouPendencia: Boolean(interpretacao.memoria?.usouPendencia)
			};

			for (const [campo, esperado] of Object.entries(passo.esperado)) {
				if (!compararValor(esperado, atual[campo])) {
					sucesso = false;
				}
			}

			pendencia = faltantes.length > 0
				? {
					ativa: true,
					acao: interpretacao.acao,
					parametrosParciais: interpretacao.parametros,
					camposFaltantes: faltantes,
					textoOriginal: sequencia.passos[0].texto
				}
				: null;

			passos.push({ texto: passo.texto, esperado: passo.esperado, recebido: atual });
		}

		resultados.push({ nome: sequencia.nome, sucesso, passos });
	}

	return resultados;
}

function formatarPercentual(acertos, total) {
	return total === 0 ? "0.0" : ((acertos / total) * 100).toFixed(1);
}

export function gerarRelatorioTexto({ comandos, sequencias }) {
	const linhas = [
		"Avaliacao do agente de leitura",
		"--------------------------------"
	];

	linhas.push("\nMetricas por campo:");
	for (const [campo, { acertos, total }] of Object.entries(comandos.metricas)) {
		if (total === 0) continue;
		linhas.push(`${campo}: ${acertos}/${total} (${formatarPercentual(acertos, total)}%)`);
	}

	linhas.push("\nMetricas por grupo:");
	for (const [grupo, { acertos, total }] of Object.entries(comandos.grupos)) {
		linhas.push(`${grupo}: ${acertos}/${total} (${formatarPercentual(acertos, total)}%)`);
	}

	linhas.push("\nSequencias com memoria:");
	for (const sequencia of sequencias) {
		linhas.push(`${sequencia.sucesso ? "OK" : "FALHA"} - ${sequencia.nome}`);
	}

	if (comandos.falhas.length > 0) {
		linhas.push("\nFalhas de comandos:");
		for (const falha of comandos.falhas) {
			linhas.push(`- [${falha.grupo}/${falha.campo}] "${falha.texto}"`);
			linhas.push(`  esperado: ${falha.esperado}`);
			linhas.push(`  recebido: ${falha.recebido}`);
		}
	}

	return linhas.join("\n");
}
