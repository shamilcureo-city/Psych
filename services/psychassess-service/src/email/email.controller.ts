import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@ApiTags('email')
@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('trigger/reassessment-reminders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger reassessment reminder emails (admin/cron)' })
  async triggerReassessmentReminders() {
    const sent = await this.emailService.sendReassessmentReminders();
    return { sent };
  }

  @Post('trigger/mood-digests')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger weekly mood digest emails (admin/cron)' })
  async triggerMoodDigests() {
    const sent = await this.emailService.sendWeeklyMoodDigests();
    return { sent };
  }
}
