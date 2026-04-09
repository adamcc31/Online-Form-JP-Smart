'use client';

import { useState, useEffect } from 'react';
import { DynamicFormRenderer } from '@/components/DynamicFormRenderer';
import api from '@/lib/api';

export default function RegisterPage() {
  const [formSchema, setFormSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // In a real app, you'd get the organization_id from the URL or context
  const organizationId = 'default-org-id'; 

  useEffect(() => {
    const fetchForm = async () => {
      try {
        // Fetch the active form for this organization
        const response = await api.get(`/forms?organization_id=${organizationId}`);
        if (response.data && response.data.length > 0) {
          setFormSchema(response.data[0].schema_config);
        } else {
          setError('No active form found for this organization.');
        }
      } catch (err) {
        setError('Failed to load form.');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      await api.post('/registrations', {
        organization_id: organizationId,
        passport_number: data.passport_number || `TEMP-${Date.now()}`, // Assuming passport is a field or generated
        dynamic_data: data,
      });
      setSuccess(true);
    } catch (err) {
      setError('Failed to submit registration.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading form...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (success) return <div className="p-8 text-center text-green-600">Registration submitted successfully!</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">SIM Card Registration</h2>
        {formSchema && (
          <DynamicFormRenderer schema={formSchema} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}
