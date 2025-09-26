export interface CadastraUsuarioProps {
    nome: string;
    email: string;
    senha: string;
    confirmacaoSenha: string;
    imagem?: string | null;
    navigation: any;
    setLoading: (loading: boolean) => void;
}

export interface VerificaLoginProps {
    email: string;
    senha: string;
    setUsuarioID: (id: string) => void;
    setLogado: (logado: boolean) => void;
    setNome: (nome: string) => void;
    setEmailDoUsuario: (email: string) => void;
    atualizaLivrosDoUsuario: () => void;
    navigation: any;
    setLoading: (loading: boolean) => void;
}