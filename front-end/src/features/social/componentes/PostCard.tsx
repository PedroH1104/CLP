import React from 'react';
import { MdOutlineAccountCircle } from "react-icons/md";
import { FaStar, FaRegStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { formatDistance, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';


interface PostCardProps {
    post: any;
    usuarioID: string;
    adicionaReacao: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, usuarioID, adicionaReacao }) => {

    const formatDistanceToNowInPortuguese = (date: any) => {
        const distance = formatDistance(parseISO(date), new Date(), { locale: ptBR });
        return distance.replace(/seconds?/i, 'segundos').replace(/minutes?/i, 'minutos').replace(/hours?/i, 'horas').replace(/days?/i, 'dias').replace(/months?/i, 'meses').replace(/years?/i, 'anos');
    }

    return (
        <div className="mb-[20px] p-4 rounded-lg w-[700px] border border-black mx-auto">
            <div className="flex items-center justify-between mb-[30px]">
                <div className="flex items-center">
                    {post.imagemDoUsuario ? (
                        <img
                            src={post.imagemDoUsuario}
                            alt="Perfil"
                            className="rounded-full w-[28px] h-[28px]"
                        />
                    ) : (
                        <MdOutlineAccountCircle className="text-black text-[28px]" />
                    )}

                    <p className="text-black font-bold ml-[8px] flex items-center max-w-[90%]">
                        {post.idUsuario === usuarioID ? "Você" : post.nomeUsuario} avaliou " {post.nome} "
                    </p>
                </div>
                <p className="text-gray-600">{formatDistanceToNowInPortuguese(post.dataDaFinalização)} atrás</p>
            </div>
            <div className="flex flex-col items-center gap-[15px]">
                <div className="flex flex-col items-center">
                    <span className="flex ml-[4px]">
                        {Array.from({ length: 5 }).map((_, i) => (
                            i < post.avaliacao
                                ? <FaStar key={`star-${post.id}-${i}`} className="text-black text-[18px]" />
                                : <FaRegStar key={`star-${post.id}-${i}`} className="text-black text-[18px]" />
                        ))}
                    </span>
                    <p className="text-gray-700 mb-2 text-center">{post.comentario}</p>
                </div>
                <div className="border border-black mb-2 flex items-center justify-center">
                    <img src={post.imagemLivro} className="h-[250px] object-contain" alt="Capa do livro" />
                </div>
            </div>
            <div className="relative flex items-center">
                {post.curtidas.includes(usuarioID) ? (
                    <FaHeart
                        className="text-[40px] text-azulEscuro cursor-pointer"
                        onClick={() => adicionaReacao(post.id)}
                    />
                ) : (
                    <FaRegHeart
                        className="text-[40px] text-azulEscuro cursor-pointer"
                        onClick={() => adicionaReacao(post.id)}
                    />
                )}
                <p className="absolute text-azulEscuro top-[60%] left-[5%] text-[16px] font-bold">
                    {post.curtidas?.length || 0}
                </p>
            </div>
        </div>
    );
};

export default PostCard;