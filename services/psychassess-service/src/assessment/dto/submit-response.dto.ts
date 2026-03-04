import { IsInt, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitResponseDto {
  @ApiProperty({ description: 'Question ID (e.g., phq9_1)' })
  @IsString()
  questionId!: string;

  @ApiProperty({ description: 'Selected response value (numeric)' })
  @IsInt()
  @Min(0)
  @Max(4)
  responseValue!: number;

  @ApiProperty({ description: 'Selected response text label' })
  @IsString()
  responseText!: string;
}
