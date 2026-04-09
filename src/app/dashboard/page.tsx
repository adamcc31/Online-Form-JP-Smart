'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { FileText, LogOut, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { clearAuthCookie } from '../actions/auth';

interface Registration {
  id: string;
  passport_number: string;
  status: string;
  dynamic_data: Record<string, any>;
  created_at: string;
  assigned_agent?: { name: string };
  organization?: { name: string };
}

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/registrations');
      setRegistrations(res.data);
    } catch (error) {
      console.error('Failed to load registrations', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearAuthCookie();
    router.push('/login');
  };

  const updateStatus = async (id: string, currentStatus: string) => {
    // Valid transitions logic wrapper
    let nextStatus = currentStatus;
    if (currentStatus === 'PENDING') nextStatus = 'REVIEW_IN_PROGRESS';
    else if (currentStatus === 'REVIEW_IN_PROGRESS') nextStatus = 'APPROVED'; // Assuming admin or can be rejected
    else if (currentStatus === 'APPROVED') nextStatus = 'PROCESSED';
    else return;

    try {
      await api.patch(`/registrations/${id}`, { status: nextStatus });
      fetchRegistrations(); // refetch
    } catch (error) {
      alert('Failed to update status. Check permissions.');
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (['APPROVED', 'PROCESSED'].includes(status)) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (['REVISION_REQUIRED'].includes(status)) return <AlertCircle className="w-5 h-5 text-rose-500" />;
    return <Clock className="w-5 h-5 text-amber-500" />;
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
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Registration Control</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Incoming Submissions</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Review and update student registration statuses.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant ID (Passport)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignee/Org</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{reg.passport_number}</div>
                        <div className="text-xs text-gray-500 max-w-[200px] truncate">
                           {JSON.stringify(reg.dynamic_data)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon status={reg.status} />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {reg.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {reg.assigned_agent?.name || 'Unassigned'} <br />
                        <span className="text-xs text-gray-400">{reg.organization?.name}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {reg.status !== 'PROCESSED' && (
                          <button
                            onClick={() => updateStatus(reg.id, reg.status)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                          >
                            Advance Status
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
