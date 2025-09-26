import { useState, createContext, useContext, useEffect, Dispatch, SetStateAction } from 'react';
import { api } from "../api/api"
import { LivroProps } from '../types/Livro';
import { buscaLivrosPorUsuario } from '../services/livro';
import { atualizaPosts } from '../services/posts';
import { PostProps } from '../types/Post';

interface LogadoContextProps {
  logado: boolean;
  setLogado: Dispatch<SetStateAction<boolean>>;
  usuarioID: any | undefined;
  setUsuarioID: Dispatch<SetStateAction<any | undefined>>;
  livros: LivroProps[];
  setLivros: Dispatch<SetStateAction<LivroProps[]>>;
  nome: string;
  setNome: Dispatch<SetStateAction<string>>;
  emailDoUsuario: string;
  setEmailDoUsuario: Dispatch<SetStateAction<string>>;
  atualizaLivrosDoUsuario: () => void;
  criaSugestoes: () => void;
  listaSugestoes: any[];
  setListaSugestoes: Dispatch<SetStateAction<any[]>>;
  ListarLivrosComMeta: () => void; // Alterado para não mais receber parâmetros
  metasDeLivros: any[];
  setMetasDeLivros: Dispatch<SetStateAction<any[]>>;
  imagemDoUsuario: string | undefined; // Novo estado para a imagem
  setImagemDoUsuario: Dispatch<SetStateAction<string | undefined>>;
  posts: PostProps[];
  setPosts: Dispatch<SetStateAction<PostProps[]>>;
  atualizaListaDePosts: () => void;
  isLoadingUser: boolean; // Estado de carregamento do contexto
}

export const LogadoContext = createContext<LogadoContextProps>({
  logado: false,
  setLogado: () => { },
  usuarioID: undefined,
  setUsuarioID: () => { },
  livros: [],
  setLivros: () => { },
  nome: '',
  setNome: () => { },
  emailDoUsuario: '',
  setEmailDoUsuario: () => { },
  atualizaLivrosDoUsuario: () => { },
  criaSugestoes: () => { },
  listaSugestoes: [],
  setListaSugestoes: () => { },
  ListarLivrosComMeta: () => { }, // Inicialmente uma função vazia
  metasDeLivros: [],
  setMetasDeLivros: () => { },
  imagemDoUsuario: undefined, // Inicializando o estado da imagem como null
  setImagemDoUsuario: () => { }, // Função vazia inicial
  posts: [],
  setPosts: () => { },
  atualizaListaDePosts: () => { },
  isLoadingUser: false, // Estado inicial
});

export function LogadoProvider({ children }: { children: React.ReactNode }) {
  const [logado, setLogado] = useState<boolean>(false);
  const [usuarioID, setUsuarioID] = useState<any | undefined>(undefined);
  const [livros, setLivros] = useState<LivroProps[]>([]);
  const [nome, setNome] = useState<string>('');
  const [emailDoUsuario, setEmailDoUsuario] = useState<string>('');
  const [listaSugestoes, setListaSugestoes] = useState<any[]>([]);
  const [metasDeLivros, setMetasDeLivros] = useState<LivroProps[]>([]); // Novo estado  
  const [imagemDoUsuario, setImagemDoUsuario] = useState<string | undefined>(undefined);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  useEffect(() => {
    atualizaListaDePosts();
  }, [])

  useEffect(() => {
    if (usuarioID) {
      const fetchAllUserData = async () => {
        setIsLoadingUser(true);
        try {
          await atualizaLivrosDoUsuario();
          await atualizaListaDePosts();
          await ListarLivrosComMeta();
          await criaSugestoes();
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        } finally {
          setIsLoadingUser(false);
        }
      };
      fetchAllUserData();
    }
  }, [usuarioID]);

  const atualizaLivrosDoUsuario = async () => {
    await buscaLivrosPorUsuario(usuarioID, setLivros)
  }

  const atualizaListaDePosts = async () => {
    atualizaPosts(setPosts);
  }

  function getRandomElements<T>(array: T[], count: number): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array.slice(0, count);
  }

  const criaSugestoes = async () => {
    try {
      const resposta = await api.get("/livros/");
      const livrosAPI = resposta.data;

      // Passo 1: Criar um conjunto (Set) de títulos dos livros que o usuário já possui
      const titulosDoUsuario = new Set(livros.map((livro) => livro.titulo));

      // Passo 2: Filtrar a lista completa de livros, removendo duplicatas e os livros que o usuário já tem
      const livrosUnicosMap = new Map();
      livrosAPI.forEach((livro: LivroProps) => {
        if (
          !livrosUnicosMap.has(livro.titulo) &&
          !titulosDoUsuario.has(livro.titulo)
        ) {
          livrosUnicosMap.set(livro.titulo, livro);
        }
      });
      const listaUnica = Array.from(livrosUnicosMap.values());

      // Passo 3: Selecionar 5 elementos aleatórios da lista filtrada
      const sugestoes =
        listaUnica.length > 5
          ? getRandomElements(listaUnica, 5)
          : listaUnica;

      setListaSugestoes(sugestoes);
    } catch (erro) {
      console.error("Erro ao criar sugestões de livros:", erro);
      setListaSugestoes([]);
    }
  };

  const ListarLivrosComMeta = () => {
    const filteredLivros = livros.filter(livro => livro.dataMeta !== undefined && livro.concluido != true);
    setMetasDeLivros(filteredLivros);
  };

  return (
    <LogadoContext.Provider
      value={{
        logado,
        setLogado,
        usuarioID,
        setUsuarioID,
        livros,
        setLivros,
        nome,
        setNome,
        emailDoUsuario,
        setEmailDoUsuario,
        atualizaLivrosDoUsuario,
        criaSugestoes,
        listaSugestoes,
        setListaSugestoes,
        ListarLivrosComMeta,
        metasDeLivros,
        setMetasDeLivros,
        imagemDoUsuario,
        setImagemDoUsuario,
        posts,
        setPosts,
        atualizaListaDePosts,
        isLoadingUser
      }}
    >
      {children}
    </LogadoContext.Provider>
  );
}

export function useLogadoContext() {
  return useContext(LogadoContext);
}