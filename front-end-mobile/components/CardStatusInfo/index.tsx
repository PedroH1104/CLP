import React, { useMemo } from 'react'; // Adicionado useMemo
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLogadoContext } from '../../context/logadoContext';
import { LivroProps } from '../../types/Livro';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

type CardStatusInfoProps = {
  tipo: 1 | 2 | 3;
};

export default function CardStatusInfo({ tipo }: CardStatusInfoProps) {
  const { livros } = useLogadoContext();

  // 1. Função de filtragem movida para dentro do componente, mas chamada no useMemo
  const filtrarLivros = (livros: LivroProps[], tipo: 1 | 2 | 3) => {
    if (tipo === 1) return livros.filter((livro: LivroProps) => livro.paginaAtual === 0 && !livro.concluido);
    if (tipo === 2) return livros.filter((livro: LivroProps) => livro.paginaAtual !== 0 && !livro.concluido);
    if (tipo === 3) return livros.filter((livro: LivroProps) => livro.concluido);
    return [];
  };

  // 2. O useMemo memoriza a lista de livros filtrados.
  // O filtro só é executado se 'livros' ou 'tipo' mudarem.
  const livrosFiltrados = useMemo(() => {
    return filtrarLivros(livros, tipo);
  }, [livros, tipo]);


  const getCardStyle = () => {
    if (tipo === 1) return ['#757575', '#424242'] as const;
    if (tipo === 2) return ['#1976D2', '#0D47A1'] as const;
    if (tipo === 3) return ['#388E3C', '#1B5E20'] as const;
    return ['#000', '#333'] as const;
  };


  const getIcon = () => {
    if (tipo === 1) return <FontAwesome name="clipboard" size={70} color="rgba(255, 255, 255, 0.1)" />;
    if (tipo === 2) return <MaterialCommunityIcons name="progress-clock" size={80} color="rgba(255, 255, 255, 0.1)" />;
    if (tipo === 3) return <FontAwesome name="check-circle" size={70} color="rgba(255, 255, 255, 0.1)" />;
    return null;
  };

  const getLabel = () => {
    const quantidade = livrosFiltrados.length;
    if (tipo === 1) return quantidade === 1 ? 'Livro\nNão Iniciado' : 'Livros\nNão Iniciados';
    if (tipo === 2) return quantidade === 1 ? 'Livro\nEm Andamento' : 'Livros\nEm Andamento';
    if (tipo === 3) return quantidade === 1 ? 'Livro\nConcluído' : 'Livros\nConcluídos';
    return 'Desconhecido';
  };

  return (
    <LinearGradient colors={getCardStyle()} style={styles.card}>

      <View style={styles.iconContainer}>{getIcon()}</View>

      <View style={styles.content}>
        <Text style={styles.count}>{livrosFiltrados.length}</Text>
        <Text style={styles.label}>{getLabel()}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 110,
    height: 110,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  iconContainer: {
    position: 'absolute',
    top: 15,
    alignSelf: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  count: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  label: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 14,
  },
});