export interface LivroProps {
    _id: string; // O `ObjectId` do Mongoose é convertido para `string`
    titulo: string;
    paginas?: number;
    usuarioId: string;
    categoria: 
      | "Romance" 
      | "Ficção científica" 
      | "Fantasia" 
      | "Terror" 
      | "Suspense" 
      | "Drama" 
      | "Comédia" 
      | "Biografia" 
      | "Autobiografia" 
      | "Fábula" 
      | "Aventura" 
      | "Infantil" 
      | "Outro";
    imagem: string;
    paginaAtual?: number;
    concluido?: boolean;
    dataMeta?: string | Date;
    avaliacao?: number;
  };

export interface LivroAdicionadoProps{
    usuarioId: string;
    titulo: string;
    paginas: number;
    categoria: string;
    imagem: string;
}

export interface LivroConcluidoProps {
    paginaAtual: number;
    concluido: boolean;
    avaliacao: number;
}

export interface LivroAtualizadoProps {
    dataMeta?: Date | null;
    paginaAtual?: number;
    concluido?: boolean;
}