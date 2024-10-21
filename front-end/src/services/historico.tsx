import { api } from "@/api/api";

interface adicionaLivroAoHistoricoProps{
    livroID: string;
    usuarioID: string;
}

interface AtualizarProgressoProps {
    concluido: boolean;
    quantidadePaginas: number;
    paginaAtual: string;
    dataMeta: string | undefined;
    usuarioID: string;
    livroID: string;
}

interface AtualizaMetaNoHistoricoProps {
    paginaAtual: string | number;
    date: Date | undefined;
    usuarioID: string;
    cardAberto: any;
}

export async function adicionaLivroAoHistorico({livroID, usuarioID}:adicionaLivroAoHistoricoProps){
    const dataAtual = new Date();

    const livroNoHistorico = {
        data_leitura: dataAtual,
        pagina_atual: 0,
        data_meta: undefined,
        usuario: usuarioID,
        livro: livroID,
        concluido: false,
    };

    try {        
        const resposta = await api.post("/historico/criar", livroNoHistorico);       
        console.log("Resposta da API:", resposta);
    } catch (erro) {        
        console.error("Erro ao fazer requisição:", erro);
    }
}

export async function atualizarProgressoNoHistorico({ concluido, quantidadePaginas, paginaAtual, dataMeta, usuarioID, livroID }: AtualizarProgressoProps) {
    const dataAtual = new Date();

    const progresso = {
        data_leitura: dataAtual,
        pagina_atual: concluido ? quantidadePaginas : paginaAtual !== "" ? paginaAtual : undefined,
        data_meta: dataMeta,
        usuario: usuarioID,
        livro: livroID,
        concluido: concluido
    };

    try {
        const resposta = await api.post("/historico/criar", progresso);
        console.log(resposta.data, "- Progresso atualizado");
    } catch (erro) {
        console.error("Erro ao atualizar progresso no histórico: ", erro);
    }
}

export async function atualizaMetaNoHistorico({ paginaAtual, date, usuarioID, cardAberto }: AtualizaMetaNoHistoricoProps) {
    const dataAtual = new Date();

    const progresso = {
        data_leitura: dataAtual,
        pagina_atual: paginaAtual != "" ? paginaAtual : cardAberto?.pagina_atual,
        data_meta: date ? date : "2024-02-20T23:48:40.204Z",
        usuario: usuarioID,
        livro: cardAberto?.livro_id,
        concluido: cardAberto?.concluido
    };

    try {
        const response = await api.post("/historico/criar", progresso);
        console.log(response.data, "- Meta atualizada");
    } catch (error) {
        console.error('Erro ao criar histórico com meta: ', error);
    }
}

export async function deletaHistoricoDoLivro(idLivro: any) {
    await api.delete(`/historico/${idLivro}`)
        .then(response => {
            console.log(response.data)
        })
        .catch(error => {
            console.error('Erro ao deletar historico do livro:', error);
            // Lidar com o erro, se necessário
        });
}

export const buscaRelatorio = async () => {
    try {
      const response = await api.get("/historico");
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      throw error; // 
    }
  };