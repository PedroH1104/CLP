import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoadingProps {
  paginaInicial?: boolean; // Define que a prop é opcional
}

export default function Loading({ paginaInicial = false }: LoadingProps) {
  return (
    <View style={[styles.loadingContainer, !paginaInicial && styles.smallLoading]}>
      <ActivityIndicator size="large" color="#003366" />
      {paginaInicial && <Text style={styles.loadingText}>Carregando...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  smallLoading: {
    maxHeight: 50,
    backgroundColor: 'transparent', // Fundo transparente para o indicador em cards ou botões
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
});
