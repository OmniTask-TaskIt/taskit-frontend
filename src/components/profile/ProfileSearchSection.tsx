import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, MapPin, ShieldCheck, ShieldAlert, X, FileText, Tag } from 'lucide-react';
import { profileService, type Profile } from '../../services/profileService';

const iconProps = { size: 18, strokeWidth: 2 };

export default function ProfileSearchSection() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await profileService.searchProfiles(query.trim());
      setResults(data || []);
    } catch (err) {
      console.error("Error al buscar perfiles:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#171A34]/90 backdrop-blur-md shadow-2xl p-6 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-6">Directorio de profesionales</h1>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o categoría..."
              className="w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-white/5 pl-10 pr-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#263BAA]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#263BAA] px-6 py-3 text-sm font-medium text-white hover:bg-[#1a297a] transition-colors cursor-pointer disabled:opacity-60 shadow-md"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Lista de Resultados */}
        <div className="mt-6 flex flex-col gap-3">
          {results.length === 0 && !loading && (
            <p className="text-sm text-white/50 text-center py-8">No se encontraron profesionales con ese criterio.</p>
          )}

          {results.map((prof) => {
            const isVerified = prof.identityVerificationStatus === 'VERIFIED';
            const isPending = prof.identityVerificationStatus === 'PENDING_REVIEW' || prof.identityVerificationStatus === 'PENDING';

            return (
              <motion.div
                key={prof.userId}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedProfile(prof)}
                className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-white/5 hover:bg-white/10 transition-all cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FFF4D6] text-[#0B132B] flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-inner">
                    {prof.photoUrl ? (
                      <img src={prof.photoUrl} alt={prof.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(prof.fullName || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-white">{prof.fullName || 'Profesional TaskIt'}</h2>
                      {isVerified ? (
                        <span title="Verificado">
                          <ShieldCheck size={14} className="text-emerald-400 cursor-pointer" />
                        </span>
                      ) : isPending ? (
                        <span title="Pendiente de revisión">
                          <ShieldAlert size={14} className="text-amber-400 cursor-pointer" />
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-white/60 mt-0.5 truncate max-w-[240px] sm:max-w-md">
                      {prof.description || 'Sin descripción disponible'}
                    </p>
                    {prof.locationCoverage && (
                      <span className="flex items-center gap-1 text-[11px] text-white/50 mt-1">
                        <MapPin size={12} /> Zona: {prof.locationCoverage}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs font-semibold text-white">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {prof.reputationScore} <span className="text-white/40">({prof.totalReviews})</span>
                  </span>
                  <span className="text-[11px] text-[#7c93fc] font-medium hover:underline">Ver perfil</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* MODAL DE DETALLE DEL PROFESIONAL */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.15)] bg-[#171A34] p-6 sm:p-8 shadow-2xl text-white relative"
            >
              <button
                onClick={() => setSelectedProfile(null)}
                className="absolute top-5 right-5 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Cabecera del Modal */}
              <div className="flex items-center gap-5 border-b border-[rgba(255,255,255,0.08)] pb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#FFF4D6] text-[#0B132B] flex items-center justify-center font-black text-2xl flex-shrink-0 shadow-inner">
                  {selectedProfile.photoUrl ? (
                    <img src={selectedProfile.photoUrl} alt={selectedProfile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(selectedProfile.fullName || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">{selectedProfile.fullName || 'Profesional'}</h2>
                    {selectedProfile.identityVerificationStatus === 'VERIFIED' ? (
                      <span className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck size={12} /> Verificado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/30">
                        <ShieldAlert size={12} /> Pendiente
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-400">
                      <Star size={16} className="fill-amber-400" />
                      {selectedProfile.reputationScore}
                    </span>
                    <span className="text-xs text-white/50">({selectedProfile.totalReviews} reseñas)</span>
                  </div>
                </div>
              </div>

              {/* Cuerpo del Detalle */}
              <div className="mt-6 flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-2 text-white/70 mb-2">
                    <FileText {...iconProps} className="text-white/40" />
                    <h3 className="text-sm font-medium">Descripción profesional</h3>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed bg-white/5 p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    {selectedProfile.description || 'Este usuario aún no ha agregado una descripción.'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-white/70 mb-2">
                    <MapPin {...iconProps} className="text-white/40" />
                    <h3 className="text-sm font-medium">Zona de cobertura</h3>
                  </div>
                  <p className="text-sm text-white">
                    {selectedProfile.locationCoverage || 'No especificada'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-white/70 mb-2">
                    <Tag {...iconProps} className="text-white/40" />
                    <h3 className="text-sm font-medium">Categorías y servicios</h3>
                  </div>
                  {selectedProfile.categories && selectedProfile.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.categories.map((cat) => (
                        <span key={cat} className="rounded-md border border-[rgba(255,255,255,0.08)] bg-white/5 px-3 py-1.5 text-xs text-white">
                          {cat}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/50">Sin categorías registradas.</p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.08)] flex justify-end">
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="rounded-xl bg-[#263BAA] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1a297a] transition-colors cursor-pointer shadow-md"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}