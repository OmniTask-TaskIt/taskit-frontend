import { CalendarDays, ClipboardCheck } from 'lucide-react';
import { formatSeniority, monthsBetween } from '../../../../utils/seniority';

interface ProfileActivityProps {
  tasksCompleted?: number;
  /** Fecha de alta en ISO-8601. */
  memberSince?: string;
}

/** RF-AUTHPR-8: trayectoria del usuario (tareas completadas y antigüedad en la plataforma). */
export default function ProfileActivity({ tasksCompleted, memberSince }: ProfileActivityProps) {
  const completed = tasksCompleted ?? 0;
  const since = memberSince ? new Date(memberSince) : null;
  const validSince = since && !Number.isNaN(since.getTime()) ? since : null;

  return (
    <ul className="mt-2 flex flex-col gap-1 text-sm text-[#17213f]/80 sm:flex-row sm:flex-wrap sm:gap-x-4">
      <li className="flex items-center gap-1.5">
        <ClipboardCheck size={16} className="text-[#263BAA]" aria-hidden="true" />
        {completed === 1 ? '1 tarea completada' : `${completed} tareas completadas`}
      </li>
      {validSince && (
        <li className="flex items-center gap-1.5">
          <CalendarDays size={16} className="text-[#263BAA]" aria-hidden="true" />
          Miembro desde {validSince.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })} ·{' '}
          {formatSeniority(monthsBetween(validSince, new Date()))}
        </li>
      )}
    </ul>
  );
}
