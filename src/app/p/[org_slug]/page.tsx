'use client';

import { useState, useEffect, use } from 'react';
import { DynamicFormRenderer } from '@/components/DynamicFormRenderer';
import { FormHeader } from '@/components/FormHeader';
import api from '@/lib/api';
import { Loader2, CheckCircle2, Copy, Search, AlertTriangle } from 'lucide-react';

interface PageProps {
  params: Promise<{ org_slug: string }>;
}

export default function PublicFormPage({ params }: PageProps) {
  const { org_slug } = use(params);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        // TRD §9.2: GET /forms/public/:org_slug
        const response = await api.get(`/forms/public/${org_slug}`);
        setFormData(response.data.data || response.data);
      } catch (err: any) {
        const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Form tidak ditemukan untuk organisasi ini.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [org_slug]);

  const handleSubmit = async (data: any) => {
    if (!formData) return;
    setSubmitting(true);

    try {
      const form = formData.form || formData;
      const org = formData.organization;

      // Step 1: Create DRAFT registration — TRD §9.2
      const createRes = await api.post('/registrations/public', {
        organization_id: form.organization_id || org?.id,
        dynamic_form_id: form.id,
        passport_number: data.field_passport_number || data.passport_number || `P-${Date.now()}`,
        full_name: data.field_nama_lengkap || data.full_name || 'Unknown',
        dynamic_data: data,
        documents: {}, // Empty initially
      });

      const registration = createRes.data.data || createRes.data;
      const newRegistrationId = registration.id;
      setRegistrationId(newRegistrationId);

      // Step 1.5: Upload Documents to S3 via Presigned URLs
      const uploadedDocs: Record<string, string> = {};
      const pendingUploads = [];

      for (const key of Object.keys(data)) {
        if (data[key] instanceof File) {
          const file = data[key] as File;
          pendingUploads.push(
            (async () => {
              // TRD §9.2 Upload Presign Request
              const res = await api.post(`/registrations/public/${newRegistrationId}/documents/presign`, {
                fileName: file.name,
                mimeType: file.type,
                docType: key,
              });
              
              const { url, key: storageKey } = res.data.data;
              
              // Direct upload to S3 Compatible Storage (Railway Bucket / Cloudflare R2)
              await fetch(url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
              });
              
              uploadedDocs[key] = storageKey;
            })()
          );
        }
      }

      if (pendingUploads.length > 0) {
        await Promise.all(pendingUploads);
      }

      // Step 2: Submit (DRAFT → PENDING) — TRD §9.2
      const submitRes = await api.patch(`/registrations/public/${newRegistrationId}/submit`, {
        dynamic_data: data,
        documents: uploadedDocs,
      });

      const submitted = submitRes.data.data || submitRes.data;
      setTrackingCode(submitted.tracking_code || registration.tracking_code);
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Gagal mengirim registrasi. Silakan coba lagi.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingCode = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
        <p className="text-sm text-gray-500">Memuat formulir...</p>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error && !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-md w-full glass p-8 rounded-3xl text-center shadow-xl">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Form Tidak Tersedia</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // ============================================
  // SUCCESS STATE
  // ============================================
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-md w-full glass p-8 rounded-3xl text-center shadow-xl animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Registrasi Berhasil! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Simpan kode tracking berikut untuk memantau status registrasi Anda.
          </p>

          {/* Tracking Code Display */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kode Tracking</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-mono font-extrabold text-primary-600 dark:text-primary-400 tracking-widest">
                {trackingCode}
              </span>
              <button
                onClick={copyTrackingCode}
                className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all"
                title="Salin kode"
              >
                <Copy className={`w-5 h-5 ${copied ? 'text-emerald-500' : 'text-gray-400'}`} />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-emerald-500 mt-2 animate-in fade-in">Tersalin!</p>
            )}
          </div>

          <a
            href={`/status?code=${trackingCode}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/25"
          >
            <Search className="w-4 h-4" />
            Cek Status Registrasi
          </a>
        </div>
      </div>
    );
  }

  // ============================================
  // FORM STATE
  // ============================================
  const form = formData?.form || formData;
  const organization = formData?.organization;
  const headerConfig = form?.header_config || {};
  const schemaConfig = form?.schema_config || { fields: [] };
  const theme = headerConfig?.theme || {};

  return (
    <div
      className="min-h-screen py-6 px-4 sm:px-6"
      style={{ backgroundColor: theme.background_color || '#F9FAFB' }}
    >
      <div className="max-w-lg mx-auto">
        {/* FormHeader per TRD §6.6 */}
        <FormHeader config={headerConfig} orgName={organization?.name} />

        {/* Form Body */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <DynamicFormRenderer
            schema={schemaConfig}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Formulir ini dilindungi enkripsi dan data Anda akan diproses sesuai kebijakan privasi.
          </p>
          <a
            href="/status"
            className="inline-flex items-center gap-1 mt-2 text-xs text-primary-500 hover:text-primary-600 font-medium"
          >
            <Search className="w-3 h-3" />
            Sudah punya kode tracking? Cek status di sini
          </a>
        </div>
      </div>
    </div>
  );
}
