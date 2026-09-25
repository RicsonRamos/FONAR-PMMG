import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FormSection as FormSectionType, FormValues } from '../types/form';
import { FormField } from './FormField';

interface FormSectionProps {
  section: FormSectionType;
  formValues: FormValues;
  onChangeField: (fieldId: string, value: string | string[]) => void;
  onAddressAutofill?: (address: { street: string; neighborhood: string; city: string; state: string }) => void;
  errors: Record<string, string>;
  defaultOpen?: boolean;
}

export const FormSectionComponent: React.FC<FormSectionProps> = ({
  section,
  formValues,
  onChangeField,
  onAddressAutofill,
  errors,
  defaultOpen = true
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      {/* Cabeçalho da Seção */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 bg-[#373435] text-white flex items-center justify-between hover:bg-[#2c292a] transition-colors border-l-4 border-[#A08F63]"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="font-bold text-sm sm:text-base tracking-wide uppercase">
            {section.title}
          </span>
          {section.badge && (
            <span className="text-[11px] font-semibold bg-[#A08F63]/30 text-[#A08F63] px-2 py-0.5 rounded border border-[#A08F63]/40">
              {section.badge}
            </span>
          )}
        </div>
        <div className="text-gray-300">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Conteúdo dos Campos */}
      {isOpen && (
        <div className="p-5 space-y-4">
          {section.description && (
            <p className="text-xs text-gray-600 border-b border-gray-100 pb-2">
              {section.description}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {section.fields.map(field => {
              // Campos de largura total se for textarea, checkbox, endereço ou pergunta longa
              const isFullWidth =
                field.type === 'textarea' ||
                field.type === 'checkbox' ||
                field.type === 'radio' ||
                field.id.includes('street') ||
                field.id.includes('social_name') ||
                field.label.length > 45;

              return (
                <div key={field.id} className={isFullWidth ? 'md:col-span-2' : ''}>
                  <FormField
                    field={field}
                    value={formValues[field.id] || (field.type === 'checkbox' ? [] : '')}
                    onChange={val => onChangeField(field.id, val)}
                    onAddressAutofill={onAddressAutofill}
                    error={errors[field.id]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
