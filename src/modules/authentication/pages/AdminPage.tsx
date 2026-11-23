import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Flag, Loader2, LogOut, ShieldCheck, Users } from 'lucide-react';
import fondoImage from '../../../assets/FondoP.jpeg';
import UsersTab from '../Components/admin/UsersTab';
import VerificationsTab from '../Components/admin/VerificationsTab';
import ReportsTab from '../Components/admin/ReportsTab';
import TaskReportsTab from '../Components/admin/TaskReportsTab';
import ThemeToggle from '../Components/ui/ThemeToggle';
import { useAdminTheme } from '../Hooks/useAdminTheme';
import { authStore } from '../services/authStore';
import { logoutAndRedirect } from '../services/logout';

type Tab = 'users' | 'verifications' | 'profileReports' | 'taskReports';

const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: 'users', label: 'Usuarios', icon: Users },
  { key: 'verifications', label: 'Verificaciones', icon: ShieldCheck },
  { key: 'profileReports', label: 'Reportes de perfil', icon: Flag },
  { key: 'taskReports', label: 'Reportes de tarea', icon: Flag },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('users');
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === 'dark';
  const adminEmail = authStore.getEmail();

  // En pantallas angostas las pestañas se deslizan: al cambiar de pestaña se centra la activa para que nunca quede oculta.
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = tabsRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    active?.scrollIntoView?.({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [tab]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logoutAndRedirect();
  };

  return (
    <div
      data-theme={theme}
      className="admin-theme relative min-h-screen w-full overflow-x-hidden bg-adm-bg px-4 py-5 text-adm-text transition-colors duration-500 sm:px-8 sm:py-10"
      style={{
        paddingTop: 'max(1.25rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Fondo modo día: la imagen de TaskIt suavizada con un velo claro */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
          isDark ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundImage: `url(${fondoImage})` }}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-[#f5f7ff]/80 backdrop-blur-[3px] transition-opacity duration-700 ${
          isDark ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Fondo modo noche: resplandores azules que se desplazan despacio */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#263BAA]/25 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-[#7183ff]/15 blur-3xl"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-5 flex items-center justify-between gap-3"
        >
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-adm-muted hover:bg-adm-hover hover:text-adm-hover-text"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> Volver al dashboard
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {adminEmail && (
              <span
                title={adminEmail}
                className="hidden max-w-[200px] items-center gap-2 truncate rounded-full border border-adm-line bg-adm-surface py-1 pl-1 pr-3 text-xs text-adm-muted md:flex"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#263BAA] text-[11px] font-bold uppercase text-white">
                  {adminEmail.charAt(0)}
                </span>
                <span className="truncate">{adminEmail}</span>
              </span>
            )}
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Cerrar sesión"
              className="flex h-10 items-center gap-2 rounded-full border border-rose-500/40 bg-adm-surface px-3 text-sm font-semibold text-adm-danger hover:bg-rose-500/15 hover:border-rose-500/60 disabled:opacity-60 sm:px-4"
            >
              {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              <span className="hidden sm:inline">{loggingOut ? 'Saliendo...' : 'Cerrar sesión'}</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex items-start gap-3.5"
        >
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#263BAA] to-[#5568e8] text-white shadow-[0_10px_24px_-8px_rgba(38,59,170,0.7)]">
            <ShieldCheck size={22} />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">Panel de administración</h1>
            <p className="mt-1 text-sm text-adm-muted">
              Usuarios, verificación de identidad y reportes de la comunidad de TaskIt.
            </p>
          </div>
        </motion.div>

        <div
          ref={tabsRef}
          className="mt-6 flex gap-1 overflow-x-auto border-b border-adm-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              aria-current={tab === key}
              className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3 py-2.5 text-sm font-medium sm:px-4 ${
                tab === key
                  ? 'bg-adm-surface text-adm-text'
                  : 'text-adm-muted hover:bg-adm-hover hover:text-adm-hover-text'
              }`}
            >
              <Icon size={15} /> {label}
              {tab === key && (
                <motion.span
                  layoutId="admin-tab-underline"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-adm-accent"
                />
              )}
            </button>
          ))}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="mt-6"
        >
          {tab === 'users' && <UsersTab />}
          {tab === 'verifications' && <VerificationsTab />}
          {tab === 'profileReports' && <ReportsTab />}
          {tab === 'taskReports' && <TaskReportsTab />}
        </motion.div>
      </div>
    </div>
  );
}
