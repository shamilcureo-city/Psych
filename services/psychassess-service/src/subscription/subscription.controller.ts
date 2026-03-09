import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto, VerifyPaymentDto } from './dto/create-subscription.dto';
import { JwtAuthGuard, SetPublic } from '../auth/guards/jwt.guard';

@ApiTags('subscription')
@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plan')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription plan and limits' })
  async getPlan(@Request() req: { user: { sub: string } }) {
    return this.subscriptionService.getPlanLimits(req.user.sub);
  }

  @Post('checkout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Razorpay checkout session' })
  async createCheckout(
    @Request() req: { user: { sub: string } },
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionService.createCheckout(req.user.sub, dto.plan);
  }

  @Post('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay payment and activate subscription' })
  async verifyPayment(
    @Request() req: { user: { sub: string } },
    @Body() dto: VerifyPaymentDto & { plan: string },
  ) {
    return this.subscriptionService.verifyPayment(
      req.user.sub,
      dto.razorpayPaymentId,
      dto.razorpaySubscriptionId,
      dto.razorpaySignature,
      dto.plan,
    );
  }

  @Post('cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel current subscription' })
  async cancelSubscription(@Request() req: { user: { sub: string } }) {
    return this.subscriptionService.cancelSubscription(req.user.sub);
  }

  @Post('webhook')
  @SetPublic()
  @ApiOperation({ summary: 'Razorpay webhook handler' })
  async handleWebhook(@Body() body: { event: string; payload: Record<string, unknown> }) {
    return this.subscriptionService.handleWebhook(body.event, body.payload);
  }
}
