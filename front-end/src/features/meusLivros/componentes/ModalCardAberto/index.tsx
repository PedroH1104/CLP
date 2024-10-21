import { useModalContext } from "@/contexts/ModalContext"
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { DialogDescription } from "@radix-ui/react-dialog"
import { useState } from "react"
import InputNumber from "../../../../components/InputNumber"
import { useLogadoContext } from "@/contexts/LogadoContext"
import { FaRegStar, FaStar } from "react-icons/fa";
import DatePickerDemo from "@/components/DatePickerDemo"
import { adicionarMeta, concluirLivro, deletarLivro, salvarEdicaoLivro } from "@/services/livro"

export default function ModalCardAberto() {

    const { cardAberto, setModalOpen } = useModalContext()
    const [paginaAtual, setPaginaAtual] = useState("");
    const { buscaLivrosPorUsuario, usuarioID, imagemDoUsuario } = useLogadoContext();
    const [avaliacao, setAvalicao] = useState(false);
    const [rating, setRating] = useState(0);
    const [date, setDate] = useState<Date | undefined>(cardAberto?.data_meta ? new Date(cardAberto?.data_meta) : undefined);
    const [comentario, setComentario] = useState("");
    const [erro, setErro] = useState<string | null>(null);

    const handleSalvarEdicao = () => {
        // Verificar se a página atual é válida e se está dentro do intervalo permitido
        const paginaAtualNum = parseInt(paginaAtual, 10);
        if (isNaN(paginaAtualNum) || paginaAtualNum < 1 || paginaAtualNum > (cardAberto?.quantidade_paginas || 0)) {
            setErro("Por favor, insira uma página válida entre 1 e " + (cardAberto?.quantidade_paginas || 0) + ".");
            return;
        }

        // Verificar se o campo da página atual está vazio ou se a página não foi alterada
        if (paginaAtual === "" || paginaAtual === cardAberto?.pagina_atual.toString()) {
            setErro("Por favor, insira a página que você parou.");
            return;
        }

        salvarEdicaoLivro({
            usuarioID,
            cardAberto,
            paginaAtual,
            buscaLivrosPorUsuario,
            setModalOpen
        });
        setErro(null);
    };

    const handleAdicionarMeta = async () => {
        if (!date) {
            setErro("Por favor, selecione uma data.");
            return;
        }

        if (cardAberto) {
            await adicionarMeta({
                usuarioID,
                cardAberto,
                paginaAtual,
                date,
                buscaLivrosPorUsuario,
                setModalOpen
            });
            setErro(null);
        } else {
            console.error("Não há livro aberto para adicionar meta.");
        }
    };

    const handleConcluirLivro = () => {

        console.log("imagem do usuario antes do handle", imagemDoUsuario)

        concluirLivro({
            usuarioID,
            cardAberto,
            rating,
            buscaLivrosPorUsuario,
            setModalOpen,
            comentario, 
            imagemDoUsuario         
        });
    };

    const handleDeletarLivro = () => {
        if (cardAberto?.livro_id) {
            deletarLivro({ livroID: cardAberto.livro_id, setModalOpen, buscaLivrosPorUsuario })
        }
    };

    function abreMenuAvaliacao() {
        setAvalicao(true);
    }

    const handleCommentChange = (event: any) => {
        setComentario(event.target.value);
    };

    return (
        <DialogContent className='min-w-[400px] h-[400px] border-azulPadrao justify-center pb-0'>
            <DialogHeader className="flex-col items-center h-[0px] mb-[50px]">
                <DialogTitle className="text-azulPadrao font-semibold text-[32px] leading-none text-center">{cardAberto?.titulo}</DialogTitle>
                <DialogDescription className="text-azulPadrao">{cardAberto?.categoria}</DialogDescription>
            </DialogHeader>
            <div className="flex-column">
                {avaliacao ? (
                    <div>
                        <div className="flex justify-center mb-[10px]">
                            <h3 className="text-azulPadrao text-[32px] ">O que você achou do livro?</h3>
                        </div>
                        <div className="flex gap-[8px] justify-center items-center">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <div key={value} onClick={() => setRating(value)}>
                                    {value <= rating ? (
                                        <FaStar className="text-azulPadrao text-[26px]" />
                                    ) : (
                                        <FaRegStar className="text-azulPadrao text-[26px]" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col justify-center mt-[25px] items-center">
                            <textarea
                                placeholder="Digite seu comentário"
                                value={comentario}
                                onChange={handleCommentChange}
                                className="border border-gray-300 px-4 py-2 rounded-md mr-2 h-[100px] w-[350px]"
                            />
                            <button onClick={handleConcluirLivro} className="bg-azulPadrao text-white px-6 py-3 rounded-full mt-4 hover:bg-opacity-80 w-[200px]">
                                Enviar
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center mb-[10px]">
                            <h3 className="text-azulPadrao text-[20px] ">Em qual página você parou?</h3>
                        </div>
                        <div className="flex gap-[8px] justify-center items-center">
                            <InputNumber value={paginaAtual} setValue={setPaginaAtual} placeholder={cardAberto?.pagina_atual} estilos="w-[70px] h-[25px]" />
                            <p className="text-[24px] text-azulPadrao">/</p>
                            <p className="text-[24px] text-azulPadrao">{cardAberto?.quantidade_paginas}</p>
                        </div>
                        <div className="flex mt-[30px] gap-[20px]">
                            <button className='text-[14px] font-semibold text-white bg-vermelhoClaro px-[20px] py-[0px]  rounded-full h-[40px]' onClick={handleDeletarLivro}>Deletar livro</button>
                            <button className='text-[14px] font-semibold text-white bg-azulPadrao px-[20px] py-[0px]  rounded-full h-[40px]' onClick={handleSalvarEdicao}>Salvar alterações</button>
                            <button className='text-[14px] font-semibold text-white bg-verde px-[20px] py-[0px] rounded-full h-[40px]' onClick={abreMenuAvaliacao}>Terminar livro</button>
                        </div>
                        <div className="flex justify-center mt-[25px]">
                            <DatePickerDemo date={date} setDate={setDate} />
                            <button className='ml-[10px] text-[14px] font-semibold text-white bg-cinzaEscuro px-[20px] py-[0px] rounded-full h-[40px]' onClick={handleAdicionarMeta}>Adicionar meta</button>
                        </div>
                        <div className="text-center mt-[15px] mb-[5px] h-[15px]">
                            {erro && (
                                <p className="text-red">{erro}</p>
                            )}
                        </div>
                    </>
                )}
                <div className="flex justify-around mt-[30px]">
                    {/* 
                    <h3 className="text-[26px] text-azulPadrao">Anotações</h3>                    
                    <button className='text-[14px] font-semibold text-white bg-cinzaEscuro px-[20px] py-[0px] mr-[10px] rounded-full h-[40px]'>Adicionar anotação</button>]
                    */}
                </div>
            </div>
        </DialogContent>
    )
}
