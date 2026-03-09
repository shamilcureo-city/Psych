import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    this.fromEmail = this.config.get<string>('SMTP_FROM') || 'noreply@psychassess.com';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('Email transporter configured');
    } else {
      this.logger.warn('SMTP not configured — emails will be logged to console only');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(`[EMAIL MOCK] To: ${options.to} | Subject: ${options.subject}`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: `"PsychAssess" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  // ─── Reassessment Reminders ─────────────────────────────────
  async sendReassessmentReminders(): Promise<number> {
    // Find users whose last assessment was 14+ days ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const usersWithOldAssessments = await this.prisma.user.findMany({
      where: {
        sessions: {
          some: {
            status: 'COMPLETED',
            completedAt: { lt: twoWeeksAgo },
          },
        },
      },
      include: {
        sessions: {
          where: { status: 'COMPLETED' },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Filter to only users who haven't taken an assessment in 14+ days
    const eligibleUsers = usersWithOldAssessments.filter((user) => {
      const lastSession = user.sessions[0];
      return lastSession && lastSession.completedAt && lastSession.completedAt < twoWeeksAgo;
    });

    let sent = 0;
    for (const user of eligibleUsers) {
      const lastTool = user.sessions[0]?.toolType || 'PHQ-9';
      const success = await this.sendEmail({
        to: user.email,
        subject: `Time for a check-in — retake your ${lastTool} assessment`,
        html: this.reassessmentReminderTemplate(user.name || 'there', lastTool),
      });
      if (success) sent++;
    }

    this.logger.log(`Sent ${sent} reassessment reminders`);
    return sent;
  }

  // ─── Weekly Mood Digest ─────────────────────────────────────
  async sendWeeklyMoodDigests(): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const usersWithMoodLogs = await this.prisma.user.findMany({
      where: {
        moodLogs: {
          some: {
            logDate: { gte: oneWeekAgo },
          },
        },
      },
      include: {
        moodLogs: {
          where: { logDate: { gte: oneWeekAgo } },
          orderBy: { logDate: 'asc' },
        },
      },
    });

    let sent = 0;
    for (const user of usersWithMoodLogs) {
      const avgMood = user.moodLogs.reduce((sum: number, l: { moodScore: number }) => sum + l.moodScore, 0) / user.moodLogs.length;
      const success = await this.sendEmail({
        to: user.email,
        subject: 'Your weekly mood summary from PsychAssess',
        html: this.weeklyMoodDigestTemplate(
          user.name || 'there',
          user.moodLogs.length,
          Math.round(avgMood * 10) / 10,
        ),
      });
      if (success) sent++;
    }

    this.logger.log(`Sent ${sent} weekly mood digests`);
    return sent;
  }

  // ─── Email Templates ────────────────────────────────────────

  private reassessmentReminderTemplate(name: string, toolType: string): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; font-size: 24px; margin: 0;">PsychAssess</h1>
        </div>
        <h2 style="color: #1f2937;">Hi ${name},</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          It's been 2 weeks since your last <strong>${toolType}</strong> assessment.
          Clinical guidelines recommend regular check-ins to track your progress effectively.
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          Taking just 5 minutes to reassess can reveal meaningful changes in your mental health and help you stay on track.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.config.get<string>('APP_URL') || 'http://localhost:3004'}/psych"
             style="background: linear-gradient(135deg, #3b82f6, #4f46e5); color: white; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: 600;">
            Take Your Assessment
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          PsychAssess is a screening tool and does not provide clinical diagnoses.
          <br />If you no longer wish to receive these reminders, update your notification settings.
        </p>
      </div>
    `;
  }

  private weeklyMoodDigestTemplate(name: string, entryCount: number, avgMood: number): string {
    const moodEmoji = avgMood >= 4 ? '😊' : avgMood >= 3 ? '😐' : avgMood >= 2 ? '😔' : '😞';
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; font-size: 24px; margin: 0;">PsychAssess</h1>
        </div>
        <h2 style="color: #1f2937;">Your Weekly Mood Summary</h2>
        <p style="color: #4b5563;">Hi ${name}, here's your mood recap for the past week:</p>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 8px;">${moodEmoji}</div>
          <div style="color: #1f2937; font-size: 20px; font-weight: 600;">Average Mood: ${avgMood}/5</div>
          <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">${entryCount} entries logged this week</div>
        </div>
        <p style="color: #4b5563; line-height: 1.6;">
          ${avgMood >= 3.5
            ? 'Great job keeping up with your mood tracking! Your average is looking positive.'
            : 'We notice your mood has been lower than usual. Consider taking an assessment or speaking with a professional.'}
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.config.get<string>('APP_URL') || 'http://localhost:3004'}/psych/dashboard"
             style="background: linear-gradient(135deg, #3b82f6, #4f46e5); color: white; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: 600;">
            View Your Dashboard
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          PsychAssess by Cureocity. This is a screening tool, not a diagnostic instrument.
        </p>
      </div>
    `;
  }
}
