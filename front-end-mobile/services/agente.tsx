import { api } from "../api/api";

export interface ExecutarAgentePayload {
  texto: string;
  usuarioId: string;
  nomeUsuario?: string;
  confirmar?: boolean;
  interpretacaoConfirmada?: {
    acao: string;
    origem?: "openai";
    parametros?: Record<string, any>;
  };
}

export interface RespostaAgente {
  agente: string;
  acao: string;
  origemInterpretacao?: "openai";
  sucesso: boolean;
  precisaConfirmacao?: boolean;
  mensagem: string;
  parametros?: Record<string, any>;
  traceBDI?: {
    modelo?: string;
    resumo?: {
      acao?: string;
      origemInterpretacao?: string;
      ferramentaEscolhida?: string;
      sucesso?: boolean;
      usouMemoria?: boolean;
      planoLLM?: boolean;
      precisaConfirmacao?: boolean;
      totalEtapas?: number;
    };
    etapas?: Array<{
      tipo: string;
      titulo: string;
      descricao: string;
      detalhes?: Record<string, any>;
    }>;
  };
  dados?: ResultadoSocialAgente[] | any;
}

export interface ResultadoSocialAgente {
  id: string;
  autor: string;
  livro: string;
  avaliacao: number;
  descricao?: string;
  imagem?: string;
  data?: string;
  curtidas?: string[];
  comentarios?: any[];
}

export interface HistoricoAgenteItem {
  _id: string;
  usuarioId: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
  texto: string;
  acao: string;
  origemInterpretacao: "openai";
  parametros?: Record<string, any>;
  sucesso: boolean;
  precisaConfirmacao?: boolean;
  mensagem: string;
  traceBDI?: {
    modelo?: string;
    resumo?: {
      acao?: string;
      origemInterpretacao?: string;
      ferramentaEscolhida?: string;
      sucesso?: boolean;
      usouMemoria?: boolean;
      planoLLM?: boolean;
      precisaConfirmacao?: boolean;
      totalEtapas?: number;
    };
    etapas?: Array<{
      tipo: string;
      titulo: string;
      descricao: string;
      detalhes?: Record<string, any>;
    }>;
  };
  data: string;
}

export async function executarAgente(payload: ExecutarAgentePayload): Promise<RespostaAgente> {
  const resposta = await api.post("/agente/executar", payload, { timeout: 10000 });
  return resposta.data;
}

export async function transcreverAudio(uri: string): Promise<string> {
  const formData = new FormData();

  formData.append("audio", {
    uri,
    name: "comando.m4a",
    type: "audio/mp4",
  } as any);

  let resposta;

  try {
    resposta = await api.post("/agente/transcrever", formData, {
      timeout: 90000,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data) => data,
    });
  } catch (error: any) {
    console.log("[transcreverAudio] erro no upload", {
      mensagem: error.message,
      codigo: error.code,
      status: error.response?.status,
      resposta: error.response?.data,
      baseURL: error.config?.baseURL,
      url: error.config?.url,
    });

    const mensagemBackend = error.response?.data?.mensagem;
    if (mensagemBackend) {
      throw new Error(mensagemBackend);
    }

    if (error.code === "ERR_NETWORK") {
      throw new Error(
        "Nao consegui enviar o audio ao backend. Verifique se o backend esta rodando e se o celular esta na mesma rede do computador."
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("A transcricao demorou demais para responder. Tente novamente com um audio mais curto.");
    }

    throw error;
  }

  if (!resposta.data.sucesso || !resposta.data.texto) {
    throw new Error(resposta.data.mensagem || "Audio sem transcricao.");
  }

  return resposta.data.texto;
}

export async function buscarHistoricoAgente(usuarioId: string, admin = false): Promise<HistoricoAgenteItem[]> {
  const resposta = await api.get(`/agente/historico?usuario=${usuarioId}&admin=${admin}`, { timeout: 10000 });
  return resposta.data;
}
