import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AssessmentModule } from './assessment/assessment.module';
import { CrisisModule } from './crisis/crisis.module';
import { MoodModule } from './mood/mood.module';
import { HistoryModule } from './history/history.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { EmailModule } from './email/email.module';
import { PdfModule } from './pdf/pdf.module';
import { ShareModule } from './share/share.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AssessmentModule,
    CrisisModule,
    MoodModule,
    HistoryModule,
    SubscriptionModule,
    EmailModule,
    PdfModule,
    ShareModule,
  ],
})
export class AppModule {}
