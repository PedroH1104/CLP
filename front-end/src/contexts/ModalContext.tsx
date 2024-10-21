import { LivroProps } from "@/types/LivroProps";
import { createContext, useContext, useState } from "react";

interface ModalContextProps {
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    modalQueEstaAberto: string;
    setModalQueEstaAberto: React.Dispatch<React.SetStateAction<string>>;
    cardAberto: LivroProps | null; // Tipo específico para cardAberto
    setCardAberto: React.Dispatch<React.SetStateAction<LivroProps | null>>;
    imagens: string[];
    setImagens: React.Dispatch<React.SetStateAction<string[]>>;
    imagemEscolhida: string | null;
    setImagemEscolhida: React.Dispatch<React.SetStateAction<string | null>>;
}

export const ModalContext = createContext<ModalContextProps>({
    modalOpen: false,
    setModalOpen: () => { },
    modalQueEstaAberto: "",
    setModalQueEstaAberto: () => { },
    cardAberto: null,
    setCardAberto: () => { },
    imagens: [],
    setImagens: () => { },
    imagemEscolhida: null,
    setImagemEscolhida: () => { },
});

export function ModalProvider({ children }: { children: React.ReactNode; }) {

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalQueEstaAberto, setModalQueEstaAberto] = useState("");
    const [cardAberto, setCardAberto] = useState<LivroProps | null>(null);
    const [imagens, setImagens] = useState<string[]>([]);
    const [imagemEscolhida, setImagemEscolhida] = useState<string | null>(null);    

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
        }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModalContext() {
    return useContext(ModalContext)
}