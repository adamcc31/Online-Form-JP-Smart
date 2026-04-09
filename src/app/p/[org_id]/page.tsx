'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { DynamicFormRenderer } from '@/components/DynamicFormRenderer';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function PublicRegistrationPage() {
  const params = useParams();
  const org_id = params.org_id as string;
  const [schemaConfig, setSchemaConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (org_id) {
      fetchFormConfig();
    }
  }, [org_id]);

  const fetchFormConfig = async () => {
    try {
      // Find the active form for this organization
      const res = await api.get(`/forms?organization_id=${org_id}`);
      const activeForm = res.data.find((f: any) => f.is_active);
      if (activeForm) {
        setSchemaConfig(activeForm.schema_config);
      } else {
        setError('No active registration form found for this organization.');
      }
    } catch (err) {
      setError('Failed to load form configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    setError('');
    try {
      // The student must provide a passport_number inside dynamic data
      // For simplicity, we extract it or generate a temporary one if the schema didn't force it
      const passportNumber = data.passport_number || data.passport || `TEMP-${Date.now()}`;
      
      const payload = {
        organization_id: org_id,
        passport_number: passportNumber,
        dynamic_data: data,
      };

      await api.post('/registrations', payload);
      setSuccess(true);
    } catch (err) {
      setError('Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-md w-full glass rounded-3xl p-8 text-center shadow-xl animate-in zoom-in slide-in-from-bottom-8">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registration Complete</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your application has been successfully submitted and is pending review by an agent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Student Registration
          </h1>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
            Please fill out all required information carefully.
          </p>
        </div>

        {error ? (
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : schemaConfig ? (
          <div className="glass p-8 sm:p-12 rounded-3xl shadow-xl">
            <DynamicFormRenderer 
              schema={schemaConfig} 
              onSubmit={handleSubmit} 
              isSubmitting={submitting} 
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
