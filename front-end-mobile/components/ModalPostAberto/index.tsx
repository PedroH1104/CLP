import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Image, FlatList } from 'react-native';
import { useModalContext } from '../../context/modalContext';
import { Ionicons } from '@expo/vector-icons';
import StarRating from '../StarRating'; // Supondo que você tenha um componente de avaliação
import { formatDistanceToNowInPortuguese } from '../../services/dateDistance';

export default function ModalPostAberto() {
    const { publicacaoAberta, modalOpen, setModalOpen } = useModalContext();
    const [comentario, setComentario] = useState('');
    const [comentarios, setComentarios] = useState(publicacaoAberta?.comentarios || []);

    const handleEnviarComentario = () => {
        if (comentario.trim()) {
            setComentarios([...comentarios, { texto: comentario, autor: 'Usuário', data: new Date() }]);
            setComentario('');
        }
    };

    const renderComentario = ({ item } : any) => (
        <View style={styles.comentarioItem}>
            <Text style={styles.comentarioAutor}>{item.autor}</Text>
            <Text style={styles.comentarioTexto}>{item.texto}</Text>
            <Text style={styles.comentarioData}>{formatDistanceToNowInPortuguese(item.data)} atrás</Text>
        </View>
    );

    return (
        <Modal animationType="fade" transparent visible={modalOpen}>
            <TouchableWithoutFeedback onPress={() => setModalOpen(false)}>
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalOpen(false)}>
                                <Ionicons name="close-circle-outline" size={24} color="#666" />
                            </TouchableOpacity>

                            
                            <View style={styles.header}>
                                <Ionicons name="person-circle" size={32} color="#003366" />
                                <Text style={styles.autor}>{publicacaoAberta?.nomeAutor}</Text>
                            </View>

                           
                            <View style={styles.ratingContainer}>
                                <StarRating rating={publicacaoAberta?.avaliacao} size={26} color="#003366" />
                            </View>

                            {/* Tempo que faz 
                            <Text style={styles.textDate}>{formatDistanceToNowInPortuguese(publicacaoAberta?.data)} atrás</Text>
                            */}
                            
                            <View style={styles.descricaoContainer}>
                                {publicacaoAberta?.descricao && <Text style={styles.descricao}>{publicacaoAberta?.descricao}</Text>}
                                {publicacaoAberta?.imagem && <Image source={{ uri: publicacaoAberta?.imagem }} style={styles.imagemLivro} />}
                            </View>
                            
                            <FlatList
                                data={comentarios}
                                renderItem={renderComentario}
                                keyExtractor={(item, index) => index.toString()}
                                style={styles.listaComentarios}
                            />
                            
                            <View style={styles.comentarioContainer}>
                                <TextInput
                                    style={styles.comentarioInput}
                                    multiline
                                    placeholder="Digite seu comentário"
                                    value={comentario}
                                    onChangeText={setComentario}
                                />
                                <TouchableOpacity style={styles.enviarButton} onPress={handleEnviarComentario}>
                                    <Text style={styles.buttonText}>Enviar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: "white",
        width: "90%",
        padding: 12,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 5,
    },
    autor: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#003366",
    },
    textDate: {
        fontSize: 14,
        color: "#999",
        marginBottom: 10,  // Ajuste para o tempo ficar mais distante
    },
    ratingContainer: {
        marginVertical: 8,
        alignItems: "center",
    },
    descricaoContainer: {
        marginBottom: 15,
        alignItems: "center",
    },
    descricao: {
        fontSize: 16,
        textAlign: "center",
        color: "#666",
        marginBottom: 8,
    },
    imagemLivro: {
        width: 90,
        height: 120,
        borderRadius: 8,
        marginVertical: 10,
    },
    listaComentarios: {
        maxHeight: 150,
        marginVertical: 10,
        paddingBottom: 10,
    },
    comentarioItem: {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 8,
    },
    comentarioAutor: {
        fontWeight: "bold",
        color: "#003366",
    },
    comentarioTexto: {
        fontSize: 16,
        color: "#333",
        marginVertical: 4,
    },
    comentarioData: {
        fontSize: 12,
        color: "#999",
    },
    comentarioContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 10,
    },
    comentarioInput: {
        height: 40,
        width: "75%",
        fontSize: 16,
        color: "#333",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: "#F9F9F9",
    },
    enviarButton: {
        backgroundColor: "#003366",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        minWidth: "20%",
        alignSelf: "center",
    },
    buttonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "white",
    },
});