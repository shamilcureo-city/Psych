import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

const PLAN_PRICES: Record<string, { amount: number; name: string; razorpayPlanId?: string }> = {
  WELLNESS: { amount: 29900, name: 'Wellness Plan — ₹299/month' },
  CLINICAL: { amount: 299900, name: 'Clinical Plan — ₹2,999/month' },
};

const PLAN_LIMITS: Record<string, { assessmentsPerMonth: number; pdfExport: boolean; sharing: boolean }> = {
  FREE: { assessmentsPerMonth: 1, pdfExport: false, sharing: false },
  WELLNESS: { assessmentsPerMonth: -1, pdfExport: true, sharing: true },
  CLINICAL: { assessmentsPerMonth: -1, pdfExport: true, sharing: true },
};

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private razorpay: { orders: { create: (opts: Record<string, unknown>) => Promise<{ id: string }> }; subscriptions: { create: (opts: Record<string, unknown>) => Promise<{ id: string; short_url: string }> } } | null = null;
  private razorpayKeySecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const keyId = this.config.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET');
    this.razorpayKeySecret = keySecret || '';

    if (keyId && keySecret) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Razorpay = require('razorpay');
      this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      this.logger.log('Razorpay initialized');
    } else {
      this.logger.warn('Razorpay not configured — subscription endpoints will return mock data');
    }
  }

  async getUserPlan(userId: string): Promise<string> {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    return sub?.plan || 'FREE';
  }

  async getPlanLimits(userId: string) {
    const plan = await this.getUserPlan(userId);
    return { plan, ...PLAN_LIMITS[plan] || PLAN_LIMITS.FREE };
  }

  async checkAssessmentLimit(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const limits = await this.getPlanLimits(userId);
    if (limits.assessmentsPerMonth === -1) return { allowed: true };

    // Count assessments this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await this.prisma.assessmentSession.count({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: startOfMonth },
      },
    });

    if (count >= limits.assessmentsPerMonth) {
      return {
        allowed: false,
        reason: `Free plan allows ${limits.assessmentsPerMonth} assessment(s) per month. Upgrade to Wellness for unlimited.`,
      };
    }

    return { allowed: true };
  }

  async createCheckout(userId: string, plan: string) {
    const planInfo = PLAN_PRICES[plan];
    if (!planInfo) {
      throw new BadRequestException(`Invalid plan: ${plan}`);
    }

    // Get or create subscription record
    let subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await this.prisma.subscription.create({
        data: { userId, plan: 'FREE', status: 'ACTIVE' },
      });
    }

    if (!this.razorpay) {
      // Mock mode for development
      return {
        checkoutUrl: null,
        orderId: `mock_order_${Date.now()}`,
        amount: planInfo.amount,
        currency: 'INR',
        plan: planInfo.name,
        message: 'Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
      };
    }

    // Create Razorpay order
    const order = await this.razorpay.orders.create({
      amount: planInfo.amount,
      currency: 'INR',
      receipt: `sub_${userId}_${Date.now()}`,
      notes: {
        userId,
        plan,
      },
    });

    return {
      orderId: order.id,
      amount: planInfo.amount,
      currency: 'INR',
      plan: planInfo.name,
      keyId: this.config.get<string>('RAZORPAY_KEY_ID'),
    };
  }

  async verifyPayment(
    userId: string,
    razorpayPaymentId: string,
    razorpayOrderIdOrSubId: string,
    razorpaySignature: string,
    plan: string,
  ) {
    // Verify signature
    const body = razorpayOrderIdOrSubId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', this.razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Activate subscription
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        status: 'ACTIVE',
        razorpaySubId: razorpayOrderIdOrSubId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId,
        plan,
        status: 'ACTIVE',
        razorpaySubId: razorpayOrderIdOrSubId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    this.logger.log(`Subscription activated for user ${userId}: ${plan}`);
    return { status: 'active', plan };
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.plan === 'FREE') {
      throw new NotFoundException('No active subscription found');
    }

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        // Keep access until period end
      },
    });

    this.logger.log(`Subscription cancelled for user ${userId}`);
    return { status: 'cancelled', accessUntil: subscription.currentPeriodEnd };
  }

  // Webhook handler for Razorpay events
  async handleWebhook(event: string, payload: Record<string, unknown>) {
    this.logger.log(`Razorpay webhook: ${event}`);

    switch (event) {
      case 'subscription.charged':
        // Extend period
        break;
      case 'subscription.cancelled':
        // Mark cancelled
        break;
      case 'payment.failed':
        // Mark past_due
        break;
      default:
        this.logger.warn(`Unhandled webhook event: ${event}`);
    }
  }
}
