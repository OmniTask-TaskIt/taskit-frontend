import { aitaService } from '../services/aita.service';
import { useAitaRequest } from './useAitaRequest';

export function useAitaShield() {
  const request = useAitaRequest(aitaService.analyzeShield);
  return { ...request, analyze: request.execute };
}
