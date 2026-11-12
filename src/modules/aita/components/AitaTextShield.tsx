import { useState } from 'react';
import { useAitaShield } from '../hooks/useAitaShield';
import type { FraudRiskLevel, TextAnalysisSource } from '../types/aita.types';
import AitaAlert from './AitaAlert';
import AitaMagicButton from './AitaMagicButton';
import AitaThinking from './AitaThinking';

const RISK_STYLES: Record<FraudRiskLevel, string> = {
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-900',
  HIGH: 'border-orange-200 bg-orange-50 text-orange-900',
  CRITICAL: 'border-rose-200 bg-rose-50 text-rose-800',
};

const RISK_LABELS: Record<FraudRiskLevel, string> = {
  LOW: 'Riesgo bajo',
  MEDIUM: 'Riesgo medio',
  HIGH: 'Riesgo alto',
  CRITICAL: 'Riesgo crítico',
};

type Props = {
  text: string;
  source: TextAnalysisSource;
  sourceId: string;
  taskId?: string;
  chatId?: string;
  senderId?: string;
  label?: string;
};

export default function AitaTextShield({ text, source, sourceId, taskId, chatId, senderId, label = 'Revisar riesgos' }: Props) {
  const { analyze, isLoading, error, data, reset } = useAitaShield();
  const [localError, setLocalError] = useState<string | null>(null);
  const content = text.trim();

  const run = async () => {
    setLocalError(null);
    if (!content) {
      setLocalError('Escribe un texto antes de pedir la revisión de Shield.');
      return;
    }
    await analyze({
      source,
      source_id: sourceId,
      text: content,
      task_id: taskId ?? null,
      chat_id: chatId ?? null,
      sender_id: senderId ?? null,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <AitaMagicButton onClick={() => { void run(); }} loading={isLoading} loadingLabel="Revisando..." disabled={!content}>
          {label}
        </AitaMagicButton>
      </div>
      {isLoading && <AitaThinking label="Shield está revisando el texto..." />}
      {(localError || error) && (
        <AitaAlert message={localError || error || ''} onDismiss={() => { setLocalError(null); reset(); }} />
      )}
      {data && (
        <div className={`rounded-xl border px-3 py-2 text-xs leading-relaxed ${RISK_STYLES[data.risk_level]}`}>
          <p className="font-semibold">{data.is_anomaly ? RISK_LABELS[data.risk_level] : 'Sin señales de riesgo'}</p>
          <p className="mt-1">{data.explanation}</p>
          <p className="mt-1 opacity-80">Puedes seguir</p>
        </div>
      )}
    </div>
  );
}
