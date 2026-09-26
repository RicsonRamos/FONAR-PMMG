export interface LegalNoticeConfig {
  id: string;
  version: string;
  title: string;
  text: string;
  juridicalValidationRequired?: boolean;
  checkboxLabel?: string;
}

export const LEGAL_TEXTS = {
  auxiliaryDisclaimer: {
    id: 'AUXILIARY_TOOL_DISCLAIMER',
    version: '1.1.0',
    title: 'Aviso Importante à Cidadã — Formulário Seguro',
    text: 'Este formulário é um canal seguro para acolhimento e coleta preliminar das informações de violência doméstica. O preenchimento auxilia a Polícia Militar de Minas Gerais no registro oficial da ocorrência (REDS) e na imediata avaliação de risco para medidas protetivas e de segurança. Caso você esteja em situação de perigo imediato, ligue 190 (Polícia Militar).',
    juridicalValidationRequired: false
  },
  purposeNotice: {
    id: 'COLLECTION_PURPOSE_NOTICE',
    version: '1.1.0',
    title: 'Finalidade da Coleta',
    text: 'Registro antecipado e acolhedor de informações para atendimento e proteção à mulher vítima de violência doméstica, em conformidade com a Instrução de Serviço nº 01/2026 - 16º BPM e a Lei Maria da Penha (Lei nº 11.340/2006).',
    juridicalValidationRequired: false
  },
  privacyNotice: {
    id: 'PRIVACY_LGPD_NOTICE',
    version: '1.1.0',
    title: 'Privacidade e Proteção de Dados',
    text: 'Suas informações são confidenciais e protegidas pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Os dados digitados não são gravados no seu aparelho (sem cookies ou histórico local). Ao sair da página ou enviar, nada permanece salvo no seu celular ou computador.',
    juridicalValidationRequired: false
  },
  contactNotice: {
    id: 'CONTACT_CHANNEL_NOTICE',
    version: '1.1.0',
    title: 'Canais de Emergência e Atendimento',
    text: 'Emergência Policial: Ligue 190 • Central de Atendimento à Mulher: Ligue 180 • Disque Denúncia: Ligue 181.'
  },
  declaration: {
    id: 'FINAL_FIDELITY_DECLARATION',
    version: '1.1.0',
    title: 'Declaração de Fidedignidade das Informações',
    text: 'Prezado(a) cidadão(ã), omitir a verdade ou fazer declaração falsa em documento público ou particular é crime previsto no art. 299 do Código Penal Brasileiro (Lei nº 2.848/1940 - CPB), sob pena de reclusão de 1 a 5 anos e multa (se documento público) ou reclusão de 1 a 3 anos e multa (se documento particular). Ao prosseguir, declaro sob as penas da lei a veracidade de todas as informações prestadas.',
    checkboxLabel: 'Confirmo a veracidade de todas as informações prestadas e estou ciente da responsabilidade penal prevista no art. 299 do Código Penal Brasileiro (CPB).'
  }
} as const;

export function generateDeclarationText(params: {
  victimName?: string;
  dateStr?: string;
  timeStr?: string;
}): string {
  const now = new Date();
  const dateFormatted = params.dateStr
    ? params.dateStr.includes('-')
      ? params.dateStr.split('-').reverse().join('/')
      : params.dateStr
    : now.toLocaleDateString('pt-BR');
  const timeFormatted = params.timeStr || now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const displayName = params.victimName && params.victimName.trim()
    ? params.victimName.trim().toUpperCase()
    : 'NOME DA CIDADÃ / VÍTIMA';

  return `EU, ${displayName}, DECLARO QUE EM ${dateFormatted} ÀS ${timeFormatted}, PRESTEI AS INFORMAÇÕES REGISTRADAS NESTE FORMULÁRIO AUXILIAR DE PRIMEIRA RESPOSTA E AVALIAÇÃO DE RISCO (FONAR). CONFIRMO A VERACIDADE DAS INFORMAÇÕES PRESTADAS ACIMA E ESTOU CIENTE DE QUE OMITIR, EM DOCUMENTO PÚBLICO OU PARTICULAR, DECLARAÇÃO QUE DEVIA CONSTAR, OU NELE INSERIR OU FAZER DECLARAÇÃO FALSA OU DIVERSA DA QUE DEVIA SER ESCRITA, É CRIME PREVISTO NO ART. 299 DA LEI Nº 2.848/1940 (CÓDIGO PENAL BRASILEIRO - CPB), FICANDO O AUTOR SUJEITO À RECLUSÃO DE 1 A 5 ANOS E MULTA (SE O DOCUMENTO É PÚBLICO) E RECLUSÃO DE 1 A 3 ANOS E MULTA (SE O DOCUMENTO É PARTICULAR).`;
}

