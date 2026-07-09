import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageStructure from '../../../components/PageStructure';
import { useLogadoContext } from '../../../context/logadoContext';
import { buscarHistoricoAgente, HistoricoAgenteItem } from '../../../services/agente';

function formatarData(data: string) {
  const dataRegistro = new Date(data);

  if (Number.isNaN(dataRegistro.getTime())) {
    return '';
  }

  return dataRegistro.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarParametros(parametros?: Record<string, any>) {
  if (!parametros || Object.keys(parametros).length === 0) {
    return 'Nenhum parametro extraido.';
  }

  return Object.entries(parametros)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .map(([chave, valor]) => `${nomeDoCampo(chave)}: ${formatarValor(valor)}`)
    .join('\n');
}

function nomeDoCampo(campo: string) {
  const nomes: Record<string, string> = {
    texto: 'Texto recebido',
    origem: 'Origem',
    acaoDetectada: 'Acao detectada',
    parametrosExtraidos: 'Parametros extraidos',
    ferramentaProposta: 'Ferramenta proposta pelo LLM',
    parametrosPropostos: 'Parametros propostos pelo LLM',
    usouPendenciaNoPrompt: 'Recebeu pendencia ativa',
    totalHistoricoConsiderado: 'Historicos considerados',
    totalLivrosConsiderados: 'Livros considerados',
    contextoAplicado: 'Contexto aplicado',
    usouPendencia: 'Usou memoria',
    camposFaltantesAntes: 'Campos que faltavam',
    camposPreenchidosPelaIA: 'Campos preenchidos pela OpenAI',
    parametrosPendentes: 'Parametros da pendencia',
    parametrosPropostosPelaIA: 'Parametros finais propostos pela OpenAI',
    acaoPretendida: 'Acao pretendida',
    parametrosParciais: 'Parametros parciais',
    desejo: 'Objetivo do agente',
    acaoSolicitada: 'Acao solicitada',
    totalLivrosUsuario: 'Livros observados',
    totalPostsRecentes: 'Posts sociais observados',
    acao: 'Acao planejada',
    passos: 'Passos do plano',
    parametros: 'Parametros',
    permitido: 'Permitido',
    precisaConfirmacao: 'Precisa confirmacao',
    mensagem: 'Mensagem',
    ferramenta: 'Ferramenta interna',
    executada: 'Executada',
    sucesso: 'Sucesso',
    pendencia: 'Pendencia criada',
    totalItens: 'Itens encontrados',
    imagemEncontrada: 'Imagem encontrada',
    postGerado: 'Post social gerado',
    id: 'Identificador',
    titulo: 'Titulo',
  };

  return nomes[campo] || campo;
}

function formatarValor(valor: any): string {
  if (Array.isArray(valor)) {
    return valor.join(', ');
  }

  if (typeof valor === 'boolean') {
    return valor ? 'sim' : 'nao';
  }

  if (typeof valor === 'object' && valor !== null) {
    return `\n${formatarObjetoComoLinhas(valor)}`;
  }

  return String(valor);
}

function formatarObjetoComoLinhas(objeto?: Record<string, any>) {
  if (!objeto || Object.keys(objeto).length === 0) {
    return 'Nenhum dado informado.';
  }

  return Object.entries(objeto)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .map(([chave, valor]) => `${nomeDoCampo(chave)}: ${formatarValor(valor)}`)
    .join('\n');
}

function formatarDetalhesTrace(tipo: string, detalhes?: Record<string, any>) {
  if (!detalhes || Object.keys(detalhes).length === 0) {
    return '';
  }

  if (tipo === 'observacao') {
    return `Texto recebido: "${detalhes.texto || ''}"`;
  }

  if (tipo === 'percepcao') {
    const contextoAplicado = detalhes.contextoAplicado === 'pendencia_ativa'
      ? 'pendencia ativa'
      : 'nenhum';

    return [
      `Origem: ${detalhes.origem || 'openai'}`,
      `Acao detectada: ${nomeDaAcao(detalhes.acaoDetectada || 'desconhecida')}`,
      `Contexto aplicado: ${contextoAplicado}`,
      'Parametros extraidos:',
      formatarObjetoComoLinhas(detalhes.parametrosExtraidos),
    ].join('\n');
  }

  if (tipo === 'memoria') {
    return [
      'O BDI recuperou uma pendencia anterior e enviou esse contexto para a OpenAI.',
      `Campos que faltavam: ${formatarValor(detalhes.camposFaltantesAntes || []) || 'nenhum'}`,
      `Campos preenchidos pela OpenAI: ${formatarValor(detalhes.camposPreenchidosPelaIA || []) || 'nenhum'}`,
      'Parametros da pendencia anterior:',
      formatarObjetoComoLinhas(detalhes.parametrosPendentes),
      'Parametros finais propostos pela OpenAI:',
      formatarObjetoComoLinhas(detalhes.parametrosPropostosPelaIA),
    ].join('\n');
  }

  if (tipo === 'plano_llm') {
    return [
      `Ferramenta proposta: ${nomeDaAcao(detalhes.ferramentaProposta || 'desconhecida')}`,
      `Recebeu pendencia ativa: ${formatarValor(Boolean(detalhes.usouPendenciaNoPrompt))}`,
      `Historicos considerados: ${detalhes.totalHistoricoConsiderado || 0}`,
      `Livros considerados: ${detalhes.totalLivrosConsiderados || 0}`,
      'Parametros propostos pelo LLM:',
      formatarObjetoComoLinhas(detalhes.parametrosPropostos),
    ].join('\n');
  }

  if (tipo === 'deliberacao') {
    return [
      `Objetivo do agente: ${detalhes.desejo}`,
      `Acao solicitada: ${nomeDaAcao(detalhes.acaoSolicitada || 'desconhecida')}`,
      `Livros observados: ${detalhes.totalLivrosUsuario}`,
      `Posts sociais observados: ${detalhes.totalPostsRecentes}`,
    ].join('\n');
  }

  if (tipo === 'plano') {
    return [
      `Acao planejada: ${nomeDaAcao(detalhes.acao || 'desconhecida')}`,
      `Passos: ${(detalhes.passos || []).join(' -> ')}`,
      'Parametros usados no plano:',
      formatarObjetoComoLinhas(detalhes.parametros),
    ].join('\n');
  }

  if (tipo === 'seguranca') {
    return [
      `Permitido executar: ${formatarValor(Boolean(detalhes.permitido))}`,
      `Precisa confirmacao: ${formatarValor(Boolean(detalhes.precisaConfirmacao))}`,
      detalhes.mensagem ? `Mensagem: ${detalhes.mensagem}` : '',
    ].filter(Boolean).join('\n');
  }

  if (tipo === 'acao') {
    return [
      `Ferramenta interna: ${detalhes.ferramenta || 'nenhuma'}`,
      `Executada: ${formatarValor(Boolean(detalhes.executada))}`,
      `Sucesso: ${formatarValor(Boolean(detalhes.sucesso))}`,
      detalhes.mensagem ? `Mensagem: ${detalhes.mensagem}` : '',
      detalhes.pendencia ? `Pendencia criada:\n${formatarObjetoComoLinhas(detalhes.pendencia)}` : '',
    ].filter(Boolean).join('\n');
  }

  return formatarObjetoComoLinhas(detalhes);
}

function resumirEtapaTrace(tipo: string, detalhes?: Record<string, any>, descricao?: string) {
  if (!detalhes) {
    return descricao || '';
  }

  if (tipo === 'observacao') {
    return 'O agente recebeu o comando do usuario.';
  }

  if (tipo === 'memoria') {
    const campos = formatarValor(detalhes.camposFaltantesAntes || []);
    return `Pendencia anterior recuperada${campos ? `: faltavam ${campos}` : ''}.`;
  }

  if (tipo === 'plano_llm') {
    const ferramenta = nomeDaAcao(detalhes.ferramentaProposta || 'desconhecida');
    const memoria = detalhes.usouPendenciaNoPrompt ? ' usando a memoria ativa' : '';
    return `OpenAI propôs ${ferramenta}${memoria}.`;
  }

  if (tipo === 'percepcao') {
    return `Intencao detectada: ${nomeDaAcao(detalhes.acaoDetectada || 'desconhecida')}.`;
  }

  if (tipo === 'deliberacao') {
    return `BDI relacionou a acao ao objetivo ${detalhes.desejo || 'do agente'}.`;
  }

  if (tipo === 'plano') {
    const totalPassos = Array.isArray(detalhes.passos) ? detalhes.passos.length : 0;
    return `Plano interno com ${totalPassos} passo${totalPassos === 1 ? '' : 's'}.`;
  }

  if (tipo === 'seguranca') {
    return detalhes.precisaConfirmacao
      ? 'A acao precisa de confirmacao.'
      : 'A acao foi liberada para execucao.';
  }

  if (tipo === 'acao') {
    return detalhes.executada
      ? `Ferramenta interna acionada: ${detalhes.ferramenta || 'nenhuma'}.`
      : 'Nenhuma ferramenta final foi executada nesta etapa.';
  }

  if (tipo === 'observacao_resultado') {
    return detalhes.sucesso ? 'Resultado registrado com sucesso.' : 'Resultado registrado com pendencia ou erro.';
  }

  return descricao || '';
}

function nomeDaAcao(acao: string) {
  const nomes: Record<string, string> = {
    criar_livro: 'Criar livro',
    atualizar_pagina: 'Atualizar pagina',
    excluir_livro: 'Excluir livro',
    concluir_livro: 'Concluir livro',
    consultar_social: 'Consultar avaliacoes',
    solicitar_dados: 'Solicitar dados',
    comando_desconhecido: 'Comando desconhecido',
    buscar_avaliacoes: 'Buscar avaliacoes',
    desconhecida: 'Nao identificada',
  };

  return nomes[acao] || acao;
}

function nomeDaOrigem(origem: HistoricoAgenteItem['origemInterpretacao']) {
  const nomes = {
    openai: 'OpenAI',
  };

  return nomes[origem] || 'OpenAI';
}

function TraceTimeline({ item }: { item: HistoricoAgenteItem }) {
  const etapas = item.traceBDI?.etapas || [];
  const [etapasAbertas, setEtapasAbertas] = useState<Record<string, boolean>>({});

  if (etapas.length === 0) {
    return null;
  }

  const alternarEtapa = (chave: string) => {
    setEtapasAbertas((estadoAtual) => ({
      ...estadoAtual,
      [chave]: !estadoAtual[chave],
    }));
  };

  return (
    <View style={styles.traceBox}>
      <View style={styles.traceHeader}>
        <Text style={styles.sectionLabel}>Ciclo do agente</Text>
        <Text style={styles.traceCount}>{etapas.length} etapas</Text>
      </View>

      {etapas.map((etapa, index) => {
        const chave = `${etapa.tipo}-${index}`;
        const detalhes = formatarDetalhesTrace(etapa.tipo, etapa.detalhes);
        const resumo = resumirEtapaTrace(etapa.tipo, etapa.detalhes, etapa.descricao);
        const aberta = Boolean(etapasAbertas[chave]);

        return (
          <View key={chave} style={styles.traceStep}>
            <View style={styles.traceMarker}>
              <Text style={styles.traceNumber}>{index + 1}</Text>
            </View>

            <View style={styles.traceContent}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => alternarEtapa(chave)}
                style={styles.traceStepHeader}
              >
                <View style={styles.traceTitleGroup}>
                  <Text style={styles.traceTitle}>{etapa.titulo}</Text>
                  <Text style={styles.traceSummary}>{resumo}</Text>
                </View>

                {!!detalhes && (
                  <Ionicons
                    name={aberta ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#64748B"
                  />
                )}
              </TouchableOpacity>

              {aberta && !!detalhes && (
                <View style={styles.traceDetailsBox}>
                  <Text style={styles.traceDetails}>{detalhes}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function HistoricoCard({ item }: { item: HistoricoAgenteItem }) {
  const parametros = useMemo(() => formatarParametros(item.parametros), [item.parametros]);
  const nomeUsuario = item.usuario?.nome || 'Usuario nao identificado';
  const emailUsuario = item.usuario?.email || item.usuarioId;
  const usouMemoria = Boolean(item.traceBDI?.resumo?.usouMemoria);
  const ferramentaEscolhida = item.traceBDI?.resumo?.ferramentaEscolhida || 'nenhuma';
  const totalEtapas = item.traceBDI?.resumo?.totalEtapas || item.traceBDI?.etapas?.length || 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.statusLine}>
          <View style={[styles.statusDot, item.sucesso ? styles.successDot : styles.errorDot]} />
          <Text style={styles.actionTitle}>{nomeDaAcao(item.acao)}</Text>
        </View>

        <Text style={styles.dateText}>{formatarData(item.data)}</Text>
      </View>

      <View style={styles.userBox}>
        <Ionicons name="person-circle-outline" size={20} color="#003366" />
        <View style={styles.userTextGroup}>
          <Text style={styles.userName}>{nomeUsuario}</Text>
          <Text style={styles.userEmail}>{emailUsuario}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Comando recebido</Text>
        <Text style={styles.commandText}>"{item.texto}"</Text>
      </View>

      <View style={styles.decisionGrid}>
        <View style={styles.decisionItem}>
          <Text style={styles.sectionLabel}>LLM</Text>
          <Text style={styles.valueText}>Origem: {nomeDaOrigem(item.origemInterpretacao)}</Text>
          <Text style={styles.valueText}>Proposta: {nomeDaAcao(item.acao)}</Text>
        </View>

        <View style={styles.decisionItem}>
          <Text style={styles.sectionLabel}>BDI</Text>
          <Text style={styles.valueText}>
            {item.precisaConfirmacao ? 'Solicitou confirmacao' : item.sucesso ? 'Executou acao' : 'Pediu ajuste'}
          </Text>
          <Text style={styles.valueText}>{usouMemoria ? 'Usou memoria anterior' : 'Sem memoria pendente'}</Text>
        </View>
      </View>

      <View style={styles.flowSummary}>
        <View style={styles.flowPill}>
          <Ionicons name="sparkles-outline" size={15} color="#003366" />
          <Text style={styles.flowText}>{nomeDaAcao(item.acao)}</Text>
        </View>

        <View style={styles.flowPill}>
          <Ionicons name="construct-outline" size={15} color="#003366" />
          <Text style={styles.flowText}>{ferramentaEscolhida}</Text>
        </View>

        <View style={styles.flowPill}>
          <Ionicons name="git-branch-outline" size={15} color="#003366" />
          <Text style={styles.flowText}>{totalEtapas} etapas</Text>
        </View>
      </View>

      {usouMemoria && (
        <View style={styles.memoryBox}>
          <Ionicons name="time-outline" size={18} color="#7C2D12" />
          <Text style={styles.memoryText}>
            Este comando usou uma pendencia anterior como contexto. Veja a etapa "Consulta de memoria" no ciclo abaixo.
          </Text>
        </View>
      )}

      <View style={styles.paramsPreview}>
        <Text style={styles.sectionLabel}>Parametros principais</Text>
        <Text style={styles.paramsText}>{parametros}</Text>
      </View>

      <TraceTimeline item={item} />

      <View style={styles.resultBox}>
        <Text style={styles.sectionLabel}>Resultado</Text>
        <Text style={styles.resultText}>{item.mensagem}</Text>
      </View>
    </View>
  );
}

export default function Agente() {
  const { emailDoUsuario, usuarioID } = useLogadoContext();
  const [historico, setHistorico] = useState<HistoricoAgenteItem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const carregarHistorico = useCallback(async () => {
    if (!usuarioID) return;

    setCarregando(true);
    setErro('');

    try {
      const isAdmin = emailDoUsuario?.trim().toLowerCase() === 'admin@clp.com';
      const resposta = await buscarHistoricoAgente(usuarioID, isAdmin);
      setHistorico(resposta);
    } catch (error: any) {
      setErro(
        error.response?.data?.mensagem ||
          error.message ||
          'Nao consegui carregar o historico do agente.'
      );
    } finally {
      setCarregando(false);
    }
  }, [emailDoUsuario, usuarioID]);

  const atualizar = useCallback(async () => {
    setRefreshing(true);
    await carregarHistorico();
    setRefreshing(false);
  }, [carregarHistorico]);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  return (
    <PageStructure
      title="Agente"
      icon="hardware-chip"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={atualizar} />}
    >
      <View style={styles.container}>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Tomada de decisao</Text>
          <Text style={styles.summaryText}>
            Esta area mostra quem enviou cada comando, como o assistente interpretou a intencao,
            qual acao escolheu e qual resultado foi registrado.
          </Text>

          <TouchableOpacity style={styles.refreshButton} onPress={carregarHistorico}>
            <Ionicons name="refresh" size={18} color="white" />
            <Text style={styles.refreshButtonText}>Atualizar</Text>
          </TouchableOpacity>
        </View>

        {carregando && !refreshing && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#003366" />
            <Text style={styles.loadingText}>Carregando historico...</Text>
          </View>
        )}

        {!!erro && <Text style={styles.errorText}>{erro}</Text>}

        {!carregando && !erro && historico.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="git-branch-outline" size={32} color="#64748B" />
            <Text style={styles.emptyTitle}>Nenhuma decisao registrada ainda.</Text>
            <Text style={styles.emptyText}>
              Execute um comando pelo assistente de voz para visualizar o fluxo aqui.
            </Text>
          </View>
        )}

        {historico.map((item) => (
          <HistoricoCard key={item._id} item={item} />
        ))}
      </View>
    </PageStructure>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  summary: {
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  summaryText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#003366',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingBox: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 12,
  },
  emptyBox: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
  },
  emptyTitle: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: 'white',
    padding: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  statusLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  successDot: {
    backgroundColor: '#15803D',
  },
  errorDot: {
    backgroundColor: '#B91C1C',
  },
  actionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    color: '#64748B',
    fontSize: 12,
  },
  section: {
    marginBottom: 12,
  },
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    marginBottom: 12,
  },
  userTextGroup: {
    flex: 1,
  },
  userName: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
  },
  userEmail: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  commandText: {
    color: '#1E293B',
    fontSize: 14,
    lineHeight: 20,
  },
  decisionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  decisionItem: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
  },
  valueText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  flowSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  flowPill: {
    minHeight: 32,
    borderRadius: 8,
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#CFE0F5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  flowText: {
    color: '#1E3A5F',
    fontSize: 12,
    fontWeight: '700',
  },
  paramsPreview: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 12,
  },
  paramsText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  memoryBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 10,
    marginBottom: 12,
  },
  memoryText: {
    flex: 1,
    color: '#7C2D12',
    fontSize: 13,
    lineHeight: 18,
  },
  traceBox: {
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
  },
  traceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  traceCount: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  traceStep: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
  },
  traceMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#003366',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  traceNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  traceContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  traceStepHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  traceTitleGroup: {
    flex: 1,
  },
  traceTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  traceSummary: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  traceDescription: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  traceDetailsBox: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginTop: 8,
  },
  traceDetails: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  resultBox: {
    borderRadius: 8,
    backgroundColor: '#EEF6FF',
    padding: 10,
  },
  resultText: {
    color: '#1E3A5F',
    fontSize: 14,
    lineHeight: 20,
  },
});
