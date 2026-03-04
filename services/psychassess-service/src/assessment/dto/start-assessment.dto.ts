import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AssessmentToolType } from '@psychassess/shared';

export class StartAssessmentDto {
  @ApiProperty({ description: 'Client ID from client-management service' })
  @IsString()
  clientId!: string;

  @ApiProperty({ enum: AssessmentToolType, description: 'Assessment tool type' })
  @IsEnum(AssessmentToolType)
  toolType!: AssessmentToolType;
}
