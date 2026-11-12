import { aitaService } from '../services/aita.service';
import { useAitaRequest } from './useAitaRequest';

export function useAitaProfile() {
  const request = useAitaRequest(aitaService.optimizeProfile);
  return { ...request, optimize: request.execute };
}
