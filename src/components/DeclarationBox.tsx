import { AlertCircle } from 'lucide-react';
import { LEGAL_TEXTS } from '../config/legalTexts';

interface DeclarationBoxProps {
  confirmed: boolean;
  onToggle: (checked: boolean) => void;
  error?: string;
}

export const DeclarationBox: React.FC<DeclarationBoxProps> = ({ confirmed, onToggle, error }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="bg-[#373435] text-white px-5 py-3 border-l-4 border-[#AB2328] flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wide">
          {LEGAL_TEXTS.declaration.title}
        </h3>
        <span className="text-[10px] bg-red-900/60 text-red-200 px-2 py-0.5 rounded border border-red-700 font-mono">
          VALIDAR JURIDICAMENTE
        </span>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs text-gray-700 leading-relaxed bg-amber-50/60 p-3 rounded border border-amber-200/60">
          {LEGAL_TEXTS.declaration.text}
        </p>

        <label
          className={`flex items-start gap-3 p-3.5 rounded-lg border-2 cursor-pointer transition ${
            confirmed
              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-medium'
              : 'border-gray-300 hover:border-[#A08F63] text-gray-800'
          }`}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => onToggle(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-[#AB2328] rounded border-gray-300 focus:ring-[#A08F63]"
          />
          <div className="text-xs">
            <span className="font-bold block text-sm mb-0.5 text-gray-900">
              {LEGAL_TEXTS.declaration.checkboxLabel}
            </span>
            <span className="text-gray-500">
              A confirmação é obrigatória para habilitação do envio e cálculo da evidência técnica.
            </span>
          </div>
        </label>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-[#AB2328] font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
