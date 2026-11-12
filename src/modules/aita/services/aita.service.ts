import axios from 'axios';
import { env } from '../../authentication/Config/env';
import { AITA_API_BASE, AITA_CONFIG_ERROR, AITA_TIMEOUT_MS } from '../config/aita.config';
import type {
  AitaReviewInput,
  EstimateFairPriceCommand,
  FraudAnalysis,
  FraudCheckCommand,
  GeneratedTaskContent,
  GenerateTaskDescriptionCommand,
  IndexedResource,
  MatchResult,
  PriceEstimate,
  ProfileOptimization,
  ProviderProfile,
  SemanticMatchCommand,
  SentimentAnalysis,
  TaskText,
} from '../types/aita.types';
import { AitaRequestError, isAbortError, toAitaRequestError } from './aitaError';

export const aitaClient = axios.create({
  baseURL: AITA_API_BASE || undefined,
  timeout: AITA_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

aitaClient.interceptors.request.use((config) => {
  if (env.aitaApiKey) {
    config.headers.Authorization = `Bearer ${env.aitaApiKey}`;
  }
  return config;
});

async function post<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  if (!AITA_API_BASE) {
    throw new AitaRequestError(AITA_CONFIG_ERROR);
  }

  try {
    const response = await aitaClient.post<T>(url, body, { signal });
    return response.data;
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw toAitaRequestError(error);
  }
}

export const aitaService = {
  generateDescription(body: GenerateTaskDescriptionCommand, signal?: AbortSignal) {
    return post<GeneratedTaskContent>('/api/v1/tasks/description', body, signal);
  },

  estimatePrice(body: EstimateFairPriceCommand, signal?: AbortSignal) {
    return post<PriceEstimate>('/api/v1/tasks/price-estimate', body, signal);
  },

  indexTask(body: TaskText, signal?: AbortSignal) {
    return post<IndexedResource>('/api/v1/matchmaking/tasks', body, signal);
  },

  indexProvider(body: ProviderProfile, signal?: AbortSignal) {
    return post<IndexedResource>('/api/v1/matchmaking/providers', body, signal);
  },

  searchProviders(body: SemanticMatchCommand, signal?: AbortSignal) {
    return post<MatchResult[]>('/api/v1/matchmaking/search', body, signal);
  },

  analyzeSentiment(body: AitaReviewInput, signal?: AbortSignal) {
    return post<SentimentAnalysis>('/api/v1/reviews/sentiment', body, signal);
  },

  analyzeShield(body: FraudCheckCommand, signal?: AbortSignal) {
    return post<FraudAnalysis>('/api/v1/shield/analyze', body, signal);
  },

  optimizeProfile(body: ProviderProfile, signal?: AbortSignal) {
    return post<ProfileOptimization>('/api/v1/profiles/optimize', body, signal);
  },
};
