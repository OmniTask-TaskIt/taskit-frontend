/** Contratos de AITA (OpenAPI 3.1). Los campos siguen el snake_case del backend. */

export type AitaTaskCategory = 'ARREGLOS' | 'EDUCACION';

export type SentimentLabel = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export type FraudRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AnomalyType = 'FRAUD' | 'HARASSMENT' | 'SPAM' | 'PHISHING';

export type TextAnalysisSource = 'TASK_DESCRIPTION' | 'CHAT_MESSAGE' | 'REVIEW';

export interface GenerateTaskDescriptionCommand {
  idea: string;
}

export interface GeneratedTaskContent {
  title: string;
  description: string;
}

export interface EstimateFairPriceCommand {
  description: string;
  category: AitaTaskCategory;
  location: string;
}

export interface PriceEstimate {
  min_price: number;
  max_price: number;
  currency?: string;
  confidence: number;
  rationale: string;
}

export interface TaskText {
  task_id: string;
  task_name: string;
  task_description: string;
  category: AitaTaskCategory;
}

export interface ProviderProfile {
  provider_id: string;
  display_name: string;
  bio?: string;
  skills?: string[];
  location?: string;
  categories?: AitaTaskCategory[];
}

export interface IndexedResource {
  status?: string;
  resource_id: string;
}

export interface SemanticMatchCommand {
  task_id: string;
  task_name: string;
  task_description: string;
  category: AitaTaskCategory;
  limit?: number;
}

export interface MatchResult {
  task_id: string;
  provider_id: string;
  score: number;
  rationale?: string;
}

export interface AitaReviewInput {
  review_id: string;
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface SentimentAnalysis {
  review_id: string;
  sentiment: SentimentLabel;
  score: number;
  keywords: string[];
  summary: string;
}

export interface FraudCheckCommand {
  source: TextAnalysisSource;
  source_id: string;
  text: string;
  task_id?: string | null;
  chat_id?: string | null;
  sender_id?: string | null;
}

export interface FraudAnalysis {
  source: TextAnalysisSource;
  source_id: string;
  task_id?: string | null;
  chat_id?: string | null;
  is_anomaly: boolean;
  risk_level: FraudRiskLevel;
  anomaly_types: AnomalyType[];
  explanation: string;
  flagged_excerpt?: string;
}

export interface ProfileOptimization {
  provider_id: string;
  suggestions: string[];
  optimized_bio?: string | null;
  keywords?: string[];
}
