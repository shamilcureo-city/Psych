import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CRISIS_RESOURCES_INDIA } from '@psychassess/shared';
import { CrisisPublisherService } from './crisis-publisher.service';

export interface FlagCrisisDto {
  clientId: string;
  sessionId?: string;
  voiceSessionId?: string;
  flagType: string;
  severity: string;
  description?: string;
}

@Injectable()
export class CrisisService {
  private readonly logger = new Logger(CrisisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly publisher: CrisisPublisherService,
  ) {}

  async flagCrisis(dto: FlagCrisisDto) {
    this.logger.warn(
      `CRISIS FLAG: client=${dto.clientId} type=${dto.flagType} severity=${dto.severity}`,
    );

    const event = await this.prisma.crisisEvent.create({
      data: {
        clientId: dto.clientId,
        sessionId: dto.sessionId,
        voiceSessionId: dto.voiceSessionId,
        flagType: dto.flagType,
        severity: dto.severity,
        description: dto.description,
      },
    });

    // Publish crisis event for downstream consumers (Kafka in production)
    await this.publisher.publish({
      crisisEventId: event.id,
      clientId: dto.clientId,
      sessionId: dto.sessionId,
      flagType: dto.flagType,
      severity: dto.severity,
      description: dto.description,
      timestamp: new Date().toISOString(),
    });

    return {
      crisisEventId: event.id,
      flagType: dto.flagType,
      severity: dto.severity,
      resources: CRISIS_RESOURCES_INDIA,
      message:
        'If you are in immediate danger, please call emergency services (112) or a crisis helpline.',
    };
  }

  async getActiveCrisisEvents(clientId: string) {
    return this.prisma.crisisEvent.findMany({
      where: {
        clientId,
        resolvedAt: null,
      },
      orderBy: { triggeredAt: 'desc' },
    });
  }

  async resolveCrisisEvent(eventId: string, resolvedBy: string) {
    return this.prisma.crisisEvent.update({
      where: { id: eventId },
      data: {
        resolvedAt: new Date(),
        resolvedBy,
      },
    });
  }

  getCrisisResources() {
    return CRISIS_RESOURCES_INDIA;
  }
}
