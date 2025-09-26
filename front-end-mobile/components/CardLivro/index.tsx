import React, { useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LivroProps } from '../../types/Livro';
import { useModalContext } from '../../context/modalContext';
import StarRating from '../StarRating';
import { differenceInDays, startOfDay } from 'date-fns';
import { Ionicons } from "@expo/vector-icons";
import { useLogadoContext } from '../../context/logadoContext';
import { adicionaSugestao } from '../../services/livro';
import Loading from '../Loading';

interface CardLivroProps extends LivroProps {
  sugestao?: boolean;
  avaliacaoReal?: number;
}

export default function CardLivro({ sugestao, avaliacaoReal, ...livro }: CardLivroProps) {

  const { setModalOpen, setModalQueEstaAberto, setCardAberto } = useModalContext();
  const { usuarioID, setListaSugestoes, listaSugestoes, atualizaLivrosDoUsuario } = useLogadoContext();
  const [loading, setLoading] = useState(false);

  // Otimização com useMemo para evitar re-cálculos desnecessários
  const backgroundColor = useMemo(() => {
    if (sugestao) return styles.bgLaranjaClaro;
    if (livro.paginaAtual === 0 && !livro.concluido) return styles.bgCinzaEscuro;
    if (livro.paginaAtual !== 0 && !livro.concluido) return styles.bgAzulPadrao;
    if (livro.concluido) return styles.bgVerdeEscuro;
    return {};
  }, [sugestao, livro.paginaAtual, livro.concluido]);

  const textoMinimizado = useMemo(() => {
    if (!livro.titulo) return '';
    return livro.titulo.length > 20 ? `${livro.titulo.substring(0, 20)}...` : livro.titulo;
  }, [livro.titulo]);

  const tempoMeta = useMemo(() => {
    if (!livro.dataMeta) return '';
    const hoje = startOfDay(new Date());
    const dataMetaDate = startOfDay(new Date(livro.dataMeta));
    const diferencaDias = differenceInDays(dataMetaDate, hoje);

    if (diferencaDias === 0) return "Sua meta encerra hoje";
    if (diferencaDias === 1) return "Sua meta encerra amanhã";
    if (diferencaDias > 1) return `Sua meta encerra em ${diferencaDias} dias`;
    return "Sua meta expirou";
  }, [livro.dataMeta]);

  const abrirCardModal = () => {
    setCardAberto(livro);
    setModalQueEstaAberto("visualizarLivro");
    setModalOpen(true);
  };

  const handleAdicionarSugestao = async () => {
    setLoading(true);
    try {
      const livroAdicionado = {
        usuarioId: usuarioID,
        titulo: livro.titulo,
        paginas: Number(livro.paginas),
        categoria: livro.categoria,
        imagem: livro.imagem,
      };
      await adicionaSugestao(livroAdicionado);
    } catch (error) {
      console.error("Erro ao adicionar sugestão:", error);
    } finally {
      atualizaLivrosDoUsuario();
      handleRemoverSugestao();
      setLoading(false);
    }
  };

  const handleRemoverSugestao = async () => {
    setLoading(true);
    try {
      const novaListaSugestoes = listaSugestoes.filter((item) => item._id !== livro._id);
      setListaSugestoes(novaListaSugestoes);
    } catch (error) {
      console.error("Erro ao remover sugestão:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        onPress={() => !sugestao && abrirCardModal()}
        style={[styles.card, sugestao && styles.disabledCard]}
        disabled={sugestao}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: livro.imagem }} style={styles.image} />
        </View>
        <View style={[styles.cardFooter, backgroundColor]}>
          <Text style={styles.title} numberOfLines={1}>
            {textoMinimizado}
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{livro.categoria}</Text>
            <Text style={styles.infoText}>
              {sugestao ? 0 : livro.paginaAtual}/{livro.paginas}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.starsWrapper}>
        {sugestao && avaliacaoReal !== undefined && <StarRating rating={avaliacaoReal} size={20} color="#003366" />}
        {!sugestao && livro.concluido && livro.avaliacao !== undefined && livro.avaliacao !== 0 && (
          <StarRating rating={livro.avaliacao} size={20} color="#003366" />
        )}
        {!sugestao && !livro.concluido && <Text style={styles.metaNotice}>{tempoMeta}</Text>}
        {sugestao && (
          loading ? (
            <Loading />
          ) : (
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={handleAdicionarSugestao}>
                <Ionicons name="checkmark-circle-outline" size={36} color="#2E7D32" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRemoverSugestao}>
                <Ionicons name="close-circle-outline" size={36} color="#FF5252" />
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 200,
    marginBottom: 10,
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
    height: 280,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledCard: {
    opacity: 0.6,
  },
  imageContainer: {
    height: "60%",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
  },
  cardFooter: {
    height: "40%",
    padding: 10,
    justifyContent: "center",
  },
  bgLaranjaClaro: {
    backgroundColor: "#FFA726",
  },
  bgCinzaEscuro: {
    backgroundColor: "#616161",
  },
  bgAzulPadrao: {
    backgroundColor: "#003366",
  },
  bgVerdeEscuro: {
    backgroundColor: "#2E7D32",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
  },
  starsWrapper: {
    marginTop: 5,
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  metaNotice: {
    fontSize: 14,
    color: "#999",
    fontWeight: "400",
  },
  iconRow: {
    flexDirection: "row",
    marginTop: 5,
    gap: 15,
  },
});
