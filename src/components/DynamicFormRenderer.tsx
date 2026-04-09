'use client';

import React, { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Loader2 } from 'lucide-react';
import { SmartCaptcha } from './SmartCaptcha';

// TRD §5.2: All supported field types
interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  minAge?: number;
  maxAge?: number;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'tel' | 'email' | 'date' | 'radio' | 'checkbox' | 'select' | 'file_upload' | 'section_divider' | 'info_text';
  required?: boolean;
  placeholder?: string;
  content?: string;
  options?: { value: string; label: string }[];
  validation?: FormFieldValidation;
}

interface DynamicFormProps {
  schema: { version?: string; fields: FormField[] };
  onSubmit: (data: any) => void;
  defaultValues?: any;
  isSubmitting?: boolean;
}

// Dynamically build Zod schema from schema_config per TRD §5.3
function buildZodSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    // Skip non-data fields
    if (field.type === 'section_divider' || field.type === 'info_text') return;

    let validator: z.ZodTypeAny;

    switch (field.type) {
      case 'text':
      case 'tel':
      case 'email':
        validator = z.string();
        if (field.required) validator = (validator as z.ZodString).min(1, 'Wajib diisi');
        if (field.validation?.minLength) validator = (validator as z.ZodString).min(field.validation.minLength, `Minimal ${field.validation.minLength} karakter`);
        if (field.validation?.maxLength) validator = (validator as z.ZodString).max(field.validation.maxLength, `Maksimal ${field.validation.maxLength} karakter`);
        if (field.validation?.pattern) {
          validator = (validator as z.ZodString).regex(new RegExp(field.validation.pattern), field.validation.patternMessage || 'Format tidak valid');
        }
        if (field.type === 'email') validator = (validator as z.ZodString).email('Format email tidak valid');
        if (!field.required) validator = validator.optional().or(z.literal(''));
        break;

      case 'textarea':
        validator = z.string();
        if (field.required) validator = (validator as z.ZodString).min(1, 'Wajib diisi');
        if (field.validation?.minLength) validator = (validator as z.ZodString).min(field.validation.minLength, `Minimal ${field.validation.minLength} karakter`);
        if (field.validation?.maxLength) validator = (validator as z.ZodString).max(field.validation.maxLength, `Maksimal ${field.validation.maxLength} karakter`);
        if (!field.required) validator = validator.optional().or(z.literal(''));
        break;

      case 'number':
        validator = z.coerce.number();
        if (!field.required) validator = validator.optional();
        break;

      case 'date':
        validator = z.string();
        if (field.required) validator = (validator as z.ZodString).min(1, 'Wajib diisi');
        if (!field.required) validator = validator.optional().or(z.literal(''));
        break;

      case 'radio':
      case 'select':
        validator = z.string();
        if (field.required) validator = (validator as z.ZodString).min(1, 'Silakan pilih salah satu');
        if (!field.required) validator = validator.optional().or(z.literal(''));
        break;

      case 'checkbox':
        if (field.required) {
          validator = z.array(z.string()).min(1, 'Wajib dipilih minimal satu');
        } else {
          validator = z.array(z.string()).optional();
        }
        break;

      case 'file_upload':
        validator = z.any().optional();
        break;

      default:
        validator = z.any().optional();
    }

    shape[field.id] = validator;
  });

  return z.object(shape);
}

// ============================================
// FIELD INPUT STYLES
// ============================================

const inputBaseClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none placeholder:text-gray-400";

const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 transition-colors group-focus-within:text-primary-500";

// ============================================
// MAIN COMPONENT
// ============================================

export const DynamicFormRenderer: React.FC<DynamicFormProps> = ({ schema, onSubmit, defaultValues, isSubmitting }) => {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const validationSchema = useMemo(() => buildZodSchema(schema.fields), [schema.fields]);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: defaultValues || {},
  });

  const renderField = (field: FormField) => {
    switch (field.type) {
      // =============== TEXT ===============
      case 'text':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <input
                type="text"
                className={inputBaseClass}
                onChange={onChange}
                value={value || ''}
                placeholder={field.placeholder || `Masukkan ${field.label}...`}
              />
            )}
          />
        );

      // =============== TEXTAREA ===============
      case 'textarea':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <textarea
                className={`${inputBaseClass} min-h-[120px] resize-y`}
                onChange={onChange}
                value={value || ''}
                placeholder={field.placeholder || `Masukkan ${field.label}...`}
                rows={4}
              />
            )}
          />
        );

      // =============== NUMBER ===============
      case 'number':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <input
                type="number"
                className={inputBaseClass}
                onChange={onChange}
                value={value ?? ''}
                placeholder={field.placeholder || '0'}
              />
            )}
          />
        );

      // =============== TEL ===============
      case 'tel':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <input
                type="tel"
                className={inputBaseClass}
                onChange={onChange}
                value={value || ''}
                placeholder={field.placeholder || '+62 8xx-xxxx-xxxx'}
              />
            )}
          />
        );

      // =============== EMAIL ===============
      case 'email':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <input
                type="email"
                className={inputBaseClass}
                onChange={onChange}
                value={value || ''}
                placeholder={field.placeholder || 'contoh@email.com'}
              />
            )}
          />
        );

      // =============== DATE ===============
      case 'date':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <input
                type="date"
                className={inputBaseClass}
                onChange={onChange}
                value={value || ''}
              />
            )}
          />
        );

      // =============== RADIO ===============
      case 'radio':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {field.options?.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                      value === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-indigo-900/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={option.value}
                      checked={value === option.value}
                      onChange={() => onChange(option.value)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                    {value === option.value && (
                      <div className="absolute right-4 w-4 h-4 rounded-full bg-primary-500 shadow-sm" />
                    )}
                  </label>
                ))}
              </div>
            )}
          />
        );

      // =============== CHECKBOX ===============
      case 'checkbox':
        return (
          <Controller
            name={field.id}
            control={control}
            defaultValue={[]}
            render={({ field: { onChange, value } }) => (
              <div className="space-y-3 mt-2">
                {field.options?.map((option) => {
                  const checked = Array.isArray(value) && value.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                        checked
                          ? 'border-primary-500 bg-primary-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const currentVal = Array.isArray(value) ? value : [];
                          const newVal = checked
                            ? currentVal.filter((v: string) => v !== option.value)
                            : [...currentVal, option.value];
                          onChange(newVal);
                        }}
                        className="mt-0.5 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        );

      // =============== SELECT ===============
      case 'select':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <select
                className={`${inputBaseClass} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_16px_center]`}
                onChange={onChange}
                value={value || ''}
              >
                <option value="">— Pilih {field.label} —</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        );

      // =============== SECTION DIVIDER ===============
      case 'section_divider':
        return (
          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center pt-4">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-start">
              <span className="bg-white dark:bg-gray-900 pr-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {field.label}
              </span>
            </div>
          </div>
        );

      // =============== INFO TEXT ===============
      case 'info_text':
        return (
          <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {field.content || field.label}
            </p>
          </div>
        );

      // =============== FILE UPLOAD ===============
      case 'file_upload':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange } }) => (
              <div className="mt-1">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold text-primary-600">Pilih file</span> atau drag & drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG (maks. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => onChange(e.target.files?.[0])}
                  />
                </label>
              </div>
            )}
          />
        );

      default:
        return <p className="text-sm text-gray-400">Tipe field &quot;{field.type}&quot; belum didukung</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {schema.fields.map((field) => (
        <div key={field.id} className="group">
          {/* Don't show label for dividers and info text */}
          {field.type !== 'section_divider' && field.type !== 'info_text' && (
            <label className={labelClass}>
              {field.label}
              {field.required && <span className="text-rose-500 ml-1">*</span>}
            </label>
          )}
          {renderField(field)}
          {errors[field.id] && (
            <p className="mt-2 text-sm text-rose-500 animate-in slide-in-from-top-1">
              {errors[field.id]?.message as string}
            </p>
          )}
        </div>
      ))}

      {/* Security Captcha */}
      <div className="pt-4 pb-2 border-t border-gray-100 dark:border-gray-800">
        <SmartCaptcha onVerified={setCaptchaVerified} />
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting || !captchaVerified}
          className="w-full relative overflow-hidden group flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-primary-500/25 text-base font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-primary-600 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          <span className="relative z-10 flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Mengirim...
              </>
            ) : (
              'Kirim Registrasi'
            )}
          </span>
        </button>
      </div>
    </form>
  );
};
