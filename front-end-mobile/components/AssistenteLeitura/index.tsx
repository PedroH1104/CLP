import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { executarAgente, RespostaAgente, ResultadoSocialAgente, transcreverAudio } from "../../services/agente";
import { useLogadoContext } from "../../context/logadoContext";
import StarRating from "../StarRating";

type ConfirmacaoExclusao = {
  texto: string;
  titulo: string;
  acao: string;
  origem?: "openai";
  parametros?: Record<string, any>;
};

function extrairTituloConfirmacao(resultado: RespostaAgente) {
  return (
    resultado.parametros?.titulo ||
    resultado.dados?.titulo ||
    resultado.dados?.livro?.titulo ||
    "este livro"
  );
}

function extrairMensagemErro(error: any) {
  return (
    error?.response?.data?.mensagem ||
    error?.message ||
    "Nao consegui processar o audio."
  );
}

function resultadoEhSocial(resultado: RespostaAgente) {
  return resultado.acao === "consultar_social" && Array.isArray(resultado.dados);
}

function resultadoUsouMemoria(resultado: RespostaAgente) {
  return Boolean(
    resultado.traceBDI?.etapas?.some((etapa) =>
      Boolean(etapa.detalhes?.memoria?.usouPendencia)
    )
  );
}

function AvaliacaoResumoCard({ avaliacao }: { avaliacao: ResultadoSocialAgente }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerAvatar}>
          <Ionicons name="person" size={16} color="#003366" />
        </View>

        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{avaliacao.autor || "Leitor"}</Text>
          <Text style={styles.bookName}>{avaliacao.livro}</Text>
        </View>
      </View>

      <View style={styles.ratingLine}>
        <StarRating rating={Number(avaliacao.avaliacao) || 0} size={17} color="#F59E0B" />
        <Text style={styles.ratingText}>{Number(avaliacao.avaliacao || 0).toFixed(1)}</Text>
      </View>

      {!!avaliacao.descricao && (
        <Text style={styles.reviewText}>{avaliacao.descricao}</Text>
      )}
    </View>
  );
}

export default function AssistenteLeitura() {
  const {
    usuarioID,
    nome,
    atualizaLivrosDoUsuario,
    atualizaListaDePosts,
  } = useLogadoContext();

  const gravador = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const estadoGravador = useAudioRecorderState(gravador);
  const [gravando, setGravando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState<ConfirmacaoExclusao | null>(null);
  const [resultadoSocial, setResultadoSocial] = useState<RespostaAgente | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const atualizarDadosDaTela = async () => {
    await atualizaLivrosDoUsuario();
    await atualizaListaDePosts();
  };

  // Fluxo principal do assistente no app: o front so envia o texto ao backend
  // e reage ao resultado. A decisao da acao fica no agente do servidor.
  const executarComandoPorTexto = async (
    texto: string,
    confirmar = false,
    interpretacaoConfirmada?: ConfirmacaoExclusao
  ) => {
    const resultado: RespostaAgente = await executarAgente({
      texto,
      usuarioId: usuarioID,
      nomeUsuario: nome,
      confirmar,
      interpretacaoConfirmada: interpretacaoConfirmada
        ? {
            acao: interpretacaoConfirmada.acao,
            origem: interpretacaoConfirmada.origem,
            parametros: interpretacaoConfirmada.parametros,
          }
        : undefined,
    });

    if (resultado.precisaConfirmacao) {
      setConfirmacaoExclusao({
        texto,
        titulo: extrairTituloConfirmacao(resultado),
        acao: resultado.acao,
        origem: resultado.origemInterpretacao,
        parametros: resultado.parametros,
      });
      return resultado;
    }

    if (resultado.sucesso) {
      if (resultadoEhSocial(resultado)) {
        setMensagem("");
        setResultadoSocial(resultado);
      } else if (resultadoUsouMemoria(resultado)) {
        setMensagem(resultado.mensagem);
        setTimeout(() => setMensagem(""), 4500);
      } else {
        setMensagem("");
      }
      await atualizarDadosDaTela();
      return resultado;
    }

    setMensagem(resultado.mensagem || "Nao consegui identificar a acao.");
    return resultado;
  };

  const iniciarGravacao = async () => {
    try {
      setMensagem("");

      const permissao = await requestRecordingPermissionsAsync();
      if (!permissao.granted) {
        setMensagem("Permissao de microfone negada.");
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await gravador.prepareToRecordAsync();
      gravador.record();
      setGravando(true);
    } catch (error: any) {
      setGravando(false);
      setMensagem(error?.message || "Nao consegui iniciar a gravacao.");
    }
  };

  // Ao parar a gravacao, o audio vira texto pela OpenAI e esse texto passa
  // a ser a observacao externa recebida pelo agente de leitura.
  const pararGravacao = async () => {
    if (!gravando) {
      setGravando(false);
      setMensagem("Nenhuma gravacao ativa.");
      return;
    }

    setProcessando(true);
    setMensagem("");

    try {
      await gravador.stop();
      const audioUri = gravador.uri;

      setGravando(false);

      if (!audioUri) {
        setMensagem("Nao consegui acessar o audio gravado.");
        return;
      }

      const transcricao = await transcreverAudio(audioUri);
      console.log("[AssistenteLeitura] audio transcrito", {
        caracteres: transcricao.length,
      });
      await executarComandoPorTexto(transcricao);
    } catch (error: any) {
      setMensagem(extrairMensagemErro(error));
    } finally {
      setProcessando(false);
    }
  };

  // Confirmacoes reaproveitam a interpretacao ja feita para nao gastar uma
  // nova chamada de LLM apenas para confirmar a exclusao.
  const confirmarExclusao = async () => {
    if (!confirmacaoExclusao) {
      return;
    }

    setExcluindo(true);
    setMensagem("");

    try {
      await executarComandoPorTexto(confirmacaoExclusao.texto, true, confirmacaoExclusao);
      setConfirmacaoExclusao(null);
    } catch (error: any) {
      setMensagem(extrairMensagemErro(error));
    } finally {
      setExcluindo(false);
    }
  };

  const statusTexto = mensagem || (gravando && !processando
    ? `Ouvindo... ${Math.round((estadoGravador.durationMillis || 0) / 1000)}s`
    : "");
  const avaliacoesSociais = resultadoSocial?.acao === "consultar_social" && Array.isArray(resultadoSocial.dados)
    ? (resultadoSocial.dados as ResultadoSocialAgente[])
    : [];

  return (
    <View style={styles.container}>
      {!!statusTexto && (
        <View style={styles.statusBubble}>
          <Text style={styles.statusText}>{statusTexto}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, gravando && styles.recordingButton]}
        onPress={gravando ? pararGravacao : iniciarGravacao}
        disabled={processando}
        activeOpacity={0.85}
      >
        {processando ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons name={gravando ? "stop" : "mic"} size={30} color="white" />
        )}
      </TouchableOpacity>

      <Modal
        transparent
        visible={!!confirmacaoExclusao}
        animationType="fade"
        onRequestClose={() => !excluindo && setConfirmacaoExclusao(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Deseja realmente excluir o livro {confirmacaoExclusao?.titulo}?
            </Text>
            <Text style={styles.modalSubtitle}>Essa acao e irreversivel.</Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmacaoExclusao(null)}
                disabled={excluindo}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.deleteButton, excluindo && styles.disabledButton]}
                onPress={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={!!resultadoSocial}
        animationType="fade"
        onRequestClose={() => setResultadoSocial(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.socialModalCard}>
            <View style={styles.socialHeader}>
              <View style={styles.socialTitleGroup}>
                <Text style={styles.modalTitle}>Avaliacoes encontradas</Text>
                <Text style={styles.modalSubtitle}>{resultadoSocial?.mensagem}</Text>
              </View>

              <Pressable style={styles.closeButton} onPress={() => setResultadoSocial(null)}>
                <Ionicons name="close" size={22} color="#1F2933" />
              </Pressable>
            </View>

            <ScrollView style={styles.reviewsScroll} contentContainerStyle={styles.reviewsContent}>
              {avaliacoesSociais.length > 0 ? (
                avaliacoesSociais.map((avaliacao) => (
                  <AvaliacaoResumoCard key={avaliacao.id} avaliacao={avaliacao} />
                ))
              ) : (
                <View style={styles.emptyReviewsBox}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#64748B" />
                  <Text style={styles.emptyReviewsText}>
                    Nenhuma avaliacao encontrada para esse livro.
                  </Text>
                </View>
              )}
            </ScrollView>

            <Pressable style={styles.okButton} onPress={() => setResultadoSocial(null)}>
              <Text style={styles.okButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  recordingButton: {
    backgroundColor: "#C62828",
  },
  statusBubble: {
    position: "absolute",
    right: 0,
    bottom: 74,
    maxWidth: 260,
    minWidth: 148,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#003366",
  },
  statusText: {
    color: "white",
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 22,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  socialModalCard: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "78%",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  socialHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  socialTitleGroup: {
    flex: 1,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    color: "#003366",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    textAlign: "center",
  },
  modalSubtitle: {
    marginTop: 8,
    color: "#777",
    fontSize: 14,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },
  modalButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#C9D5E3",
    backgroundColor: "#fff",
  },
  cancelButtonText: {
    color: "#003366",
    fontSize: 15,
    fontWeight: "700",
  },
  deleteButton: {
    backgroundColor: "#C62828",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.75,
  },
  reviewsScroll: {
    maxHeight: 360,
  },
  reviewsContent: {
    gap: 10,
    paddingBottom: 4,
  },
  reviewCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8E0EA",
    backgroundColor: "white",
    padding: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAF2FB",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    color: "#1F2933",
    fontSize: 14,
    fontWeight: "700",
  },
  bookName: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  ratingLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  ratingText: {
    color: "#92400E",
    fontSize: 13,
    fontWeight: "700",
  },
  reviewText: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  emptyReviewsBox: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  emptyReviewsText: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
  },
  okButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: "#2A6FB0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  okButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
});
