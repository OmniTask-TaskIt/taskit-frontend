import { useState } from 'react';

/** Mantiene el texto de AITA en un bloque corto, con scroll interno si hace falta leerlo completo. */
export default function AitaFitText({ text, className = '' }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.trim().length > 160;

  return (
    <div className={className}>
      <p className={`whitespace-pre-wrap leading-relaxed ${expanded ? 'max-h-32 overflow-y-auto' : 'line-clamp-3'}`}>
        {text}
      </p>
      {long && (
        <button
          type="button"
          className="mt-1 text-[11px] font-semibold text-[#263BAA]"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
}
