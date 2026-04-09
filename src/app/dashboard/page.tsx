'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  FileText, LogOut, Loader2, CheckCircle2, Clock, AlertCircle,
  Users, Building2, Search, Filter, ChevronDown,
  UserPlus, ArrowRight, FileCheck, Eye, Download,
} from 'lucide-react';
import { clearAuthCookie } from '../actions/auth';

interface Registration {
  id: string;
  tracking_code: string;
  passport_number: string;
  full_name: string;
  status: string;
  dynamic_data: Record<string, any>;
  documents: Record<string, any>;
  notes: string | null;
  created_at: string;
  submitted_at: string | null;
  assigned_agent?: { id: string; name: string; email: string } | null;
  organization?: { name: string };
  dynamic_form?: { id: string; title: string };
}

interface UserInfo {
  userId: string;
  email: string;
  role: string;
  organization_id: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Draft', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', icon: <Clock className="w-4 h-4" /> },
  PENDING: { label: 'Menunggu', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: <Clock className="w-4 h-4" /> },
  REVIEW_IN_PROGRESS: { label: 'Ditinjau', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: <Eye className="w-4 h-4" /> },
  REVISION_REQUIRED: { label: 'Revisi', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', icon: <AlertCircle className="w-4 h-4" /> },
  APPROVED: { label: 'Disetujui', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: <CheckCircle2 className="w-4 h-4" /> },
  PROCESSED: { label: 'Selesai', color: 'text-emerald-700', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: <FileCheck className="w-4 h-4" /> },
};

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchUserInfo();
    fetchRegistrations();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await api.get('/auth/profile');
      setUserInfo(res.data.data || res.data);
    } catch {
      // Token may be invalid
    }
  };

  const fetchRegistrations = useCallback(async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/registrations', { params });
      setRegistrations(res.data.data || res.data);
    } catch (error) {
      console.error('Failed to load registrations', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchRegistrations();
  }, [statusFilter, fetchRegistrations]);

  const handleLogout = async () => {
    await clearAuthCookie();
    router.push('/login');
  };

  // TRD §8: State Machine Transitions
  const getNextStatus = (current: string, role: string): { status: string; label: string } | null => {
    if (current === 'PENDING' && (role === 'ADMIN' || role === 'SUPER_ADMIN')) return { status: 'REVIEW_IN_PROGRESS', label: 'Mulai Review' };
    if (current === 'REVIEW_IN_PROGRESS' && role === 'AGENT') return { status: 'REVISION_REQUIRED', label: 'Minta Revisi' };
    if (current === 'REVIEW_IN_PROGRESS' && (role === 'ADMIN' || role === 'SUPER_ADMIN')) return { status: 'APPROVED', label: 'Setujui' };
    if (current === 'APPROVED' && (role === 'ADMIN' || role === 'SUPER_ADMIN')) return { status: 'PROCESSED', label: 'Tandai Selesai' };
    return null;
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/registrations/${id}/status`, { status: newStatus });
      fetchRegistrations();
    } catch (error: any) {
      alert(error?.response?.data?.error?.message || 'Gagal mengupdate status.');
    }
  };

  const assignAgent = async (regId: string, agentId: string) => {
    try {
      await api.patch(`/admin/registrations/${regId}/assign`, { agent_id: agentId });
      setAssignModalOpen(false);
      fetchRegistrations();
    } catch (error: any) {
      alert(error?.response?.data?.error?.message || 'Gagal assign agent.');
    }
  };

  const exportCsv = async () => {
    try {
      const res = await api.get('/admin/registrations/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registrations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Gagal export CSV.');
    }
  };

  // Filter registrations by search
  const filtered = registrations.filter((reg) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      reg.full_name.toLowerCase().includes(q) ||
      reg.passport_number.toLowerCase().includes(q) ||
      reg.tracking_code.toLowerCase().includes(q)
    );
  });

  // Stats
  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'PENDING').length,
    inReview: registrations.filter(r => r.status === 'REVIEW_IN_PROGRESS').length,
    approved: registrations.filter(r => ['APPROVED', 'PROCESSED'].includes(r.status)).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">JP Smart Dashboard</h1>
              <p className="text-xs text-gray-500">{userInfo?.email} · <span className="font-semibold text-primary-600">{userInfo?.role}</span></p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: <FileText className="w-5 h-5" />, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Menunggu', value: stats.pending, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Ditinjau', value: stats.inReview, icon: <Eye className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Disetujui', value: stats.approved, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, paspor, atau kode tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Menunggu</option>
              <option value="REVIEW_IN_PROGRESS">Ditinjau</option>
              <option value="REVISION_REQUIRED">Revisi</option>
              <option value="APPROVED">Disetujui</option>
              <option value="PROCESSED">Selesai</option>
            </select>
          </div>

          {(userInfo?.role === 'ADMIN' || userInfo?.role === 'SUPER_ADMIN') && (
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pendaftar</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada registrasi ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((reg) => {
                    const sc = STATUS_CONFIG[reg.status] || STATUS_CONFIG.DRAFT;
                    const nextAction = userInfo ? getNextStatus(reg.status, userInfo.role) : null;

                    return (
                      <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">{reg.full_name}</div>
                          <div className="text-xs text-gray-500">{reg.passport_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-primary-600">{reg.tracking_code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.color} ${sc.bg}`}>
                            {sc.icon}
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {reg.assigned_agent ? (
                            <span className="text-sm text-gray-700 dark:text-gray-300">{reg.assigned_agent.name}</span>
                          ) : (
                            (userInfo?.role === 'ADMIN' || userInfo?.role === 'SUPER_ADMIN') ? (
                              <button
                                onClick={() => { setSelectedReg(reg); setAssignModalOpen(true); }}
                                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-500 font-medium"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                Assign
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {reg.submitted_at
                            ? new Date(reg.submitted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                            : new Date(reg.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                          {nextAction && (
                            <button
                              onClick={() => updateStatus(reg.id, nextAction.status)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-500 transition-all shadow-sm"
                            >
                              {nextAction.label}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Assign Agent Modal */}
      {assignModalOpen && selectedReg && (
        <AgentAssignModal
          registration={selectedReg}
          onAssign={assignAgent}
          onClose={() => setAssignModalOpen(false)}
        />
      )}
    </div>
  );
}

// ============================================
// AGENT ASSIGNMENT MODAL
// ============================================
function AgentAssignModal({
  registration,
  onAssign,
  onClose,
}: {
  registration: Registration;
  onAssign: (regId: string, agentId: string) => void;
  onClose: () => void;
}) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch agents (users with AGENT role) - from auth/signup we know users exist
    // In a real app this would be a dedicated endpoint 
    const fetchAgents = async () => {
      try {
        // For now, we use a simple approach - in production, add GET /admin/agents endpoint
        setAgents([]);
      } catch { }
      setLoading(false);
    };
    fetchAgents();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Assign Agent</h3>
        <p className="text-sm text-gray-500 mb-4">
          Pilih agent untuk memverifikasi registrasi <strong>{registration.full_name}</strong>
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Agent ID</label>
          <input
            id="agent-id-input"
            type="text"
            placeholder="Masukkan Agent User ID..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              const input = document.getElementById('agent-id-input') as HTMLInputElement;
              if (input?.value) onAssign(registration.id, input.value);
            }}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
