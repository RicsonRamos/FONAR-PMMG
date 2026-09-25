export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'time'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'section_header';

export interface FormQuestion {
  id: string;
  version: string;
  index: number;
  label: string;
  type: FieldType;
  description?: string | null;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  allowOther?: boolean;
  sectionId: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  fields: FormQuestion[];
}

export interface FormValues {
  [fieldId: string]: string | string[];
}

export interface ValidationErrors {
  [fieldId: string]: string;
}
