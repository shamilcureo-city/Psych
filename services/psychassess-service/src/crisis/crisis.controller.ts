import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CrisisService } from './crisis.service';

@ApiTags('crisis')
@Controller('crisis')
export class CrisisController {
  constructor(private readonly crisisService: CrisisService) {}

  @Get('resources')
  @ApiOperation({ summary: 'Get crisis helpline resources' })
  getResources() {
    return this.crisisService.getCrisisResources();
  }

  @Get('client/:clientId/active')
  @ApiOperation({ summary: 'Get active (unresolved) crisis events for a client' })
  @ApiParam({ name: 'clientId' })
  getActiveCrisisEvents(@Param('clientId') clientId: string) {
    return this.crisisService.getActiveCrisisEvents(clientId);
  }

  @Post(':eventId/resolve')
  @ApiOperation({ summary: 'Resolve a crisis event' })
  @ApiParam({ name: 'eventId' })
  resolveCrisisEvent(
    @Param('eventId') eventId: string,
    @Body('resolvedBy') resolvedBy: string,
  ) {
    return this.crisisService.resolveCrisisEvent(eventId, resolvedBy);
  }
}
