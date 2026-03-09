import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShareLinkDto {
  @ApiProperty({ description: 'Assessment result ID to share' })
  @IsString()
  resultId!: string;

  @ApiProperty({ description: 'Optional expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
