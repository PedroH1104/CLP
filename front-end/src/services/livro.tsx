import { api } from "@/api/api";
import { v4 as uuidv4 } from 'uuid'; 

import { atualizaMetaNoHistorico, atualizarProgressoNoHistorico, deletaHistoricoDoLivro } from "./historico";

interface SalvarEdicaoLivroProps {
    usuarioID: string;
    cardAberto: any;
    paginaAtual: string;
    buscaLivrosPorUsuario: () => void;
    setModalOpen: (open: boolean) => void;
}

interface AdicionarMetaProps {
    usuarioID: string;
    cardAberto: any;
    paginaAtual: string;
    date: Date | undefined;
    buscaLivrosPorUsuario: () => void;
    setModalOpen: (open: boolean) => void;
}

interface ConcluirLivroProps {
    usuarioID: string;
    cardAberto?: any;
    rating: number;
    buscaLivrosPorUsuario: () => void;
    setModalOpen: (open: boolean) => void;
    comentario: string, 
    imagemDoUsuario: string | undefined
}

interface DeletarLivroProps {
    livroID: string;
    setModalOpen: (isOpen: boolean) => void;
    buscaLivrosPorUsuario: () => void;
}

export const CriaLivro = async (livroAdicionado: any) => {
    try {
        const response = await api.post("/livros/adicionar", livroAdicionado);
        return response; // Retorna o response da requisição
    } catch (error) {
        console.error("Erro ao adicionar livro:", error);
        throw error; // Lança o erro para ser tratado onde a função é chamada
    }
};

export async function salvarEdicaoLivro({ usuarioID, cardAberto, paginaAtual, buscaLivrosPorUsuario, setModalOpen }: SalvarEdicaoLivroProps) {
    const livroEditado = {
        UserId: usuarioID,
        livro_id: cardAberto?.livro_id,
        titulo: cardAberto?.titulo,
        quantidade_paginas: cardAberto?.quantidade_paginas,
        categoria: cardAberto?.categoria,
        pagina_atual: paginaAtual !== "" ? paginaAtual : cardAberto?.pagina_atual,
        concluido: cardAberto?.concluido && paginaAtual === "" ? true : false,
        imagem: cardAberto?.imagem,
        data_meta: cardAberto?.data_meta,
        avaliacao: 0
    };

    try {
        const response = await api.put(`/livros/editar/${cardAberto?.livro_id}`, livroEditado);

        console.log(response.data);
        atualizarProgressoNoHistorico({
            concluido: false,
            quantidadePaginas: cardAberto?.quantidade_paginas,
            paginaAtual: paginaAtual,
            dataMeta: cardAberto?.data_meta,
            usuarioID: usuarioID,
            livroID: cardAberto?.livro_id
        });
        buscaLivrosPorUsuario();
        setModalOpen(false);
    } catch (error) {
        console.error('Erro ao atualizar livro: ', error);
    }
}

export async function adicionarMeta({ usuarioID, cardAberto, paginaAtual, date, buscaLivrosPorUsuario, setModalOpen }: AdicionarMetaProps) {

    if (!cardAberto) {
        console.error("Não há livro aberto para adicionar meta.");
        return;
    }

    const livroEditado = {
        UserId: usuarioID,
        livro_id: cardAberto.livro_id,
        titulo: cardAberto.titulo,
        quantidade_paginas: cardAberto.quantidade_paginas,
        categoria: cardAberto.categoria,
        pagina_atual: paginaAtual !== "" ? Number(paginaAtual) : cardAberto.pagina_atual,
        concluido: cardAberto.concluido && paginaAtual === "" ? true : false,
        imagem: cardAberto.imagem,
        data_meta: date,
        avaliacao: cardAberto.avaliacao
    };

    try {
        const response = await api.put(`/livros/editar/${cardAberto.livro_id}`, livroEditado);
        console.log(response.data, "- Meta adicionada");
        await atualizaMetaNoHistorico({
            paginaAtual: paginaAtual !== "" ? Number(paginaAtual) : cardAberto?.pagina_atual,
            date: date,
            usuarioID: usuarioID,
            cardAberto: cardAberto
        });
        buscaLivrosPorUsuario();
        setModalOpen(false);
    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
    }
}

export async function concluirLivro({ usuarioID, cardAberto, rating, buscaLivrosPorUsuario, setModalOpen, comentario, imagemDoUsuario }: ConcluirLivroProps) {    

    if (!cardAberto) {
        console.error("Não há livro aberto para concluir.");
        return;
    }

    const { livro_id, titulo, quantidade_paginas, categoria, imagem, data_meta } = cardAberto;

    const livroEditado = {
        UserId: usuarioID,
        livro_id: livro_id,
        titulo: titulo,
        quantidade_paginas: quantidade_paginas,
        categoria: categoria,
        pagina_atual: quantidade_paginas,
        concluido: true,
        imagem: imagem,
        data_meta: data_meta,
        avaliacao: rating,
    };

    try {
        const response = await api.put(`/livros/editar/${livro_id}`, livroEditado);
        const dataAtual = new Date();
        console.log('Concluído:', response.data);
        buscaLivrosPorUsuario();
        setModalOpen(false);

        await atualizarProgressoNoHistorico({
            concluido: true,
            quantidadePaginas: quantidade_paginas,
            paginaAtual: quantidade_paginas,
            dataMeta: data_meta,
            usuarioID: usuarioID,
            livroID: livro_id
        });       

        const comentarioParaBD = { 
            id: uuidv4(),          
            usuario_id: usuarioID,
            nome: titulo,            
            imagemLivro: imagem,
            comentario: comentario,
            curtidas: [],
            dataDaFinalização: dataAtual,
            avaliacao: rating,
            idUsuario: usuarioID,
            imagemDoUsuario: imagemDoUsuario
        }                

        api.post("/social/adicionarComentario", comentarioParaBD)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error('Erro ao enviar comentário:', error);
            });
        
    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
    }
}

export async function deletarLivro({ livroID, setModalOpen, buscaLivrosPorUsuario }: DeletarLivroProps) {
    if (livroID) {
        await api.delete(`/livros/deletar/${livroID}`)
            .then(response => {
                const status = response.status;
                if (status === 201) {
                    alert("Livro deletado com sucesso")
                    deletaHistoricoDoLivro(livroID); // Se necessário, chame a função de deletar histórico                     
                    setModalOpen(false)
                    buscaLivrosPorUsuario()
                }
                else {
                    alert("Falha ao deletar livro")
                }
            })
            .catch(error => {
                console.error('Erro ao deletar livro:', error);
                throw error;
            });
    } else {
        console.error('ID do livro não fornecido.');
        return Promise.reject('ID do livro não fornecido.');
    }
}

export const buscaLivros = async () => {
    try {
        const response = await api.get("/livros/");
        return response.data; // Retorna os dados obtidos da API
    } catch (error) {
        console.error('Erro ao buscar livros', error);
        throw error; // Lança o erro para ser tratado onde a função é chamada
    }
};



