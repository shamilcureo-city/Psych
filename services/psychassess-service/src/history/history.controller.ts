import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { HistoryService } from './history.service';

@ApiTags('history')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get(':clientId/timeline')
  @ApiOperation({ summary: 'Get score timeline for longitudinal tracking' })
  @ApiParam({ name: 'clientId' })
  @ApiQuery({ name: 'toolType', required: false })
  getTimeline(
    @Param('clientId') clientId: string,
    @Query('toolType') toolType?: string,
  ) {
    return this.historyService.getScoreTimeline(clientId, toolType);
  }

  @Get(':clientId/latest')
  @ApiOperation({ summary: 'Get latest scores across all tools' })
  @ApiParam({ name: 'clientId' })
  getLatestScores(@Param('clientId') clientId: string) {
    return this.historyService.getLatestScores(clientId);
  }

  @Get(':clientId/summary')
  @ApiOperation({ summary: 'Get comprehensive client summary' })
  @ApiParam({ name: 'clientId' })
  getClientSummary(@Param('clientId') clientId: string) {
    return this.historyService.getClientSummary(clientId);
  }
}
