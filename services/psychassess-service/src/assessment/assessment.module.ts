import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { ScoringService } from './scoring/scoring.service';
import { CrisisModule } from '../crisis/crisis.module';

@Module({
  imports: [CrisisModule],
  controllers: [AssessmentController],
  providers: [AssessmentService, ScoringService],
  exports: [AssessmentService, ScoringService],
})
export class AssessmentModule {}
