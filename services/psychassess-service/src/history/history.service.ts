import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssessmentToolType } from '@psychassess/shared';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getScoreTimeline(clientId: string, toolType?: string) {
    const where: any = { clientId };
    if (toolType) where.toolType = toolType;

    return this.prisma.clientScoreHistory.findMany({
      where,
      orderBy: { assessedAt: 'asc' },
    });
  }

  async getLatestScores(clientId: string) {
    const toolTypes = Object.values(AssessmentToolType);
    const results: any[] = [];

    for (const toolType of toolTypes) {
      const latest = await this.prisma.clientScoreHistory.findFirst({
        where: { clientId, toolType },
        orderBy: { assessedAt: 'desc' },
      });
      if (latest) results.push(latest);
    }

    return results;
  }

  async getClientSummary(clientId: string) {
    const [sessions, latestScores, moodLogs, crisisEvents] = await Promise.all([
      this.prisma.assessmentSession.count({ where: { clientId } }),
      this.getLatestScores(clientId),
      this.prisma.moodLog.findMany({
        where: { clientId },
        orderBy: { logDate: 'desc' },
        take: 7,
      }),
      this.prisma.crisisEvent.count({
        where: { clientId, resolvedAt: null },
      }),
    ]);

    return {
      totalSessions: sessions,
      latestScores,
      recentMoodLogs: moodLogs,
      activeCrisisEvents: crisisEvents,
    };
  }
}
