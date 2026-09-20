import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, MapPin, Pencil, ShieldCheck, ShieldAlert, Star, Tag, Upload, Camera } from 'lucide-react';
import { profileService, type Profile } from '../../services/profileService';

const iconProps = { size: 18, strokeWidth: 2 };

export default function UserProfileCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [draft, setDraft] = useState({ description: '', locationCoverage: '', categories: '' });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const userEmail: string = localStorage.getItem('userEmail') ?? '';

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setLoading(true);
        if (!userEmail) {
          setLoading(false);
          return;
        }

        const profiles = await profileService.searchProfiles(userEmail);
        if (profiles && profiles.length > 0) {
          const currentProfile = profiles[0];
          setProfile(currentProfile);
          if (currentProfile.userId) {
            localStorage.setItem('userId', currentProfile.userId);
          }
        } else {
          // 🌟 Extraemos una versión limpia del nombre a partir del correo si no hay perfil creado aún
          const derivedName = userEmail.split('@')[0];
          const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

          setProfile({
            userId: '',
            fullName: formattedName,
            description: '',
            photoUrl: '',
            categories: [],
            locationCoverage: '',
            reputationScore: 5.0,
            totalReviews: 0,
            identityVerificationStatus: 'PENDING_REVIEW'
          });
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProfile();
  }, [userEmail]);

  const openEditor = () => {
    if (!profile) return;
    setDraft({
      description: profile.description || '',
      locationCoverage: profile.locationCoverage || '',
      categories: profile.categories?.join(', ') || ''
    });
    setSaveError('');
    setIsEditing(true);
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || !profile.userId) return;
    
    setIsSaving(true);
    setSaveError('');
    try {
      const payloadData = {
        description: draft.description.trim(),
        locationCoverage: draft.locationCoverage.trim(),
        categories: draft.categories.split(',').map((cat) => cat.trim()).filter(Boolean)
      };

      const updatedProfile = await profileService.updateProfile(profile.userId, payloadData);
      setProfile({ ...profile, ...updatedProfile });
      setIsEditing(false);
    } catch {
      setSaveError('No se pudo guardar el perfil. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const activeUserId = profile?.userId || localStorage.getItem('userId') || '';
    
    if (!file || !activeUserId) {
      alert("Error: ID de usuario no válido. Vuelve a iniciar sesión.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const newPhotoUrl = await profileService.uploadPhoto(activeUserId, file);
      setProfile((prev) => prev ? { ...prev, photoUrl: newPhotoUrl } : null);
    } catch (err) {
      console.error("Error al subir foto:", err);
      alert("No se pudo cargar la imagen de perfil.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const activeUserId = profile?.userId || localStorage.getItem('userId') || '';
    
    if (!file || !activeUserId) return;
    setUploadingDoc(true);
    try {
      const updatedProfile = await profileService.uploadDocument(activeUserId, file);
      setProfile(updatedProfile);
      alert("Documento de identidad enviado a revisión correctamente.");
    } catch (err) {
      console.error("Error al subir documento:", err);
      alert("No se pudo cargar el documento de identidad.");
    } finally {
      setUploadingDoc(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center justify-center gap-4 py-20 bg-[#171A34]/90 rounded-2xl border border-[#e4e8f3] shadow-2xl backdrop-blur-md">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#263BAA] border-t-transparent" />
        <span className="text-sm font-medium text-[#66718e]">Cargando tu perfil...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-[760px] rounded-2xl border border-[#e4e8f3] bg-[#171A34] p-8 text-center text-[#17213f] shadow-2xl">
        <p className="text-sm text-[#66718e]">No se encontró información de perfil para el correo: {userEmail}. Inicia sesión nuevamente.</p>
      </div>
    );
  }

  const status = profile.identityVerificationStatus;
  const isVerified = status === 'VERIFIED';
  const isPending = status === 'PENDING_REVIEW' || status === 'PENDING';

  // 🌟 Determinamos el nombre a mostrar con prioridad: fullName de MongoDB -> parte del correo -> "Usuario"
  const displayName = profile.fullName && profile.fullName.trim() !== '' 
    ? profile.fullName 
    : userEmail ? userEmail.split('@')[0] : 'Usuario';

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full flex-col overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.1)] border border-[#e4e8f3] bg-white/95 shadow-[0_18px_45px_rgba(47,61,110,0.12)]"
      >
        <header className="flex flex-col items-start justify-between gap-6 border-b border-[#e4e8f3] p-6 sm:flex-row sm:items-center md:p-8">
          <div className="flex items-center gap-5">
            <div 
              onClick={() => photoInputRef.current?.click()}
              className="relative group h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#FFF4D6] text-[#0B132B] shadow-inner"
              title="Haz clic para cambiar tu foto"
            >
              {profile.photoUrl ? (
                <img 
                  src={profile.photoUrl} 
                  alt="Foto de perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black">{displayName.charAt(0).toUpperCase()}</span>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#17213f] text-xs">
                {uploadingPhoto ? (
                  <span className="animate-pulse">Cargando...</span>
                ) : (
                  <>
                    <Camera size={18} />
                    <span>Editar</span>
                  </>
                )}
              </div>
            </div>
            <input type="file" ref={photoInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />

            <div>
              <div className="flex flex-wrap items-center gap-3">
                {/* 🌟 Aquí se muestra el nombre dinámico correcto */}
                <h1 className="text-2xl font-bold tracking-tight text-[#17213f]">{displayName}</h1>
                
                {isVerified ? (
                  <span className="flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck size={14} strokeWidth={2.5} />
                    Verificado
                  </span>
                ) : isPending ? (
                  <span className="flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/30">
                    <ShieldAlert size={14} strokeWidth={2.5} />
                    Pendiente de revisión
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-[#17213f]/60 border border-white/15">
                    Sin verificar
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-[#17213f]/60 truncate max-w-[280px] sm:max-w-xs">{userEmail}</p>
              <div className="mt-2">
                {profile.totalReviews && profile.totalReviews > 0 ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-[#17213f]">
                    <Star {...iconProps} className="fill-amber-400 text-amber-400" />
                    {profile.reputationScore} <span className="text-[#17213f]/50">({profile.totalReviews})</span>
                  </span>
                ) : (
                  <span className="text-sm text-[#17213f]/50">Sin reseñas todavía</span>
                )}
              </div>
            </div>
          </div>

          <button type="button" onClick={openEditor} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#263BAA] px-5 py-2.5 text-sm font-medium text-[#17213f] transition-colors hover:bg-[#1a297a] sm:w-auto shadow-md">
            <Pencil {...iconProps} />
            Editar perfil
          </button>
        </header>

        <div className="flex flex-col gap-8 p-6 md:p-8">
          <section>
            <div className="mb-2 flex items-center gap-2 text-[#17213f]/80">
              <FileText {...iconProps} className="text-[#17213f]/50" />
              <h2 className="text-sm font-medium">Descripción</h2>
            </div>
            {profile.description && profile.description.trim() !== '' ? (
              <p className="text-sm leading-relaxed text-[#17213f]/90">{profile.description}</p>
            ) : (
              <button type="button" onClick={openEditor} className="text-sm font-medium text-[#7c93fc] hover:text-[#17213f] transition-colors">+ Agregar descripción</button>
            )}
          </section>

          <section className="flex flex-col gap-2 border-t border-[#e4e8f3] pt-8">
            <div className="flex items-center gap-2 text-[#17213f]/80">
              <MapPin {...iconProps} className="text-[#17213f]/50" />
              <h2 className="text-sm font-medium">Zona de cobertura</h2>
            </div>
            {profile.locationCoverage && profile.locationCoverage.trim() !== '' ? (
              <span className="text-sm text-[#17213f]">{profile.locationCoverage}</span>
            ) : (
              <button type="button" onClick={openEditor} className="w-fit text-sm font-medium text-[#7c93fc] hover:text-[#17213f] transition-colors">+ Agregar zona</button>
            )}
          </section>

          <section className="flex flex-col gap-3 border-t border-[#e4e8f3] pt-8">
            <div className="flex items-center gap-2 text-[#17213f]/80">
              <Tag {...iconProps} className="text-[#17213f]/50" />
              <h2 className="text-sm font-medium">Categorías de servicio</h2>
            </div>
            {profile.categories && profile.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.categories.map((category) => (
                  <span key={category} className="rounded-md border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-sm text-[#17213f] truncate max-w-[220px]">
                    {category}
                  </span>
                ))}
              </div>
            ) : (
              <button type="button" onClick={openEditor} className="w-fit text-sm font-medium text-[#7c93fc] hover:text-[#17213f] transition-colors">+ Agregar categorías</button>
            )}
          </section>

          <section className="flex flex-col gap-3 border-t border-[#e4e8f3] pt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#17213f]/80">
                <Upload {...iconProps} className="text-[#17213f]/50" />
                <h2 className="text-sm font-medium">Documento de identidad (Verificación)</h2>
              </div>
              <button 
                type="button" 
                onClick={() => docInputRef.current?.click()} 
                disabled={uploadingDoc}
                className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-[#17213f] px-3 py-1.5 rounded-lg transition-colors border border-white/15"
              >
                {uploadingDoc ? 'Subiendo...' : profile.documentUrl ? 'Actualizar documento' : 'Subir documento'}
              </button>
            </div>
            <input type="file" ref={docInputRef} onChange={handleDocumentChange} accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
            <p className="text-xs text-[#17213f]/50">
              {profile.documentUrl ? '✅ Documento cargado. En proceso de revisión.' : 'Sube tu documento de identidad para activar la validación profesional.'}
            </p>
          </section>

          {isEditing && (
            <form id="editar-perfil" onSubmit={saveProfile} className="flex flex-col gap-4 border-t border-[#e4e8f3] pt-8">
              <h2 className="text-lg font-semibold text-[#17213f]">Editar perfil</h2>
              <label className="flex flex-col gap-2 text-sm text-[#66718e]">
                Descripción
                <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={3} className="rounded-lg border border-[#e4e8f3] bg-white/5 p-3 text-[#17213f] outline-none focus:border-[#263BAA]" />
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-[#66718e]">
                  Zona de cobertura
                  <input value={draft.locationCoverage} onChange={(event) => setDraft({ ...draft, locationCoverage: event.target.value })} className="rounded-lg border border-[#e4e8f3] bg-white/5 p-3 text-[#17213f] outline-none focus:border-[#263BAA]" />
                </label>
                <label className="flex flex-col gap-2 text-sm text-[#66718e]">
                  Categorías
                  <input value={draft.categories} onChange={(event) => setDraft({ ...draft, categories: event.target.value })} placeholder="Ej. Plomería, Electricidad" className="rounded-lg border border-[#e4e8f3] bg-white/5 p-3 text-[#17213f] outline-none placeholder:text-[#17213f]/30 focus:border-[#263BAA]" />
                </label>
              </div>
              {saveError && <p className="text-sm text-amber-400">{saveError}</p>}
              <div className="flex flex-wrap gap-3 mt-2">
                <button type="submit" disabled={isSaving} className="rounded-lg bg-[#263BAA] px-5 py-2.5 text-sm font-medium text-[#17213f] hover:bg-[#1a297a] disabled:opacity-60">{isSaving ? 'Guardando...' : 'Guardar cambios'}</button>
                <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg border border-[#e4e8f3] px-5 py-2.5 text-sm font-medium text-[#66718e] hover:text-[#17213f]">Cancelar</button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
