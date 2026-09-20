import { BriefcaseBusiness, Search } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: 'SEEKER' | 'PROVIDER';
  onSelectRole: (role: 'SEEKER' | 'PROVIDER') => void;
}

export default function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <label className="text-xs font-semibold text-[#66718e]">Elige tu rol principal:</label>
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => onSelectRole('SEEKER')}
          className={`cursor-pointer p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
            selectedRole === 'SEEKER'
              ? 'bg-vanilla text-[#0B132B] font-bold border-vanilla shadow-lg scale-[1.02]'
              : 'border-[#dbe1f0] bg-[#f8faff] text-[#34405f] hover:border-[#aab7e8] hover:bg-[#eef2ff]'
          }`}
        >
          <span className="flex items-center gap-2 text-sm"><Search size={16} strokeWidth={2} />Demandante</span>
          <span className="text-[10px] opacity-80 font-normal mt-0.5">Busco contratar servicios</span>
        </div>

        <div
          onClick={() => onSelectRole('PROVIDER')}
          className={`cursor-pointer p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
            selectedRole === 'PROVIDER'
              ? 'bg-vanilla text-[#0B132B] font-bold border-vanilla shadow-lg scale-[1.02]'
              : 'border-[#dbe1f0] bg-[#f8faff] text-[#34405f] hover:border-[#aab7e8] hover:bg-[#eef2ff]'
          }`}
        >
          <span className="flex items-center gap-2 text-sm"><BriefcaseBusiness size={16} strokeWidth={2} />Prestador</span>
          <span className="text-[10px] opacity-80 font-normal mt-0.5">Ofrezco mis servicios</span>
        </div>
      </div>
    </div>
  );
}
