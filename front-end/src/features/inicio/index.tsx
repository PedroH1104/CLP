import { useEffect, useState } from 'react';
import logo_inicio from '../../assets/logo_inicio.png';
import CardInfos from './componentes/CardInfos';
import { conteudoCardConcluido, conteudoCardEmAndamento, conteudoCardNaoIniciado } from "@/data/conteudoCardInfos";
import { useLogadoContext } from '@/contexts/LogadoContext';
import { buscaLivros } from '@/services/livro';
import { Refresh } from '@/services/Refresh';
import TituloFeatures from '@/components/TituloFeatures';
import Loading from '@/components/Loading';
import CardMetaContainer from './componentes/CardMetaContainer';
import CardLivroSugestaoContainer from './componentes/CardLivroSugestaoContainer';

export default function Inicio() {

    Refresh();

    const { listaSugestoes, buscaLivrosPorUsuario, metasDeLivros } = useLogadoContext();
    const [livrosAPI, setLivrosAPI] = useState<any[]>([]);
    const [loadingLivrosAPI, setLoadingLivrosAPI] = useState<boolean>(true);
    const [loadingSugestoes, setLoadingSugestoes] = useState<boolean>(true);   

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
    
    useEffect(() => {
        carregaLivros();
        carregaSugestoes();                     
    },[]);

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
                                        <CardLivroSugestaoContainer key={index} livro={livro} livrosAPI={livrosAPI} />
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
                                        <CardMetaContainer
                                            key={index}
                                            livro={livro}
                                        />
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