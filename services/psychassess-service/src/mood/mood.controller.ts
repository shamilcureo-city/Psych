import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MoodService } from './mood.service';
import { LogMoodDto } from './dto/log-mood.dto';

@ApiTags('mood')
@Controller('mood')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post(':clientId')
  @ApiOperation({ summary: 'Log a daily mood entry' })
  @ApiParam({ name: 'clientId', description: 'The client ID' })
  logMood(
    @Param('clientId') clientId: string,
    @Body() dto: LogMoodDto,
  ) {
    return this.moodService.logMood(clientId, dto.moodScore, dto.note, dto.tags);
  }

  @Get(':clientId')
  @ApiOperation({ summary: 'Get mood history for a client' })
  @ApiParam({ name: 'clientId', description: 'The client ID' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days of history to retrieve' })
  getMoodHistory(
    @Param('clientId') clientId: string,
    @Query('days') days?: number,
  ) {
    return this.moodService.getMoodHistory(clientId, days ? Number(days) : 30);
  }
}
