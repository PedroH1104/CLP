import { api } from "../api/api";
import { PostProps } from "../types/Post";

export const atualizaPosts = async (setPosts: React.Dispatch<React.SetStateAction<PostProps[]>>) => {
	try {
		const response = await api.get("/posts", { timeout: 10000 });

		// Ordena os posts localmente por data, do mais recente ao mais antigo
		// Tipagem explícita para 'a' e 'b' resolve o problema.
		const postsOrdenados = response.data.sort((a: PostProps, b: PostProps) => {
			return new Date(b.data).getTime() - new Date(a.data).getTime();
		});
		
		setPosts(postsOrdenados); // Atualiza o estado com a lista já ordenada
	} catch (error) {
		console.error('Erro ao buscar livros', error);
		throw error;
	}
};

export const editarCurtida = async ( postId: string, usuarioId: string, setPosts: React.Dispatch<React.SetStateAction<PostProps[]>>) => {
    try {
        await api.put(`/posts/editaCurtida/${postId}`, { autor: usuarioId }, { timeout: 10000 });        
        await atualizaPosts(setPosts);
    } catch (error) {
        console.error("Erro ao curtir/descurtir o post", error);
        throw error;
    }
};

export const deletaPost = async (postId: string, setPosts: React.Dispatch<React.SetStateAction<PostProps[]>>) => {
    try {
        await api.delete(`/posts/${postId}`, { timeout: 10000 });
        await atualizaPosts(setPosts); // Atualiza os posts após a exclusão
    } catch (error) {
        console.error("Erro ao excluir o post", error);
        throw error;
    }
};