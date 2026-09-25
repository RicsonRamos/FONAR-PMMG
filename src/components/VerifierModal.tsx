import React, { useState } from 'react';
import { X, FileCheck } from 'lucide-react';
import { sha256 } from '../services/crypto';
import { ManifestDocument } from '../types/evidence';

interface VerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VerificationResult {
  filename: string;
  expectedSha256: string;
  actualSha256: string;
  matches: boolean;
  sizeBytes: number;
}

export const VerifierModal: React.FC<VerifierModalProps> = ({ isOpen, onClose }) => {
  const [targetFiles, setTargetFiles] = useState<File[]>([]);
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [manifestData, setManifestData] = useState<ManifestDocument | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleManifestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed: ManifestDocument = JSON.parse(text);
      if (!parsed.files || !parsed.algorithm) {
        throw new Error('Arquivo não possui a estrutura padrão de MANIFEST.json');
      }
      setManifestData(parsed);
      setStatusMessage(`Manifesto carregado. Protocolo: ${parsed.protocol}. Aguardando arquivos.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Arquivo de manifesto inválido';
      setStatusMessage(`Erro: ${message}`);
    }
  };

  const handleTargetFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setTargetFiles(Array.from(e.target.files));
  };

  const runVerification = async () => {
    if (!manifestData) {
      setStatusMessage('Por favor, carregue o arquivo MANIFEST.json primeiro.');
      return;
    }

    if (targetFiles.length === 0) {
      setStatusMessage('Por favor, selecione os arquivos (.pdf, .json) para verificação.');
      return;
    }

    setIsVerifying(true);
    setStatusMessage('Calculando hashes SHA-256 dos arquivos...');

    const verificationList: VerificationResult[] = [];

    for (const file of targetFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const calculatedHash = await sha256(new Uint8Array(arrayBuffer));
      const manifestEntry = manifestData.files[file.name];

      if (manifestEntry) {
        const matches = calculatedHash.toLowerCase() === manifestEntry.sha256.toLowerCase();
        verificationList.push({
          filename: file.name,
          expectedSha256: manifestEntry.sha256,
          actualSha256: calculatedHash,
          matches,
          sizeBytes: file.size
        });
      } else {
        verificationList.push({
          filename: file.name,
          expectedSha256: '[Não consta no Manifesto]',
          actualSha256: calculatedHash,
          matches: false,
          sizeBytes: file.size
        });
      }
    }

    setResults(verificationList);
    setIsVerifying(false);

    const allMatched = verificationList.length > 0 && verificationList.every(r => r.matches);
    if (allMatched) {
      setStatusMessage('INTEGRIDADE CONFIRMADA: Todos os arquivos coincidem perfeitamente com os hashes registrados no MANIFEST.');
    } else {
      setStatusMessage('ALERTA: Foram detectadas divergências de integridade ou arquivos desconhecidos.');
    }
  };

  const resetVerifier = () => {
    setManifestData(null);
    setTargetFiles([]);
    setResults([]);
    setStatusMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-300">
        {/* Modal Header */}
        <div className="bg-[#373435] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#A08F63]">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-[#A08F63]" />
            <h3 className="font-bold text-base tracking-wide">
              Verificador Independente de Integridade Forense
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-700">
          <p className="leading-relaxed bg-slate-50 p-3 rounded border border-gray-200">
            Esta ferramenta calcula o hash criptográfico SHA-256 diretamente no seu navegador
            e compara com os valores autenticados no arquivo <code>MANIFEST.json</code>.
          </p>

          {/* Passo 1: Upload MANIFEST */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-2">
            <label className="font-bold block uppercase text-gray-900">
              1. Selecionar MANIFEST.json
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleManifestUpload}
              className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-300 file:text-xs file:font-semibold file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
            />
            {manifestData && (
              <p className="text-emerald-700 font-semibold text-[11px]">
                ✓ Protocolo identificado: {manifestData.protocol} (Evidence ID: {manifestData.evidence_id})
              </p>
            )}
          </div>

          {/* Passo 2: Upload Arquivos para Conferência */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-2">
            <label className="font-bold block uppercase text-gray-900">
              2. Selecionar Arquivos para Auditoria (.pdf, .json)
            </label>
            <input
              type="file"
              multiple
              onChange={handleTargetFilesUpload}
              className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-300 file:text-xs file:font-semibold file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
            />
            {targetFiles.length > 0 && (
              <p className="text-gray-600 text-[11px]">
                {targetFiles.length} arquivo(s) selecionado(s): {targetFiles.map((f: File) => f.name).join(', ')}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!manifestData || targetFiles.length === 0 || isVerifying}
              onClick={runVerification}
              className="px-4 py-2 bg-[#373435] hover:bg-[#201f20] disabled:bg-gray-300 text-white font-bold rounded shadow-sm text-xs transition"
            >
              {isVerifying ? 'Calculando SHA-256...' : 'Executar Verificação de Hashes'}
            </button>
            <button
              type="button"
              onClick={resetVerifier}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded text-xs transition"
            >
              Limpar
            </button>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-md text-xs font-semibold ${
                statusMessage.includes('INTEGRIDADE CONFIRMADA')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : statusMessage.includes('ALERTA') || statusMessage.includes('Erro')
                  ? 'bg-red-50 text-red-800 border border-red-300'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {statusMessage}
            </div>
          )}

          {/* Tabela de Resultados */}
          {results.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-gray-900 uppercase">Resultado Detalhado por Arquivo</h4>
              <div className="space-y-2">
                {results.map((res: VerificationResult, i: number) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-[11px] font-mono ${
                      res.matches
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                        : 'bg-red-50/50 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1 mb-1 border-b border-gray-200/60">
                      <span className="font-bold text-xs">{res.filename}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          res.matches ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}
                      >
                        {res.matches ? '✓ Hash Coincide' : '✗ Adulterado / Divergente'}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-gray-600 break-all">
                      <div>Esperado: {res.expectedSha256}</div>
                      <div>Calculado: {res.actualSha256}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
