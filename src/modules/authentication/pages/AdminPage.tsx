import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flag, ShieldCheck, Users } from 'lucide-react';
import fondoImage from '../../../assets/FondoP.jpeg';
import UsersTab from '../Components/admin/UsersTab';
import VerificationsTab from '../Components/admin/VerificationsTab';
import ReportsTab from '../Components/admin/ReportsTab';
import TaskReportsTab from '../Components/admin/TaskReportsTab';

type Tab = 'users' | 'verifications' | 'profileReports' | 'taskReports';

const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: 'users', label: 'Usuarios', icon: Users },
  { key: 'verifications', label: 'Verificaciones', icon: ShieldCheck },
  { key: 'profileReports', label: 'Reportes de perfil', icon: Flag },
  { key: 'taskReports', label: 'Reportes de tarea', icon: Flag },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('users');

  return (
    <div
      className="relative min-h-screen w-full bg-[#eef2fb] bg-cover bg-center px-4 py-6 text-[#17213f] sm:px-8 sm:py-10"
      style={{ backgroundImage: `url(${fondoImage})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#f5f7ff]/80 backdrop-blur-[3px]" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#5b6685] hover:text-[#17213f] transition-colors"
        >
          <ArrowLeft size={16} /> Volver al dashboard
        </Link>

        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <p className="mt-1 text-sm text-[#5b6685]">
          Usuarios, verificación de identidad y reportes de la comunidad de TaskIt.
        </p>

        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#e2e5f5] pb-px">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              aria-current={tab === key}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3 py-2.5 sm:px-4 text-sm font-medium transition-colors ${
                tab === key ? 'bg-white text-[#17213f] border-b-2 border-[#263BAA]' : 'text-[#5b6685] hover:text-[#17213f]'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'users' && <UsersTab />}
          {tab === 'verifications' && <VerificationsTab />}
          {tab === 'profileReports' && <ReportsTab />}
          {tab === 'taskReports' && <TaskReportsTab />}
        </div>
      </div>
    </div>
  );
}
