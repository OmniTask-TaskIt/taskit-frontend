import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import AitaProviderSearch from '../../aita/components/AitaProviderSearch';
import { authStore } from '../../authentication/services/authStore';
import { useTasks } from '../hooks/useTasks';
import { useTaskCategories } from '../hooks/useTaskCategories';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useTaskActions } from '../hooks/useTaskActions';
import type { Task, TaskDialog, TaskFormValues, TaskTab } from '../types/task.types';
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

function readCreatedTaskId(created: unknown): string {
  if (!created || typeof created !== 'object') return '';
  const record = created as Record<string, unknown>;
  for (const key of ['taskId', 'id', 'task_id']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

function asPublishedTask(created: unknown, form: TaskFormValues, owner: string): Task {
  const taskId = readCreatedTaskId(created);
  const title = form.title.trim();
  const description = form.description.trim();
  return {
    taskId,
    taskName: title,
    taskDescription: description,
    taskStatus: 'ACTIVE',
    taskOwner: owner,
    creationDate: new Date().toISOString(),
    category: form.category,
    price: Number(form.price),
    ownerApproval: false,
    assigneeApproval: false,
    title,
    description,
    status: 'ACTIVE',
    ownerId: owner,
  };
}

export default function TaskModule({ focusTaskId = null }: { focusTaskId?: string | null }) {
  const currentUser = authStore.getUserId() ?? authStore.getEmail() ?? '';
  const role = (authStore.getRole() ?? '').toUpperCase();
  const isProvider = role === 'PROVIDER';
  const isSeeker = role === 'SEEKER';
  const { categories, loading: categoriesLoading } = useTaskCategories();
  const categoryValues = useMemo(() => categories.filter((category) => category.value !== 'ALL').map((category) => category.value), [categories]);
  const { tasks, loading, error, setError, load } = useTasks(currentUser, categoryValues, categoriesLoading);
  const initialTab: TaskTab = isSeeker ? 'created' : 'explore';
  const { filters, setFilters, tab, setTab, visibleTasks, owned, assigned, completed } = useTaskFilters(tasks, currentUser, initialTab);
  const actions = useTaskActions(load, currentUser);
  const [selected, setSelected] = useState<Task | null>(null);
  const [dialog, setDialog] = useState<TaskDialog>(null);
  const [form, setForm] = useState(initialForm);
  const [publishedTask, setPublishedTask] = useState<Task | null>(null);
  const allowedTabs: TaskTab[] = isProvider ? ['explore', 'assigned', 'completed'] : ['created', 'assigned', 'completed'];
  const close = () => { setDialog(null); setSelected(null); };
  const canManage = (task: Task) => task.ownerId === currentUser;

  useEffect(() => {
    if (!focusTaskId) return;
    const match = tasks.find((task) => task.taskId === focusTaskId);
    if (match) setSelected(match);
  }, [focusTaskId, tasks]);

  const openEdit = (task: Task) => {
    setSelected(task);
    setForm({ title: task.taskName, description: task.taskDescription, price: String(task.price), category: task.category });
    setDialog('edit');
  };
  const openDelete = (task: Task) => { setSelected(task); setDialog('delete'); };

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.price || Number(form.price) <= 0) {
      setError('Completa todos los campos con un precio válido.');
      return;
    }
    if (dialog === 'edit' && selected) {
      const ok = await actions.update(selected.taskId, form);
      if (ok) { setForm(initialForm); close(); }
      return;
    }
    const created = await actions.create(form);
    if (!created) return;
    setPublishedTask(asPublishedTask(created, form, currentUser));
    setForm(initialForm);
    setDialog(null);
    setSelected(null);
  };

  const accept = async (task: Task) => {
    if (isProvider && task.ownerId !== currentUser && await actions.accept(task.taskId)) close();
  };
  const remove = async () => {
    if (selected && canManage(selected) && await actions.remove(selected.taskId)) close();
  };

  const seekerOwnsSelected = Boolean(selected && isSeeker && canManage(selected));
  const providerCanReview = Boolean(selected && isProvider && selected.ownerId !== currentUser && selected.status === 'ACTIVE');

  return (
    <section className="mx-auto w-full max-w-[1400px] pb-4">
      <TaskHeader onCreate={isSeeker ? () => setDialog('create') : undefined} onRefresh={() => { void load(); }} loading={loading} />
      <TaskSummary owned={owned} assigned={assigned} completed={completed} available={tasks.filter((task) => task.taskStatus === 'ACTIVE' && task.ownerId !== currentUser).length} />
      <div className={`${taskSurface} p-3 sm:p-5`}>
        <TaskTabs tab={tab} setTab={(next) => { if (next !== tab) { setTab(next); void load(); } }} sort={filters.sort} setSort={(sort) => setFilters({ ...filters, sort })} allowedTabs={allowedTabs} />
        {isProvider && tab === 'explore' && <TaskFilters filters={filters} setFilters={setFilters} categories={categories} />}
        {actions.notice && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#bde5cd] bg-[#edfbf2] px-4 py-3 text-sm font-semibold text-[#177245]" role="status">
            <CheckCircle2 size={17} />{actions.notice}
            <button type="button" className="ml-auto" onClick={() => actions.setNotice('')} aria-label="Cerrar mensaje"><X size={16} /></button>
          </div>
        )}
        {(error || actions.error) && <TaskErrorState message={error || actions.error} onRetry={error ? () => { void load(); } : undefined} retryDisabled={loading} onClose={() => { setError(''); actions.setError(''); }} />}
        <TaskList tasks={visibleTasks} loading={loading} hasTasks={tasks.length > 0} onSelect={setSelected} onAccept={accept} canAccept={(task) => isProvider && task.ownerId !== currentUser} onEdit={isSeeker ? openEdit : undefined} onDelete={isSeeker ? openDelete : undefined} canComplete={(task) => tab === 'assigned' && task.assigneeId === currentUser} currentUserId={currentUser} />
      </div>
      {selected && !dialog && (
        <TaskModal title="Detalle de la tarea" onClose={close}>
          <TaskDetail
            task={selected}
            onClose={close}
            onAccept={() => setDialog('accept')}
            canAccept={isProvider && selected.ownerId !== currentUser}
            onEdit={isSeeker && canManage(selected) ? () => openEdit(selected) : undefined}
            onDelete={isSeeker && canManage(selected) ? () => openDelete(selected) : undefined}
            showSuggestions={seekerOwnsSelected}
            showShield={providerCanReview}
          />
        </TaskModal>
      )}
      {(dialog === 'create' || dialog === 'edit') && (
        <TaskModal title={dialog === 'edit' ? 'Editar tarea' : 'Publicar una tarea'} onClose={close}>
          <TaskForm value={form} onChange={setForm} onCancel={close} onSubmit={submit} submitLabel={dialog === 'edit' ? 'Guardar cambios' : 'Publicar tarea'} />
        </TaskModal>
      )}
      {publishedTask && (
        <TaskModal title="Tarea publicada" onClose={() => setPublishedTask(null)}>
          <p className="text-sm text-[#657399]">Tu tarea ya está publicada. Estos son los profesionales que AITA recomienda para invitar.</p>
          {publishedTask.taskId
            ? <AitaProviderSearch task={publishedTask} />
            : <p className="mt-3 text-sm text-[#5b6685]">La tarea se guardó, pero no llegó su identificador. Ábrela en el detalle para ver las sugerencias.</p>}
        </TaskModal>
      )}
      {dialog === 'delete' && selected && (
        <TaskModal title="Eliminar tarea" onClose={close}>
          <p className="text-sm text-[#657399]">Esta acción no se puede deshacer. ¿Deseas eliminar esta tarea?</p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={close} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#657399]">Cancelar</button>
            <button type="button" onClick={() => { void remove(); }} className="rounded-xl bg-[#b42318] px-4 py-2.5 text-sm font-bold text-white">Eliminar</button>
          </div>
        </TaskModal>
      )}
      {dialog === 'accept' && selected && (
        <TaskModal title="Aceptar tarea" onClose={close}>
          <p className="text-sm text-[#657399]">Confirma que deseas aceptar esta tarea.</p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={close} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#657399]">Cancelar</button>
            <button type="button" onClick={() => { void accept(selected); }} className="rounded-xl bg-[#263BAA] px-4 py-2.5 text-sm font-bold text-white">Confirmar</button>
          </div>
        </TaskModal>
      )}
    </section>
  );
}
