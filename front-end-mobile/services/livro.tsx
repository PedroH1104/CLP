import { Alert } from 'react-native';
import { api } from '../api/api';
import axios from 'axios';
import { LivroAdicionadoProps, LivroAtualizadoProps, LivroConcluidoProps } from '../types/Livro';
import { PostCriadoProps } from '../types/Post';
import { GOOGLE_BOOKS_API_KEY } from '@env';

const imagemPadrao = "https://placehold.co/300x450?text=Livro";

function montarUrlGoogleBooks(consulta: string) {
    const chave = GOOGLE_BOOKS_API_KEY;
    const params = new URLSearchParams({
        q: consulta,
        maxResults: "10",
        printType: "books",
    });

    if (chave) {
        params.append("key", chave);
    }

    return `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
}

function escolherImagem(data: any) {
    const itens = data.items || [];
    const itemComImagem = itens.find((item: any) =>
        item.volumeInfo?.imageLinks?.thumbnail ||
        item.volumeInfo?.imageLinks?.smallThumbnail
    );

    const imagem =
        itemComImagem?.volumeInfo?.imageLinks?.thumbnail ||
        itemComImagem?.volumeInfo?.imageLinks?.smallThumbnail;

    return imagem ? imagem.replace("http://", "https://") : undefined;
}

export const buscaLivrosPorUsuario = async (usuarioId:string, setLivros:any) => {
    try {
      const resposta = await api.get(`/livros/busca?usuario=${usuarioId}`, { timeout: 10000 });
      const livrosUsuario = resposta.data;
      setLivros(livrosUsuario);
    } catch (erro) {
      console.error('Erro ao buscar livros do usuario:', erro);
    }
  };

export const buscarImagemLivro = async (nome: string) => {
    const consultas = [
        `intitle:"${nome}"`,
        `intitle:${nome}`,
        nome,
    ];

    try {
        for (const consulta of consultas) {
            const response = await axios.get(montarUrlGoogleBooks(consulta));

            const imagem = escolherImagem(response.data);

            console.log("[buscarImagemLivro] Google Books", {
                titulo: nome,
                consulta,
                totalItems: response.data.totalItems,
                encontrouImagem: Boolean(imagem),
            });

            if (imagem) {
                return imagem;
            }
        }

        return imagemPadrao;
    } catch (error: any) {
        console.error("[buscarImagemLivro] Erro no Google Books:", {
            status: error.response?.status,
            mensagem: error.response?.data?.error?.message || error.message,
        });
        return imagemPadrao;
    }
};

export async function criarLivro(livroAdicionado: LivroAdicionadoProps) {
  try {
    await api.post("/livros", livroAdicionado, { timeout: 10000 });
  } catch (error) {
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
        throw err;
    }
}

export async function editaLivro(idLivro: string, alteracoes: LivroConcluidoProps | LivroAtualizadoProps) {
    await api.put(`/livros/${idLivro}`, alteracoes, { timeout: 10000 });
}

export async function deletaLivro(idLivro: string) {
    await api.delete(`/livros/${idLivro}`, { timeout: 10000 });
}

export async function criaPost(novoPost: PostCriadoProps) {
    await api.post("/posts", novoPost, { timeout: 10000 });
}
