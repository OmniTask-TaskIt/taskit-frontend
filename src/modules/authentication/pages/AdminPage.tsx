import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flag, ShieldCheck, Users } from 'lucide-react';
import UsersTab from '../Components/admin/UsersTab';
import VerificationsTab from '../Components/admin/VerificationsTab';
import ReportsTab from '../Components/admin/ReportsTab';

type Tab = 'users' | 'verifications' | 'reports';

const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: 'users', label: 'Usuarios', icon: Users },
  { key: 'verifications', label: 'Verificaciones', icon: ShieldCheck },
  { key: 'reports', label: 'Reportes', icon: Flag },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('users');

  return (
    <div className="min-h-screen w-full bg-[#0B132B] px-4 py-6 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Volver al dashboard
        </Link>

        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <p className="mt-1 text-sm text-white/50">
          Usuarios, verificación de identidad y reportes de la comunidad de TaskIt.
        </p>

        <div className="mt-6 flex gap-2 border-b border-white/10 pb-px">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              aria-current={tab === key}
              className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === key ? 'bg-white/5 text-white border-b-2 border-[#263BAA]' : 'text-white/50 hover:text-white'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'users' && <UsersTab />}
          {tab === 'verifications' && <VerificationsTab />}
          {tab === 'reports' && <ReportsTab />}
        </div>
      </div>
    </div>
  );
}
