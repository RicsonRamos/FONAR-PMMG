import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Shield,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  UserX,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';
import { FORM_SECTIONS, ALL_FORM_FIELDS } from './config/formSchema';
import { SYSTEM_METADATA } from './config/version';
import { Header } from './components/Header';
import { NoticesBanner } from './components/NoticesBanner';
import { FormSectionComponent } from './components/FormSection';
import { FormField } from './components/FormField';
import { DeclarationBox } from './components/DeclarationBox';
import { SubmissionStatus } from './components/SubmissionStatus';
import { VerifierModal } from './components/VerifierModal';
import { FormValues, FormQuestion } from './types/form';
import { AuditEvent, CanonicalSubmissionJson } from './types/snapshot';
import { BackendResponse, EvidenceTransmissionPackage } from './types/evidence';
import { canonicalizeJson } from './services/canonicalizer';
import {
  createAuditEvent,
  generateEvidenceId,
  generateProtocol,
  sha256
} from './services/crypto';
import { buildSubmissionSnapshot } from './services/snapshot';
import { generateSubmissionPdf } from './services/pdfGenerator';
import { buildManifest } from './services/manifest';
import { transmitEvidencePackage } from './services/api';
import { fetchClientNetworkInfo, ClientNetworkInfo } from './services/deviceInfo';

// Configuração estruturada dos 7 Passos / Telas (Mobile-First)
interface StepConfig {
  index: number;
  id: string;
  label: string;
  shortLabel: string;
  badge?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'section_victim' | 'section_author' | 'fonar_slice' | 'declaration';
  fieldIds?: string[];
}

const FORM_STEPS: StepConfig[] = [
  {
    index: 0,
    id: 'victim',
    label: '1. Vítima e Atendimento',
    shortLabel: 'Vítima',
    description: 'Atendimento, qualificação e endereço',
    icon: User,
    type: 'section_victim'
  },
  {
    index: 1,
    id: 'author',
    label: '2. Dados do(a) Agressor(a)',
    shortLabel: 'Agressor(a)',
    description: 'Qualificação do autor (opcional)',
    icon: UserX,
    type: 'section_author'
  },
  {
    index: 2,
    id: 'fonar_1',
    label: '3. Avaliação de Risco FONAR (Parte 1/4)',
    shortLabel: 'Risco 1/4',
    badge: 'Ameaças e Agressões',
    description: 'Ameaças e agressões físicas',
    icon: FileSpreadsheet,
    type: 'fonar_slice',
    fieldIds: ['field_36', 'field_37', 'field_38', 'field_39', 'field_40', 'field_41']
  },
  {
    index: 3,
    id: 'fonar_2',
    label: '4. Avaliação de Risco FONAR (Parte 2/4)',
    shortLabel: 'Risco 2/4',
    badge: 'Comportamento e Armas',
    description: 'Ciúmes, perseguição e histórico de armas',
    icon: FileSpreadsheet,
    type: 'fonar_slice',
    fieldIds: ['field_42', 'field_43', 'field_44', 'field_45', 'field_46', 'field_47', 'field_48', 'field_49', 'field_50']
  },
  {
    index: 4,
    id: 'fonar_3',
    label: '5. Avaliação de Risco FONAR (Parte 3/4)',
    shortLabel: 'Risco 3/4',
    badge: 'Família e Filhos',
    description: 'Filhos e relações familiares',
    icon: FileSpreadsheet,
    type: 'fonar_slice',
    fieldIds: ['field_51', 'field_52', 'field_53', 'field_54', 'field_55', 'field_56', 'field_57', 'field_58']
  },
  {
    index: 5,
    id: 'fonar_4',
    label: '6. Avaliação de Risco FONAR (Parte 4/4)',
    shortLabel: 'Risco 4/4',
    badge: 'Vulnerabilidades e Moradia',
    description: 'Situação de moradia e abrigamento',
    icon: FileSpreadsheet,
    type: 'fonar_slice',
    fieldIds: ['field_59', 'field_60', 'field_61', 'field_62', 'field_63', 'field_64', 'field_65', 'field_66', 'field_67', 'field_68', 'field_69']
  },
  {
    index: 6,
    id: 'declaration',
    label: '7. Declaração e Envio',
    shortLabel: 'Declaração',
    description: 'Fidedignidade e finalização',
    icon: FileCheck,
    type: 'declaration'
  }
];

export const App: React.FC = () => {
  // Estado volátil em RAM — ZERO persistência em disco/cookies/storage
  // Padrão de Data (hoje) e Horário (atual)
  const [formValues, setFormValues] = useState<FormValues>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayDate = `${year}-${month}-${day}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const nowTime = `${hours}:${minutes}`;

    return {
      field_0: todayDate,
      field_1: nowTime,
      field_36: 'Vítima respondendo por conta própria (sem auxílio)'
    };
  });

  // Controle de Etapas / Telas
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [maxStepVisited, setMaxStepVisited] = useState<number>(0);

  const [declarationConfirmed, setDeclarationConfirmed] = useState<boolean>(false);
  const [declarationConfirmedAt, setDeclarationConfirmedAt] = useState<string>('');

  // Trilha de Auditoria em memória
  const [sessionId] = useState<string>(() => {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      return `sess-${globalThis.crypto.randomUUID()}`;
    }
    return `sess-${Date.now()}`;
  });
  const [protocol] = useState<string>(() => generateProtocol());
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  // Estados de Interface e Envio
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [backendResponse, setBackendResponse] = useState<BackendResponse | null>(null);
  const [transmissionPackage, setTransmissionPackage] = useState<EvidenceTransmissionPackage | null>(null);
  const [showVerifier, setShowVerifier] = useState<boolean>(false);
  const [clientNetworkInfo, setClientNetworkInfo] = useState<ClientNetworkInfo | null>(null);

  const formStartedRef = useRef(false);

  // Consulta antecipada e não bloqueante de IP e dados de rede
  useEffect(() => {
    fetchClientNetworkInfo()
      .then(info => setClientNetworkInfo(info))
      .catch(() => {});
  }, []);

  // Registro de Evento Inicial na Trilha de Auditoria (FORM_OPENED)
  useEffect(() => {
    async function initAudit() {
      const openedEvent = await createAuditEvent(
        'FORM_OPENED',
        protocol,
        sessionId,
        'GENESIS',
        { userAgent: navigator.userAgent }
      );
      const noticeEvent = await createAuditEvent(
        'NOTICE_DISPLAYED',
        protocol,
        sessionId,
        openedEvent.event_hash,
        { noticesVersion: '1.1.0' }
      );
      setAuditEvents([openedEvent, noticeEvent]);
    }
    initAudit();
  }, [protocol, sessionId]);

  // Alerta ao tentar sair da página com dados preenchidos não enviados
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasData = Object.keys(formValues).length > 3 && !backendResponse;
      if (hasData) {
        e.preventDefault();
        e.returnValue = 'Existem respostas não enviadas neste formulário seguro. Deseja realmente sair?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formValues, backendResponse]);

  // Atualização de campos e rastreio do início do preenchimento
  const handleFieldChange = async (fieldId: string, value: string | string[]) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));

    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }

    if (!formStartedRef.current) {
      formStartedRef.current = true;
      const lastEvent = auditEvents[auditEvents.length - 1];
      const prevHash = lastEvent ? lastEvent.event_hash : 'GENESIS';
      const startEvent = await createAuditEvent('FORM_STARTED', protocol, sessionId, prevHash, { firstField: fieldId });
      setAuditEvents(prev => [...prev, startEvent]);
    }
  };

  // Preenchimento automático de endereço disparado por busca de CEP
  const handleAddressAutofill = (address: { street: string; neighborhood: string; city: string; state: string }) => {
    setFormValues(prev => ({
      ...prev,
      field_victim_street: address.street || prev.field_victim_street || '',
      field_victim_neighborhood: address.neighborhood || prev.field_victim_neighborhood || '',
      field_victim_city: address.city || prev.field_victim_city || '',
      field_victim_state: address.state || prev.field_victim_state || ''
    }));
  };

  // Confirmação da declaração final
  const handleDeclarationToggle = async (checked: boolean) => {
    setDeclarationConfirmed(checked);
    if (checked) {
      const nowUtc = new Date().toISOString();
      setDeclarationConfirmedAt(nowUtc);
      const lastEvent = auditEvents[auditEvents.length - 1];
      const prevHash = lastEvent ? lastEvent.event_hash : 'GENESIS';
      const declEvent = await createAuditEvent('TERMS_ACCEPTED', protocol, sessionId, prevHash, { confirmedAt: nowUtc });
      setAuditEvents(prev => [...prev, declEvent]);
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next['declaration'];
        return next;
      });
    } else {
      setDeclarationConfirmedAt('');
    }
  };

  // Obter perguntas ativas do passo atual
  const getCurrentStepFields = (stepCfg: StepConfig): FormQuestion[] => {
    if (stepCfg.type === 'section_victim') {
      return FORM_SECTIONS[0].fields;
    }
    if (stepCfg.type === 'section_author') {
      return FORM_SECTIONS[1].fields;
    }
    if (stepCfg.type === 'fonar_slice' && stepCfg.fieldIds) {
      const riskSection = FORM_SECTIONS[2];
      return riskSection.fields.filter(f => stepCfg.fieldIds?.includes(f.id));
    }
    return [];
  };

  // Validação estrita por tela (evitar erro de falta de dados)
  const validateStep = (stepIdx: number): boolean => {
    const errors: Record<string, string> = {};
    const stepCfg = FORM_STEPS[stepIdx];

    if (stepCfg.type === 'section_victim') {
      // Tela 1: Validar campos obrigatórios da vítima
      for (const field of FORM_SECTIONS[0].fields) {
        if (field.required) {
          const val = formValues[field.id];
          if (!val || (Array.isArray(val) && val.length === 0) || (typeof val === 'string' && val.trim() === '')) {
            errors[field.id] = `O campo "${field.label}" é obrigatório.`;
          }
        }
      }
      if (!formValues['field_4'] || (typeof formValues['field_4'] === 'string' && formValues['field_4'].trim() === '')) {
        errors['field_4'] = 'Por favor, informe seu nome completo antes de avançar.';
      }
    } else if (stepCfg.type === 'section_author') {
      // Tela 2: "Nao deve ter itens obrigatórios nessa aba"
      // Nenhum campo é obrigatório no autor.
    } else if (stepCfg.type === 'fonar_slice') {
      // Telas 3, 4, 5, 6: "todas as perguntas devem ser obrigatoriamente respondidads"
      const fields = getCurrentStepFields(stepCfg);
      for (const field of fields) {
        if (field.required) {
          const val = formValues[field.id];
          if (
            val === undefined ||
            val === null ||
            (Array.isArray(val) && val.length === 0) ||
            (typeof val === 'string' && val.trim() === '')
          ) {
            errors[field.id] = 'Esta pergunta é de resposta obrigatória para a avaliação de risco.';
          }
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Avançar tela com validação
  const handleNextStep = () => {
    setSubmitError(null);
    if (!validateStep(currentStep)) {
      setSubmitError('Por favor, responda a todas as perguntas obrigatórias em destaque antes de avançar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setMaxStepVisited(prev => Math.max(prev, nextStep));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Voltar para a tela anterior
  const handlePrevStep = () => {
    setSubmitError(null);
    setCurrentStep(prev => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pular diretamente para uma tela permitida
  const handleJumpToStep = (targetStep: number) => {
    if (targetStep < currentStep) {
      setSubmitError(null);
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetStep <= maxStepVisited) {
      if (validateStep(currentStep)) {
        setSubmitError(null);
        setCurrentStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Validação geral do formulário completo antes do envio
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Validar declaração obrigatória
    if (!declarationConfirmed) {
      errors['declaration'] = 'A confirmação expressa da declaração sob as penas do art. 299 do CPB é obrigatória para concluir o envio.';
    }

    // 2. Validar campos configurados como obrigatórios
    for (const field of ALL_FORM_FIELDS) {
      if (field.required) {
        const val = formValues[field.id];
        if (
          val === undefined ||
          val === null ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === 'string' && val.trim() === '')
        ) {
          errors[field.id] = `O campo "${field.label}" é de resposta obrigatória.`;
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fluxo de Envio do Formulário (Evidência + Criptografia + Apps Script)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      setSubmitError('Por favor, confirme a declaração final e responda a todas as perguntas pendentes antes de enviar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const evidenceId = generateEvidenceId();

      // Evento FORM_SUBMITTED
      const lastEv = auditEvents[auditEvents.length - 1];
      const prevHash = lastEv ? lastEv.event_hash : 'GENESIS';
      const submittedEvent = await createAuditEvent('FORM_SUBMITTED', protocol, sessionId, prevHash, { evidenceId });
      const currentEvents = [...auditEvents, submittedEvent];

      // Obter informações do cliente (rede, IP, localização e dispositivo)
      const netInfo = clientNetworkInfo || await fetchClientNetworkInfo();

      // Snapshot Imutável em RAM
      const snapshot = await buildSubmissionSnapshot({
        protocol,
        evidenceId,
        sessionId,
        formValues,
        declarationConfirmed: true,
        declarationConfirmedAtUtc: declarationConfirmedAt,
        auditEvents: currentEvents,
        clientNetworkInfo: netInfo
      });

      // SHA-256 do Snapshot
      const snapshotCanonical = canonicalizeJson(snapshot);
      const snapshotSha256 = await sha256(snapshotCanonical);

      // Evento SNAPSHOT_CREATED
      const snapEvent = await createAuditEvent(
        'SNAPSHOT_CREATED',
        protocol,
        sessionId,
        submittedEvent.event_hash,
        { snapshotSha256 }
      );
      currentEvents.push(snapEvent);

      // Gerar PDF determinístico
      const pdfBytes = await generateSubmissionPdf(snapshot, {
        snapshot_sha256: snapshotSha256,
        canonical_json_sha256: snapshotSha256,
        audit_chain_hash: snapEvent.event_hash
      });
      const pdfSha256 = await sha256(pdfBytes);
      const pdfFilename = `${protocol}.pdf`;

      // Gerar JSON Canônico e calcular SHA-256
      const jsonFilename = `${protocol}.json`;
      const canonicalJsonObj: CanonicalSubmissionJson = {
        ...snapshot,
        schema_version: '1.0.0',
        hashes: {
          snapshot_sha256: snapshotSha256,
          canonical_json_sha256: '',
          pdf_sha256: pdfSha256,
          audit_trail_sha256: snapEvent.event_hash
        }
      };
      const preJsonCanonical = canonicalizeJson(canonicalJsonObj);
      const finalJsonSha256 = await sha256(preJsonCanonical);
      canonicalJsonObj.hashes.canonical_json_sha256 = finalJsonSha256;
      const finalJsonCanonical = canonicalizeJson(canonicalJsonObj);

      // Gerar MANIFEST e calcular SHA-256
      const manifestFilename = 'MANIFEST.json';
      const { manifestCanonicalString, manifestSha256 } = await buildManifest({
        protocol,
        evidenceId,
        systemVersion: SYSTEM_METADATA.system_version,
        pdfFilename,
        pdfBytes,
        pdfSha256,
        jsonFilename,
        jsonContent: finalJsonCanonical,
        jsonSha256: finalJsonSha256
      });

      // Converte bytes do PDF para base64
      let pdfBinaryString = '';
      for (let i = 0; i < pdfBytes.length; i++) {
        pdfBinaryString += String.fromCharCode(pdfBytes[i]);
      }
      const pdfBase64 = btoa(pdfBinaryString);

      // Monta Pacote de Transmissão
      const pkg: EvidenceTransmissionPackage = {
        protocol,
        evidence_id: evidenceId,
        session_id: sessionId,
        generated_at_utc: new Date().toISOString(),
        json_filename: jsonFilename,
        json_content: finalJsonCanonical,
        json_sha256: finalJsonSha256,
        pdf_filename: pdfFilename,
        pdf_base64: pdfBase64,
        pdf_sha256: pdfSha256,
        manifest_filename: manifestFilename,
        manifest_content: manifestCanonicalString,
        manifest_sha256: manifestSha256,
        snapshot_sha256: snapshotSha256
      };

      // Transmissão ao Google Apps Script
      const response = await transmitEvidencePackage(pkg);

      // Sucesso confirmado
      setBackendResponse(response);
      setTransmissionPackage(pkg);

      // Limpar memória
      setFormValues({});
      setDeclarationConfirmed(false);
      setDeclarationConfirmedAt('');
    } catch (err: unknown) {
      console.error('[SUBMISSION ERROR]:', err);
      const msg = err instanceof Error ? err.message : 'Não foi possível concluir o envio. Tente novamente.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormValues({});
    setDeclarationConfirmed(false);
    setDeclarationConfirmedAt('');
    setBackendResponse(null);
    setTransmissionPackage(null);
    setSubmitError(null);
    setValidationErrors({});
    setCurrentStep(0);
    setMaxStepVisited(0);
    window.location.reload();
  };

  const currentStepConfig = FORM_STEPS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / FORM_STEPS.length) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F7] text-[#1F2421]">
      <Header onOpenVerifier={() => setShowVerifier(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 py-4 sm:px-6 sm:py-6">
        {backendResponse ? (
          <SubmissionStatus
            response={backendResponse}
            pkg={transmissionPackage}
            onReset={handleReset}
          />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Banner de Acolhimento e Privacidade (apenas na tela inicial para poupar espaço em telas menores) */}
            {currentStep === 0 && <NoticesBanner />}

            {/* PAINEL DE NAVEGAÇÃO / STEPPER TOTALMENTE RESPONSIVO */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-5">
              {/* Barra de Progresso Superior com Percentual */}
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                  <span className="uppercase tracking-wider text-[#AB2328] font-bold">
                    Etapa {currentStep + 1} de {FORM_STEPS.length}
                  </span>
                  <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                    {progressPercent}% Concluído
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#AB2328] h-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Título da Tela Ativa (Destaque Principal) */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-100 mb-3">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    {currentStepConfig.label}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {currentStepConfig.description}
                  </p>
                </div>
                {currentStepConfig.badge && (
                  <span className="text-[11px] font-semibold bg-[#A08F63]/20 text-[#847550] px-2.5 py-1 rounded-full border border-[#A08F63]/30">
                    {currentStepConfig.badge}
                  </span>
                )}
              </div>

              {/* Mini-Stepper de Pontos para Mobile / Badges para Desktop */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                {FORM_STEPS.map((step) => {
                  const isCurrent = step.index === currentStep;
                  const isCompleted = step.index < currentStep;
                  const isAccessible = step.index <= maxStepVisited;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handleJumpToStep(step.index)}
                      disabled={!isAccessible}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
                        isCurrent
                          ? 'bg-[#AB2328] text-white shadow-sm'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer'
                          : isAccessible
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                          : 'bg-gray-50 text-gray-400 opacity-60 cursor-not-allowed'
                      }`}
                      title={step.label}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-white text-[#AB2328]'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3" /> : step.index + 1}
                      </div>
                      <span className="hidden md:inline">{step.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mensagem de Erro de Validação */}
            {submitError && (
              <div className="mb-5 p-4 rounded-lg bg-red-50 border-l-4 border-[#AB2328] flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-[#AB2328] flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-red-900">
                  <p className="font-bold mb-0.5">Atenção aos campos pendentes</p>
                  <p>{submitError}</p>
                </div>
              </div>
            )}

            {/* CONTEÚDO DA TELA ATIVA */}
            {/* TELA 1: DADOS DA VÍTIMA E ATENDIMENTO */}
            {currentStep === 0 && (
              <FormSectionComponent
                section={FORM_SECTIONS[0]}
                formValues={formValues}
                onChangeField={handleFieldChange}
                onAddressAutofill={handleAddressAutofill}
                errors={validationErrors}
                defaultOpen={true}
              />
            )}

            {/* TELA 2: DADOS DO(A) AGRESSOR(A) (SEM ITENS OBRIGATÓRIOS) */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="bg-amber-50/80 p-3 sm:p-4 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
                  <strong>Aviso:</strong> O preenchimento das informações do autor nesta tela é opcional. Preencha apenas o que souber ou puder informar com segurança.
                </div>
                <FormSectionComponent
                  section={FORM_SECTIONS[1]}
                  formValues={formValues}
                  onChangeField={handleFieldChange}
                  errors={validationErrors}
                  defaultOpen={true}
                />
              </div>
            )}

            {/* TELAS 3, 4, 5, 6: SLICES ESPECÍFICOS DO FONAR (TODAS AS PERGUNTAS OBRIGATÓRIAS) */}
            {(currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep === 5) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-5 py-4 bg-[#373435] text-white flex items-center justify-between border-l-4 border-[#A08F63]">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-5 h-5 text-[#A08F63] flex-shrink-0" />
                    <div>
                      <h2 className="font-bold text-sm sm:text-base tracking-wide uppercase">
                        {currentStepConfig.label}
                      </h2>
                      <p className="text-xs text-gray-300">
                        {currentStepConfig.description}
                      </p>
                    </div>
                  </div>
                  {currentStepConfig.badge && (
                    <span className="text-[11px] font-semibold bg-[#A08F63]/30 text-[#A08F63] px-2.5 py-1 rounded border border-[#A08F63]/40 hidden sm:block">
                      {currentStepConfig.badge}
                    </span>
                  )}
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  <div className="bg-red-50/70 p-3 rounded-lg border border-red-200/80 text-xs text-red-900 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#AB2328] flex-shrink-0" />
                    <span>Todas as perguntas desta etapa são de resposta obrigatória para a correta avaliação de risco.</span>
                  </div>

                  <div className="divide-y divide-gray-100 space-y-4">
                    {getCurrentStepFields(currentStepConfig).map((field) => (
                      <div key={field.id} className="pt-3 first:pt-0">
                        <FormField
                          field={field}
                          value={formValues[field.id] || (field.type === 'checkbox' ? [] : '')}
                          onChange={val => handleFieldChange(field.id, val)}
                          error={validationErrors[field.id]}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TELA 7: DECLARAÇÃO DE FIDEDIGNIDADE E ENVIO FINAL */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <DeclarationBox
                  confirmed={declarationConfirmed}
                  onToggle={handleDeclarationToggle}
                  error={validationErrors['declaration']}
                  victimName={typeof formValues['field_4'] === 'string' ? formValues['field_4'] : ''}
                  dateStr={typeof formValues['field_0'] === 'string' ? formValues['field_0'] : ''}
                  timeStr={typeof formValues['field_1'] === 'string' ? formValues['field_1'] : ''}
                  formValues={formValues}
                  onEditStep={idx => setCurrentStep(idx)}
                />
              </div>
            )}

            {/* BARRA INFERIOR DE NAVEGAÇÃO ENTRE TELAS (MOBILE TOUCH-FRIENDLY) */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200 mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              {/* Botão Voltar */}
              <div className="w-full sm:w-auto">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-5 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar ({FORM_STEPS[currentStep - 1].shortLabel})</span>
                  </button>
                ) : (
                  <div className="text-xs text-gray-400 text-center sm:text-left py-1">
                    Preencha os dados e avance.
                  </div>
                )}
              </div>

              {/* Botão Avançar ou Enviar */}
              <div className="w-full sm:w-auto">
                {currentStep < FORM_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#AB2328] hover:bg-[#8E1C20] text-white font-bold text-sm uppercase tracking-wide shadow-md flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <span>Avançar para {FORM_STEPS[currentStep + 1].shortLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-lg font-bold text-sm tracking-wide uppercase transition shadow-md flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-[#AB2328] hover:bg-[#8E1C20] text-white active:scale-95'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>TRANSMITINDO EVIDÊNCIA...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>FINALIZAR E ENVIAR FORMULÁRIO</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Rodapé de Segurança da Sessão */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-500 text-center">
              <Shield className="w-3.5 h-3.5 text-[#A08F63] flex-shrink-0" />
              <span>
                Sessão em memória protegida com criptografia SHA-256. Nenhum dado fica salvo no seu aparelho.
              </span>
            </div>
          </form>
        )}
      </main>

      {/* Rodapé Institucional */}
      <footer className="bg-[#373435] text-white text-xs py-6 border-t border-gray-700 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <p className="font-semibold text-gray-300">
            {SYSTEM_METADATA.name} • {SYSTEM_METADATA.instructionRef}
          </p>
          <p className="text-gray-400 text-[11px]">
            Canal de acolhimento e coleta de dados de Primeira Resposta. Em perigo imediato, ligue 190 (Polícia Militar) ou 180 (Apoio à Mulher).
          </p>
          <p className="text-[10px] text-gray-500 font-mono">
            Zero Browser Persistence Mode • Totalmente responsivo para celulares e computadores
          </p>
        </div>
      </footer>

      {/* Modal do Verificador de Integridade */}
      <VerifierModal isOpen={showVerifier} onClose={() => setShowVerifier(false)} />
    </div>
  );
};

export default App;
