import { api } from "@/api/api";

export const buscaSocial = async () => {
    try {
        const response = await api.get("/social/");
        return response.data; // Retorna os dados obtidos da API
    } catch (error) {
        console.error('Erro ao buscar livros', error);
        throw error; // Lança o erro para ser tratado onde a função é chamada
    }
};