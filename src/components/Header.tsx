import { Shield, FileCheck } from 'lucide-react';
import { PMMG_BRAND } from '../config/brand';
import { SYSTEM_METADATA } from '../config/version';

interface HeaderProps {
  onOpenVerifier: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenVerifier }) => {
  return (
    <header className="bg-[#373435] text-white shadow-md border-b-4 border-[#A08F63]">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo e Título */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-lg bg-[#AB2328] flex items-center justify-center shadow-inner border border-[#A08F63] flex-shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#A08F63]">
                  {PMMG_BRAND.name}
                </span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">
                  v{SYSTEM_METADATA.system_version}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-teko">
                FONAR — FORMULÁRIO AUXILIAR INSTITUCIONAL
              </h1>
              <p className="text-xs text-gray-300">
                {PMMG_BRAND.unit} • {PMMG_BRAND.subUnit}
              </p>
            </div>
          </div>

          {/* Botões de Ação Auxiliar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenVerifier}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#A08F63]/20 hover:bg-[#A08F63]/30 text-[#A08F63] border border-[#A08F63]/40 transition-colors"
              title="Verificar integridade de um pacote de evidência existente"
            >
              <FileCheck className="w-4 h-4" />
              <span>Verificador de Integridade</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
