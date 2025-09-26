import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import PageStructure from '../../../components/PageStructure';
import CardStatusInfo from '../../../components/CardStatusInfo';
import { useLogadoContext } from '../../../context/logadoContext';
import CardLivro from '../../../components/CardLivro';
import Loading from '../../../components/Loading';

export default function Inicio() {
    const { listaSugestoes, criaSugestoes, isLoadingUser } = useLogadoContext();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            // Chama a função para criar novas sugestões
            await criaSugestoes();
        } catch (error) {
            console.error("Erro ao atualizar sugestões:", error);
        } finally {
            setRefreshing(false);
        }
    }, [criaSugestoes]);

    if (isLoadingUser) {
        return <Loading paginaInicial />
    }

    return (
        <PageStructure
            title="Início"
            icon="home"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.container}>
                {/* Um único loading para toda a página quando os dados do usuário estão sendo carregados */}


                <Text style={styles.sectionTitle}>Visão geral</Text>
                <Text style={styles.subheading}>
                    Abaixo você encontrará uma visão geral dos seus livros. Estes cartões mostram a quantidade de livros em diferentes estágios de leitura.
                </Text>
                <View style={styles.cardStatusInfoContainer}>
                    <CardStatusInfo tipo={1} />
                    <CardStatusInfo tipo={2} />
                    <CardStatusInfo tipo={3} />
                </View>

                {/* Exibe o conteúdo de sugestões se a lista não estiver vazia */}
                {listaSugestoes.length > 0 ? (
                    <View>
                        <Text style={styles.sectionTitle}>Lista de Sugestões</Text>
                        <Text style={styles.subheading}>
                            Aqui estão algumas sugestões de leitura baseadas em livros de outros usuários. Puxe para baixo para atualizar a lista!
                        </Text>
                        <FlatList
                            data={listaSugestoes}
                            horizontal
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <View style={styles.cardItemContainer}>
                                    <CardLivro {...item} sugestao />
                                </View>
                            )}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Você já viu todas as sugestões. Puxe para baixo para ver mais!</Text>
                    </View>
                )}
            </View>
        </PageStructure>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Use flex: 1 para que o container ocupe todo o espaço
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    subheading: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    // Novo estilo para o container dos CardStatusInfo
    cardStatusInfoContainer: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginBottom: 30
    },
    // Estilo para cada item individual da FlatList
    cardItemContainer: {
        marginHorizontal: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
});