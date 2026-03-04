import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AssessmentToolType } from '@psychassess/shared';
import { AssessmentService } from './assessment.service';
import { StartAssessmentDto } from './dto/start-assessment.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';

@ApiTags('assessments')
@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Get('tools')
  @ApiOperation({ summary: 'List all available assessment tools' })
  async getAvailableTools() {
    return this.assessmentService.getAvailableTools();
  }

  @Post('start')
  @ApiOperation({ summary: 'Start a new assessment session' })
  async startAssessment(@Body() dto: StartAssessmentDto) {
    return this.assessmentService.startAssessment(dto);
  }

  @Post(':sessionId/respond')
  @ApiOperation({ summary: 'Submit a response for a single question' })
  @ApiParam({ name: 'sessionId', description: 'Assessment session ID' })
  async submitResponse(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitResponseDto,
  ) {
    return this.assessmentService.submitResponse(sessionId, dto);
  }

  @Post(':sessionId/complete')
  @ApiOperation({ summary: 'Complete and score an assessment' })
  @ApiParam({ name: 'sessionId', description: 'Assessment session ID' })
  async completeAssessment(@Param('sessionId') sessionId: string) {
    return this.assessmentService.completeAssessment(sessionId);
  }

  @Get(':sessionId/result')
  @ApiOperation({ summary: 'Get the scored result for a completed assessment' })
  @ApiParam({ name: 'sessionId', description: 'Assessment session ID' })
  async getResult(@Param('sessionId') sessionId: string) {
    return this.assessmentService.getResult(sessionId);
  }

  @Get('client/:clientId/history')
  @ApiOperation({ summary: 'Get longitudinal score history for a client' })
  @ApiParam({ name: 'clientId', description: 'Client ID' })
  @ApiQuery({ name: 'toolType', required: false, enum: AssessmentToolType })
  async getClientHistory(
    @Param('clientId') clientId: string,
    @Query('toolType') toolType?: AssessmentToolType,
  ) {
    return this.assessmentService.getClientHistory(clientId, toolType);
  }

  @Get('client/:clientId/sessions')
  @ApiOperation({ summary: 'Get all assessment sessions for a client' })
  @ApiParam({ name: 'clientId', description: 'Client ID' })
  async getClientSessions(@Param('clientId') clientId: string) {
    return this.assessmentService.getClientSessions(clientId);
  }
}
