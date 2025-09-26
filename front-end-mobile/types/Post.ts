export interface PostProps {
    _id: string;
    autor: string;
    nomeAutor: string;
    nomeLivro: string;
    descricao?: string;
    avaliacao: number;
    curtidas: string[],
    comentarios: [],
    imagem: string;
    data: Date | string;
}


export interface PostCriadoProps {
    autor: string;
    nomeAutor: string;
    nomeLivro: string;
    descricao?: string;
    avaliacao: number;
    imagem: string;
    data: Date | string;
}