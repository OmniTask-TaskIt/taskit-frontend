import { aitaService } from '../services/aita.service';
import { useAitaRequest } from './useAitaRequest';

export function useAitaDescription() {
  const request = useAitaRequest(aitaService.generateDescription);
  return { ...request, generate: request.execute };
}
