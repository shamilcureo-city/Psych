import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AssessmentModule } from './assessment/assessment.module';
import { CrisisModule } from './crisis/crisis.module';
import { MoodModule } from './mood/mood.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AssessmentModule,
    CrisisModule,
    MoodModule,
    HistoryModule,
  ],
})
export class AppModule {}
