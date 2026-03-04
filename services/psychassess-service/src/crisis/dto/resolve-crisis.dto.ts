import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveCrisisDto {
  @ApiProperty({ description: 'Identifier of the person resolving the crisis event' })
  @IsString()
  @IsNotEmpty()
  resolvedBy!: string;
}
