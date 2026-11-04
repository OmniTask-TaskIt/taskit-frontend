import { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { authStore } from '../../authentication/services/authStore';
import { useTasks } from '../hooks/useTasks';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useTaskActions } from '../hooks/useTaskActions';
import type { Task, TaskDialog, TaskFormValues } from '../types/task.types';
import TaskHeader from '../components/TaskHeader';
import TaskSummary from '../components/TaskSummary';
import TaskTabs from '../components/TaskTabs';
import TaskFilters from '../components/TaskFilters';
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';
import TaskForm from '../components/TaskForm';
import TaskDetail from '../components/TaskDetail';
import TaskErrorState from '../components/TaskErrorState';
import { taskSurface } from '../styles/taskStyles';

const initialForm: TaskFormValues = { title: '', description: '', price: '', category: 'ARREGLOS' };

export default function TaskModule() {
  const currentUser = authStore.getUserId() ?? authStore.getEmail() ?? '';
  const { tasks, loading, error, setError, load } = useTasks(currentUser);
  const { filters, setFilters, tab, setTab, visibleTasks, owned, assigned, completed } = useTaskFilters(tasks, currentUser);
  const actions = useTaskActions(load, currentUser);
  const [selected, setSelected] = useState<Task | null>(null);
  const [dialog, setDialog] = useState<TaskDialog>(null);
  const [form, setForm] = useState(initialForm);
  const close = () => { setDialog(null); setSelected(null); };
  const submit = async () => { if (!currentUser) { setError('No encontramos tu usuario autenticado. Inicia sesión nuevamente.'); return; } if (!form.title.trim() || !form.description.trim() || !form.price || Number(form.price) <= 0) { setError('Completa todos los campos con un precio válido.'); return; } if (await actions.create(form)) { setForm(initialForm); close(); } };
  const accept = async (task: Task) => { if (await actions.accept(task.taskId)) close(); };
  return <section className="mx-auto w-full max-w-[1400px] pb-4">
    <TaskHeader onCreate={() => setDialog('create')} />
    <TaskSummary owned={owned} assigned={assigned} completed={completed} available={tasks.filter((task) => task.taskStatus === 'ACTIVE').length} />
    <div className={`${taskSurface} p-3 sm:p-5`}>
      <TaskTabs tab={tab} setTab={setTab} sort={filters.sort} setSort={(sort) => setFilters({ ...filters, sort })} />
      {tab === 'explore' && <TaskFilters filters={filters} setFilters={setFilters} />}
      {actions.notice && <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#bde5cd] bg-[#edfbf2] px-4 py-3 text-sm font-semibold text-[#177245]" role="status"><CheckCircle2 size={17} />{actions.notice}<button type="button" className="ml-auto" onClick={() => actions.setNotice('')} aria-label="Cerrar mensaje"><X size={16} /></button></div>}
      {(error || actions.error) && <TaskErrorState message={error || actions.error} onClose={() => { setError(''); actions.setError(''); }} />}
      <TaskList tasks={visibleTasks} loading={loading} hasTasks={tasks.length > 0} onSelect={setSelected} onAccept={(task) => { setSelected(task); setDialog('accept'); }} />
    </div>
    {selected && !dialog && <TaskModal title="Detalle de la tarea" onClose={close}><TaskDetail task={selected} onClose={close} onAccept={() => setDialog('accept')} /></TaskModal>}
    {dialog === 'create' && <TaskModal title="Publicar una tarea" onClose={close}><TaskForm value={form} onChange={setForm} onCancel={close} onSubmit={submit} /></TaskModal>}
    {dialog === 'accept' && selected && <TaskModal title="Aceptar tarea" onClose={close}><p className="text-sm text-[#657399]">Confirma que deseas aceptar esta tarea. El servicio quedará asignado a tu cuenta.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={close} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#657399]">Cancelar</button><button type="button" onClick={() => accept(selected)} className="rounded-xl bg-[#263BAA] px-4 py-2.5 text-sm font-bold text-white">Confirmar</button></div></TaskModal>}
  </section>;
}
