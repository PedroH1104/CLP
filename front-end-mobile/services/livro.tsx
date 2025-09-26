import { Alert } from 'react-native';
import { api } from '../api/api';
import axios from 'axios';
import { LivroAdicionadoProps, LivroAtualizadoProps, LivroConcluidoProps } from '../types/Livro';
import { PostCriadoProps } from '../types/Post';
import { GOOGLE_API_KEY, ID_MECANISMO_PESQUISA } from '@env';

export const buscaLivrosPorUsuario = async (usuarioId:string, setLivros:any) => {
    try {
      const resposta = await api.get(`/livros/busca?usuario=${usuarioId}`, { timeout: 10000 });
      const livrosUsuario = resposta.data;
      setLivros(livrosUsuario);
    } catch (erro) {
      console.error('Erro ao buscar livros do usuário:', erro);
    }
  };

export const buscarImagemLivro = async (nome: string) => {
    const busca = `capa do livro ${nome}`;    

    // Verifique se as duas variáveis existem antes de fazer a requisição
    if (!GOOGLE_API_KEY || !ID_MECANISMO_PESQUISA) {
        console.error("As variáveis de ambiente para a API do Google não foram definidas.");
        return null;
    }

    try {
        const response = await axios.get(
            // Use template literals (crases) para construir a URL completa
            `https://www.googleapis.com/customsearch/v1?q=${busca}&key=${GOOGLE_API_KEY}&cx=${ID_MECANISMO_PESQUISA}&searchType=image`
        );
        return response.data.items[0]?.link;
    } catch (error) {
        console.error("Erro ao buscar imagem do livro:", error);
        return null;
    }
};

export async function criarLivro(livroAdicionado: LivroAdicionadoProps) {
  try {
    await api.post("/livros", livroAdicionado, { timeout: 10000 });
    // Em caso de sucesso, não faz nada. O componente que chamou irá lidar com a resposta.
  } catch (error) {
    // Lança o erro para que o componente que a chamou possa tratá-lo.
    throw error;
  }
}

export async function adicionaSugestao(livroAdicionado: LivroAdicionadoProps,) {
    try {
        await api.post("/livros", livroAdicionado, { timeout: 10000 });        
    } catch (error: any) {
        if (error.response) {
            Alert.alert('Erro', error.response.data.mensagem || 'Ocorreu um erro ao criar o livro');            
        } else {
            Alert.alert('Erro', 'Erro ao conectar com o servidor.');            
        }
    }
}

export async function concluiLivro(idLivro: string, alteracoesLivro: LivroConcluidoProps, novoPost: PostCriadoProps) {
    try {
        await editaLivro(idLivro, alteracoesLivro);
        await criaPost(novoPost);
    } catch (err) {
        // A função de serviço continua sendo responsável por essa lógica interna
        throw err;
    }
}

export async function editaLivro(idLivro: string, alteracoes: LivroConcluidoProps | LivroAtualizadoProps) {
    // Apenas faz a chamada à API e "lança" o erro implicitamente se algo falhar
    await api.put(`/livros/${idLivro}`, alteracoes, { timeout: 10000 });
}

export async function deletaLivro(idLivro: string) {
    // Apenas faz a chamada à API
    await api.delete(`/livros/${idLivro}`, { timeout: 10000 });
}

export async function criaPost(novoPost: PostCriadoProps) {
    await api.post("/posts", novoPost, { timeout: 10000 });
}