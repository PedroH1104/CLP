import { LivroProps } from "@/types/LivroProps";
import CardMeta from "../CardMeta";

export default function CardMetaContainer({ livro }: { livro: LivroProps }) {

  // Função movida para dentro do componente
  const calculaDiasRestantes = (data_meta: string) => {
    const dataMeta = new Date(data_meta);
    const dataAtual = new Date();
    dataMeta.setHours(0, 0, 0, 0);
    dataAtual.setHours(0, 0, 0, 0);
    const diferencaEmMilissegundos = dataMeta.getTime() - dataAtual.getTime();
    const diferencaEmDias = Math.ceil(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));
    return diferencaEmDias;
  };

  return (
    <div className='flex flex-col items-center gap-[15px]'>
      <h2 className='text-azulPadrao'>{livro.titulo}</h2>
      <CardMeta
        firstValuePercentage={(livro.pagina_atual / livro.quantidade_paginas) * 100}
        paginaAtual={livro.pagina_atual}
        paginaFinal={livro.quantidade_paginas}
      />
      <p className='text-azulPadrao'>{calculaDiasRestantes(livro.data_meta)} dias restantes</p>
    </div>
  );
}