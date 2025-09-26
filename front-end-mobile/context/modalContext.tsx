import { LivroProps } from "../types/Livro";
import { createContext, useContext, useState } from "react";

interface ModalContextProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    modalQueEstaAberto: string;
    setModalQueEstaAberto: React.Dispatch<React.SetStateAction<string>>;
    cardAberto: LivroProps;
    setCardAberto: React.Dispatch<React.SetStateAction<LivroProps>>;
    imagens: string[];
    setImagens: React.Dispatch<React.SetStateAction<string[]>>;
    imagemEscolhida: string | null;
    setImagemEscolhida: React.Dispatch<React.SetStateAction<string | null>>;
    publicacaoAberta: any;
    setPublicacaoAberta: React.Dispatch<React.SetStateAction<any>>;
}

export const ModalContext = createContext<ModalContextProps>({
    modalOpen: false,
    setModalOpen: () => {},
    modalQueEstaAberto: "",
    setModalQueEstaAberto: () => {},
    cardAberto: {
        _id: "", // ou um ObjectId válido
        titulo: "",
        paginas: 0,
        usuarioId: "",
        categoria: "Outro", // Defina um valor padrão válido
        imagem: "",
        paginaAtual: 0,
        concluido: false,
        dataMeta: undefined,
        avaliacao: 0,
    },
    setCardAberto: () => {},
    imagens: [],
    setImagens: () => {},
    imagemEscolhida: null,
    setImagemEscolhida: () => {},
    publicacaoAberta: null,
    setPublicacaoAberta: () => {},
});

export function ModalProvider({ children }: { children: React.ReactNode; }) {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalQueEstaAberto, setModalQueEstaAberto] = useState("");
    const [cardAberto, setCardAberto] = useState<LivroProps>({
        _id: "", // ou ObjectId válido
        titulo: "",
        paginas: 0,
        usuarioId: "",
        categoria: "Outro",
        imagem: "",
        paginaAtual: 0,
        concluido: false,
        dataMeta: undefined,
        avaliacao: 0,
    });
    const [imagens, setImagens] = useState<string[]>([]);
    const [imagemEscolhida, setImagemEscolhida] = useState<string | null>(null);
    const [publicacaoAberta, setPublicacaoAberta] = useState<any>(null);

    return (
        <ModalContext.Provider value={{
            modalOpen,
            setModalOpen,
            modalQueEstaAberto,
            setModalQueEstaAberto,
            cardAberto,
            setCardAberto,
            imagens,
            setImagens,
            imagemEscolhida,
            setImagemEscolhida,
            publicacaoAberta,
            setPublicacaoAberta,
        }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModalContext() {
    return useContext(ModalContext);
}