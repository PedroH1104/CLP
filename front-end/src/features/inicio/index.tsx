import { useEffect, useState } from 'react';
import logo_inicio from '../../assets/logo_inicio.png';
import CardInfos from './componentes/CardInfos';
import { conteudoCardConcluido, conteudoCardEmAndamento, conteudoCardNaoIniciado } from "@/data/conteudoCardInfos";
import { useLogadoContext } from '@/contexts/LogadoContext';
import CardLivro from '../meusLivros/componentes/CardLivro';
import { SiVerizon } from "react-icons/si";
import { IoCloseSharp } from "react-icons/io5";
import CardMeta from './componentes/CardMeta';
import { v4 as uuidv4 } from 'uuid';
import { buscaLivros, CriaLivro } from '@/services/livro';
import { Refresh } from '@/services/Refresh';
import TituloFeatures from '@/components/TituloFeatures';
import Loading from '@/components/Loading';

export default function Inicio() {

    Refresh();

    const { listaSugestoes, setListaSugestoes, usuarioID, buscaLivrosPorUsuario, metasDeLivros } = useLogadoContext();
    const [livrosAPI, setLivrosAPI] = useState<any[]>([]);
    const [loadingLivrosAPI, setLoadingLivrosAPI] = useState<boolean>(true);
    const [loadingSugestoes, setLoadingSugestoes] = useState<boolean>(true);

    const removerSugestao = (livroRemovido: any) => {
        setListaSugestoes(prevSugestoes => prevSugestoes.filter(livro => livro !== livroRemovido));
    };

    const adicionarSugestao = async (livroSelecionado: any) => {
        const livroAjustado = {
            ...livroSelecionado,
            UserId: usuarioID,
            livro_id: uuidv4(),
            pagina_atual: 0,
            concluido: false,
            data_meta: undefined,
            avaliacao: 0
        };

        try {
            const response = await CriaLivro(livroAjustado);
            if (response && response.status >= 200 && response.status < 300) {
                buscaLivrosPorUsuario();
                removerSugestao(livroSelecionado);
                alert("Livro adicionado à sua lista com sucesso!");
            } else {
                console.error("Erro ao adicionar livro:", response?.data);
            }
        } catch (error) {
            console.error("Erro ao criar livro:", error);
        }
    };

    function calculaDiasRestantes(data_meta: string) {
        const dataMeta = new Date(data_meta);
        const dataAtual = new Date();
        dataMeta.setHours(0, 0, 0, 0);
        dataAtual.setHours(0, 0, 0, 0);
        const diferencaEmMilissegundos = dataMeta.getTime() - dataAtual.getTime();
        const diferencaEmDias = Math.ceil(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));
        return diferencaEmDias;
    }

    const carregaLivros = async () => {
        try {
            setLoadingLivrosAPI(true);
            const livrosBuscados = await buscaLivros();
            setLivrosAPI(livrosBuscados);
        } catch (error) {
            console.error("Erro ao carregar livros:", error);
        } finally {
            setLoadingLivrosAPI(false);
        }
    };

    const carregaSugestoes = async () => {
        try {
            setLoadingSugestoes(true);
            await buscaLivrosPorUsuario();
        } catch (error) {
            console.error("Erro ao carregar sugestões:", error);
        } finally {
            setLoadingSugestoes(false);
        }
    };

    function constroiCard(livro: any) {
        const livrosRelacionados = livrosAPI.filter((livroAPI) => livroAPI.titulo === livro.titulo);
        const totalAvaliacoes = livrosRelacionados.filter((livroAPI) => livroAPI.avaliacao !== 0).reduce((total, livroAPI) => total + livroAPI.avaliacao, 0);
        const mediaAvaliacoes = totalAvaliacoes / livrosRelacionados.filter((livroAPI) => livroAPI.avaliacao !== 0).length;

        return <CardLivro {...livro} sugestao={true} avaliacaoReal={mediaAvaliacoes} />
    }

    useEffect(() => {
        carregaLivros();
        carregaSugestoes();
    }, []);

    return (
        <section className='flex flex-col'>
            <TituloFeatures src={logo_inicio} text="MEU PAINEL" />
            {loadingLivrosAPI && loadingSugestoes ? (
                <Loading />
            ) : (
                <>
                    <div className='flex flex-col items-center'>
                        <h2 className='font-bold text-[28px] text-azulPadrao'>Visão Geral dos Livros</h2>
                        <p className='mb-[50px] text-azulPadrao text-[18px]'>Abaixo você encontrará uma visão geral dos seus livros. Estes cartões mostram a quantidade de livros em diferentes estágios de leitura:</p>
                        <div className='flex w-full justify-center gap-[40px] mb-[50px]'>
                            <CardInfos {...conteudoCardNaoIniciado} />
                            <CardInfos {...conteudoCardEmAndamento} />
                            <CardInfos {...conteudoCardConcluido} />
                        </div>
                    </div>

                    <div>
                        {listaSugestoes.length > 0 && (
                            <div className='flex flex-col items-center gap-[50px] mb-[60px]'>
                                <div className="flex flex-col items-center">
                                    <h2 className='font-bold text-[28px] text-azulPadrao'>Recomendações de Leitura</h2>
                                    <p className='text-azulPadrao text-[18px]'>Você tem alguns livros recomendados que ainda não estão na sua lista. Os livros podem ser avaliados por outros usuários após o término da leitura. A média das avaliações aparece abaixo de cada livro.</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-6">
                                    {listaSugestoes.slice(0, 5).map((livro, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div className='flex items-center gap-2'>
                                                <button onClick={() => adicionarSugestao(livro)}>
                                                    <SiVerizon className="text-green-500 text-[30px]" />
                                                </button>
                                                <button onClick={() => removerSugestao(livro)}>
                                                    <IoCloseSharp className="text-vermelhoClaro text-[50px]" />
                                                </button>
                                            </div>
                                            {constroiCard(livro)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {metasDeLivros.length > 0 && (
                            <div className='flex flex-col items-center'>
                                <h2 className='font-bold text-[28px] text-azulPadrao'>Suas Metas de Leitura</h2>
                                <p className='text-azulPadrao text-[18px]'>Aqui estão suas metas atuais de leitura. Acompanhe o progresso e veja quantos dias faltam para cumprir suas metas.</p>
                                <div className='flex gap-[100px] mt-[50px] flex-wrap justify-center'>
                                    {metasDeLivros.map((livro, index) => (
                                        <div key={index} className='flex flex-col items-center gap-[15px]'>
                                            <h2 className='text-azulPadrao'>{livro.titulo}</h2>
                                            <CardMeta firstValuePercentage={(livro.pagina_atual / livro.quantidade_paginas) * 100} paginaAtual={livro.pagina_atual} paginaFinal={livro.quantidade_paginas} />
                                            <p className='text-azulPadrao'>{calculaDiasRestantes(livro.data_meta)} dias restantes</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}