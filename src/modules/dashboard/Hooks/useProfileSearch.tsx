import { useState } from 'react';
import { profileService } from '../services/profileService';
import type { Profile } from '../types/profile';

export function useProfileSearch() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (name: string) => {
    if (!name.trim()) {
      setProfiles([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await profileService.searchProfiles(name);
      setProfiles(data);
    } catch {
      setError('No se pudieron encontrar perfiles.');
    } finally {
      setLoading(false);
    }
  };

  return { profiles, search, loading, error };
}