import React from 'react';
import { AlertCircle, ShieldAlert, FileText, Edit3 } from 'lucide-react';
import { LEGAL_TEXTS, generateDeclarationText } from '../config/legalTexts';
import { FormValues } from '../types/form';

interface DeclarationBoxProps {
  confirmed: boolean;
  onToggle: (checked: boolean) => void;
  error?: string;
  victimName?: string;
  dateStr?: string;
  timeStr?: string;
  formValues?: FormValues;
  onEditStep?: (stepIndex: number) => void;
}

export const DeclarationBox: React.FC<DeclarationBoxProps> = ({
  confirmed,
  onToggle,
  error,
  victimName,
  dateStr,
  timeStr,
  formValues = {},
  onEditStep
}) => {
  // Monta texto dinâmico da declaração de forma canônica
  const dynamicDeclarationText = generateDeclarationText({ victimName, dateStr, timeStr });

  return (
    <div className="space-y-6">
      {/* 1. Aviso de Responsabilidade Penal em Linguagem Acessível */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
        <div className="bg-[#AB2328] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-bold text-sm uppercase tracking-wide">
              {LEGAL_TEXTS.declaration.title}
            </h3>
          </div>
          <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-mono font-bold">
            Art. 299 - CPB
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-gray-800 text-xs sm:text-sm leading-relaxed space-y-2">
            <p className="font-bold text-[#AB2328] text-sm">
              Prezado(a) cidadão(ã),
            </p>
            <p>
              As informações que você declarou neste formulário são de fundamental importância para a sua segurança e subsidiarão o registro oficial da ocorrência pela Polícia Militar e as medidas protetivas de urgência no Poder Judiciário.
            </p>
            <p className="bg-white/80 p-3 rounded border border-amber-200/60 font-medium text-xs text-gray-700 italic">
              &ldquo;Omitir, em documento público ou particular, declaração que devia constar, ou nele inserir ou fazer declaração falsa ou diversa da que devia ser escrita, com o fim de prejudicar direito, criar obrigação ou alterar a verdade sobre fato juridicamente relevante: <br />
              <strong className="not-italic text-[#AB2328]">Pena: reclusão de 1 a 5 anos, e multa, se o documento é público; e reclusão de 1 a 3 anos, e multa, se o documento é particular.</strong>&rdquo;
              <span className="block mt-1 text-[11px] font-semibold text-gray-500 not-italic">
                — Artigo 299 do Decreto-Lei nº 2.848/1940 (Código Penal Brasileiro)
              </span>
            </p>
          </div>

          {/* Declaração Formal Personalizada */}
          <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Termo Individual de Declaração de Fidedignidade
            </span>
            <p className="text-xs sm:text-sm font-mono text-gray-900 bg-white p-3.5 rounded border border-gray-300 leading-relaxed font-semibold">
              {dynamicDeclarationText}
            </p>
          </div>

          {/* Checkbox de Confirmação */}
          <label
            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
              confirmed
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-medium'
                : 'border-gray-300 hover:border-[#A08F63] text-gray-800 bg-white'
            }`}
          >
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => onToggle(e.target.checked)}
              className="mt-1 w-5 h-5 text-[#AB2328] rounded border-gray-300 focus:ring-[#A08F63]"
            />
            <div className="text-xs sm:text-sm">
              <span className="font-bold block text-sm mb-1 text-gray-900">
                {LEGAL_TEXTS.declaration.checkboxLabel}
              </span>
              <span className="text-gray-600 block text-xs">
                Ao marcar esta opção, você atesta expressamente que todas as informações prestadas são verdadeiras e assume a responsabilidade pelas declarações efetuadas.
              </span>
            </div>
          </label>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-[#AB2328] font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Resumo de Conferência Antes do Envio */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#A08F63]" />
            <h4 className="font-bold text-sm text-gray-900 uppercase">
              Conferência dos Dados Preenchidos
            </h4>
          </div>
          <span className="text-xs text-gray-500">
            Revise antes de confirmar o envio
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Dados da Vítima */}
          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 uppercase tracking-wide">
                1. Dados da Vítima
              </span>
              {onEditStep && (
                <button
                  type="button"
                  onClick={() => onEditStep(0)}
                  className="text-[#A08F63] hover:text-[#847550] inline-flex items-center gap-1 font-semibold hover:underline"
                >
                  <Edit3 className="w-3 h-3" /> Editar
                </button>
              )}
            </div>
            <div className="space-y-1 text-gray-700">
              <p><strong className="text-gray-900">Nome:</strong> {formValues['field_4'] || <span className="text-red-500 italic">Não informado</span>}</p>
              {formValues['field_victim_social_name'] && (
                <p><strong className="text-gray-900">Nome Social:</strong> {formValues['field_victim_social_name']}</p>
              )}
              <p><strong className="text-gray-900">CPF:</strong> {formValues['field_7'] || 'Não informado'}</p>
              <p><strong className="text-gray-900">Telefone:</strong> {formValues['field_16'] || 'Não informado'}</p>
              <p><strong className="text-gray-900">Lesão Sofrida pela Vítima:</strong> {formValues['field_3'] || 'Não informado'}</p>
              <p><strong className="text-gray-900">Endereço:</strong> {[
                formValues['field_victim_street'],
                formValues['field_victim_number'],
                formValues['field_victim_neighborhood'],
                formValues['field_victim_city'],
                formValues['field_victim_state']
              ].filter(Boolean).join(', ') || 'Não informado'}</p>
            </div>
          </div>

          {/* Dados do Autor */}
          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 uppercase tracking-wide">
                2. Dados do(a) Agressor(a)
              </span>
              {onEditStep && (
                <button
                  type="button"
                  onClick={() => onEditStep(1)}
                  className="text-[#A08F63] hover:text-[#847550] inline-flex items-center gap-1 font-semibold hover:underline"
                >
                  <Edit3 className="w-3 h-3" /> Editar
                </button>
              )}
            </div>
            <div className="space-y-1 text-gray-700">
              <p><strong className="text-gray-900">Nome do Autor:</strong> {formValues['field_21'] || 'Não informado'}</p>
              <p><strong className="text-gray-900">Relação com a Vítima:</strong> {formValues['field_2'] || 'Não informado'}</p>
              <p><strong className="text-gray-900">Endereço do Autor:</strong> {formValues['field_32'] || 'Não informado'}</p>
            </div>
          </div>
        </div>

        {/* Avaliação de Risco FONAR */}
        <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 uppercase tracking-wide">
              3. Formulário de Risco (FONAR)
            </span>
            {onEditStep && (
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="text-[#A08F63] hover:text-[#847550] inline-flex items-center gap-1 font-semibold hover:underline"
              >
                <Edit3 className="w-3 h-3" /> Editar
              </button>
            )}
          </div>
          <p className="text-gray-600">
            Questionário estruturado de avaliação de risco respondido conforme Resolução Conjunta CNJ/CNMP nº 5/2020.
          </p>
        </div>
      </div>
    </div>
  );
};
