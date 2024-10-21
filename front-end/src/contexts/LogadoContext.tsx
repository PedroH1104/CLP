import { useState, createContext, useContext, useEffect, Dispatch, SetStateAction } from 'react';
import { api } from '@/api/api';
import { LivroProps } from '@/types/LivroProps';

interface LogadoContextProps {
  logado: boolean;
  setLogado: Dispatch<SetStateAction<boolean>>;
  usuarioID: any | undefined;
  setUsuarioID: Dispatch<SetStateAction<any | undefined>>;
  livros: LivroProps[];
  setLivros: Dispatch<SetStateAction<LivroProps[]>>;
  nome: string;
  setNome: Dispatch<SetStateAction<string>>;
  buscaLivrosPorUsuario: () => void;
  criaSugestoes: () => void;
  listaSugestoes: any[];
  setListaSugestoes: Dispatch<SetStateAction<any[]>>;
  ListarLivrosComMeta: () => void; // Alterado para não mais receber parâmetros
  metasDeLivros: any[];
  setMetasDeLivros: Dispatch<SetStateAction<any[]>>;
  imagemDoUsuario: string | undefined ; // Novo estado para a imagem
  setImagemDoUsuario: Dispatch<SetStateAction<string | undefined>>; 
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
  buscaLivrosPorUsuario: () => { },
  criaSugestoes: () => { },
  listaSugestoes: [],
  setListaSugestoes: () => { },
  ListarLivrosComMeta: () => { }, // Inicialmente uma função vazia
  metasDeLivros: [],
  setMetasDeLivros: () => { },
  imagemDoUsuario: undefined, // Inicializando o estado da imagem como null
  setImagemDoUsuario: () => { }, // Função vazia inicial
});

export function LogadoProvider({ children }: { children: React.ReactNode }) {
  const [logado, setLogado] = useState<boolean>(false);
  const [usuarioID, setUsuarioID] = useState<any | undefined>(undefined);
  const [livros, setLivros] = useState<LivroProps[]>([]);
  const [nome, setNome] = useState<string>('');
  const [listaSugestoes, setListaSugestoes] = useState<any[]>([]);
  const [metasDeLivros, setMetasDeLivros] = useState<LivroProps[]>([]); // Novo estado  
  const [imagemDoUsuario, setImagemDoUsuario] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (livros.length > 0) {
      criaSugestoes();
      ListarLivrosComMeta();      
    }
  }, [livros]);

  const buscaLivrosPorUsuario = async () => {
    try {
      const resposta = await api.get(`/livros/${usuarioID}`);
      const livrosUsuario = resposta.data;
      setLivros(livrosUsuario);
    } catch (erro) {
      console.error('Erro ao buscar livros do usuário:', erro);
    }
  };

  function getRandomElements<T>(array: T[], count: number): T[] {
    // Embaralhar o array usando o algoritmo de Fisher-Yates
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    // Retornar os primeiros 'count' elementos do array embaralhado
    return array.slice(0, count);
  }


  const criaSugestoes = async () => {
    try {
      const resposta = await api.get("/livros/");
      const livrosAPI = resposta.data;
      const titulosSet = new Set<string>();

      const livrosNaoRepetidos = livrosAPI.filter((livroAPI: any) => {
        if (!titulosSet.has(livroAPI.titulo)) {
          titulosSet.add(livroAPI.titulo);
          return !livros.some((livro: any) => livro.titulo === livroAPI.titulo);
        }
        return false;
      });

      const sugestoes = livrosNaoRepetidos.length > 10 ? getRandomElements(livrosNaoRepetidos, 10)  : livrosNaoRepetidos;
      setListaSugestoes(sugestoes);
    } catch (erro) {
      console.error("Erro ao criar sugestões de livros:", erro);
      return [];
    }
  };

  const ListarLivrosComMeta = () => {
    const filteredLivros = livros.filter(livro => livro.data_meta !== undefined && livro.concluido != true);
    setMetasDeLivros(filteredLivros); // Atualiza o estado metasDeLivros    
  };

  useEffect(() => {
    if (logado && usuarioID) {
      buscaLivrosPorUsuario();
      criaSugestoes();
      ListarLivrosComMeta();
    }
  }, [logado, usuarioID]);

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
        buscaLivrosPorUsuario,
        criaSugestoes,
        listaSugestoes,
        setListaSugestoes,
        ListarLivrosComMeta,
        metasDeLivros,
        setMetasDeLivros,
        imagemDoUsuario, 
        setImagemDoUsuario
      }}
    >
      {children}
    </LogadoContext.Provider>
  );
}

export function useLogadoContext() {
  return useContext(LogadoContext);
}