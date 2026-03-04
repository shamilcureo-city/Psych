import { IsInt, IsString, IsOptional, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogMoodDto {
  @ApiProperty({ description: 'Mood score from 1 (very low) to 5 (very high)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  moodScore!: number;

  @ApiPropertyOptional({ description: 'Optional note about the mood entry' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ description: 'Optional tags for the mood entry', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
