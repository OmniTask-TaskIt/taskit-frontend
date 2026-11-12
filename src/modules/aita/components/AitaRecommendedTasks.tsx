import { useEffect, useState } from 'react';
import { authStore } from '../../authentication/services/authStore';
import { profileService } from '../../authentication/services/profileService';
import { taskService } from '../../tasks/services/taskService';
import type { Task } from '../../tasks/types/task.types';
import { isAitaCategory, toProviderProfile } from '../mappers/aita.mappers';
import { aitaService } from '../services/aita.service';
import { isAbortError, toAitaRequestError } from '../services/aitaError';
import AitaAlert from './AitaAlert';
import AitaThinking from './AitaThinking';
import { Sparkles, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Suggestion = { task: Task; score: number; rationale?: string };

const MAX_CANDIDATES = 4;

// Función para transformar el 'rationale' matemático en un texto amigable
function formatRationale(rationale: string | undefined): string | null {
  if (!rationale) return null;
  // Si el backend envía el texto crudo con "Similitud coseno...", lo filtramos o lo reescribimos
  if (rationale.toLowerCase().includes('similitud coseno')) {
     return "Alta compatibilidad con tus habilidades y experiencia.";
  }
  return rationale;
}

export default function AitaRecommendedTasks({ onOpen }: { onOpen: (task: Task) => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Suggestion[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      try {
        const email = authStore.getEmail() ?? localStorage.getItem('userEmail') ?? '';
        const storedUserId = localStorage.getItem('userId') ?? authStore.getUserId() ?? '';
        const profiles = email ? await profileService.searchProfiles(email) : [];
        const profile = profiles[0];
        const providerId = profile?.userId || storedUserId;
        
        if (!providerId) {
          throw new Error('missing-user');
        }

        const provider = toProviderProfile({
          userId: providerId,
          displayName: profile?.fullName || email || 'Prestador',
          bio: profile?.description || '',
          location: profile?.locationCoverage || '',
          categories: profile?.categories || [],
        });

        try {
          await aitaService.indexProvider(provider, controller.signal);
        } catch (indexError) {
          if (isAbortError(indexError)) return;
        }

        const categories = (await taskService.getCategories()).filter(isAitaCategory);
        const feed = categories.length > 0 ? await taskService.getTaskFeed(categories) : [];
        const candidates = feed
          .filter((task) => task.taskStatus === 'ACTIVE' && task.ownerId !== providerId && task.ownerId !== storedUserId && isAitaCategory(task.category))
          .slice(0, MAX_CANDIDATES);

        const ranked: Suggestion[] = [];
        for (const task of candidates) {
          if (!active || controller.signal.aborted) break;
          if (!isAitaCategory(task.category)) continue;
          
          const matches = await aitaService.searchProviders({
            task_id: task.taskId,
            task_name: task.taskName || task.title || '',
            task_description: task.taskDescription || task.description || '',
            category: task.category,
            limit: 5,
          }, controller.signal);
          
          const mine = matches.find((match) => match.provider_id === providerId || match.provider_id === storedUserId);
          if (mine) {
             ranked.push({ task, score: mine.score, rationale: mine.rationale });
          }
        }

        ranked.sort((left, right) => right.score - left.score);
        if (!active || controller.signal.aborted) return;
        
        setItems(ranked);
        setError(null);
      } catch (caught) {
        if (!active || isAbortError(caught)) return;
        setError(caught instanceof Error && caught.message === 'missing-user'
          ? 'No encontramos tu perfil de prestador. Inicia sesión de nuevo para ver tareas compatibles.'
          : toAitaRequestError(caught).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <section className="mb-8 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_12px_40px_rgba(38,59,170,0.06)] backdrop-blur-xl transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-[#263BAA] shadow-md shadow-violet-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0B132B]">Tareas recomendadas</h2>
          <p className="text-sm font-medium text-[#5b6685]">AITA analizó tu perfil y encontró estas oportunidades para ti.</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <AitaThinking label="Buscando las mejores tareas para tus habilidades..." />
        </div>
      )}
      
      {error && <AitaAlert message={error} />}
      
      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 py-10 px-4 text-center">
           <Sparkles className="h-8 w-8 text-violet-300 mb-3" />
           <p className="font-semibold text-[#2f3b63]">No hay tareas nuevas por el momento</p>
           <p className="mt-1 text-sm text-[#5b6685] max-w-sm">Cuando los usuarios publiquen tareas que coincidan con tu experiencia, AITA te avisará aquí.</p>
        </div>
      )}

      {items.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnimatePresence>
            {items.map(({ task, score, rationale }, index) => {
              const friendlyRationale = formatRationale(rationale);
              const matchPercentage = Math.round(Math.max(0, score) * 100);
              // Color dinámico según el porcentaje
              const scoreColor = matchPercentage >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 
                                 matchPercentage >= 60 ? 'text-violet-700 bg-violet-50 border-violet-200' : 
                                 'text-blue-600 bg-blue-50 border-blue-200';

              return (
                <motion.li 
                  key={task.taskId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e8ebf5] bg-white p-5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md"
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-violet-100/50 to-transparent blur-xl transition-all group-hover:bg-violet-200/50"></div>
                  
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-bold text-[#0B132B] line-clamp-1 text-lg group-hover:text-[#263BAA] transition-colors">
                        {task.title || task.taskName}
                      </h3>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold border ${scoreColor}`}>
                        {matchPercentage}% Match
                      </span>
                    </div>
                    
                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#5b6685]">
                      {task.description || task.taskDescription}
                    </p>
                    
                    {friendlyRationale && (
                      <div className="mb-4 flex items-start gap-2 rounded-lg bg-violet-50/50 px-3 py-2 text-[13px] font-medium text-violet-800">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p>{friendlyRationale}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#f0f2f8] pt-4 mt-auto">
                    <div className="flex items-center gap-3 text-xs font-medium text-[#7a84a1]">
                      {task.category && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{task.category}</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => onOpen(task)}
                      className="rounded-xl bg-[#263BAA] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1a297a] hover:shadow-md active:scale-95"
                    >
                      Postularme
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}