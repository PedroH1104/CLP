import { useState } from 'react';
import { useLogadoContext } from '@/contexts/LogadoContext';
import { GoGear } from "react-icons/go";
import { buscaRelatorio } from '@/services/historico';
import { Refresh } from '@/services/Refresh';
import TituloFeatures from '@/components/TituloFeatures';

interface HistoricoProps {
  historico_id: number;
  data_leitura: string;
  pagina_atual: number;
  data_meta: string;
  usuario: number;
  livro: number;
  concluido: boolean
}

export default function Relatorio() {

  Refresh()

  const { livros, usuarioID} = useLogadoContext();
  const [selectedBookId, setSelectedBookId] = useState();
  const [historicosFiltrados, setHistoricosFiltrados] = useState<HistoricoProps[]>([]);
  const [mostrarTabela, setMostrarTabela] = useState(false);  

  const handleBookChange = (event: any) => {
    setSelectedBookId(event.target.value);
  };

  const formatarDataLeitura = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  const formatarDataMeta = (dataString: any) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const handleBuscarRelatorio = async () => {
    try {
      if (selectedBookId) {
        const historicos = await buscaRelatorio();
        console.log(historicos);

        const historicosDoLivro = historicos.filter((historico: HistoricoProps) => {
          return historico.livro === selectedBookId && historico.usuario === usuarioID;
        });

        const historicosFormatados = historicosDoLivro.map((historico: HistoricoProps) => {
          let statusMeta: string;
          let paginaAtual: string;
        
          // Função para converter uma data no formato esperado para comparação e comparar apenas os dias
          const parseDate = (dateString: string | undefined) => {
            if (!dateString) return undefined;
            const date = new Date(dateString);
            // Zera as horas, minutos e segundos para comparar apenas os dias
            date.setHours(0, 0, 0, 0);
            return date;
          };
        
          if (historico.concluido) {
            const dataLeitura = parseDate(historico.data_leitura);
            const dataMeta = parseDate(historico.data_meta);
        
            console.log(`Data de leitura: ${dataLeitura}`);
            console.log(`Data da meta: ${dataMeta}`);
        
            if (dataMeta) {
              if (dataLeitura && dataLeitura <= dataMeta) {
                statusMeta = "Meta alcançada";
              } else {
                statusMeta = "Falha na meta";
              }
            } else {
              statusMeta = "Sem meta"; // Se não houver data_meta
            }
            paginaAtual = "Concluído";
          } else {
            statusMeta = historico.data_meta ? formatarDataMeta(historico.data_meta) : "Sem meta";
            paginaAtual = `${historico.pagina_atual}`;
          }
        
          return {
            ...historico,
            pagina_atual: paginaAtual,
            data_meta: statusMeta
          };
        });

        setHistoricosFiltrados(historicosFormatados);
        setMostrarTabela(true);
      } else {
        alert("Por favor, selecione um livro antes de buscar o relatório.");
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      // Trate o erro conforme necessário, como exibir uma mensagem ao usuário
    }
  };

  return (
    <section>
     <TituloFeatures icon={<GoGear className='text-[32px] text-azulPadrao' />} text="RELATÓRIO" />
      <div className='flex flex-col items-center'>
        <h2 className='text-lg text-gray-700 text-center mb-6 w-[85%]'>
          Mergulhe na sua jornada de leitura! Aqui, você pode explorar um histórico detalhado das suas leituras e metas. Em breve, utilizaremos esses dados para ajudar a ajustar seu ritmo e alcançar suas metas de leitura de forma mais eficaz. Vamos analisar seu progresso e otimizar sua experiência literária!
        </h2>
        <div className='flex gap-[10px] mb-[25px] items-center'>
          <label htmlFor="bookSelect" className='text-[22px] font-bold text-gray-800'>Selecione um Livro:</label>
          <select id="bookSelect" value={selectedBookId} onChange={handleBookChange} className='text-black px-[10px] py-[5px]'>
            <option value=""></option>
            {livros.map((livro) => (
              <option key={livro.livro_id} value={livro.livro_id} className='text-azulPadrao'>
                {livro.titulo}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleBuscarRelatorio} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Buscar relatório de leitura</button>

        {mostrarTabela && (
          <table className="mt-[30px] border-collapse border border-gray-500">
            <thead>
              <tr>
                <th className="border border-gray-500 px-4 py-2">Data da Leitura</th>
                <th className="border border-gray-500 px-4 py-2">Página Atual</th>
                <th className="border border-gray-500 px-4 py-2">Data da Meta</th>
              </tr>
            </thead>
            <tbody>
              {historicosFiltrados.map((historico, index) => (
                <tr key={index}>
                  <td className="border border-gray-500 px-4 py-2 text-center">{formatarDataLeitura(historico.data_leitura)}</td>
                  <td className="border border-gray-500 px-4 py-2 text-center">{historico.pagina_atual}</td>
                  <td className="border border-gray-500 px-4 py-2 text-center">{historico.data_meta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}