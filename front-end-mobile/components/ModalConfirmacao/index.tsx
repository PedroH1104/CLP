import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ModalConfirmacaoProps {
    visivel: boolean;
    titulo?: string;
    mensagem: string;
    onConfirmar: () => void;
    onCancelar: () => void;
}

export default function ModalConfirmacao({ visivel, titulo = "Confirmação", mensagem, onConfirmar, onCancelar }: ModalConfirmacaoProps) {
    return (
        <Modal transparent visible={visivel} animationType="fade">
            <View style={styles.container}>
                <View style={styles.modalContent}>
                    <Text style={styles.titulo}>{titulo}</Text>
                    <Text style={styles.mensagem}>{mensagem}</Text>
                    <View style={styles.botoesContainer}>
                        <TouchableOpacity style={[styles.botao, styles.botaoCancelar]} onPress={onCancelar}>
                            <Text style={styles.textoBotao}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.botao, styles.botaoConfirmar]} onPress={onConfirmar}>
                            <Text style={styles.textoBotao}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    titulo: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#003366",
        marginBottom: 10,
    },
    mensagem: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },
    botoesContainer: {
        flexDirection: "row",
        gap: 10,
    },
    botao: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    botaoCancelar: {
        backgroundColor: "#ccc",
    },
    botaoConfirmar: {
        backgroundColor: "#C62828",
    },
    textoBotao: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
});