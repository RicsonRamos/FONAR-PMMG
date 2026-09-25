import React from 'react';
import { CheckCircle2, Download, Copy, RefreshCw, FileText, Shield, ExternalLink, HardDrive, Mail } from 'lucide-react';
import { BackendResponse, EvidenceTransmissionPackage } from '../types/evidence';

interface SubmissionStatusProps {
  response: BackendResponse;
  pkg: EvidenceTransmissionPackage | null;
  onReset: () => void;
}

export const SubmissionStatus: React.FC<SubmissionStatusProps> = ({ response, pkg, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  const copyProtocol = () => {
    navigator.clipboard.writeText(response.protocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string | Uint8Array, mimeType: string) => {
    const blob =
      content instanceof Uint8Array
        ? new Blob([content as unknown as BlobPart], { type: mimeType })
        : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (!pkg) return;
    const binary = atob(pkg.pdf_base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    downloadFile(pkg.pdf_filename, bytes, 'application/pdf');
  };

  const handleDownloadJson = () => {
    if (!pkg) return;
    downloadFile(pkg.json_filename, pkg.json_content, 'application/json');
  };

  const handleDownloadManifest = () => {
    if (!pkg) return;
    downloadFile(pkg.manifest_filename, pkg.manifest_content, 'application/json');
  };

  return (
    <div className="max-w-2xl mx-auto my-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Top Banner */}
      <div className="bg-[#373435] text-white p-6 text-center border-b-4 border-[#A08F63] relative">
        <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold font-teko tracking-wide uppercase">
          Formulário Enviado com Sucesso
        </h2>
        <p className="text-xs text-gray-300">
          O registro técnico foi transmitido e encaminhado para arquivamento.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Identificadores Principais */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Protocolo de Submissão
              </span>
              <span className="text-xl font-mono font-bold text-[#AB2328]">
                {response.protocol}
              </span>
            </div>
            <button
              onClick={copyProtocol}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copiado!' : 'Copiar Protocolo'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block font-medium">Evidence ID (Técnico):</span>
              <span className="font-mono text-gray-800 break-all">{response.evidence_id}</span>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">Data/Hora (UTC):</span>
              <span className="font-mono text-gray-800">{response.timestamp_utc}</span>
            </div>
          </div>
        </div>

        {/* Status dos Processos Secundários (Drive e Gmail) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-2.5">
            <HardDrive className={`w-5 h-5 flex-shrink-0 mt-0.5 ${response.drive_archived ? 'text-emerald-600' : 'text-amber-500'}`} />
            <div className="text-xs">
              <span className="font-bold text-gray-900 block">Google Drive</span>
              <span className="text-gray-600">
                {response.drive_archived ? 'Arquivado na pasta de Auditoria' : 'Pendente de sincronização'}
              </span>
              {response.drive_folder_url && (
                <a
                  href={response.drive_folder_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#A08F63] font-semibold hover:underline mt-1"
                >
                  Abrir Pasta <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-2.5">
            <Mail className={`w-5 h-5 flex-shrink-0 mt-0.5 ${response.email_sent ? 'text-emerald-600' : 'text-gray-400'}`} />
            <div className="text-xs">
              <span className="font-bold text-gray-900 block">Notificação Gmail</span>
              <span className="text-gray-600">
                {response.email_sent ? 'E-mail corporativo despachado' : 'Processo secundário dispensado'}
              </span>
            </div>
          </div>
        </div>

        {/* Download dos Arquivos do Pacote de Evidência */}
        {pkg && (
          <div className="border border-gray-200 rounded-lg p-4 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#A08F63]" />
              Baixar Cópia Local do Pacote de Evidência
            </h4>
            <p className="text-xs text-gray-600">
              O pacote abaixo contém os mesmos arquivos exatos que foram transmitidos e arquivados no Google Drive.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded text-xs font-semibold shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5 text-[#AB2328]" />
                <span>PDF ({pkg.pdf_filename})</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded text-xs font-semibold shadow-sm transition"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>JSON ({pkg.json_filename})</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadManifest}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded text-xs font-semibold shadow-sm transition"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>MANIFEST.json</span>
              </button>
            </div>
          </div>
        )}

        {/* Informação sobre Higiene e Descarte da Memória */}
        <div className="bg-emerald-50 text-emerald-900 p-3 rounded-lg border border-emerald-200 text-xs">
          <p className="font-semibold mb-0.5">Segurança dos Dados Pessoais:</p>
          <p className="text-emerald-800">
            As estruturas JavaScript que continham as respostas temporárias em memória foram descartadas e higienizadas.
            Nenhum dado pessoal permaneceu salvo no navegador.
          </p>
        </div>

        {/* Botão Novo Preenchimento */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#373435] hover:bg-[#201f20] text-white text-sm font-bold rounded-lg shadow transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Iniciar Novo Preenchimento</span>
          </button>
        </div>
      </div>
    </div>
  );
};
