'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ArrowLeft,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

interface StatusData {
  tracking_code: string;
  full_name: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  organization: { name: string };
}

const STATUS_INFO: Record<string, { icon: React.ReactNode; color: string; bgColor: string; label: string; description: string }> = {
  DRAFT: {
    icon: <Clock className="w-8 h-8" />,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    label: 'Draft',
    description: 'Registrasi belum disubmit. Silakan lengkapi dan kirim formulir.',
  },
  PENDING: {
    icon: <Clock className="w-8 h-8" />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    label: 'Menunggu Verifikasi',
    description: 'Registrasi sudah diterima dan sedang menunggu proses verifikasi oleh petugas.',
  },
  REVIEW_IN_PROGRESS: {
    icon: <Search className="w-8 h-8" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    label: 'Sedang Ditinjau',
    description: 'Petugas sedang memeriksa dokumen dan data Anda. Mohon bersabar.',
  },
  REVISION_REQUIRED: {
    icon: <AlertCircle className="w-8 h-8" />,
    color: 'text-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    label: 'Perlu Revisi',
    description: 'Ada data atau dokumen yang perlu diperbaiki. Silakan cek kembali dan submit ulang.',
  },
  APPROVED: {
    icon: <CheckCircle2 className="w-8 h-8" />,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    label: 'Disetujui',
    description: 'Registrasi telah disetujui! SIM Card Anda akan segera diproses.',
  },
  PROCESSED: {
    icon: <FileCheck className="w-8 h-8" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    label: 'Selesai Diproses',
    description: 'SIM Card Anda telah selesai diproses dan siap untuk digunakan.',
  },
};

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>}>
      <StatusContent />
    </Suspense>
  );
}

function StatusContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode);
    }
  }, []);

  const handleSearch = async (trackingCode?: string) => {
    const searchCode = trackingCode || code;
    if (!searchCode.trim()) return;

    setLoading(true);
    setError('');
    setStatusData(null);
    setSearched(true);

    try {
      // TRD §9.2: GET /registrations/public/status/:tracking_code
      const response = await api.get(`/registrations/public/status/${searchCode.trim()}`);
      setStatusData(response.data.data || response.data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Kode tracking tidak ditemukan. Pastikan kode yang dimasukkan benar.');
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = statusData ? STATUS_INFO[statusData.status] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
            Cek Status Registrasi
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Masukkan kode tracking 12 digit yang Anda terima saat registrasi
          </p>
        </div>

        {/* Search Input */}
        <div className="glass p-6 rounded-2xl shadow-xl mb-8">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Masukkan Kode Tracking..."
              maxLength={12}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-lg tracking-wider placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm mb-8 animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Status Result */}
        {statusData && statusInfo && (
          <div className="glass rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Status Banner */}
            <div className={`${statusInfo.bgColor} p-6 flex items-center gap-4`}>
              <div className={statusInfo.color}>
                {statusInfo.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                <h2 className={`text-xl font-bold ${statusInfo.color}`}>
                  {statusInfo.label}
                </h2>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {statusInfo.description}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{statusData.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Organisasi</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{statusData.organization?.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Kode Tracking</p>
                  <p className="text-sm font-mono font-bold text-primary-600">{statusData.tracking_code}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Submit</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {statusData.submitted_at ? new Date(statusData.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>

              {/* Refresh button */}
              <button
                onClick={() => handleSearch()}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </button>
            </div>
          </div>
        )}

        {/* Empty state when searched but no result */}
        {searched && !statusData && !loading && !error && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Masukkan kode tracking untuk melihat status</p>
          </div>
        )}
      </div>
    </div>
  );
}
