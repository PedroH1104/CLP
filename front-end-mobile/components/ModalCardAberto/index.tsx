import React, { useState, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Button } from 'react-native';
import { useModalContext } from '../../context/modalContext';
import { useLoadingContext } from '../../context/loadingContext';
import { useLivro } from '../../services/hooks/useLivro';
import Loading from '../Loading';
import StarRating from '../StarRating';
import { Ionicons } from "@expo/vector-icons";
import ErrorText from '../ErrorText';
import ModalConfirmacao from '../ModalConfirmacao';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ModalCardAberto() {
    const { cardAberto, modalOpen, modalQueEstaAberto, setModalOpen } = useModalContext();
    const { loading } = useLoadingContext();

    const {
        paginaAtual,
        setPaginaAtual,
        date,
        setDate,
        errorMessage,
        avaliacao,
        rating,
        setRating,
        descricao,
        setDescricao,
        inputRef,
        modalConfirmacaoVisivel,
        setModalConfirmacaoVisivel,
        showDatePicker,
        setShowDatePicker,
        showMode,
        handleDelete,
        confirmarDelete,
        handleSaveChanges,
        abreAvaliacao,
        handleFinish
    } = useLivro(cardAberto);

    // Estado local para o input de página, o valor atual que está sendo digitado
    const [paginaInput, setPaginaInput] = useState(paginaAtual.toString());

    // Estado local para o placeholder do input de página
    const [inputPlaceholder, setInputPlaceholder] = useState("Digite a página");

    // Sincroniza o estado local com o estado do hook
    useEffect(() => {
        setPaginaInput(paginaAtual.toString());
    }, [paginaAtual]);

    const handleFocus = () => {
        // Limpa o valor do input ao focar, para que o usuário comece a digitar do zero
        setPaginaInput("");
        // Altera o placeholder para guiar o usuário
        setInputPlaceholder("Ex: 150");
    };

    const handleBlur = () => {
        const parsedPage = Number(paginaInput);
        // Se o usuário digitou um valor válido, atualiza o estado da página
        if (!isNaN(parsedPage) && paginaInput !== "") {
            setPaginaAtual(parsedPage);
        }

        // Se o input estiver vazio ao perder o foco, restaura o valor anterior
        if (paginaInput === "") {
            setPaginaInput(paginaAtual.toString());
        }

        // Volta o placeholder ao estado original
        setInputPlaceholder("Digite a página");
    };

    const handleChangeText = (text: string) => {
        // Atualiza o estado local do input enquanto o usuário digita
        setPaginaInput(text);
    };

    return (
        <Modal visible={modalOpen && modalQueEstaAberto == "visualizarLivro"} animationType="fade" transparent>
            <TouchableWithoutFeedback onPress={() => setModalOpen(false)}>
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalOpen(false)}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                            <Text style={styles.title}>{cardAberto?.titulo}</Text>
                            <Text style={styles.categoria}>{cardAberto?.categoria}</Text>
                            {avaliacao ?
                                <View style={styles.formContainer}>
                                    <Text style={styles.label}>O que achou do livro? Avalie!</Text>
                                    <View style={styles.formContainer2}>
                                        <StarRating rating={rating} setRating={setRating} size={32} />
                                    </View>
                                    <View>
                                        <TextInput
                                            style={styles.comentarioInput}
                                            multiline={true}
                                            placeholder="Escreva aqui o que achou da leitura"
                                            value={descricao}
                                            onChangeText={setDescricao}
                                        />
                                        {loading ? <Loading /> :
                                            <TouchableOpacity style={styles.enviarButton} onPress={handleFinish}>
                                                <Text style={styles.buttonText}>Enviar</Text>
                                            </TouchableOpacity>
                                        }
                                        {errorMessage && <ErrorText texto={errorMessage} />}
                                    </View>
                                </View>
                                :
                                <View style={styles.formContainer}>
                                    <Text style={styles.label}>Em que página você parou?</Text>
                                    <Text style={styles.labelMenor}>Clique para editar</Text>
                                    <Pressable
                                        style={{ flexDirection: "row", alignItems: "center" }}
                                        onPress={() => inputRef.current?.focus()}
                                    >
                                        <View style={styles.pageContainer}>
                                            <TextInput
                                                ref={inputRef}
                                                style={styles.input}
                                                textAlignVertical="top"
                                                value={paginaInput}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                                placeholder={inputPlaceholder}
                                                placeholderTextColor="#999"
                                                onChangeText={handleChangeText}
                                                keyboardType="numeric"
                                            />
                                            <Text style={{ fontSize: 22 }}>/ {cardAberto?.paginas}</Text>
                                        </View>
                                    </Pressable>
                                    <Text style={styles.label}>Estabelecer prazo para leitura?</Text>
                                    {date ? (
                                        <View style={styles.dateContainer}>
                                            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                                            <Ionicons
                                                name="close-circle"
                                                size={24}
                                                color="red"
                                                onPress={() => setDate(null)}
                                                style={styles.closeIcon}
                                            />
                                        </View>
                                    ) : (
                                        <View style={{ marginTop: 20 }}>
                                            <Button onPress={showMode} title="Selecionar data" />
                                        </View>
                                    )}

                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={date || new Date()}
                                            mode="date"
                                            display="default"
                                            minimumDate={new Date(2000, 0, 1)}
                                            onChange={(event, selectedDate) => {
                                                setShowDatePicker(false);
                                                if (selectedDate) setDate(selectedDate);
                                            }}
                                        />
                                    )}
                                    <View style={styles.buttonContainer}>
                                        {loading ? <Loading /> :
                                            <>
                                                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                                                    <Text style={styles.buttonText}>Deletar Livro</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveChanges}>
                                                    <Text style={styles.buttonText}>Salvar Livro</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.button, styles.finishButton]} onPress={abreAvaliacao}>
                                                    <Text style={styles.buttonText}>Concluir Livro</Text>
                                                </TouchableOpacity>
                                            </>
                                        }
                                    </View>
                                    {errorMessage && <ErrorText texto={errorMessage} />}
                                </View>
                            }
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
            <ModalConfirmacao
                visivel={modalConfirmacaoVisivel}
                titulo="Deletar Livro"
                mensagem="Tem certeza que deseja excluir este livro? Essa ação não pode ser desfeita."
                onConfirmar={confirmarDelete}
                onCancelar={() => setModalConfirmacaoVisivel(false)}
            />
        </Modal>
    )
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
        padding: 25,
        borderRadius: 12,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#ddd",
        borderRadius: 20,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        color: "#1D5FA3",
    },
    categoria: {
        color: "#666",
        textAlign: "center",
        fontSize: 16,
        fontStyle: "italic",
    },
    formContainer: {
        alignItems: "center",
        marginTop: 15,
    },
    label: {
        color: "#1D5FA3",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    formContainer2: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
        gap: 6,
    },
    comentarioInput: {
        height: 90,
        minWidth: "100%",
        fontSize: 16,
        color: "#333",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 20,
        textAlign: "center",
        marginTop: 5,
        padding: 8,
        backgroundColor: "#F9F9F9",
    },
    enviarButton: {
        backgroundColor: "#003366",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        minWidth: 160,
        alignSelf: "center",
    },
    labelMenor: {
        color: "#1D5FA3",
        fontSize: 13,
    },
    pageContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#1D5FA3",
        borderRadius: 10,
        paddingHorizontal: 40,
        marginVertical: 15,
        backgroundColor: "#F2F8FF",
    },
    input: {
        fontSize: 22,
        fontWeight: "600",
        color: "#333",
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
    },
    dateText: {
        fontSize: 22,
        color: "#666",
        fontWeight: "500",
    },
    closeIcon: {
        marginLeft: 12,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButton: {
        backgroundColor: "#C62828",
    },
    saveButton: {
        backgroundColor: "#003366",
    },
    finishButton: {
        backgroundColor: "#2E7D32",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        padding: 0,
    },
});