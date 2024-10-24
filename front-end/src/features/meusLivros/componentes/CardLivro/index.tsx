import { LivroProps } from "@/types/LivroProps";
import { useModalContext } from "@/contexts/ModalContext";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

interface CardLivroProps extends LivroProps {
  sugestao?: boolean;
  avaliacaoReal?: number;
}

export default function CardLivro({ sugestao, avaliacaoReal, ...livro }: CardLivroProps) {
  const { setModalOpen, setModalQueEstaAberto, setCardAberto } = useModalContext();

  function getClassString() {
    if (sugestao) {
      return 'bg-laranjaClaro';
    }
    if (livro.pagina_atual === 0 && !livro.concluido) {
      return 'bg-cinzaEscuro';
    }
    if (livro.pagina_atual !== 0 && !livro.concluido) {
      return 'bg-azulPadrao';
    }
    if (livro.concluido) {
      return 'bg-verdeEscuro';
    }
    return ""; // Retorna uma string vazia se nenhuma condição for atendida
  }

  function minimizaText(text?: string) {
    if (!text) return
    return text.length > 20 ? `${text.substring(0, 20)}...` : text

  }

  const abrirCardModal = (livro: any) => {
    setCardAberto(livro);
    setModalQueEstaAberto("visualizarCard")
    setModalOpen(true);
  }

  function renderStars(avaliacao: number) {
    const fullStars = Math.floor(avaliacao);
    const partialStar = avaliacao - fullStars;
    const starIcons = [];

    // Renderiza estrelas completas
    for (let i = 0; i < fullStars; i++) {
      starIcons.push(<FaStar key={i} className="text-azulPadrao text-[18px]" />);
    }

    // Renderiza estrela parcial, se houver
    if (partialStar > 0) {
      starIcons.push(<FaStarHalfAlt key="partial" className="text-azulPadrao text-[18px]" />);
    }

    // Renderiza estrelas vazias para completar 5 estrelas
    const remainingStars = 5 - Math.ceil(avaliacao);
    for (let i = 0; i < remainingStars; i++) {
      starIcons.push(<FaRegStar key={`empty-${i}`} className="text-azulPadrao text-[18px]" />);
    }

    return (
      <div className="flex gap-[8px] justify-center items-center">
        {starIcons}
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => !sugestao && abrirCardModal(livro)}
        className={`w-[220px] h-[280px] overflow-hidden border-black border rounded-md cursor-pointer ${sugestao ? 'pointer-events-none' : ''}`}
      >
        {/* Metade superior com ícone */}
        <div className="h-3/5 bg-white flex items-center justify-center border-b border-black">
          <img src={livro.imagem} className="w-[230px] h-[166px]" />
        </div>
        {/* Metade inferior com background retornado da função */}
        <div className={`h-2/5 ${getClassString()} p-2`}>
          <div className="flex flex-col items-center h-full">
            <h1 title={livro.titulo} className="text-[18px] text-bold text-white mt-[15px] mb-[20px]">{minimizaText(livro.titulo)}</h1>
            <div className="flex w-full justify-around">
              <p className="text-white text-[14px]">{livro.categoria}</p>
              <p className="text-white text-[14px]">{sugestao ? 0 : livro.pagina_atual}/{livro.quantidade_paginas}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[5px]">
        {sugestao ? (
          avaliacaoReal !== undefined && (
            <div className="mt-[5px]">
              {renderStars(avaliacaoReal)}
            </div>
          )
        ) : (
          livro.avaliacao !== undefined && livro.avaliacao !== 0 && (
            <div className="mt-[5px]">
              {renderStars(livro.avaliacao)}
            </div>
          )
        )}
      </div>
    </div>
  );
}