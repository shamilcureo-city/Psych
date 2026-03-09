import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ASSESSMENT_TOOLS, AssessmentToolType } from '@psychassess/shared';

@Injectable()
export class ShareService {
  private readonly logger = new Logger(ShareService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createShareLink(userId: string, resultId: string, expiresAt?: string) {
    // Verify the result belongs to this user
    const result = await this.prisma.assessmentResult.findFirst({
      where: { id: resultId, userId },
    });

    if (!result) {
      throw new NotFoundException('Result not found or does not belong to you');
    }

    const link = await this.prisma.shareLink.create({
      data: {
        userId,
        resultId,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });

    this.logger.log(`Share link created: ${link.token} for result ${resultId}`);
    return {
      token: link.token,
      url: `/shared/${link.token}`,
      expiresAt: link.expiresAt,
    };
  }

  async getSharedResult(token: string) {
    const link = await this.prisma.shareLink.findUnique({
      where: { token },
      include: {
        result: true,
        user: { select: { name: true } },
      },
    });

    if (!link || !link.isActive) {
      throw new NotFoundException('Share link not found or has been deactivated');
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new ForbiddenException('This share link has expired');
    }

    // Increment view count
    await this.prisma.shareLink.update({
      where: { id: link.id },
      data: { viewCount: { increment: 1 } },
    });

    const tool = ASSESSMENT_TOOLS[link.result.toolType as AssessmentToolType];

    return {
      patientName: link.user.name || 'Anonymous',
      toolName: tool?.name || link.result.toolType,
      toolFullName: tool?.fullName || link.result.toolType,
      domain: tool?.domain || 'N/A',
      totalScore: link.result.totalScore,
      maxPossibleScore: link.result.maxPossibleScore,
      severityBand: link.result.severityBand,
      severityLabel: link.result.severityLabel,
      clinicalInterpretation: link.result.clinicalInterpretation,
      recommendation: link.result.recommendation,
      riskLevel: link.result.riskLevel,
      subscaleScores: link.result.subscaleScores,
      assessedAt: link.result.createdAt,
    };
  }

  async getUserShareLinks(userId: string) {
    return this.prisma.shareLink.findMany({
      where: { userId, isActive: true },
      include: {
        result: {
          select: {
            toolType: true,
            totalScore: true,
            severityBand: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivateShareLink(userId: string, token: string) {
    const link = await this.prisma.shareLink.findFirst({
      where: { token, userId },
    });

    if (!link) {
      throw new NotFoundException('Share link not found');
    }

    await this.prisma.shareLink.update({
      where: { id: link.id },
      data: { isActive: false },
    });

    return { deactivated: true };
  }
}
