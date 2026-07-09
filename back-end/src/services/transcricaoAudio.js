import fs from "node:fs/promises";
import OpenAI, { toFile } from "openai";

const modeloTranscricao = process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe";

function mensagemAmigavelErroOpenAI(error) {
	const status = error.status || error.code;

	if (status === 401) {
		return "A OPENAI_API_KEY parece invalida. Confira a chave configurada no backend.";
	}

	if (status === 402 || status === 429) {
		return "Nao consegui transcrever o audio porque o limite ou saldo da OpenAI foi atingido.";
	}

	if (status === 400) {
		return "Nao consegui enviar esse formato de audio para a OpenAI. Tente gravar novamente.";
	}

	if (status === 503 || status === 504) {
		return "A OpenAI demorou para responder. Tente novamente em alguns instantes.";
	}

	return "Nao consegui transcrever o audio com OpenAI. Verifique a OPENAI_API_KEY, o modelo e a conexao do backend.";
}

function normalizarMetadadosAudio(metadados = {}) {
	return {
		nomeArquivo: metadados.nomeOriginal || "comando.m4a",
		mimeType: metadados.mimeType || "audio/mp4"
	};
}

export async function transcreverAudio(caminhoArquivo, metadados = {}) {
	if (!process.env.OPENAI_API_KEY) {
		return {
			sucesso: false,
			mensagem: "Configure a variavel OPENAI_API_KEY no backend para ativar a transcricao por audio."
		};
	}

	try {
		// Primeira etapa do fluxo: converter a fala em texto para que o agente
		// trabalhe com uma observacao em linguagem natural.
		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
			maxRetries: 0
		});
		const { nomeArquivo, mimeType } = normalizarMetadadosAudio(metadados);
		const audioBuffer = await fs.readFile(caminhoArquivo);
		const arquivoAudio = await toFile(audioBuffer, nomeArquivo, { type: mimeType });

		console.log("[transcreverAudio] enviando para OpenAI", {
			modelo: modeloTranscricao,
			nomeArquivo,
			mimeType,
			tamanho: audioBuffer.length
		});

		const resposta = await openai.audio.transcriptions.create({
			file: arquivoAudio,
			model: modeloTranscricao,
			language: "pt"
		});

		const texto = resposta.text?.trim() || "";
		console.log("[transcreverAudio] resposta OpenAI", {
			transcreveu: Boolean(texto),
			caracteres: texto.length
		});

		return {
			sucesso: Boolean(texto),
			texto,
			mensagem: texto ? "Audio transcrito com sucesso." : "Nao consegui identificar fala no audio."
		};
	} catch (error) {
		console.error("Erro ao transcrever audio com OpenAI:", {
			status: error.status || error.code,
			message: error.message
		});

		return {
			sucesso: false,
			mensagem: mensagemAmigavelErroOpenAI(error)
		};
	}
}
