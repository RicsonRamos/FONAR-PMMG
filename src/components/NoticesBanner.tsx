import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { LEGAL_TEXTS } from '../config/legalTexts';

export const NoticesBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      {/* Alerta Primário — Ferramenta Auxiliar */}
      <div className="bg-amber-50 border-l-4 border-[#AB2328] p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#AB2328] flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-gray-800">
            <p className="font-semibold text-[#AB2328] uppercase text-xs tracking-wider mb-1">
              Aviso Institucional Obrigatório [VALIDAR JURIDICAMENTE]
            </p>
            <p className="font-medium">
              {LEGAL_TEXTS.auxiliaryDisclaimer.text}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Ref: Instrução de Serviço nº 01/2026 - 16º BPM / POPs 1.03.058/2026 e Lei nº 11.340/2006.
            </p>
          </div>
        </div>
      </div>

      {/* Regra Crítica de Privacidade dos Dados */}
      <div className="bg-slate-50 px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>
            <strong className="text-emerald-800">Privacidade Técnica:</strong> Os dados NÃO são armazenados no navegador (sem cookies ou localStorage). As informações residem unicamente em memória temporária.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[#A08F63] hover:text-[#847550] font-semibold flex items-center gap-1 flex-shrink-0 underline text-xs"
        >
          {expanded ? 'Ocultar avisos completos' : 'Ver avisos completos e canal de contato'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Conteúdo Expandido dos Avisos */}
      {expanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 text-xs text-gray-700">
          <div>
            <h4 className="font-bold text-gray-900 mb-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A08F63]" />
              {LEGAL_TEXTS.purposeNotice.title}
            </h4>
            <p className="text-gray-600 leading-relaxed">
              {LEGAL_TEXTS.purposeNotice.text}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A08F63]" />
              {LEGAL_TEXTS.privacyNotice.title}
            </h4>
            <p className="text-gray-600 leading-relaxed">
              {LEGAL_TEXTS.privacyNotice.text}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A08F63]" />
              {LEGAL_TEXTS.contactNotice.title}
            </h4>
            <p className="text-gray-600 leading-relaxed">
              {LEGAL_TEXTS.contactNotice.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
