import { ALL_FORM_FIELDS } from '../config/formSchema';
import { LEGAL_TEXTS } from '../config/legalTexts';
import { SYSTEM_METADATA } from '../config/version';
import { FormValues } from '../types/form';
import {
  AuditEvent,
  FrozenDeclaration,
  FrozenNotice,
  FrozenQuestion,
  SubmissionSnapshot,
  TechnicalMetadata
} from '../types/snapshot';
import { sha256 } from './crypto';
import { ClientNetworkInfo, detectDeviceSummary } from './deviceInfo';

export interface BuildSnapshotParams {
  protocol: string;
  evidenceId: string;
  sessionId: string;
  formValues: FormValues;
  declarationConfirmed: boolean;
  declarationConfirmedAtUtc: string;
  declarationText?: string;
  auditEvents: AuditEvent[];
  clientNetworkInfo?: ClientNetworkInfo;
}

/**
 * Monta o snapshot imutável em memória capturando exatamente o conteúdo apresentado.
 */
export async function buildSubmissionSnapshot(params: BuildSnapshotParams): Promise<SubmissionSnapshot> {
  const now = new Date();
  const submittedAtUtc = now.toISOString();
  
  // Format local timestamp: DD/MM/AAAA HH:MM:SS -03:00
  const submittedAtLocal = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'America/Sao_Paulo'
  }).format(now) + ' (Horário de Brasília)';

  // 1. Congelar avisos legais com hashes individuais
  const noticeDisclaimerHash = await sha256(LEGAL_TEXTS.auxiliaryDisclaimer.text);
  const noticePurposeHash = await sha256(LEGAL_TEXTS.purposeNotice.text);
  const noticePrivacyHash = await sha256(LEGAL_TEXTS.privacyNotice.text);

  const notices: FrozenNotice[] = [
    {
      id: LEGAL_TEXTS.auxiliaryDisclaimer.id,
      version: LEGAL_TEXTS.auxiliaryDisclaimer.version,
      text: LEGAL_TEXTS.auxiliaryDisclaimer.text,
      sha256: noticeDisclaimerHash
    },
    {
      id: LEGAL_TEXTS.purposeNotice.id,
      version: LEGAL_TEXTS.purposeNotice.version,
      text: LEGAL_TEXTS.purposeNotice.text,
      sha256: noticePurposeHash
    },
    {
      id: LEGAL_TEXTS.privacyNotice.id,
      version: LEGAL_TEXTS.privacyNotice.version,
      text: LEGAL_TEXTS.privacyNotice.text,
      sha256: noticePrivacyHash
    }
  ];

  // 2. Congelar declaração individualizada exatamente como apresentada e assinada
  const effectiveDeclarationText = params.declarationText || LEGAL_TEXTS.declaration.text;
  const declarationHash = await sha256(effectiveDeclarationText);
  const declaration: FrozenDeclaration = {
    version: LEGAL_TEXTS.declaration.version,
    text: effectiveDeclarationText,
    confirmed: params.declarationConfirmed,
    confirmed_at_utc: params.declarationConfirmedAtUtc,
    sha256: declarationHash
  };

  // 3. Informações técnicas estritamente justificadas (sem fingerprinting invasivo)
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'NodeJS/Test';
  const deviceSummary =
    params.clientNetworkInfo?.device || detectDeviceSummary(userAgent);
  const ipAddress =
    params.clientNetworkInfo?.ip || 'Não detectado / Rede local';
  const locationSummary =
    params.clientNetworkInfo?.location || (Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo');

  const technical: TechnicalMetadata = {
    user_agent: userAgent,
    language: typeof navigator !== 'undefined' ? navigator.language : 'pt-BR',
    screen_resolution:
      typeof window !== 'undefined' ? `${window.screen?.width || 0}x${window.screen?.height || 0}` : 'Unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
    timezone_offset_minutes: new Date().getTimezoneOffset(),
    device_summary: deviceSummary,
    ip_address: ipAddress,
    location_summary: locationSummary
  };

  // 4. Congelar perguntas, redações, opções e respostas
  const questions: FrozenQuestion[] = ALL_FORM_FIELDS.map(field => {
    const rawAnswer = params.formValues[field.id];
    let normalizedAnswer: string | string[] = '';
    if (Array.isArray(rawAnswer)) {
      normalizedAnswer = rawAnswer;
    } else if (typeof rawAnswer === 'string') {
      normalizedAnswer = rawAnswer.trim();
    }

    return {
      question_id: field.id,
      question_version: field.version,
      section_id: field.sectionId,
      text: field.label,
      type: field.type,
      options: field.options || [],
      answer: normalizedAnswer
    };
  });

  // 5. Finalizar audit trail
  const lastEvent = params.auditEvents[params.auditEvents.length - 1];
  const finalChainHash = lastEvent ? lastEvent.event_hash : 'GENESIS';

  return {
    evidence_id: params.evidenceId,
    protocol: params.protocol,
    session_id: params.sessionId,
    system: {
      name: SYSTEM_METADATA.name,
      version: SYSTEM_METADATA.system_version,
      build_id: SYSTEM_METADATA.build_id,
      build_timestamp: SYSTEM_METADATA.build_timestamp
    },
    form: {
      id: SYSTEM_METADATA.form_id,
      version: SYSTEM_METADATA.form_version,
      title: 'ATENDIMENTO 1ª RESPOSTA - FONAR'
    },
    timestamps: {
      submitted_at_utc: submittedAtUtc,
      submitted_at_local: submittedAtLocal
    },
    notices,
    declaration,
    technical,
    questions,
    audit_trail: {
      algorithm: 'SHA-256',
      events: params.auditEvents,
      final_chain_hash: finalChainHash
    }
  };
}
