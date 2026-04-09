import Link from 'next/link';
import { ArrowRight, ShieldCheck, Globe, Zap, Search, FileText, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">JP Smart<span className="text-primary-500">.</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/status" 
            className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Cek Status
          </Link>
          <Link 
            href="/login" 
            className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-ping"></span>
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">v2.0 Production Ready</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 max-w-4xl">
          Sistem Registrasi <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500">
            SIM Card Jepang
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Platform manajemen registrasi multi-tenant untuk LPK SO Indonesia. Formulir dinamis, verifikasi dokumen, dan pelacakan status secara real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link 
            href="/p/lpk-sakura" 
            className="group relative inline-flex justify-center items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-primary-600 rounded-2xl overflow-hidden shadow-xl shadow-primary-500/25 transition-transform hover:scale-105"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-600 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <span className="relative z-10 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Isi Formulir Registrasi
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link 
            href="/status" 
            className="inline-flex justify-center items-center px-8 py-4 text-base font-medium text-gray-700 dark:text-gray-200 glass border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:scale-105"
          >
            <Search className="w-5 h-5 mr-2" />
            Cek Status Registrasi
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Fitur Unggulan</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">Dibangun untuk kebutuhan LPK dalam mengelola registrasi SIM Card secara efisien dan aman.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-3xl border border-gray-100 dark:border-gray-800 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/10">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Formulir Dinamis</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Form berbasis JSON Schema dengan 12 tipe field, validasi Zod real-time, dan rendering otomatis per konfigurasi LPK.
            </p>
          </div>
          <div className="glass p-8 rounded-3xl border border-gray-100 dark:border-gray-800 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 md:-translate-y-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Keamanan Enterprise</h3>
            <p className="text-gray-600 dark:text-gray-400">
              JWT dengan TTL 15 menit, RBAC 4-level, validasi server-side, dan audit trail otomatis via PostgreSQL trigger.
            </p>
          </div>
          <div className="glass p-8 rounded-3xl border border-gray-100 dark:border-gray-800 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/10">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Multi-Tenant</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Setiap LPK memiliki form, branding, dan alur kerja mandiri. Super Admin mengelola seluruh platform.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Cara Kerja</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Isi Formulir', desc: 'Siswa mengakses URL form unik per-LPK dan mengisi data lengkap.' },
            { step: '2', title: 'Upload Dokumen', desc: 'Foto KTP, Paspor, dan Zairyu Card langsung dari kamera smartphone.' },
            { step: '3', title: 'Verifikasi', desc: 'Agent dan Admin memverifikasi data dan dokumen yang masuk.' },
            { step: '4', title: 'Selesai', desc: 'SIM Card diproses dan siswa menerima notifikasi status.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
                <span className="text-white font-bold text-lg">{item.step}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200/50 dark:border-gray-800/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            © 2026 JP Smart — Dynamic SIM Registration System v2.0
          </p>
        </div>
      </footer>
    </main>
  );
}
