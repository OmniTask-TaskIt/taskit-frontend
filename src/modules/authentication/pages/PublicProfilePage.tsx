import ProfileActivity from '../Components/profile/ProfileActivity';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, Flag, MapPin, MessageSquare, ShieldAlert, ShieldCheck, Star, Tag } from 'lucide-react';
import ProfileReviews from '../Components/profile/ProfileReviews';
import ReportProfileModal from '../Components/profile/ReportProfileModal';
import { profileService } from '../services/profileService';
import type { Profile } from '../types/profile.types';
import fondoImage from '../../../assets/FondoP.jpeg';

const iconProps = { size: 18, strokeWidth: 2 };

/** RF-AUTHPR-3: perfil público de otro usuario, en /profile/:userId (requiere sesión). */
export default function PublicProfilePage() {
  const { userId = '' } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);
  const [reporting, setReporting] = useState(false);

  const ownUserId = localStorage.getItem('userId') ?? '';

  useEffect(() => {
    let cancelled = false;
    profileService
      .getProfile(userId)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setError('');
        setPhotoFailed(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(axios.isAxiosError(err) && err.response?.status === 404 ? 'Este perfil no existe.' : 'No se pudo cargar el perfil.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  const name = profile?.fullName?.trim() || 'Usuario de TaskIt';
  const verified = profile?.identityVerificationStatus === 'VERIFIED';

  return (
    <div
      className="relative min-h-screen w-full bg-[#eef2fb] bg-cover bg-center px-4 py-6 text-[#17213f] sm:px-8 sm:py-10"
      style={{ backgroundImage: `url(${fondoImage})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#f5f7ff]/80 backdrop-blur-[3px]" />

      <div className="relative mx-auto flex w-full max-w-[760px] flex-col gap-4">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-[#1f2f8f] shadow hover:bg-white"
        >
          <ArrowLeft size={16} /> Volver
        </button>

        {loading && (
          <div className="rounded-2xl border border-[#e4e8f3] bg-white/95 py-16 text-center text-sm font-medium text-[#4a5578] shadow-xl">
            Cargando perfil...
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="rounded-2xl border border-[#e4e8f3] bg-white/95 p-8 text-center shadow-xl">
            <p className="text-sm font-medium text-[#17213f]">{error}</p>
            <Link to="/dashboard" className="mt-3 inline-block text-sm font-semibold text-[#1f2f8f] hover:underline">Ir a mi panel</Link>
          </div>
        )}

        {!loading && profile && (
          <article className="overflow-hidden rounded-2xl border border-[#e4e8f3] bg-white/95 shadow-[0_18px_45px_rgba(47,61,110,0.12)]">
            <header className="flex flex-col gap-5 border-b border-[#e4e8f3] p-6 sm:flex-row sm:items-center md:p-8">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF4D6] text-3xl font-black text-[#0B132B]">
                {profile.photoUrl && !photoFailed ? (
                  <img src={profile.photoUrl} alt={`Foto de ${name}`} onError={() => setPhotoFailed(true)} className="h-full w-full object-cover" />
                ) : (
                  <span>{name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
                  {verified ? (
                    <span className="flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      <ShieldCheck size={14} strokeWidth={2.5} /> Cuenta verificada
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      <ShieldAlert size={14} strokeWidth={2.5} /> Sin verificar
                    </span>
                  )}
                </div>
                <div className="mt-2 text-sm">
                  {profile.totalReviews > 0 ? (
                    <span className="flex items-center gap-1 font-medium">
                      <Star size={18} className="fill-amber-400 text-amber-400" />
                      {profile.reputationScore} <span className="text-[#17213f]/80">({profile.totalReviews} reseñas)</span>
                    </span>
                  ) : (
                    <span className="text-[#17213f]/80">Sin reseñas todavía</span>
                  )}
                </div>
                <ProfileActivity tasksCompleted={profile.tasksCompleted} memberSince={profile.memberSince} />
              </div>
            </header>

            <div className="flex flex-col gap-8 p-6 md:p-8">
              <section>
                <div className="mb-2 flex items-center gap-2 text-[#17213f]/80"><FileText {...iconProps} /><h2 className="text-sm font-medium">Descripción</h2></div>
                <p className="text-sm leading-relaxed">{profile.description?.trim() || 'Este usuario aún no ha agregado una descripción.'}</p>
              </section>

              <section className="border-t border-[#e4e8f3] pt-8">
                <div className="mb-2 flex items-center gap-2 text-[#17213f]/80"><MapPin {...iconProps} /><h2 className="text-sm font-medium">Zona de cobertura</h2></div>
                <p className="text-sm">{profile.locationCoverage?.trim() || 'No especificada'}</p>
              </section>

              <section className="border-t border-[#e4e8f3] pt-8">
                <div className="mb-3 flex items-center gap-2 text-[#17213f]/80"><Tag {...iconProps} /><h2 className="text-sm font-medium">Categorías de servicio</h2></div>
                {profile.categories?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.categories.map((c) => (
                      <span key={c} className="max-w-[220px] truncate rounded-md border border-[#d6dcf5] bg-[#eef1ff] px-3 py-1.5 text-sm">{c}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#17213f]/80">Sin categorías registradas.</p>
                )}
              </section>

              <section className="border-t border-[#e4e8f3] pt-8">
                <div className="mb-3 flex items-center gap-2 text-[#17213f]/80"><MessageSquare {...iconProps} /><h2 className="text-sm font-medium">Reseñas</h2></div>
                {/* ProfileReviews está diseñado para fondo oscuro: se muestra en su propio panel. */}
                <div className="rounded-xl bg-[#171A34] p-4 text-white">
                  <ProfileReviews userId={profile.userId || userId} />
                </div>
              </section>

              {(profile.userId || userId) !== ownUserId && (
                <div className="border-t border-[#e4e8f3] pt-6">
                  <button type="button" onClick={() => setReporting(true)} className="flex items-center gap-1.5 text-sm font-semibold text-rose-700 hover:underline">
                    <Flag size={14} /> Reportar perfil
                  </button>
                </div>
              )}
            </div>
          </article>
        )}
      </div>

      {reporting && profile && (
        <ReportProfileModal userId={profile.userId || userId} userName={name} onClose={() => setReporting(false)} />
      )}
    </div>
  );
}
