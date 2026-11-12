import { aitaService } from '../services/aita.service';
import { useAitaRequest } from './useAitaRequest';

export function useAitaSentiment() {
  const request = useAitaRequest(aitaService.analyzeSentiment);
  return { ...request, analyze: request.execute };
}
