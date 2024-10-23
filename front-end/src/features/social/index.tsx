import { useLogadoContext } from "@/contexts/LogadoContext";
import { buscaSocial } from "@/services/social";
import { useEffect, useState } from "react";
import { TbWorldHeart } from "react-icons/tb";
import { api } from "@/api/api";
import { Refresh } from "@/services/Refresh";
import PostCard from "./componentes/PostCard";
import TituloFeatures from "@/components/TituloFeatures";

export default function Social() {

    Refresh()
    
    const { usuarioID } = useLogadoContext();
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const listaSocial = await buscaSocial();
                const postsOrdenados = listaSocial.sort((a: any, b: any) => {
                    return new Date(b.dataDaFinalização).getTime() - new Date(a.dataDaFinalização).getTime();
                });
                setPosts(postsOrdenados);
            } catch (error) {
                console.error('Erro ao buscar posts sociais:', error);
            }
        };

        fetchData();
    }, [posts]);

    const adicionaReacao = async (postId: string) => {
        try {
            // Envia uma requisição PUT para atualizar a curtida no post
            const response = await api.put(`/social/editarCurtida/${postId}`, { usuarioID });

            // Verifica se a resposta foi bem-sucedida
            if (response.status === 200) {                
                const updatedPosts = posts.map(post =>
                    post.id === postId ? { ...post, curtidas: response.data.curtidas } : post
                );
                setPosts(updatedPosts);
            } else {
                console.error('Erro ao adicionar/removed reação:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao adicionar/removed reação:', error);
        }
    }

    return (
        <section>
            <TituloFeatures icon={<TbWorldHeart className='text-[32px] text-azulPadrao' />} text="SOCIAL" />            
            <div className="flex flex-col justify-center">
            {posts.map((post) => (
                <PostCard
                    key={post.id} 
                    post={post} 
                    usuarioID={usuarioID} 
                    adicionaReacao={adicionaReacao} 
                />
            ))}
            </div>
        </section>
    )
}