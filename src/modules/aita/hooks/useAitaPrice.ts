import { aitaService } from '../services/aita.service';
import { useAitaRequest } from './useAitaRequest';

export function useAitaPrice() {
  const request = useAitaRequest(aitaService.estimatePrice);
  return { ...request, estimate: request.execute };
}
