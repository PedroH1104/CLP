import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import TituloCampo from "../../../../components/TituloCampo"
import SelectCategoria from "../../../../components/SelectCategoria"
import { useState } from "react"
import InputText from "../../../../components/InputText"
import InputNumber from "../../../../components/InputNumber"
import { useModalContext } from "@/contexts/ModalContext"
import { CriaLivro } from "@/services/livro"
import { useLogadoContext } from "@/contexts/LogadoContext"
import { v4 as uuidv4 } from 'uuid';
import axios from "axios"
import { atualizarProgressoNoHistorico } from "@/services/historico"

export function ModalCriacaoLivro() {

  const [nomeLivro, setNomeLivro] = useState("")
  const [quantidadePaginas, setQuantidadePaginas] = useState("")
  const [categoria, setCategoria] = useState("")
  const { setModalOpen } = useModalContext()
  const { usuarioID, buscaLivrosPorUsuario } = useLogadoContext();
  const [erro, setErro] = useState<string | null>(null);

  function limpaCampos() {
    setNomeLivro("")
    setQuantidadePaginas("")
    setCategoria("")
    setErro(null);
  }

  const handleAdicionarLivro = async () => {

    if (!nomeLivro || !quantidadePaginas || !categoria) {
      setErro("Por favor, preencha todos os campos.");
      return;
    }

    const livroAdicionado = {
      UserId: usuarioID,
      livro_id: uuidv4(),
      titulo: nomeLivro,
      quantidade_paginas: quantidadePaginas,
      categoria: categoria,
      pagina_atual: 0,
      concluido: false,
      imagem: await buscarImagemLivro(nomeLivro),
      data_meta: "",
      avaliacao: 0
    };    

    try {
      const response = await CriaLivro(livroAdicionado);
      if (response && response.status >= 200 && response.status < 300) {     
        
        const livroAdicionadoParaHistorico = {
          concluido: false,
          quantidadePaginas: quantidadePaginas,
          paginaAtual: 0,
          dataMeta: "",
          usuarioID: usuarioID,
          livroID: livroAdicionado.livro_id
        }

        atualizarProgressoNoHistorico(livroAdicionadoParaHistorico)
        buscaLivrosPorUsuario();
        limpaCampos();
        setModalOpen(false);
      } else {
        console.error("Erro ao adicionar livro:", response?.data);
      }
    } catch (error) {
      console.error("Erro ao criar livro:", error);
    }
  };

  const buscarImagemLivro = async (nome: any) => {
    const busca = `capa do livro ${nome}`
    try {
      const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1?q=${busca}&key=AIzaSyAgiU1Bcn3I-7nHHevvI3bWXHSYiaY3uF4&cx=61e32c63bae2147be&searchType=image`
      );      
      const primeiraImagem = response.data.items[0].link;
      
      return primeiraImagem
    } catch (error) {
      console.error('Erro ao buscar imagem do livro:', error);
    }
  };

  return (
    <DialogContent className='min-w-[400px] h-[375px] border-azulPadrao'>
      <DialogHeader className="flex-col items-center">
        <DialogTitle className="text-azulPadrao font-semibold text-[32px] leading-none">ADICIONAR LIVRO</DialogTitle>
      </DialogHeader>
      <div className="flex-column">
        <div className="">
          <TituloCampo>Nome do livro</TituloCampo>
          <InputText value={nomeLivro} setValue={setNomeLivro} />
        </div>
        <div className="mt-[20px]">
          <TituloCampo>Quantidade de páginas</TituloCampo>
          <InputNumber value={quantidadePaginas} setValue={setQuantidadePaginas} />
        </div>
        <div className="flex justify-between items-center mt-[20px]">
          <div>
            <TituloCampo>Categoria</TituloCampo>
            <SelectCategoria selectedValue={categoria} setSelectedValue={setCategoria} />
          </div>
          <button className='text-[14px] font-semibold text-white bg-azulPadrao px-[20px] py-[0px] mr-[10px] rounded-full h-[40px]' onClick={handleAdicionarLivro}>Adicionar</button>
        </div>
        <div className="text-center mt-[15px] mb-[5px] h-[15px]">
          {erro && (
            <p className="text-red">{erro}</p>
          )}
        </div>
      </div>
    </DialogContent>
  )
}