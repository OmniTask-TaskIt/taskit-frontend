import { aitaService } from '../services/aita.service';
import { useAitaRequest } from './useAitaRequest';

export function useAitaMatchmaking() {
  const indexTask = useAitaRequest(aitaService.indexTask);
  const indexProvider = useAitaRequest(aitaService.indexProvider);
  const search = useAitaRequest(aitaService.searchProviders);

  return { indexTask, indexProvider, search };
}
