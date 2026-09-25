import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { FORM_SECTIONS, ALL_FORM_FIELDS } from './config/formSchema';
import { SYSTEM_METADATA } from './config/version';
import { Header } from './components/Header';
import { NoticesBanner } from './components/NoticesBanner';
import { FormSectionComponent } from './components/FormSection';
import { DeclarationBox } from './components/DeclarationBox';
import { SubmissionStatus } from './components/SubmissionStatus';
import { VerifierModal } from './components/VerifierModal';
import { FormValues } from './types/form';
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

export const App: React.FC = () => {
  // Estado volátil em RAM — ZERO persistência em disco/cookies/storage
  const [formValues, setFormValues] = useState<FormValues>({});
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

  const formStartedRef = useRef(false);

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
        { noticesVersion: '1.0.0' }
      );
      setAuditEvents([openedEvent, noticeEvent]);
    }
    initAudit();
  }, [protocol, sessionId]);

  // Alerta ao tentar sair da página com dados preenchidos não enviados
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasData = Object.keys(formValues).length > 0 && !backendResponse;
      if (hasData) {
        e.preventDefault();
        e.returnValue = 'Existem dados não enviados neste formulário auxiliar. Deseja realmente sair?';
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

  // Validação dos dados
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Validar declaração obrigatória
    if (!declarationConfirmed) {
      errors['declaration'] = 'A confirmação da declaração é obrigatória para prosseguir com o envio.';
    }

    // 2. Validar campos configurados como obrigatórios
    for (const field of ALL_FORM_FIELDS) {
      if (field.required) {
        const val = formValues[field.id];
        if (!val || (Array.isArray(val) && val.length === 0) || (typeof val === 'string' && val.trim() === '')) {
          errors[field.id] = `O campo "${field.label}" é de preenchimento obrigatório.`;
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fluxo de Envio do Formulário (Item 11 da especificação)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Passo 1 e 2: Validação
    if (!validateForm()) {
      setSubmitError('Por favor, resolva os campos pendentes e confirme a declaração antes de enviar.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Passo 3 e 4: Identificadores e timestamps
      const evidenceId = generateEvidenceId();

      // Evento FORM_SUBMITTED
      const lastEv = auditEvents[auditEvents.length - 1];
      const prevHash = lastEv ? lastEv.event_hash : 'GENESIS';
      const submittedEvent = await createAuditEvent('FORM_SUBMITTED', protocol, sessionId, prevHash, { evidenceId });
      const currentEvents = [...auditEvents, submittedEvent];

      // Passo 5: Montar Snapshot Imutável em RAM
      const snapshot = await buildSubmissionSnapshot({
        protocol,
        evidenceId,
        sessionId,
        formValues,
        declarationConfirmed: true,
        declarationConfirmedAtUtc: declarationConfirmedAt,
        auditEvents: currentEvents
      });

      // Passo 6: SHA-256 do Snapshot
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

      // Passo 8: Gerar PDF determinístico
      // Nota: o PDF recebe os hashes de snapshot, canonical json e audit chain
      const pdfBytes = await generateSubmissionPdf(snapshot, {
        snapshot_sha256: snapshotSha256,
        canonical_json_sha256: snapshotSha256, // pre-json canonical
        audit_chain_hash: snapEvent.event_hash
      });
      const pdfSha256 = await sha256(pdfBytes);
      const pdfFilename = `${protocol}.pdf`;

      // Passo 7 e 9: Gerar JSON Canônico e calcular SHA-256
      const jsonFilename = `${protocol}.json`;
      const canonicalJsonObj: CanonicalSubmissionJson = {
        ...snapshot,
        schema_version: '1.0.0',
        hashes: {
          snapshot_sha256: snapshotSha256,
          canonical_json_sha256: '', // será atualizado após cálculo do próprio JSON
          pdf_sha256: pdfSha256,
          audit_trail_sha256: snapEvent.event_hash
        }
      };
      // Canonicaliza objeto inicial para calcular seu hash de integridade
      const preJsonCanonical = canonicalizeJson(canonicalJsonObj);
      const finalJsonSha256 = await sha256(preJsonCanonical);
      canonicalJsonObj.hashes.canonical_json_sha256 = finalJsonSha256;
      const finalJsonCanonical = canonicalizeJson(canonicalJsonObj);

      // Passo 11 e 12: Gerar MANIFEST e calcular SHA-256
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

      // Converte bytes do PDF para base64 para transporte JSON seguro
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

      // Passo 13 e 14: Enviar ao Google Apps Script e aguardar confirmação
      const response = await transmitEvidencePackage(pkg);

      // Passo 15: Sucesso confirmado pelo servidor
      setBackendResponse(response);
      setTransmissionPackage(pkg);

      // Passo 16 e 17: Limpar os dados sensíveis da memória e não manter cópia local
      setFormValues({});
      setDeclarationConfirmed(false);
      setDeclarationConfirmedAt('');
    } catch (err: unknown) {
      console.error('[SUBMISSION ERROR]:', err);
      const msg = err instanceof Error ? err.message : 'Não foi possível concluir o envio. Tente novamente.';
      setSubmitError(msg);
      // Os dados permanecem em memória no estado do componente para permitir nova tentativa sem perda
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
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F7] text-[#1F2421]">
      <Header onOpenVerifier={() => setShowVerifier(true)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6">
        {backendResponse ? (
          <SubmissionStatus
            response={backendResponse}
            pkg={transmissionPackage}
            onReset={handleReset}
          />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Banner de Avisos Legais e Privacidade */}
            <NoticesBanner />

            {/* Seções do Formulário */}
            {FORM_SECTIONS.map((section, idx) => (
              <FormSectionComponent
                key={section.id}
                section={section}
                formValues={formValues}
                onChangeField={handleFieldChange}
                errors={validationErrors}
                defaultOpen={idx === 0 || idx === 2}
              />
            ))}

            {/* Declaração de Fidedignidade Técnica */}
            <DeclarationBox
              confirmed={declarationConfirmed}
              onToggle={handleDeclarationToggle}
              error={validationErrors['declaration']}
            />

            {/* Mensagem de Erro Geral */}
            {submitError && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-[#AB2328] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#AB2328] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-900">
                  <p className="font-bold text-sm mb-0.5">Falha no Processamento</p>
                  <p>{submitError}</p>
                </div>
              </div>
            )}

            {/* Botão de Envio */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#A08F63] flex-shrink-0" />
                <span>
                  Ao clicar em <strong>Enviar Formulário</strong>, o pacote de evidência (PDF + JSON + MANIFEST)
                  será gerado, assinado com SHA-256 e transmitido diretamente ao Google Apps Script.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-lg font-bold text-sm tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0 ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-[#AB2328] hover:bg-[#8E1C20] text-white active:scale-[0.99]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ENVIANDO E CALCULANDO HASHES...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ENVIAR FORMULÁRIO</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Rodapé Institucional */}
      <footer className="bg-[#373435] text-white text-xs py-6 border-t border-gray-700 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-2">
          <p className="font-semibold text-gray-300">
            {SYSTEM_METADATA.name} • {SYSTEM_METADATA.instructionRef}
          </p>
          <p className="text-gray-400 text-[11px]">
            Ferramenta auxiliar para coleta de dados de Primeira Resposta. O registro oficial deve ser executado no sistema REDS.
          </p>
          <p className="text-[10px] text-gray-500 font-mono">
            Build: {SYSTEM_METADATA.build_id} • Versão: {SYSTEM_METADATA.system_version} • Zero Browser Persistence Mode
          </p>
        </div>
      </footer>

      {/* Modal do Verificador de Integridade */}
      <VerifierModal isOpen={showVerifier} onClose={() => setShowVerifier(false)} />
    </div>
  );
};
export default App;
