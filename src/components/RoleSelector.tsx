import { BriefcaseBusiness, Search } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: 'SEEKER' | 'PROVIDER';
  onSelectRole: (role: 'SEEKER' | 'PROVIDER') => void;
}

export default function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <label className="text-xs font-semibold text-[#66718e]">Elige tu rol principal:</label>
      <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:gap-3">
        <div
          onClick={() => onSelectRole('SEEKER')}
          className={`cursor-pointer p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
            selectedRole === 'SEEKER'
              ? 'border-[#5667c9] bg-[#5667c9] font-bold text-white shadow-[0_10px_22px_rgba(86,103,201,0.28)] scale-[1.02]'
              : 'border-[#d7d3e3] bg-[#f1eef6] text-[#34405f] hover:border-[#b8b1d2] hover:bg-[#e8e4f1]'
          }`}
        >
          <span className="flex items-center gap-2 text-sm"><Search size={16} strokeWidth={2} />Demandante</span>
          <span className="text-[10px] opacity-80 font-normal mt-0.5">Busco contratar servicios</span>
        </div>

        <div
          onClick={() => onSelectRole('PROVIDER')}
          className={`cursor-pointer p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
            selectedRole === 'PROVIDER'
              ? 'border-[#5667c9] bg-[#5667c9] font-bold text-white shadow-[0_10px_22px_rgba(86,103,201,0.28)] scale-[1.02]'
              : 'border-[#d7d3e3] bg-[#f1eef6] text-[#34405f] hover:border-[#b8b1d2] hover:bg-[#e8e4f1]'
          }`}
        >
          <span className="flex items-center gap-2 text-sm"><BriefcaseBusiness size={16} strokeWidth={2} />Prestador</span>
          <span className="text-[10px] opacity-80 font-normal mt-0.5">Ofrezco mis servicios</span>
        </div>
      </div>
    </div>
  );
}
