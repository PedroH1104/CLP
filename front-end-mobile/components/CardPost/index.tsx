import React, { useState } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { PostProps } from "../../types/Post";
import { useLogadoContext } from "../../context/logadoContext";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "../StarRating";
import { formatDistanceToNowInPortuguese } from "../../services/dateDistance";
import { editarCurtida, deletaPost } from "../../services/posts";
import ModalConfirmacao from "../ModalConfirmacao";
import { useModalContext } from "../../context/modalContext";

export default function CardPost(post: PostProps) {
    const { usuarioID, setPosts } = useLogadoContext();
    const [curtidas, setCurtidas] = useState(post.curtidas);
    const [processing, setProcessing] = useState(false); 
    const [modalVisivel, setModalVisivel] = useState(false); 

    // const { setModalOpen, setModalQueEstaAberto, setPublicacaoAberta } = useModalContext();

    const handleCurtir = async (postId: string, usuarioId: string) => {
        if (processing) return;
        setProcessing(true);

        const isCurtido = curtidas.includes(usuarioID);
        const novasCurtidas = isCurtido
            ? curtidas.filter((id: string) => id !== usuarioID)
            : [...curtidas, usuarioID];
        setCurtidas(novasCurtidas);

        try {
            await editarCurtida(postId, usuarioId, setPosts);
        } catch (error) {
            console.error("Erro ao curtir/descurtir o post:", error);
        } finally {
            setProcessing(false);
        }
    };

    const handleExcluirPost = async () => {
        try {
            await deletaPost(post._id, setPosts);
        } catch (error) {
            console.error("Erro ao excluir post:", error);
        } finally {
            setModalVisivel(false);
        }
    };

    {/** UPDATES EM BREVE
    const abrirPublicacao = (post: any) => {
        console.log("clicou, era pra abrir o post: ", post);
        setPublicacaoAberta(post);
        setModalQueEstaAberto("visualizarPost");
        setModalOpen(true);
    }
    */}

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.autorContainer}>
                    <Ionicons name="person-circle" size={32} color="#003366" />
                    <Text style={styles.autor} numberOfLines={2} ellipsizeMode="tail">
                        {post.nomeAutor.split(' ').slice(0, 2).join(' ')}
                    </Text>
                </View>

                {post.autor === usuarioID && (
                    <TouchableOpacity onPress={() => setModalVisivel(true)}>
                        <Ionicons name="close-circle-outline" size={24} color={"#666"} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.centerContent}>
                <StarRating rating={post.avaliacao} size={28} color="#003366" />
                {post.descricao && <Text style={styles.descricao}>{post.descricao}</Text>}
                                
                {post.imagem && <Image source={{ uri: post.imagem }} style={styles.imagemLivro} />}
                
                <Text style={styles.titulo}>{post.nomeLivro}</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.iconsContainers}>
                    <View style={styles.likeContainer}>
                        <TouchableOpacity onPress={() => handleCurtir(post._id, usuarioID)} disabled={processing}>
                            <Ionicons name={curtidas.includes(usuarioID) ? "heart" : "heart-outline"} size={28} color={"#003366"} />
                        </TouchableOpacity>
                        {curtidas.length > 0 && <Text style={styles.numCurtidas}>{curtidas.length}</Text>}
                    </View>
                    {/** 
                    <TouchableOpacity
                        onPress={() => abrirPublicacao(post)}
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={28} color="#003366" />
                    </TouchableOpacity>
                    */}
                </View>
                <Text style={styles.textDate}>{formatDistanceToNowInPortuguese(post.data)} atrás</Text>
            </View>


            <ModalConfirmacao
                visivel={modalVisivel}
                titulo="Deletar publicação"
                mensagem="Tem certeza que deseja excluir esta publicação? Essa ação não pode ser desfeita."
                onConfirmar={handleExcluirPost}
                onCancelar={() => setModalVisivel(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        height: 450,
        justifyContent: "space-between",
        borderRadius: 10,
        padding: 12,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    autorContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    autor: {
        fontSize: 22,
        fontWeight: "bold",
        flexShrink: 1,
        color: "#003366",
    },
    centerContent: {
        alignItems: "center",
        gap: 10,
    },
    descricao: {
        fontSize: 16,
        textAlign: "center",
        color: "#666",
    },
    titulo: {
        fontSize: 20,
        fontWeight: "500",
        color: "#003366",
    },
    imagemLivro: {
        width: 126,
        height: 168,
        borderRadius: 8,
    },
    textDate: {
        fontSize: 16,
        color: "#999",
        fontWeight: "400",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    iconsContainers: {
        flexDirection: "row",
        gap: 12,
    },
    likeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    numCurtidas: {
        fontSize: 18,
        color: "#003366",
        fontWeight: "bold",
    },
});