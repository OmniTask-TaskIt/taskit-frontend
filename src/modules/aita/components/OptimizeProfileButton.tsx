import { useState } from 'react';
import { aitaService } from '../services/aita.service';
import { useAitaProfile } from '../hooks/useAitaProfile';
import { toProviderProfile } from '../mappers/aita.mappers';
import AitaAlert from './AitaAlert';
import AitaMagicButton from './AitaMagicButton';
import AitaThinking from './AitaThinking';

type Props = {
  userId: string;
  displayName: string;
  bio: string;
  location: string;
  categories: string[];
  onApply: (bio: string) => void;
};

export default function OptimizeProfileButton({ userId, displayName, bio, location, categories, onApply }: Props) {
  const { optimize, isLoading, error, data, reset } = useAitaProfile();
  const [indexWarning, setIndexWarning] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const run = async () => {
    setLocalError(null);
    setIndexWarning(null);
    if (!userId) {
      setLocalError('No encontramos tu usuario. Vuelve a iniciar sesión y edita la descripción a mano.');
      return;
    }

    const profile = toProviderProfile({ userId, displayName, bio, location, categories });
    const result = await optimize(profile);
    if (!result) return;

    const optimizedBio = result.optimized_bio?.trim() ?? '';
    if (optimizedBio) onApply(optimizedBio);

    try {
      await aitaService.indexProvider({ ...profile, bio: optimizedBio || profile.bio });
    } catch {
      setIndexWarning('El texto quedó listo, pero no se pudo indexar el perfil para el matchmaking.');
    }
  };

  const visibleError = localError || error;

  return (
    <div className="flex flex-col gap-2">
      <AitaMagicButton onClick={() => { void run(); }} loading={isLoading} loadingLabel="Optimizando..." disabled={!userId}>
        Optimizar perfil con IA
      </AitaMagicButton>
      {isLoading && <AitaThinking label="AITA está mejorando tu perfil..." />}
      {visibleError && <AitaAlert message={visibleError} onDismiss={() => { setLocalError(null); reset(); }} />}
      {indexWarning && <AitaAlert message={indexWarning} onDismiss={() => setIndexWarning(null)} />}
      {data && (
        <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-sky-50 p-3 text-sm text-[#2f3b63]">
          <p className="text-xs font-semibold text-violet-800">Sugerencias de AITA</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed">
            {data.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}
          </ul>
          {data.keywords && data.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-violet-800">{keyword}</span>
              ))}
            </div>
          )}
          <p className="mt-2 text-[11px] text-[#5b6685]">Puedes ajustar el texto a mano antes de guardar.</p>
        </div>
      )}
    </div>
  );
}
