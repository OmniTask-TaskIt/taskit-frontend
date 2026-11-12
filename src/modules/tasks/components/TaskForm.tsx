import { useState } from 'react';
import AitaAlert from '../../aita/components/AitaAlert';
import AitaGeneratedMark from '../../aita/components/AitaGeneratedMark';
import AitaMagicButton from '../../aita/components/AitaMagicButton';
import AitaThinking from '../../aita/components/AitaThinking';
import { useAitaDescription } from '../../aita/hooks/useAitaDescription';
import { useAitaPrice } from '../../aita/hooks/useAitaPrice';
import type { TaskFormValues } from '../types/task.types';

type Props = {
  value: TaskFormValues;
  onChange: (value: TaskFormValues) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
};

const fieldClass = 'mt-1.5 w-full rounded-xl border border-[#dfe4f2] bg-white px-3 text-sm text-[#0B132B] outline-none focus:border-[#263BAA]';
const aiFieldClass = 'mt-1.5 w-full rounded-xl border border-violet-300 bg-white px-3 text-sm text-[#0B132B] outline-none ring-2 ring-violet-200 focus:border-violet-400';

function money(amount: number, currency = 'COP') {
  const code = /^[A-Za-z]{3}$/.test(currency) ? currency.toUpperCase() : 'COP';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(amount);
}

export default function TaskForm({ value, onChange, onCancel, onSubmit, submitLabel = 'Publicar tarea' }: Props) {
  const description = useAitaDescription();
  const price = useAitaPrice();
  const [idea, setIdea] = useState('');
  const [location, setLocation] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [aiTitle, setAiTitle] = useState(false);
  const [aiDescription, setAiDescription] = useState(false);
  const [aiPrice, setAiPrice] = useState(false);

  const generate = async () => {
    const draft = idea.trim();
    if (draft.length < 3) {
      setLocalError('Escribe una idea de al menos 3 caracteres. Si prefieres, completa el formulario a mano.');
      return;
    }
    setLocalError(null);
    const result = await description.generate({ idea: draft });
    if (!result) return;
    onChange({ ...value, title: result.title, description: result.description });
    setAiTitle(true);
    setAiDescription(true);
  };

  const estimate = async () => {
    if (value.description.trim().length < 3) {
      setLocalError('Agrega una descripción antes de estimar el precio. También puedes escribirlo tú.');
      return;
    }
    if (location.trim().length < 2) {
      setLocalError('Indica la ciudad para estimar el precio. El presupuesto sigue siendo editable.');
      return;
    }
    setLocalError(null);
    const result = await price.estimate({
      description: value.description.trim(),
      category: value.category,
      location: location.trim(),
    });
    if (!result) return;
    const suggested = Math.round((result.min_price + result.max_price) / 2);
    onChange({ ...value, price: String(suggested) });
    setAiPrice(true);
  };

  const alertMessage = localError || description.error || price.error;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-[12rem] flex-1 text-sm font-semibold text-[#2f3b63]">
            Idea suelta
            <input
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              maxLength={500}
              placeholder="Ej. Arreglar una fuga bajo el lavaplatos"
              className={fieldClass}
            />
          </label>
          <AitaMagicButton onClick={() => { void generate(); }} loading={description.isLoading} loadingLabel="Generando...">
            Generar descripción
          </AitaMagicButton>
        </div>
        {description.isLoading && <div className="mt-3"><AitaThinking label="AITA está redactando la tarea..." /></div>}
      </div>

      {alertMessage && (
        <AitaAlert
          message={alertMessage}
          onDismiss={() => {
            setLocalError(null);
            description.reset();
            price.reset();
          }}
        />
      )}

      <label className="block text-sm font-semibold text-[#2f3b63]">
        <span className="flex items-center justify-between gap-2">Nombre de la tarea {aiTitle && <AitaGeneratedMark />}</span>
        <input
          value={value.title}
          onChange={(event) => {
            setAiTitle(false);
            onChange({ ...value, title: event.target.value });
          }}
          className={`${aiTitle ? aiFieldClass : fieldClass} h-11`}
        />
      </label>

      <div className="block text-sm font-semibold text-[#2f3b63]">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2">Descripción {aiDescription && <AitaGeneratedMark />}</span>
        </span>
        <textarea
          aria-label="Descripción"
          value={value.description}
          onChange={(event) => {
            setAiDescription(false);
            onChange({ ...value, description: event.target.value });
          }}
          rows={4}
          className={`${aiDescription ? aiFieldClass : fieldClass} resize-none py-3`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="text-sm font-semibold text-[#2f3b63]">
          <span className="flex items-center justify-between gap-2">Precio {aiPrice && <AitaGeneratedMark />}</span>
          <input
            aria-label="Precio"
            value={value.price}
            onChange={(event) => {
              setAiPrice(false);
              onChange({ ...value, price: event.target.value });
            }}
            type="number"
            min="1"
            className={`${aiPrice ? aiFieldClass : fieldClass} h-11`}
          />
          <label className="mt-3 block text-xs font-medium text-[#657399]">
            Ciudad para la estimación
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Ej. Bogotá"
              className={fieldClass}
            />
          </label>
          <div className="mt-2">
            <AitaMagicButton onClick={() => { void estimate(); }} loading={price.isLoading} loadingLabel="Estimando...">
              Estimar precio sugerido
            </AitaMagicButton>
          </div>
          {price.isLoading && <div className="mt-2"><AitaThinking label="AITA está estimando el precio..." /></div>}
          {price.data && (
            <div className="mt-2 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-sky-50 p-3 text-xs font-medium leading-relaxed text-[#2f3b63]">
              <p>Rango sugerido: {money(price.data.min_price, price.data.currency)} – {money(price.data.max_price, price.data.currency)}</p>
              <p className="mt-1 text-[#5b6685]">Confianza {Math.round(price.data.confidence * 100)}%. {price.data.rationale}</p>
              <p className="mt-1">Se usó el punto medio. Puedes cambiarlo.</p>
            </div>
          )}
        </div>
        <label className="block text-sm font-semibold text-[#2f3b63]">
          Categoría
          <select
            aria-label="Categoría"
            value={value.category}
            onChange={(event) => onChange({ ...value, category: event.target.value as TaskFormValues['category'] })}
            className={`${fieldClass} h-11`}
          >
            <option value="ARREGLOS">Arreglos</option>
            <option value="EDUCACION">Educación</option>
          </select>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#657399]">Cancelar</button>
        <button type="submit" className="rounded-xl bg-[#263BAA] px-4 py-2.5 text-sm font-bold text-white">{submitLabel}</button>
      </div>
    </form>
  );
}
