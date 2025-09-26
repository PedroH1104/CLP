import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import PageStructure from '../../../components/PageStructure';
import { useLogadoContext } from '../../../context/logadoContext';
import CardLivro from '../../../components/CardLivro';
import { useModalContext } from '../../../context/modalContext';
import { ModalsController } from '../../../components/ModalsController';
import { Ionicons } from '@expo/vector-icons';

export default function MeusLivros() {

  const { livros } = useLogadoContext();
  const [filtroPeloNome, setFiltroPeloNome] = useState('');
  const [livrosFiltrados, setLivrosFiltrados] = useState<any[]>([]);
  const { atualizaLivrosDoUsuario } = useLogadoContext();
  const { modalOpen, setModalQueEstaAberto, setModalOpen } = useModalContext();

  useEffect(() => {
    atualizaLivrosDoUsuario();
  }, [])  

  useEffect(() => {
    const filtrados = livros.filter((livro) =>
      livro.titulo?.toLowerCase().includes(filtroPeloNome.toLowerCase())
    );
    setLivrosFiltrados(filtrados);
  }, [filtroPeloNome, livros]);

  const abrirModalCriacaoLivro = () => {
    setModalQueEstaAberto("criarLivro");
    setModalOpen(true);
  };

  return (
    <PageStructure title="Meus Livros" icon="book">
      <View style={styles.container}>
        {livros.length > 0 &&<TextInput
          style={styles.input}
          placeholder="Busque seu livro pelo nome"
          value={filtroPeloNome}
          onChangeText={setFiltroPeloNome}
        />}
        {livrosFiltrados.length > 0 ? (
          <View>
            <Text style={styles.subheading}>Clique no seu livro para editar informações</Text>
            <FlatList
              data={livrosFiltrados}
              horizontal
              keyExtractor={(item) => item._id} 
              renderItem={({ item }) => (
                <View style={styles.cardContainer}>
                  <CardLivro {...item} />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ) : (
          <Text style={styles.emptyText}>
            {filtroPeloNome
              ? 'Nenhum livro encontrado.'
              : 'Você ainda não adicionou nenhum livro.'}
          </Text>
        )}
        {modalOpen && <ModalsController/>}
        <TouchableOpacity style={styles.fab} onPress={abrirModalCriacaoLivro}>
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>
      
    </PageStructure>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,    
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,    
    marginBottom: 20,
    marginHorizontal: 40,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  cardContainer: {
    marginHorizontal: 10,    
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: -100,
    right: 20,
    backgroundColor: '#2A6FB0', // Cor azul
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Sombra no Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});