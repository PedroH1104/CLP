import OpenAI from "openai";
import {
	categoriasPermitidas,
	ferramentasOpenAI,
	nomesFerramentasLeitura
} from "./leitura/toolSchemas.js";

// As ferramentas disponiveis para o LLM nao ficam neste arquivo.
// Elas sao importadas de toolSchemas.js e enviadas na chamada da OpenAI
// pelo campo `tools`. E ali que o professor pode ver quais acoes o agente conhece.
const modeloAgente = process.env.OPENAI_AGENT_MODEL || "gpt-4o-mini";

const normalizarTexto = (texto = "") =>
	texto
		.toString()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();

function categoriaFoiInformadaNoTexto(texto, categoria, contexto = {}) {
	if (!categoria || categoria === "Outro") {
		return false;
	}

	const categoriaNormalizada = normalizarTexto(categoria);
	const categoriaNoTexto = normalizarTexto(texto).includes(categoriaNormalizada);
	const categoriaNaPendencia = normalizarTexto(
		contexto.pendenciaAtiva?.parametrosParciais?.categoria
	).includes(categoriaNormalizada);

	return categoriaNoTexto || categoriaNaPendencia;
}

function normalizarCategoria(categoria) {
	const categoriaNormalizada = normalizarTexto(categoria);
	return categoriasPermitidas.find((item) => normalizarTexto(item) === categoriaNormalizada) || "Outro";
}

function normalizarParametros(nomeFerramenta, parametros = {}, texto = "", contexto = {}) {
	// O LLM escolhe a ferramenta, mas o backend normaliza os argumentos para
	// manter tipos previsiveis antes de entregar os dados ao BDI.
	const parametrosNormalizados = {
		acaoPretendida: parametros.acaoPretendida || "",
		camposFaltantes: Array.isArray(parametros.camposFaltantes) ? parametros.camposFaltantes : [],
		titulo: parametros.titulo || "",
		paginas: Number(parametros.paginas) || 0,
		paginaAtual: Number(parametros.paginaAtual) || 0,
		categoria: normalizarCategoria(parametros.categoria),
		avaliacao: Number(parametros.avaliacao) || 0,
		descricao: parametros.descricao || ""
	};

	if (nomeFerramenta === "criar_livro") {
		return {
			titulo: parametrosNormalizados.titulo,
			paginas: parametrosNormalizados.paginas,
			categoria: categoriaFoiInformadaNoTexto(texto, parametrosNormalizados.categoria, contexto)
				? parametrosNormalizados.categoria
				: "Outro"
		};
	}

	if (nomeFerramenta === "atualizar_pagina") {
		return {
			titulo: parametrosNormalizados.titulo,
			paginaAtual: parametrosNormalizados.paginaAtual
		};
	}

	if (nomeFerramenta === "excluir_livro" || nomeFerramenta === "consultar_social") {
		return {
			titulo: parametrosNormalizados.titulo
		};
	}

	if (nomeFerramenta === "concluir_livro") {
		return {
			titulo: parametrosNormalizados.titulo,
			avaliacao: parametrosNormalizados.avaliacao,
			descricao: parametrosNormalizados.descricao
		};
	}

	if (nomeFerramenta === "solicitar_dados") {
		return {
			acaoPretendida: parametrosNormalizados.acaoPretendida,
			camposFaltantes: parametrosNormalizados.camposFaltantes,
			parametrosParciais: {
				titulo: parametrosNormalizados.titulo,
				paginas: parametrosNormalizados.paginas,
				paginaAtual: parametrosNormalizados.paginaAtual,
				categoria: parametrosNormalizados.categoria,
				avaliacao: parametrosNormalizados.avaliacao,
				descricao: parametrosNormalizados.descricao
			},
			mensagem: parametros.mensagem || "Preciso de mais informacoes para continuar."
		};
	}

	return parametrosNormalizados;
}

export function interpretarIndisponivel(mensagem) {
	return {
		acao: "desconhecida",
		parametros: {
			titulo: "",
			paginas: 0,
			paginaAtual: 0,
			categoria: "Outro",
			avaliacao: 0,
			descricao: ""
		},
		origem: "openai",
		erroInterpretacao: true,
		mensagem
	};
}

function montarDeliberacaoLLM(nomeFerramenta, parametros = {}, contexto = {}) {
	// Esta estrutura nao executa nada. Ela guarda, para auditoria, qual foi
	// o plano proposto pelo LLM: ferramenta escolhida, parametros sugeridos
	// e quanto contexto foi considerado na decisao.
	return {
		ferramentaProposta: nomeFerramenta,
		parametrosPropostos: parametros,
		usouPendenciaNoPrompt: Boolean(contexto.pendenciaAtiva),
		totalHistoricoConsiderado: resumirHistorico(contexto.historicoRecente || []).length,
		totalLivrosConsiderados: resumirLivros(contexto.livrosDoUsuario || []).length
	};
}

function resumirHistorico(historicoRecente = []) {
	return historicoRecente.slice(0, 5).map((item) => ({
		texto: item.texto,
		acao: item.acao,
		parametros: item.parametros || {},
		sucesso: Boolean(item.sucesso),
		mensagem: item.mensagem,
		pendencia: item.pendencia || null
	}));
}

function resumirLivros(livrosDoUsuario = []) {
	return livrosDoUsuario.slice(0, 20).map((item) => ({
		titulo: item.titulo,
		paginas: item.paginas,
		paginaAtual: item.paginaAtual,
		categoria: item.categoria,
		concluido: Boolean(item.concluido)
	}));
}

export function montarMensagensAgente(texto = "", contexto = {}) {
	// Aqui montamos o prompt operacional do agente: comando atual, pendencia
	// ativa, historico recente e livros do usuario entram como contexto.
	// Esse payload sera enviado como mensagem `user`; o `system` abaixo explica
	// como o LLM deve usar esse contexto e quando deve escolher uma tool.
	const payload = {
		comandoAtual: texto,
		contexto: {
			pendenciaAtiva: contexto.pendenciaAtiva || null,
			historicoRecente: resumirHistorico(contexto.historicoRecente || []),
			livrosDoUsuario: resumirLivros(contexto.livrosDoUsuario || [])
		}
	};

	return [
		{
			role: "system",
			content: [
				"Voce e o agente de leitura do CLP.",
				"Sua tarefa e analisar a observacao atual do usuario junto com o contexto do agente.",
				"Decida se a observacao atual inicia uma nova acao ou complementa uma pendencia anterior.",
				"Use o historico e a pendencia ativa para combinar parametros quando fizer sentido.",
				"Analise as ferramentas disponiveis, suas descricoes e seus schemas recebidos via tool calling.",
				"Escolha exatamente a ferramenta que melhor representa a intencao do usuario.",
				"Se nenhuma ferramenta representar bem a intencao, escolha comando_desconhecido e peca ao usuario para reformular com uma acao de leitura mais clara.",
				"Se existe uma acao clara, mas faltam campos obrigatorios para executar, escolha solicitar_dados.",
				"Em solicitar_dados, informe acaoPretendida, campos faltantes, parametros parciais ja conhecidos e uma mensagem objetiva ao usuario.",
				"No argumento titulo, inclua somente o nome da obra.",
				"Nao inclua genero, paginas, nota ou comentario dentro do titulo.",
				"Nao infira genero ou categoria pelo nome do livro; use Outro se o usuario nao falou a categoria explicitamente nem ela ja estiver na pendencia ativa.",
				"Se a observacao atual completar uma pendencia, retorne a ferramenta da pendencia com os parametros finais combinados.",
				"Quando usar a pendencia ativa, leia contexto.pendenciaAtiva.parametrosParciais e monte os parametros finais da ferramenta.",
				"Se a pendencia ativa for de criar_livro e o usuario informar paginas e categoria, nao use solicitar_dados; use a ferramenta final criar_livro.",
				"Nao use solicitar_dados quando a observacao atual preencher todos os campos faltantes da pendencia ativa; use a ferramenta final correspondente.",
				"Exemplo: pendencia criar_livro faltando paginas e categoria, observacao '350, drama' significa paginas=350 e categoria=Drama; chame criar_livro.",
				"Nao deixe vazio um campo que ja exista em parametrosParciais, como titulo, paginas, categoria, paginaAtual, avaliacao ou descricao."
			].join(" ")
		},
		{
			role: "user",
			content: JSON.stringify(payload)
		}
	];
}

export function adaptarToolCall(toolCall, texto = "", contexto = {}) {
	// A resposta do LLM vem como tool call. Essa funcao transforma a escolha
	// do modelo no formato interno usado pelo BDI.
	// Exemplo: se o LLM chamou criar_livro, daqui sai { acao: "criar_livro",
	// parametros: ... }, que depois vira desejo, intencao e ferramenta real no BDI.
	const nomeFerramenta = toolCall?.function?.name;

	if (!nomesFerramentasLeitura.includes(nomeFerramenta)) {
		return interpretarIndisponivel("Nao consegui associar o comando a uma ferramenta disponivel.");
	}

	try {
		const argumentos = JSON.parse(toolCall.function.arguments || "{}");

		if (nomeFerramenta === "comando_desconhecido") {
			return {
				...interpretarIndisponivel(
					argumentos.mensagem
					|| "Nao consegui entender o que voce quis dizer. Por favor, informe uma acao de leitura mais clara."
				),
				deliberacaoLLM: montarDeliberacaoLLM(nomeFerramenta, argumentos, contexto),
				toolCall: {
					id: toolCall.id,
					nome: nomeFerramenta,
					argumentos
				}
			};
		}

		const parametros = normalizarParametros(nomeFerramenta, argumentos, texto, contexto);

		return {
			acao: nomeFerramenta,
			parametros,
			origem: "openai",
			// Guardamos a deliberacao do LLM para a aba Agente mostrar o raciocinio
			// operacional: qual tool foi proposta e quais parametros vieram dela.
			deliberacaoLLM: montarDeliberacaoLLM(nomeFerramenta, parametros, contexto),
			toolCall: {
				id: toolCall.id,
				nome: nomeFerramenta,
				argumentos
			}
		};
	} catch (error) {
		console.error("Falha ao ler argumentos da tool escolhida:", error.message);
		return interpretarIndisponivel("A OpenAI escolheu uma ferramenta, mas os argumentos vieram em formato invalido.");
	}
}

export async function interpretarComandoComIA(texto = "", contexto = {}) {
	if (!process.env.OPENAI_API_KEY) {
		return interpretarIndisponivel("Configure a OPENAI_API_KEY no backend para ativar o agente interpretador.");
	}

	try {
		// Esta e a decisao agêntica baseada em LLM: a OpenAI deve escolher
		// exatamente uma ferramenta entre as ferramentas de leitura disponiveis.
		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
			maxRetries: 0
		});

		// Ponto exato em que mandamos para a OpenAI:
		// - `messages` leva o comando atual e o contexto do agente;
		// - `tools` leva o catalogo de ferramentas disponiveis;
		// - `tool_choice: "required"` obriga o modelo a escolher uma tool.
		const completion = await openai.chat.completions.create({
			model: modeloAgente,
			temperature: 0,
			tool_choice: "required",
			tools: ferramentasOpenAI,
			messages: montarMensagensAgente(texto, contexto)
		});

		// A resposta da OpenAI vem em `choices`. Como obrigamos tool calling,
		// esperamos que a primeira escolha tenha uma chamada de ferramenta.
		// Exemplo esperado: tool_calls[0].function.name = "criar_livro"
		// e tool_calls[0].function.arguments = "{\"titulo\":\"Marley e Eu\",...}".
		const toolCall = completion.choices[0]?.message?.tool_calls?.[0];

		if (!toolCall) {
			return interpretarIndisponivel("A OpenAI nao escolheu uma ferramenta para esse comando.");
		}

		// Proximo passo: transformar a tool call bruta da OpenAI no formato
		// interno do projeto. A partir daqui o BDI recebe algo como:
		// { acao: "criar_livro", parametros: { titulo, paginas, categoria } }.
		// O texto original e o contexto ainda sao passados para normalizar dados
		// e registrar se a decisao usou historico ou pendencia ativa.
		return adaptarToolCall(toolCall, texto, contexto);
	} catch (error) {
		console.error("Falha ao interpretar comando com IA:", error.message);
		return interpretarIndisponivel("Nao consegui interpretar o comando com a OpenAI no momento. Tente novamente em instantes.");
	}
}
