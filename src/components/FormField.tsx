import React, { useState } from 'react';
import { Calendar, Clock, Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { FormQuestion } from '../types/form';

interface FormFieldProps {
  field: FormQuestion;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onAddressAutofill?: (address: { street: string; neighborhood: string; city: string; state: string }) => void;
  error?: string;
}

// Funções utilitárias de formatação / máscaras
function formatCpf(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function formatPhone(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function formatCep(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
}

export const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, onAddressAutofill, error }) => {
  const isArray = Array.isArray(value);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepMessage, setCepMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCheckboxToggle = (option: string) => {
    const currentList = Array.isArray(value) ? [...value] : [];
    const index = currentList.indexOf(option);
    if (index > -1) {
      currentList.splice(index, 1);
    } else {
      currentList.push(option);
    }
    onChange(currentList);
  };

  const handleSetToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
  };

  const handleSetNow = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    onChange(`${hours}:${minutes}`);
  };

  const handleTextChange = (raw: string) => {
    const idLower = field.id.toLowerCase();
    const labelLower = field.label.toLowerCase();

    if (idLower.includes('cpf') || labelLower.includes('cpf')) {
      onChange(formatCpf(raw));
    } else if (idLower.includes('tel') || idLower.includes('telefone') || labelLower.includes('telefone')) {
      onChange(formatPhone(raw));
    } else if (idLower.includes('cep') || labelLower.includes('cep')) {
      const formatted = formatCep(raw);
      onChange(formatted);
      const clean = formatted.replace(/\D/g, '');
      if (clean.length === 8) {
        fetchViaCep(clean);
      }
    } else {
      onChange(raw);
    }
  };

  const fetchViaCep = async (cleanCep: string) => {
    if (cleanCep.length !== 8) return;
    setCepLoading(true);
    setCepMessage(null);
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await resp.json();
      if (data.erro) {
        setCepMessage({ type: 'error', text: 'CEP não encontrado. Preencha o endereço manualmente.' });
      } else {
        setCepMessage({
          type: 'success',
          text: `Localizado: ${data.logradouro || ''}, ${data.bairro || ''} - ${data.localidade || ''}/${data.uf || ''}`
        });
        if (onAddressAutofill) {
          onAddressAutofill({
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          });
        }
      }
    } catch {
      setCepMessage({ type: 'error', text: 'Não foi possível consultar o CEP automaticamente. Preencha manualmente.' });
    } finally {
      setCepLoading(false);
    }
  };

  const isCepField = field.id.toLowerCase().includes('cep') || field.label.toLowerCase().includes('cep');

  return (
    <div className="space-y-2 py-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="block text-xs sm:text-sm font-bold text-[#1F2421] uppercase tracking-wide leading-snug">
          {field.label}
          {field.required && (
            <span className="text-[#AB2328] font-bold ml-1" title="Campo de resposta obrigatória">*</span>
          )}
        </label>

        {/* Botões Rápidos para Data e Horário */}
        {field.type === 'date' && (
          <button
            type="button"
            onClick={handleSetToday}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-gray-100 hover:bg-[#A08F63]/20 text-gray-700 hover:text-[#847550] border border-gray-300 font-semibold transition active:scale-95"
            title="Preencher com a data de hoje"
          >
            <Calendar className="w-3.5 h-3.5 text-[#A08F63]" />
            <span>Hoje</span>
          </button>
        )}

        {field.type === 'time' && (
          <button
            type="button"
            onClick={handleSetNow}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-gray-100 hover:bg-[#A08F63]/20 text-gray-700 hover:text-[#847550] border border-gray-300 font-semibold transition active:scale-95"
            title="Preencher com o horário atual"
          >
            <Clock className="w-3.5 h-3.5 text-[#A08F63]" />
            <span>Horário Atual</span>
          </button>
        )}
      </div>

      {field.description && (
        <p className="text-xs text-gray-500 italic mb-1">{field.description}</p>
      )}

      {/* Tipo: date */}
      {field.type === 'date' && (
        <input
          type="date"
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(e.target.value)}
          className={`w-full px-3.5 py-2.5 text-sm sm:text-base bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A08F63] focus:border-transparent transition shadow-sm ${
            error ? 'border-[#AB2328] bg-red-50/20' : 'border-gray-300'
          }`}
        />
      )}

      {/* Tipo: time */}
      {field.type === 'time' && (
        <input
          type="time"
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(e.target.value)}
          className={`w-full px-3.5 py-2.5 text-sm sm:text-base bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A08F63] focus:border-transparent transition shadow-sm ${
            error ? 'border-[#AB2328] bg-red-50/20' : 'border-gray-300'
          }`}
        />
      )}

      {/* Tipo: text (com suporte especial a CEP) */}
      {field.type === 'text' && (
        <div className="space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={typeof value === 'string' ? value : ''}
              onChange={e => handleTextChange(e.target.value)}
              placeholder={field.placeholder || 'Preencha este campo...'}
              maxLength={isCepField ? 9 : 1000}
              className={`w-full px-3.5 py-2.5 text-sm sm:text-base bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A08F63] focus:border-transparent transition shadow-sm ${
                isCepField ? 'pr-24 font-mono' : ''
              } ${error ? 'border-[#AB2328] bg-red-50/20' : 'border-gray-300'}`}
            />
            {isCepField && (
              <button
                type="button"
                onClick={() => {
                  const rawVal = typeof value === 'string' ? value : '';
                  fetchViaCep(rawVal.replace(/\D/g, ''));
                }}
                disabled={cepLoading}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gray-100 hover:bg-[#A08F63]/20 text-gray-700 hover:text-[#847550] border border-gray-300 rounded-md text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 active:scale-95"
              >
                {cepLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Buscar</span>
              </button>
            )}
          </div>
          {cepMessage && (
            <p
              className={`text-xs flex items-center gap-1.5 font-medium ${
                cepMessage.type === 'success' ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {cepMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{cepMessage.text}</span>
            </p>
          )}
        </div>
      )}

      {/* Tipo: textarea */}
      {field.type === 'textarea' && (
        <textarea
          rows={3}
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || 'Digite as informações detalhadas...'}
          maxLength={5000}
          className={`w-full px-3.5 py-2.5 text-sm sm:text-base bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A08F63] focus:border-transparent transition shadow-sm ${
            error ? 'border-[#AB2328] bg-red-50/20' : 'border-gray-300'
          }`}
        />
      )}

      {/* Tipo: select */}
      {field.type === 'select' && (
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(e.target.value)}
          className={`w-full px-3.5 py-3 text-sm sm:text-base bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A08F63] focus:border-transparent transition shadow-sm ${
            error ? 'border-[#AB2328] bg-red-50/20' : 'border-gray-300'
          }`}
        >
          <option value="">Selecione uma opção...</option>
          {field.options?.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {/* Tipo: radio (Mobile-friendly com alvo de toque amplo) */}
      {field.type === 'radio' && (
        <div className="space-y-2 pt-1">
          {field.options?.map((opt, i) => {
            const isSelected = value === opt;
            return (
              <label
                key={i}
                className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm cursor-pointer transition min-h-[46px] select-none active:scale-[0.99] shadow-sm ${
                  isSelected
                    ? 'bg-amber-50/70 border-[#A08F63] text-gray-950 font-semibold ring-1 ring-[#A08F63]'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={isSelected}
                  onChange={() => onChange(opt)}
                  className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-[#AB2328] focus:ring-[#A08F63] flex-shrink-0"
                />
                <span className="leading-snug">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Tipo: checkbox (Mobile-friendly com alvo de toque amplo) */}
      {field.type === 'checkbox' && (
        <div className="space-y-2 pt-1">
          {field.options?.map((opt, i) => {
            const checked = isArray ? (value as string[]).includes(opt) : false;
            return (
              <label
                key={i}
                className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm cursor-pointer transition min-h-[46px] select-none active:scale-[0.99] shadow-sm ${
                  checked
                    ? 'bg-amber-50/70 border-[#A08F63] text-gray-950 font-semibold ring-1 ring-[#A08F63]'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxToggle(opt)}
                  className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded text-[#AB2328] focus:ring-[#A08F63] flex-shrink-0"
                />
                <span className="leading-snug">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-xs text-[#AB2328] font-bold mt-1.5 flex items-center gap-1.5 bg-red-50 p-2 rounded border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
