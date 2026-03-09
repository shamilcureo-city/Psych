import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ enum: ['WELLNESS', 'CLINICAL'], description: 'Plan to subscribe to' })
  @IsString()
  @IsIn(['WELLNESS', 'CLINICAL'])
  plan!: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Razorpay payment ID' })
  @IsString()
  razorpayPaymentId!: string;

  @ApiProperty({ description: 'Razorpay subscription ID' })
  @IsString()
  razorpaySubscriptionId!: string;

  @ApiProperty({ description: 'Razorpay signature' })
  @IsString()
  razorpaySignature!: string;
}
