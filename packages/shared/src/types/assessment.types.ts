// ─── Tool Types ────────────────────────────────────────────────
export enum AssessmentToolType {
  PHQ2 = 'PHQ2',
  PHQ9 = 'PHQ9',
  GAD7 = 'GAD7',
  DASS21 = 'DASS21',
  WHO5 = 'WHO5',
  PSS10 = 'PSS10',
  ISI = 'ISI',
}

// ─── Session Status ────────────────────────────────────────────
export enum AssessmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

// ─── Risk / Severity ──────────────────────────────────────────
export enum RiskLevel {
  NONE = 'NONE',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRISIS = 'CRISIS',
}

export enum SeverityBand {
  MINIMAL = 'MINIMAL',
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  MODERATELY_SEVERE = 'MODERATELY_SEVERE',
  SEVERE = 'SEVERE',
  EXTREMELY_SEVERE = 'EXTREMELY_SEVERE',
  NORMAL = 'NORMAL',
  POOR = 'POOR',
  LOW = 'LOW',
  HIGH = 'HIGH',
  SUBTHRESHOLD = 'SUBTHRESHOLD',
  POSITIVE_SCREEN = 'POSITIVE_SCREEN',
  NEGATIVE_SCREEN = 'NEGATIVE_SCREEN',
}

// ─── Voice Session ─────────────────────────────────────────────
export enum VoiceSessionType {
  PSYCHOEDUCATION = 'PSYCHOEDUCATION',
  CBT_CHECKIN = 'CBT_CHECKIN',
  MINDFULNESS = 'MINDFULNESS',
  BEHAVIORAL_ACTIVATION = 'BEHAVIORAL_ACTIVATION',
  SLEEP_HYGIENE = 'SLEEP_HYGIENE',
  CRISIS_SUPPORT = 'CRISIS_SUPPORT',
  GUIDED_RELAXATION = 'GUIDED_RELAXATION',
}

export enum CrisisEventType {
  PHQ9_Q9 = 'PHQ9_Q9',
  VERBAL_DISTRESS = 'VERBAL_DISTRESS',
  SELF_HARM_KEYWORD = 'SELF_HARM_KEYWORD',
  CLINICIAN_FLAGGED = 'CLINICIAN_FLAGGED',
}

// ─── Question / Response Structures ───────────────────────────
export interface ResponseOption {
  value: number;
  label: string;
}

export interface AssessmentQuestion {
  id: string;
  index: number;
  text: string;
  options: ResponseOption[];
  subscale?: string;
}

export interface SeverityThreshold {
  min: number;
  max: number;
  band: SeverityBand;
  label: string;
  clinicalInterpretation: string;
  recommendation: string;
}

export interface AssessmentToolDefinition {
  type: AssessmentToolType;
  name: string;
  fullName: string;
  domain: string;
  description: string;
  itemCount: number;
  scoreRange: { min: number; max: number };
  guideline: string;
  reference: string;
  license: string;
  questions: AssessmentQuestion[];
  severityThresholds: SeverityThreshold[];
  subscales?: {
    name: string;
    questionIds: string[];
    multiplier?: number;
    severityThresholds: SeverityThreshold[];
  }[];
  crisisItems?: { questionId: string; threshold: number; action: string }[];
  adaptiveTriggers?: {
    condition: string;
    triggeredTool: AssessmentToolType;
  }[];
}

// ─── Scored Result ─────────────────────────────────────────────
export interface ScoredResult {
  toolType: AssessmentToolType;
  totalScore: number;
  maxPossibleScore: number;
  severityBand: SeverityBand;
  severityLabel: string;
  clinicalInterpretation: string;
  plainLanguageInterpretation: string;
  recommendation: string;
  riskLevel: RiskLevel;
  subscaleScores?: Record<string, { score: number; severityBand: SeverityBand; label: string }>;
  crisisFlags?: { questionId: string; score: number; action: string }[];
  adaptiveSuggestions?: AssessmentToolType[];
}

// ─── Crisis Resource ───────────────────────────────────────────
export interface CrisisResource {
  name: string;
  phone: string;
  availability: string;
  whatsapp?: string;
  region: string;
}
