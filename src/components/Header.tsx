import React from 'react';
import { Shield } from 'lucide-react';
import { PMMG_BRAND } from '../config/brand';
import { SYSTEM_METADATA } from '../config/version';

export const Header: React.FC = () => {
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
        </div>
      </div>
    </header>
  );
};
