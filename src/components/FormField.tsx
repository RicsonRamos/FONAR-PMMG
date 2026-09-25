import React from 'react';
import { FormQuestion } from '../types/form';

interface FormFieldProps {
  field: FormQuestion;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, error }) => {
  const isArray = Array.isArray(value);

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

  return (
    <div className="space-y-1.5 py-2">
      <label className="block text-xs font-bold text-[#1F2421] uppercase tracking-wide">
        {field.label}
        {field.required && <span className="text-[#AB2328] ml-1">*</span>}
      </label>

      {field.description && (
        <p className="text-xs text-gray-500 italic mb-1">{field.description}</p>
      )}

      {/* Tipo: date */}
      {field.type === 'date' && (
        <input
          type="date"
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A08F63] focus:border-transparent transition"
        />
      )}

      {/* Tipo: time */}
      {field.type === 'time' && (
        <input
          type="time"
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A08F63] focus:border-transparent transition"
        />
      )}

      {/* Tipo: text */}
      {field.type === 'text' && (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || 'Preencha este campo...'}
          maxLength={1000}
          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A08F63] focus:border-transparent transition"
        />
      )}

      {/* Tipo: textarea */}
      {field.type === 'textarea' && (
        <textarea
          rows={3}
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || 'Digite as informações detalhadas...'}
          maxLength={5000}
          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A08F63] focus:border-transparent transition"
        />
      )}

      {/* Tipo: select */}
      {field.type === 'select' && (
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A08F63] focus:border-transparent transition"
        >
          <option value="">Selecione uma opção...</option>
          {field.options?.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {/* Tipo: radio */}
      {field.type === 'radio' && (
        <div className="space-y-1.5 pt-1">
          {field.options?.map((opt, i) => (
            <label
              key={i}
              className={`flex items-start gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition ${
                value === opt
                  ? 'bg-amber-50/50 border-[#A08F63] text-gray-900 font-medium'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="mt-0.5 text-[#AB2328] focus:ring-[#A08F63]"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* Tipo: checkbox (seleção múltipla) */}
      {field.type === 'checkbox' && (
        <div className="space-y-1.5 pt-1">
          {field.options?.map((opt, i) => {
            const checked = isArray ? (value as string[]).includes(opt) : false;
            return (
              <label
                key={i}
                className={`flex items-start gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition ${
                  checked
                    ? 'bg-amber-50/50 border-[#A08F63] text-gray-900 font-medium'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxToggle(opt)}
                  className="mt-0.5 rounded text-[#AB2328] focus:ring-[#A08F63]"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-[#AB2328] font-semibold mt-1">{error}</p>}
    </div>
  );
};
