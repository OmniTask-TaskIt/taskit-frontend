import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileService } from '../../authentication/services/profileService';
import type { Task } from '../../tasks/types/task.types';
import { useAitaMatchmaking } from '../hooks/useAitaMatchmaking';
import { isAitaCategory } from '../mappers/aita.mappers';
import type { MatchResult } from '../types/aita.types';
import AitaAlert from './AitaAlert';
import AitaThinking from './AitaThinking';

function percent(score: number) {
  return `${Math.round(Math.max(0, score) * 100)}%`;
}

function ProviderSuggestion({ match }: { match: MatchResult }) {
  const [name, setName] = useState(match.provider_id);

  useEffect(() => {
    let active = true;
    profileService
      .getProfile(match.provider_id)
      .then((profile) => {
        if (!active) return;
        const label = profile.fullName?.trim();
        if (label) setName(label);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [match.provider_id]);

  return (
    <li className="rounded-xl border border-violet-200 bg-white px-3 py-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-[#0B132B]">{name}</span>
        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-800">{percent(match.score)}</span>
      </div>
      {match.rationale && <p className="mt-1 text-xs leading-relaxed text-[#5b6685]">{match.rationale}</p>}
      <Link
        to={`/profile/${encodeURIComponent(match.provider_id)}`}
        className="mt-2 inline-flex rounded-lg bg-[#263BAA] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a297a]"
      >
        Invitar
      </Link>
    </li>
  );
}

export default function AitaProviderSearch({ task }: { task: Task }) {
  const { indexTask, search } = useAitaMatchmaking();
  const index = indexTask.execute;
  const find = search.execute;
  const busy = indexTask.isLoading || search.isLoading;
  const taskName = task.taskName || task.title || '';
  const taskDescription = task.taskDescription || task.description || '';
  const canSearch = Boolean(task.taskId && taskName && taskDescription && isAitaCategory(task.category));

  useEffect(() => {
    if (!canSearch || !isAitaCategory(task.category)) return undefined;
    const payload = {
      task_id: task.taskId,
      task_name: taskName,
      task_description: taskDescription,
      category: task.category,
    };
    let active = true;
    void (async () => {
      await index(payload);
      if (!active) return;
      await find({ ...payload, limit: 5 });
    })();
    return () => {
      active = false;
    };
  }, [canSearch, find, index, task.category, task.taskId, taskDescription, taskName]);

  return (
    <section className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
      <h3 className="text-sm font-bold text-[#0B132B]">✨ AITA te sugiere estos profesionales</h3>
      <p className="mt-1 text-xs text-[#5b6685]">Compatibles con esta tarea. Puedes enviarles una invitación directa.</p>
      {busy && <div className="mt-3"><AitaThinking label="AITA está buscando profesionales..." /></div>}
      {!canSearch && <p className="mt-3 text-xs text-[#5b6685]">Esta tarea no tiene datos suficientes para buscar profesionales.</p>}
      {indexTask.error && <div className="mt-3"><AitaAlert message={indexTask.error} onDismiss={indexTask.reset} /></div>}
      {search.error && <div className="mt-3"><AitaAlert message={search.error} onDismiss={search.reset} /></div>}
      {search.data && search.data.length === 0 && (
        <p className="mt-3 text-xs text-[#5b6685]">Todavía no hay profesionales indexados compatibles. Puedes seguir publicando la tarea y contactarlos desde el directorio.</p>
      )}
      {search.data && search.data.length > 0 && (
        <ul className="mt-3 space-y-2">
          {search.data.map((match) => <ProviderSuggestion key={match.provider_id} match={match} />)}
        </ul>
      )}
    </section>
  );
}
