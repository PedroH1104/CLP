import { SiVerizon } from "react-icons/si";
import { IoCloseSharp } from "react-icons/io5";
import CardLivro from '@/features/meusLivros/componentes/CardLivro'; // Ajuste o caminho conforme necessário
import { useLogadoContext } from '@/contexts/LogadoContext'; // Importando o contexto
import { v4 as uuidv4 } from 'uuid';
import { CriaLivro } from '@/services/livro'; // Importando a função para criar livros
import { LivroProps } from "@/types/LivroProps";
import { atualizarProgressoNoHistorico } from "@/services/historico";

export default function CardLivroSugestaoContainer({ livro, livrosAPI }: { livro: LivroProps; livrosAPI: LivroProps[] }) {
  const { setListaSugestoes, usuarioID, buscaLivrosPorUsuario } = useLogadoContext();

  const removerSugestao = (livroRemovido:any) => {
    setListaSugestoes(prevSugestoes => prevSugestoes.filter(livro => livro !== livroRemovido));
  };

  const adicionarSugestao = async (livroSelecionado:any) => {
    const livroAjustado = {
      ...livroSelecionado,
      UserId: usuarioID,
      livro_id: uuidv4(),
      pagina_atual: 0,
      concluido: false,
      data_meta: "",
      avaliacao: 0,
    };

    try {
      const response = await CriaLivro(livroAjustado);
      if (response && response.status >= 200 && response.status < 300) {

        const livroAdicionadoParaHistorico = {
          concluido: false,
          quantidadePaginas: livroSelecionado.quantidadePaginas,
          paginaAtual: 0,
          dataMeta: "",
          usuarioID: usuarioID,
          livroID: livroAjustado.livro_id
        }

        atualizarProgressoNoHistorico(livroAdicionadoParaHistorico)
        buscaLivrosPorUsuario();
        removerSugestao(livroSelecionado);
        alert("Livro adicionado à sua lista com sucesso!");
      } else {
        console.error("Erro ao adicionar livro:", response?.data);
      }
    } catch (error) {
      console.error("Erro ao criar livro:", error);
    }
  };

  const constroiCard = (livro: any) => {
    
    const livrosRelacionados = livrosAPI.filter((livroAPI:any) => livroAPI.titulo === livro.titulo);
    const totalAvaliacoes = livrosRelacionados.filter((livroAPI:any) => livroAPI.avaliacao !== 0).reduce((total:any, livroAPI:any) => total + livroAPI.avaliacao, 0);
    const mediaAvaliacoes = totalAvaliacoes / livrosRelacionados.filter((livroAPI:any) => livroAPI.avaliacao !== 0).length;

    return <CardLivro  {...livro} sugestao={true} avaliacaoReal={mediaAvaliacoes}  />;
  };

  return (
    <div className="flex flex-col items-center">
      <div className='flex items-center gap-2'>
        <button onClick={() => adicionarSugestao(livro)}>
          <SiVerizon className="text-green-500 text-[30px]" />
        </button>
        <button onClick={() => removerSugestao(livro)}>
          <IoCloseSharp className="text-vermelhoClaro text-[50px]" />
        </button>
      </div>
      {constroiCard(livro)}
    </div>
  );
}