import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CrisisService } from './crisis.service';
import { ResolveCrisisDto } from './dto/resolve-crisis.dto';

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
  @ApiParam({ name: 'clientId', description: 'The client ID' })
  getActiveCrisisEvents(@Param('clientId') clientId: string) {
    return this.crisisService.getActiveCrisisEvents(clientId);
  }

  @Post(':eventId/resolve')
  @ApiOperation({ summary: 'Resolve a crisis event' })
  @ApiParam({ name: 'eventId', description: 'The crisis event ID' })
  resolveCrisisEvent(
    @Param('eventId') eventId: string,
    @Body() dto: ResolveCrisisDto,
  ) {
    return this.crisisService.resolveCrisisEvent(eventId, dto.resolvedBy);
  }
}
