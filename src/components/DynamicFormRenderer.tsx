'use client';

import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface FormField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface DynamicFormProps {
  schema: { fields: FormField[] };
  onSubmit: (data: any) => void;
  defaultValues?: any;
  isSubmitting?: boolean;
}

export const DynamicFormRenderer: React.FC<DynamicFormProps> = ({ schema, onSubmit, defaultValues, isSubmitting }) => {
  // Generate Zod Schema dynamically based on configuration
  const validationSchema = useMemo(() => {
    const shape: any = {};
    schema.fields.forEach((field) => {
      let validator;
      if (field.type === 'text') {
        validator = z.string({ required_error: 'This field is required' });
        if (field.required) validator = validator.min(1, 'This field is required');
        else validator = validator.optional();
      } else if (field.type === 'radio') {
        validator = z.string({ required_error: 'Please select an option' });
        if (field.required) validator = validator.min(1, 'Please select an option');
        else validator = validator.optional();
      } else {
        validator = z.any();
      }
      shape[field.id] = validator;
    });
    return z.object(shape);
  }, [schema.fields]);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues,
  });

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                onChange={onChange}
                value={value || ''}
                placeholder={`Enter ${field.label}...`}
              />
            )}
          />
        );
      case 'radio':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {field.options?.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-center p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                      value === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      id={`${field.id}-${option.value}`}
                      name={field.id}
                      value={option.value}
                      checked={value === option.value}
                      onChange={() => onChange(option.value)}
                      className="sr-only" // Hidden visually, using container for styling
                    />
                    <div className="flex flex-col">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                        {option.label}
                      </span>
                    </div>
                    {value === option.value && (
                      <div className="absolute right-4 w-4 h-4 rounded-full bg-primary-500 shadow-sm" />
                    )}
                  </label>
                ))}
              </div>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {schema.fields.map((field) => (
        <div key={field.id} className="group">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 transition-colors group-focus-within:text-primary-500">
            {field.label} {field.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.id] && (
             <p className="mt-2 text-sm text-rose-500 animate-in slide-in-from-top-1">
               {errors[field.id]?.message as string}
             </p>
          )}
        </div>
      ))}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full relative overflow-hidden group flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-base font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">{isSubmitting ? 'Processing...' : 'Submit Registration'}</span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-primary-600 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
        </button>
      </div>
    </form>
  );
};
