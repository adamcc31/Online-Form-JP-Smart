'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page redirects to the slug-based public form
// Per TRD §9.2, public forms use /p/:org_slug routing
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Default redirect to LPK Sakura form
    // In production, this page would show a list of organizations or be removed
    router.replace('/p/lpk-sakura');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <p className="text-gray-500">Mengalihkan ke formulir registrasi...</p>
    </div>
  );
}
