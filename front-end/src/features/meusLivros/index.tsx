import { ModalsController } from "@/components/ModalsController";
import { useModalContext } from "@/contexts/ModalContext";
import { BsBook, BsPlus } from "react-icons/bs";
import CardLivro from "./componentes/CardLivro";
import { useEffect, useState } from "react";
import InputText from "@/components/InputText";
import { LivroProps } from "@/types/LivroProps";
import { useLogadoContext } from "@/contexts/LogadoContext";
import { Refresh } from "@/services/Refresh";
import TituloFeatures from "@/components/TituloFeatures";

export default function MeusLivros() {

  Refresh()

  const { modalOpen, setModalOpen, setModalQueEstaAberto } = useModalContext();
  const { livros } = useLogadoContext();
  const [filtroPeloNome, setFiltroPeloNome] = useState("");
  const [livrosFiltrados, setLivrosFiltrados] = useState<LivroProps[]>([]);
  const [ocultarConcluidos, setOcultarConcluidos] = useState(false); // Estado para ocultar livros concluídos

  const abrirModalParaAdicionar = () => {
    setModalQueEstaAberto("criarLivro");
    setModalOpen(true);
  };

  useEffect(() => {
    const livrosFiltrados = livros.filter((livro: any) => {
      const tituloInclui = livro.titulo?.toLowerCase().includes(filtroPeloNome.toLowerCase());
      const naoConcluido = !ocultarConcluidos || !livro.concluido;
      return tituloInclui && naoConcluido;
    });
    setLivrosFiltrados(livrosFiltrados);
  }, [filtroPeloNome, livros, ocultarConcluidos]);

  return (
    <section>
      <TituloFeatures icon={<BsBook className="text-[32px] text-azulPadrao" />} text="MEUS LIVROS" />
      <div className="flex items-center justify-center mb-[35px] gap-[10px]">
        <h2 className="text-[18px] text-azulPadrao">Busque seu livro pelo nome: </h2>
        <div className="w-[250px]">
          <InputText value={filtroPeloNome} setValue={setFiltroPeloNome} />
        </div>
      </div>

      <div className="flex items-center justify-end mb-[40px] mr-[40px]">
        <input
          type="checkbox"
          checked={ocultarConcluidos}
          onChange={() => setOcultarConcluidos(!ocultarConcluidos)}
          id="ocultarConcluidos"
          className="mr-2"
        />
        <label htmlFor="ocultarConcluidos" className="text-[18px] text-azulPadrao">Ocultar livros concluídos</label>
      </div>

      <div>
        <div className="flex justify-center flex-wrap gap-[50px]">
          {livrosFiltrados.map((livro, index) => {
            let metaMessage = "";

            if (livro.data_meta !== undefined && !livro.concluido) {
              // Verifica se a propriedade data_meta está presente
              const dataMeta = new Date(livro.data_meta);
              const hoje = new Date();
              const diffTime = dataMeta.getTime() - hoje.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays > 0) {
                metaMessage = `A meta vai encerrar em ${diffDays} dias`;
              } else if (diffDays === 0) {
                metaMessage = "Sua meta encerra hoje";
              } else {
                metaMessage = "Sua meta expirou";
              }
            }

            return (
              <div key={index} className="flex flex-col items-center">
                <CardLivro {...livro} />
                <div className="text-red p-2 text-[14px]">
                  {metaMessage}
                </div>
              </div>
            );
          })}
        </div>
        {modalOpen && <ModalsController />}
        <button
          className="bg-azulPadrao text-white p-4 rounded-full shadow-md fixed bottom-10 right-10 transition-all duration-300 hover:shadow-lg"
          onClick={abrirModalParaAdicionar}
        >
          <BsPlus className="text-[48px]" />
        </button>
      </div>
    </section>
  );
}