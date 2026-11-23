import { BriefcaseBusiness, Search } from 'lucide-react';
import type { SelectableRole } from '../../types/auth.types';

interface RoleSelectorProps {
  selectedRole: SelectableRole;
  onSelectRole: (role: SelectableRole) => void;
}

const BASE_CLASSES =
  'cursor-pointer p-3.5 rounded-xl border flex flex-col items-center text-center transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#263BAA]';
const ACTIVE_CLASSES =
  'border-[#5667c9] bg-[#5667c9] font-bold text-white shadow-[0_10px_22px_rgba(86,103,201,0.28)] scale-[1.02]';
const INACTIVE_CLASSES =
  'border-[#d7d3e3] bg-[#f1eef6] text-[#34405f] hover:border-[#b8b1d2] hover:bg-[#e8e4f1]';

export default function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <span id="role-selector-label" className="text-xs font-semibold text-[#5b6685]">Elige tu rol principal:</span>
      <div
        role="group"
        aria-labelledby="role-selector-label"
        className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:gap-3"
      >
        <button
          type="button"
          onClick={() => onSelectRole('SEEKER')}
          aria-pressed={selectedRole === 'SEEKER'}
          className={`${BASE_CLASSES} ${selectedRole === 'SEEKER' ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
        >
          <span className="flex items-center gap-2 text-sm"><Search size={16} strokeWidth={2} />Demandante</span>
          <span className="text-[10px] opacity-80 font-normal mt-0.5">Busco contratar servicios</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectRole('PROVIDER')}
          aria-pressed={selectedRole === 'PROVIDER'}
          className={`${BASE_CLASSES} ${selectedRole === 'PROVIDER' ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
        >
          <span className="flex items-center gap-2 text-sm"><BriefcaseBusiness size={16} strokeWidth={2} />Prestador</span>
          <span className="text-[10px] opacity-80 font-normal mt-0.5">Ofrezco mis servicios</span>
        </button>
      </div>
    </div>
  );
}
