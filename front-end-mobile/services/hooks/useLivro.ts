import { useState, useCallback, useRef, useEffect } from 'react';
import { TextInput } from 'react-native';
import { useModalContext } from '../../context/modalContext';
import { useLogadoContext } from '../../context/logadoContext';
import { useLoadingContext } from '../../context/loadingContext';
import { concluiLivro, deletaLivro, editaLivro } from '../../services/livro';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { LivroAtualizadoProps, LivroConcluidoProps, LivroProps } from '../../types/Livro';
import { PostCriadoProps } from '../../types/Post';

export const useLivro = (cardAberto: LivroProps) => {
    const { atualizaLivrosDoUsuario, usuarioID, nome, atualizaListaDePosts } = useLogadoContext();
    const { setLoading } = useLoadingContext();
    const { setModalOpen } = useModalContext();

    const [paginaAtual, setPaginaAtual] = useState<number>(cardAberto?.paginaAtual ?? 0);
    const [date, setDate] = useState<Date | null>(() => {
        if (!cardAberto?.dataMeta) return null;
        return typeof cardAberto.dataMeta === "string" ? new Date(cardAberto.dataMeta) : cardAberto.dataMeta;
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [avaliacao, setAvalicao] = useState(false);
    const [rating, setRating] = useState(0);
    const [descricao, setDescricao] = useState("");
    const inputRef = useRef<TextInput>(null);
    const [modalConfirmacaoVisivel, setModalConfirmacaoVisivel] = useState(false);

    // Efeito para resetar o estado quando um novo livro é aberto
    useEffect(() => {
        setPaginaAtual(cardAberto?.paginaAtual ?? 0);
        setDate(cardAberto?.dataMeta ? new Date(cardAberto.dataMeta) : null);
        setErrorMessage(null);
        setAvalicao(false);
        setRating(0);
        setDescricao("");
    }, [cardAberto]);

    const showMode = useCallback(() => {
        DateTimePickerAndroid.open({
            value: date || new Date(),
            onChange: (event, selectedDate) => {
                if (event.type === "set" && selectedDate) {
                    setDate(selectedDate);
                }
            },
            mode: "date",
            is24Hour: true,
        });
    }, [date]);

    const handleDelete = useCallback(() => {
        setModalConfirmacaoVisivel(true);
    }, []);

    const confirmarDelete = useCallback(async () => {
        setModalConfirmacaoVisivel(false);
        setLoading(true);
        setErrorMessage(null);

        try {
            if (!cardAberto?._id) return;
            await deletaLivro(cardAberto._id);
            atualizaLivrosDoUsuario();
            setModalOpen(false);
        } catch (error: any) {
            setErrorMessage(error.response?.data?.mensagem || "Erro ao deletar livro. Tente novamente.");
            console.error("Erro ao deletar livro:", error);
        } finally {
            setLoading(false);
        }
    }, [cardAberto, atualizaLivrosDoUsuario, setModalOpen, setLoading]);

    const handleSaveChanges = useCallback(async () => {
        if (isNaN(paginaAtual) || paginaAtual < 0 || paginaAtual > (cardAberto?.paginas || 0)) {
            setErrorMessage("Por favor, insira uma página válida entre 0 e " + (cardAberto?.paginas || 0) + ".");
            return;
        }
    
        setLoading(true);
        setErrorMessage(null);
    
        const paginaMudou = paginaAtual !== cardAberto?.paginaAtual;
        const dataMudou = (date?.toISOString() || null) !== (cardAberto?.dataMeta ? new Date(cardAberto.dataMeta).toISOString() : null);
    
        if (!paginaMudou && !dataMudou) {
            setLoading(false);
            setErrorMessage("Faça alguma mudança antes de salvar.");
            return;
        }
    
        let updatedData: LivroAtualizadoProps = {};
    
        if (paginaMudou) {
            updatedData.paginaAtual = paginaAtual;
            updatedData.concluido = false;
        }
    
        if (dataMudou) {
            updatedData.dataMeta = date;
        }
    
        try {
            if (!cardAberto?._id) return;
            await editaLivro(cardAberto._id, updatedData);
            atualizaLivrosDoUsuario();
            setModalOpen(false);
        } catch(error: any) {
            setErrorMessage(error.response?.data?.mensagem || "Erro ao salvar alterações. Tente novamente.");
            console.error("Erro ao atualizar livro:", error);
        } finally {
            setLoading(false);
        }
    }, [paginaAtual, date, cardAberto, atualizaLivrosDoUsuario, setLoading, setModalOpen]);

    const abreAvaliacao = useCallback(() => {
        setAvalicao(true);
    }, []);

    const handleFinish = useCallback(async () => {
        if (rating === 0) {
            setErrorMessage("Por favor, deixe sua avaliação!");
            return;
        }
        
        setLoading(true);
        setErrorMessage(null);
        
        const livroConcluido: LivroConcluidoProps = {
            paginaAtual: cardAberto?.paginas ?? 0, 
            concluido: true,
            avaliacao: rating,
        };
 
        const novoPost: PostCriadoProps = {
            autor: usuarioID,
            nomeAutor: nome,
            nomeLivro: cardAberto?.titulo || "",
            ...(descricao && { descricao }),
            avaliacao: rating,
            imagem: cardAberto?.imagem || "",
            data: new Date()
        };

        try {
            if (!cardAberto?._id) return;
            await concluiLivro(cardAberto._id, livroConcluido, novoPost);
            atualizaLivrosDoUsuario();
            atualizaListaDePosts();
            setModalOpen(false);
        } catch (error: any) {
            setErrorMessage(error.response?.data?.mensagem || "Erro ao concluir o livro. Tente novamente.");
            console.error("Erro ao concluir livro:", error);
        } finally {
            setLoading(false);
        }
    }, [rating, descricao, cardAberto, usuarioID, nome, atualizaLivrosDoUsuario, atualizaListaDePosts, setModalOpen, setLoading]);

    return {
        paginaAtual,
        setPaginaAtual,
        date,
        setDate,
        errorMessage,
        setErrorMessage,
        avaliacao,
        setAvalicao,
        rating,
        setRating,
        descricao,
        setDescricao,
        inputRef,
        modalConfirmacaoVisivel,
        setModalConfirmacaoVisivel,
        showMode,
        handleDelete,
        confirmarDelete,
        handleSaveChanges,
        abreAvaliacao,
        handleFinish
    };
};