import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MoodService } from './mood.service';

@ApiTags('mood')
@Controller('mood')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post(':clientId')
  @ApiOperation({ summary: 'Log a daily mood entry' })
  @ApiParam({ name: 'clientId' })
  logMood(
    @Param('clientId') clientId: string,
    @Body() body: { moodScore: number; note?: string; tags?: string[] },
  ) {
    return this.moodService.logMood(clientId, body.moodScore, body.note, body.tags);
  }

  @Get(':clientId')
  @ApiOperation({ summary: 'Get mood history for a client' })
  @ApiParam({ name: 'clientId' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getMoodHistory(
    @Param('clientId') clientId: string,
    @Query('days') days?: number,
  ) {
    return this.moodService.getMoodHistory(clientId, days ? Number(days) : 30);
  }
}
