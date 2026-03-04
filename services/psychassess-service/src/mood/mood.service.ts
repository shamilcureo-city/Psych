import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MoodService {
  constructor(private readonly prisma: PrismaService) {}

  async logMood(clientId: string, moodScore: number, note?: string, tags?: string[]) {
    if (moodScore < 1 || moodScore > 5) {
      throw new BadRequestException('Mood score must be between 1 and 5');
    }

    return this.prisma.moodLog.create({
      data: {
        clientId,
        moodScore,
        note,
        tags: tags ?? [],
      },
    });
  }

  async getMoodHistory(clientId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.moodLog.findMany({
      where: {
        clientId,
        logDate: { gte: since },
      },
      orderBy: { logDate: 'asc' },
    });
  }
}
