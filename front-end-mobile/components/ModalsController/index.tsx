import { useModalContext } from "../../context/modalContext";
import ModalCardAberto from "../ModalCardAberto";
import { ModalCriacaoLivro } from "../ModalCriacaoLivro";
import ModalPostAberto from "../ModalPostAberto";

export function ModalsController() {
  const { modalOpen, modalQueEstaAberto } = useModalContext();

  // Mapa de componentes de modal para facilitar a renderização
  const modals = {
    "criarLivro": <ModalCriacaoLivro />,
    "visualizarLivro": <ModalCardAberto />,
    "visualizarPost": <ModalPostAberto />,
  };

  // Se o modal não estiver aberto, não renderiza nada
  if (!modalOpen) {
    return null;
  }

  // Retorna o componente de modal correspondente, ou null se não for encontrado
  return modals[modalQueEstaAberto as keyof typeof modals] || null;
}