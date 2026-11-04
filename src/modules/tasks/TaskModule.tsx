import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowDownUp,
  CheckCircle2,
  ClipboardList,
  Filter,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { axiosInstance } from '../authentication/Config/axios';
import { authStore } from '../authentication/services/authStore';

export type TaskStatus = 'ACTIVE' | 'ASSIGNED' | 'COMPLETED' | 'REPORTED' | 'DISPUTED' | 'CANCELLED';
type TaskCategory = 'ARREGLOS' | 'EDUCACION';
type Tab = 'explore' | 'created' | 'assigned' | 'completed';
type Dialog = 'create' | 'delete' | 'accept' | 'report' | 'dispute' | 'approve' | null;

export interface Task {
  id: string;
  title: string;
  description: string;
  price: number;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: string;
  ownerId: string;
  assigneeId?: string | null;
  ownerApproved?: boolean;
  assigneeApproved?: boolean;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  ACTIVE: 'Disponible', ASSIGNED: 'Asignada', COMPLETED: 'Completada',
  REPORTED: 'Reportada', DISPUTED: 'Disputada', CANCELLED: 'Cancelada',
};
const STATUS_COLORS: Record<TaskStatus, string> = {
  ACTIVE: 'bg-[#e8edff] text-[#263BAA]', ASSIGNED: 'bg-[#fff1d8] text-[#9a5b00]',
  COMPLETED: 'bg-[#e4f8ed] text-[#177245]', REPORTED: 'bg-[#fff0f2] text-[#b64055]',
  DISPUTED: 'bg-[#f1eaff] text-[#7650b5]', CANCELLED: 'bg-[#edf0f5] text-[#59647d]',
};

const formatPrice = (price: number) => `$${new Intl.NumberFormat('es-CO').format(price)}`;
const formatDate = (date: string) => new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
const unwrapTasks = (data: unknown): Task[] => {
  if (Array.isArray(data)) return data as Task[];
  if (data && typeof data === 'object') {
    const value = data as { content?: unknown; tasks?: unknown; data?: unknown };
    if (Array.isArray(value.content)) return value.content as Task[];
    if (Array.isArray(value.tasks)) return value.tasks as Task[];
    if (Array.isArray(value.data)) return value.data as Task[];
  }
  return [];
};

async function taskRequest(method: 'post' | 'put' | 'delete', url: string, data?: unknown) {
  return axiosInstance.request({ method, url, data });
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof ClipboardList; label: string; value: number; tone: string }) {
  return <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_8px_24px_rgba(47,61,110,0.06)] backdrop-blur-sm">
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></div>
    <div className="min-w-0"><p className="truncate text-2xl font-bold tracking-tight text-[#0B132B]">{value}</p><p className="truncate text-xs font-medium text-[#5b6685]">{label}</p></div>
  </div>;
}

function TaskCard({ task, onSelect, onAccept }: { task: Task; onSelect: () => void; onAccept: () => void }) {
  return <article className="group rounded-2xl border border-white/90 bg-white/85 p-5 shadow-[0_10px_28px_rgba(47,61,110,0.07)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(47,61,110,0.12)]">
    <div className="mb-4 flex items-start justify-between gap-3"><span className="rounded-full bg-[#f0f2ff] px-2.5 py-1 text-[11px] font-semibold text-[#263BAA]">{task.category === 'ARREGLOS' ? 'Arreglos' : 'Educación'}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span></div>
    <button onClick={onSelect} className="block w-full text-left"><h3 className="line-clamp-1 text-base font-bold text-[#0B132B]">{task.title}</h3><p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-[#5b6685]">{task.description}</p></button>
    <div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-lg font-extrabold text-[#263BAA]">{formatPrice(task.price)}</p><p className="mt-1 text-[11px] text-[#8290ae]">Publicado {formatDate(task.createdAt)}</p></div><div className="flex gap-2"><button onClick={onSelect} className="rounded-xl border border-[#dce2f7] px-3 py-2 text-xs font-semibold text-[#263BAA] transition hover:bg-[#f2f4ff]">Ver detalle</button>{task.status === 'ACTIVE' && <button onClick={onAccept} className="rounded-xl bg-[#263BAA] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1d2e92]">Aceptar</button>}</div></div>
  </article>;
}

function DialogShell({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B132B]/35 p-4 backdrop-blur-sm" role="presentation" onMouseDown={onClose}><motion.div initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-lg rounded-3xl border border-white bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title" onMouseDown={event => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><h2 id="task-dialog-title" className="text-lg font-bold text-[#0B132B]">{title}</h2><button onClick={onClose} className="rounded-lg p-2 text-[#70809f] hover:bg-[#f1f3fa]" aria-label="Cerrar"><X size={19} /></button></div>{children}</motion.div></div>;
}

export default function TaskModule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Task | null>(null);
  const [tab, setTab] = useState<Tab>('explore');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('recent');
  const [reason, setReason] = useState('');
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'ARREGLOS' as TaskCategory });
  const currentUser = authStore.getEmail() ?? '';

  const loadTasks = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await axiosInstance.get('/tasks'); setTasks(unwrapTasks(response.data)); }
    catch { setError('No pudimos conectar con el backend. Intenta nuevamente en unos momentos.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadTasks(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadTasks]);

  const owned = useMemo(() => tasks.filter(task => task.ownerId === currentUser), [tasks, currentUser]);
  const assigned = useMemo(() => tasks.filter(task => task.assigneeId === currentUser), [tasks, currentUser]);
  const completed = useMemo(() => tasks.filter(task => task.status === 'COMPLETED' && (task.ownerId === currentUser || task.assigneeId === currentUser)), [tasks, currentUser]);
  const visibleTasks = useMemo(() => {
    let result = tab === 'created' ? owned : tab === 'assigned' ? assigned : tab === 'completed' ? completed : tasks;
    if (tab === 'explore') result = result.filter(task => task.status === 'ACTIVE');
    const normalized = query.trim().toLowerCase();
    result = result.filter(task => (!normalized || `${task.title} ${task.description}`.toLowerCase().includes(normalized)) && (category === 'ALL' || task.category === category) && (!minPrice || task.price >= Number(minPrice)) && (!maxPrice || task.price <= Number(maxPrice)));
    return [...result].sort((a, b) => sort === 'price' ? a.price - b.price : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, tab, owned, assigned, completed, query, category, minPrice, maxPrice, sort]);

  const runAction = async (action: () => Promise<unknown>, message: string) => { try { await action(); setNotice(message); setDialog(null); setSelected(null); setReason(''); await loadTasks(); } catch { setError('La acción no pudo completarse. Revisa el estado de la tarea e inténtalo de nuevo.'); } };
  const createTask = async () => { if (!form.title.trim() || !form.description.trim() || !form.price || Number(form.price) <= 0) return setError('Completa todos los campos con un precio válido.'); await runAction(() => taskRequest('post', '/tasks', { title: form.title, description: form.description, price: Number(form.price), category: form.category }), 'Tarea publicada correctamente.'); setForm({ title: '', description: '', price: '', category: 'ARREGLOS' }); };
  const actOnSelected = (action: Dialog) => { if (!selected) return; const id = selected.id; if (action === 'accept') void runAction(() => taskRequest('post', `/tasks/${id}/accept`), 'Tarea aceptada.'); if (action === 'delete') void runAction(() => taskRequest('delete', `/tasks/${id}`), 'Tarea eliminada.'); if (action === 'approve') void runAction(() => taskRequest('post', `/tasks/${id}/approve`), 'Finalización aprobada.'); if (action === 'report' || action === 'dispute') { if (!reason.trim()) return setError('Escribe un motivo para continuar.'); void runAction(() => taskRequest('post', `/tasks/${id}/${action}`, { reason }), action === 'report' ? 'Tarea reportada.' : 'Disputa registrada.'); } };

  return <section className="mx-auto w-full max-w-[1400px] pb-4">
    <header className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#657399]"><ClipboardList size={15} className="text-[#263BAA]" /> Espacio de trabajo</div><h1 className="text-3xl font-extrabold tracking-tight text-[#0B132B] sm:text-4xl">Gestión de tareas</h1><p className="mt-2 max-w-xl text-sm text-[#5b6685] sm:text-base">Publica, encuentra y administra tus tareas en un solo lugar.</p></div><button onClick={() => setDialog('create')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#263BAA] px-5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(38,59,170,0.25)] transition hover:bg-[#1d2e92]"><Plus size={18} /> Publicar tarea</button></header>
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard icon={ClipboardList} label="Tareas creadas" value={owned.length} tone="bg-[#eef1ff] text-[#263BAA]" /><StatCard icon={UserRound} label="Tareas asignadas" value={assigned.length} tone="bg-[#fff1d8] text-[#9a5b00]" /><StatCard icon={CheckCircle2} label="Tareas completadas" value={completed.length} tone="bg-[#e4f8ed] text-[#177245]" /><StatCard icon={Search} label="Tareas disponibles" value={tasks.filter(task => task.status === 'ACTIVE').length} tone="bg-[#f1eaff] text-[#7650b5]" /></div>
    <div className="rounded-3xl border border-white/90 bg-white/55 p-3 shadow-[0_15px_40px_rgba(47,61,110,0.07)] backdrop-blur-sm sm:p-5"><div className="mb-5 flex flex-col gap-3 border-b border-[#e8ebf5] pb-4 md:flex-row md:items-center md:justify-between"><div className="flex gap-1 overflow-x-auto">{[['explore', 'Explorar tareas'], ['created', 'Mis tareas creadas'], ['assigned', 'Tareas asignadas'], ['completed', 'Completadas']].map(([key, label]) => <button key={key} onClick={() => setTab(key as Tab)} className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-bold transition sm:px-4 ${tab === key ? 'bg-[#263BAA] text-white shadow-md' : 'text-[#657399] hover:bg-[#eef1ff] hover:text-[#263BAA]'}`}>{label}</button>)}</div><div className="flex items-center gap-2"><ArrowDownUp size={15} className="text-[#8290ae]" /><select value={sort} onChange={event => setSort(event.target.value)} className="rounded-lg border-0 bg-transparent text-xs font-semibold text-[#5b6685] outline-none"><option value="recent">Más recientes</option><option value="price">Precio</option></select></div></div>
      {tab === 'explore' && <div className="mb-5 grid gap-3 rounded-2xl bg-[#f6f7fc] p-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_0.7fr_0.7fr_auto] lg:items-center"><label className="relative sm:col-span-2 lg:col-span-1"><Search size={16} className="absolute left-3 top-3 text-[#8290ae]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por palabra clave" className="h-10 w-full rounded-xl border border-[#e0e5f3] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#263BAA]" /></label><select value={category} onChange={event => setCategory(event.target.value)} className="h-10 rounded-xl border border-[#e0e5f3] bg-white px-3 text-sm text-[#5b6685] outline-none focus:border-[#263BAA]"><option value="ALL">Todas las categorías</option><option value="ARREGLOS">Arreglos</option><option value="EDUCACION">Educación</option></select><input value={minPrice} onChange={event => setMinPrice(event.target.value)} type="number" min="0" placeholder="Precio mín." className="h-10 rounded-xl border border-[#e0e5f3] bg-white px-3 text-sm outline-none focus:border-[#263BAA]" /><input value={maxPrice} onChange={event => setMaxPrice(event.target.value)} type="number" min="0" placeholder="Precio máx." className="h-10 rounded-xl border border-[#e0e5f3] bg-white px-3 text-sm outline-none focus:border-[#263BAA]" /><span className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-[#263BAA]"><Filter size={15} /> Filtros activos</span></div>}
      {notice && <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#bde5cd] bg-[#edfbf2] px-4 py-3 text-sm font-semibold text-[#177245]" role="status"><CheckCircle2 size={17} /> {notice}<button className="ml-auto" onClick={() => setNotice('')} aria-label="Cerrar mensaje"><X size={16} /></button></div>}{error && <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#f1ccd2] bg-[#fff3f4] px-4 py-3 text-sm text-[#a73e51]" role="alert"><AlertCircle size={17} /><span>{error}</span><button className="ml-auto" onClick={() => setError('')} aria-label="Cerrar error"><X size={16} /></button></div>}
      {loading ? <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map(item => <div key={item} className="h-48 animate-pulse rounded-2xl bg-white/80" />)}</div> : visibleTasks.length === 0 ? <div className="rounded-2xl border border-dashed border-[#cfd7ef] px-6 py-16 text-center"><Search size={28} className="mx-auto mb-3 text-[#9aa6c2]" /><h3 className="font-bold text-[#0B132B]">{tasks.length === 0 ? 'Aún no hay tareas' : 'No encontramos resultados'}</h3><p className="mx-auto mt-1 max-w-md text-sm text-[#70809f]">{tasks.length === 0 ? 'Publica tu primera tarea o vuelve a intentarlo cuando haya nuevas oportunidades.' : 'Prueba con otra palabra clave, categoría o rango de precio.'}</p></div> : <div className="grid gap-4 md:grid-cols-2">{visibleTasks.map(task => <TaskCard key={task.id} task={task} onSelect={() => setSelected(task)} onAccept={() => { setSelected(task); setDialog('accept'); }} />)}</div>}
    </div>
    <AnimatePresence>{selected && !dialog && <DialogShell title="Detalle de la tarea" onClose={() => setSelected(null)}><div className="space-y-5"><div><div className="mb-3 flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[selected.status]}`}>{STATUS_LABELS[selected.status]}</span><span className="text-xs text-[#8290ae]">{formatDate(selected.createdAt)}</span></div><h3 className="text-2xl font-extrabold text-[#0B132B]">{selected.title}</h3><p className="mt-3 text-sm leading-6 text-[#5b6685]">{selected.description}</p></div><div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#f6f7fc] p-4 text-sm"><div><p className="text-xs text-[#8290ae]">Precio</p><p className="mt-1 font-bold text-[#263BAA]">{formatPrice(selected.price)}</p></div><div><p className="text-xs text-[#8290ae]">Categoría</p><p className="mt-1 font-semibold text-[#0B132B]">{selected.category === 'ARREGLOS' ? 'Arreglos' : 'Educación'}</p></div><div><p className="text-xs text-[#8290ae]">Dueño</p><p className="mt-1 truncate font-semibold text-[#0B132B]">{selected.ownerId}</p></div><div><p className="text-xs text-[#8290ae]">Asignado</p><p className="mt-1 truncate font-semibold text-[#0B132B]">{selected.assigneeId || 'Sin asignar'}</p></div></div><div className="flex flex-wrap gap-2"><button onClick={() => setDialog('report')} className="rounded-xl border border-[#e4c5cc] px-3 py-2 text-xs font-semibold text-[#a73e51]">Reportar</button><button onClick={() => setDialog('dispute')} className="rounded-xl border border-[#d8c9ee] px-3 py-2 text-xs font-semibold text-[#7650b5]">Disputar</button>{selected.status === 'ACTIVE' && <>{selected.ownerId === currentUser && <><button onClick={() => setNotice('La edición se habilitará cuando el backend exponga este formulario.')} className="rounded-xl border border-[#dce2f7] px-3 py-2 text-xs font-semibold text-[#263BAA]"><Pencil size={14} className="mr-1 inline" /> Editar</button><button onClick={() => setDialog('delete')} className="rounded-xl border border-[#e4c5cc] px-3 py-2 text-xs font-semibold text-[#a73e51]"><Trash2 size={14} className="mr-1 inline" /> Eliminar</button></>}{selected.ownerId !== currentUser && <button onClick={() => setDialog('accept')} className="rounded-xl bg-[#263BAA] px-4 py-2 text-xs font-bold text-white">Aceptar tarea</button>}</>}{selected.status === 'ASSIGNED' && selected.assigneeId === currentUser && <button onClick={() => setDialog('approve')} className="rounded-xl bg-[#263BAA] px-4 py-2 text-xs font-bold text-white">Aprobar finalización</button>}</div></div></DialogShell>}</AnimatePresence>
    {dialog === 'create' && <DialogShell title="Publicar una tarea" onClose={() => setDialog(null)}><div className="space-y-4"><label className="block text-sm font-semibold text-[#2f3b63]">Nombre de la tarea<input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe4f2] px-3 text-sm outline-none focus:border-[#263BAA]" placeholder="Ej. Reparar una llave de agua" /></label><label className="block text-sm font-semibold text-[#2f3b63]">Descripción<textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} rows={4} className="mt-1.5 w-full resize-none rounded-xl border border-[#dfe4f2] px-3 py-3 text-sm outline-none focus:border-[#263BAA]" placeholder="Describe lo que necesitas con claridad" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-[#2f3b63]">Precio<input value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} type="number" min="1" className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe4f2] px-3 text-sm outline-none focus:border-[#263BAA]" placeholder="$ 0" /></label><label className="block text-sm font-semibold text-[#2f3b63]">Categoría<select value={form.category} onChange={event => setForm({ ...form, category: event.target.value as TaskCategory })} className="mt-1.5 h-11 w-full rounded-xl border border-[#dfe4f2] bg-white px-3 text-sm outline-none focus:border-[#263BAA]"><option value="ARREGLOS">Arreglos</option><option value="EDUCACION">Educación</option></select></label></div><div className="flex justify-end gap-3 pt-2"><button onClick={() => setDialog(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#657399]">Cancelar</button><button onClick={() => void createTask()} className="rounded-xl bg-[#263BAA] px-4 py-2.5 text-sm font-bold text-white">Publicar tarea</button></div></div></DialogShell>}
    {dialog && ['delete', 'accept', 'approve'].includes(dialog) && selected && <DialogShell title={dialog === 'delete' ? 'Eliminar tarea' : dialog === 'accept' ? 'Aceptar tarea' : 'Aprobar finalización'} onClose={() => setDialog(null)}><div className="space-y-5"><div className="flex gap-3 rounded-2xl bg-[#f6f7fc] p-4"><ShieldAlert size={20} className="mt-0.5 shrink-0 text-[#263BAA]" /><p className="text-sm leading-5 text-[#5b6685]">{dialog === 'delete' ? 'Esta acción no se puede deshacer. ¿Quieres eliminar esta tarea?' : dialog === 'accept' ? 'Confirma que deseas aceptar esta tarea y comenzar a trabajar en ella.' : 'Confirma que la tarea fue completada correctamente.'}</p></div><div className="flex justify-end gap-3"><button onClick={() => setDialog(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#657399]">Cancelar</button><button onClick={() => actOnSelected(dialog)} className="rounded-xl bg-[#263BAA] px-4 py-2.5 text-sm font-bold text-white">Confirmar</button></div></div></DialogShell>}
    {dialog && ['report', 'dispute'].includes(dialog) && selected && <DialogShell title={dialog === 'report' ? 'Reportar tarea' : 'Disputar tarea'} onClose={() => setDialog(null)}><div className="space-y-4"><p className="text-sm text-[#5b6685]">Cuéntanos el motivo para que podamos revisar esta situación.</p><textarea value={reason} onChange={event => setReason(event.target.value)} rows={5} className="w-full resize-none rounded-xl border border-[#dfe4f2] px-3 py-3 text-sm outline-none focus:border-[#263BAA]" placeholder="Escribe un motivo obligatorio" /><div className="flex justify-end gap-3"><button onClick={() => setDialog(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#657399]">Cancelar</button><button onClick={() => actOnSelected(dialog)} className="rounded-xl bg-[#263BAA] px-4 py-2.5 text-sm font-bold text-white">Enviar</button></div></div></DialogShell>}
  </section>;
}
