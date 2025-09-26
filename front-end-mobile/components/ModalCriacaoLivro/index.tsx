import React, { useState, useCallback } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLogadoContext } from "../../context/logadoContext";
import { useModalContext } from "../../context/modalContext";
import { useLoadingContext } from "../../context/loadingContext";
import Loading from "../Loading";
import { buscarImagemLivro, criarLivro } from "../../services/livro";
import ErrorText from "../ErrorText";

const options = [
  "Romance", "Ficção científica", "Fantasia", "Terror", "Suspense", "Drama", "Comédia",
  "Biografia", "Autobiografia", "Fábula", "Aventura", "Infantil", "Outro"
];

export function ModalCriacaoLivro() {
  const [nomeLivro, setNomeLivro] = useState("");
  const [quantidadePaginas, setQuantidadePaginas] = useState("");
  const [categoria, setCategoria] = useState(options[0]);
  const { usuarioID, atualizaLivrosDoUsuario } = useLogadoContext();
  const [erro, setErro] = useState<string | null>(null);
  const { setModalOpen, modalOpen, modalQueEstaAberto } = useModalContext();
  const { loading, setLoading } = useLoadingContext();

  const limpaCampos = useCallback(() => {
    setNomeLivro("");
    setQuantidadePaginas("");
    setCategoria(options[0]);
    setErro(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    limpaCampos();
  }, [setModalOpen, limpaCampos]);

  const handleAdicionarLivro = async () => {
    if (!nomeLivro || !quantidadePaginas || !categoria) {
      setErro("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const livroAdicionado = {
        usuarioId: usuarioID,
        titulo: nomeLivro,
        paginas: Number(quantidadePaginas),
        categoria: categoria,
        imagem: await buscarImagemLivro(nomeLivro),
      };

      await criarLivro(livroAdicionado);  

      atualizaLivrosDoUsuario();
      handleCloseModal();
    } catch (error) {
      setErro("Ocorreu um erro ao adicionar o livro. Tente novamente.");
      console.error("Erro ao criar livro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={modalOpen && modalQueEstaAberto == "criarLivro"} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Adicionar Novo Livro</Text>

          <TextInput
            style={styles.input}
            value={nomeLivro}
            onChangeText={setNomeLivro}
            placeholder="Nome do livro"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            value={quantidadePaginas}
            onChangeText={setQuantidadePaginas}
            keyboardType="numeric"
            placeholder="Quantidade de páginas"
            placeholderTextColor="#999"
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoria}
              onValueChange={(itemValue) => setCategoria(itemValue)}>
              {options.map((option, index) => (
                <Picker.Item key={index} label={option} value={option} />
              ))}
            </Picker>
          </View>

          {erro && <ErrorText texto={erro} />}

          <View style={styles.buttonContainer}>
            {loading ? <Loading /> :
              <>
                <TouchableOpacity style={styles.button} onPress={handleAdicionarLivro}>
                  <Text style={styles.buttonText}>Adicionar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCloseModal}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            }
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    borderRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#003366",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#F8F8F8",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#F8F8F8",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: "#003366",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#C62828",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});