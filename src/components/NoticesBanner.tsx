import React from 'react';
import { ShieldCheck, Lock, PhoneCall } from 'lucide-react';
import { LEGAL_TEXTS } from '../config/legalTexts';

export const NoticesBanner: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      {/* Alerta de Acolhimento e Segurança à Vítima */}
      <div className="bg-amber-50/70 border-l-4 border-[#AB2328] p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#AB2328] flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-gray-800">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <span className="font-bold text-[#AB2328] uppercase text-xs tracking-wider">
                {LEGAL_TEXTS.auxiliaryDisclaimer.title}
              </span>
              <span className="text-[11px] bg-red-100 text-[#AB2328] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <PhoneCall className="w-3 h-3" />
                Em perigo agora? Ligue 190
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
              {LEGAL_TEXTS.auxiliaryDisclaimer.text}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Ref: Instrução de Serviço nº 01/2026 - 16º BPM / Lei Federal nº 11.340/2006 (Lei Maria da Penha).
            </p>
          </div>
        </div>
      </div>

      {/* Regra de Privacidade e Discrição em Linguagem Leiga */}
      <div className="bg-emerald-50/80 px-4 py-3 border-t border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-emerald-950">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1 rounded bg-emerald-100 text-emerald-800 flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <span>
            <strong className="text-emerald-900 font-bold">Sua Privacidade e Discrição:</strong> Os dados informados <strong className="underline">NÃO</strong> ficam salvos neste celular ou computador (sem histórico ou cookies). Ao fechar esta página ou enviar o relato, as informações são apagadas deste aparelho para garantir a sua segurança pessoal.
          </span>
        </div>
      </div>
    </div>
  );
};
