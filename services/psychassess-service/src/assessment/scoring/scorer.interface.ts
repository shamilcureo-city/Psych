import {
  AssessmentToolType,
  ScoredResult,
} from '@psychassess/shared';

export interface ResponseMap {
  [questionId: string]: number;
}

export interface AssessmentScorer {
  toolType: AssessmentToolType;
  score(responses: ResponseMap): ScoredResult;
}
