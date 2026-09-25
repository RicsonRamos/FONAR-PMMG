export interface LegalNoticeConfig {
  id: string;
  version: string;
  title: string;
  text: string;
  juridicalValidationRequired?: boolean;
}

export const LEGAL_TEXTS = {
  auxiliaryDisclaimer: {
    id: 'AUXILIARY_TOOL_DISCLAIMER',
    version: '1.0.0',
    title: 'Aviso Importante — Ferramenta Auxiliar',
    text: 'Este formulário é uma ferramenta auxiliar para coleta e organização preliminar das informações. A submissão deste formulário NÃO substitui o registro oficial no sistema institucional correspondente (REDS). O preenchimento oficial deverá ser realizado manualmente pelo responsável no sistema institucional.',
    juridicalValidationRequired: true
  },
  purposeNotice: {
    id: 'COLLECTION_PURPOSE_NOTICE',
    version: '1.0.0',
    title: 'Finalidade da Coleta',
    text: 'Recurso desenvolvido para apoio aos policiais militares e equipes de atendimento na coleta de dados para os casos em que a vítima de violência doméstica não acompanhar a ocorrência ou não estiver no local de registro inicial, em conformidade com a Instrução de Serviço nº 01/2026 - 16º BPM.',
    juridicalValidationRequired: true
  },
  privacyNotice: {
    id: 'PRIVACY_LGPD_NOTICE',
    version: '1.0.0',
    title: 'Privacidade e Proteção de Dados (LGPD)',
    text: 'As informações registradas são mantidas sob sigilo institucional e protegidas nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Os dados não são persistidos no navegador (sem uso de cookies, localStorage ou IndexedDB) e destinam-se exclusivamente à guarda do pacote de auditoria no Google Drive e comunicação interna via e-mail corporativo. [VALIDAR JURIDICAMENTE]',
    juridicalValidationRequired: true
  },
  contactNotice: {
    id: 'CONTACT_CHANNEL_NOTICE',
    version: '1.0.0',
    title: 'Canal de Contato Institucional',
    text: 'Em caso de dúvidas, orientações ou problemas operacionais, contatar a coordenação da 1ª Cia PM Ind PVD (RMBH) ou a Seção de Emprego Operacional (P3 / 16º BPM).'
  },
  declaration: {
    id: 'FINAL_FIDELITY_DECLARATION',
    version: '1.0.0',
    title: 'Declaração de Fidedignidade das Informações',
    text: 'Declaro, para os devidos fins de registro técnico e organização das informações, que os dados constantes neste formulário foram coletados com fidedignidade com base nas declarações apresentadas e nos elementos colhidos durante a Primeira Resposta. [VALIDAR JURIDICAMENTE]',
    checkboxLabel: 'Confirmo a declaração acima e atesto a veracidade técnica dos dados apresentados.'
  }
} as const;
