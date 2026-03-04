import { Injectable } from '@nestjs/common';
import { AssessmentToolType, ScoredResult } from '@psychassess/shared';
import { AssessmentScorer, ResponseMap } from './scorer.interface';
import { Phq2Scorer } from './phq2.scorer';
import { Phq9Scorer } from './phq9.scorer';
import { Gad7Scorer } from './gad7.scorer';
import { Dass21Scorer } from './dass21.scorer';
import { Who5Scorer } from './who5.scorer';
import { Pss10Scorer } from './pss10.scorer';
import { IsiScorer } from './isi.scorer';

@Injectable()
export class ScoringService {
  private readonly scorers: Map<AssessmentToolType, AssessmentScorer>;

  constructor() {
    const scorerInstances: AssessmentScorer[] = [
      new Phq2Scorer(),
      new Phq9Scorer(),
      new Gad7Scorer(),
      new Dass21Scorer(),
      new Who5Scorer(),
      new Pss10Scorer(),
      new IsiScorer(),
    ];

    this.scorers = new Map(
      scorerInstances.map((s) => [s.toolType, s]),
    );
  }

  score(toolType: AssessmentToolType, responses: ResponseMap): ScoredResult {
    const scorer = this.scorers.get(toolType);
    if (!scorer) {
      throw new Error(`No scorer registered for tool type: ${toolType}`);
    }
    return scorer.score(responses);
  }

  getSupportedTools(): AssessmentToolType[] {
    return Array.from(this.scorers.keys());
  }
}
