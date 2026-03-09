import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { PdfService } from './pdf.service';
import { JwtAuthGuard, RequirePlan } from '../auth/guards/jwt.guard';

@ApiTags('pdf')
@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('report/:resultId')
  @ApiBearerAuth()
  @RequirePlan('WELLNESS', 'CLINICAL')
  @ApiOperation({ summary: 'Generate PDF report for a result (Wellness+ plan required)' })
  @ApiParam({ name: 'resultId', description: 'Assessment result ID' })
  async generateReport(
    @Param('resultId') resultId: string,
    @Request() req: { user: { sub: string } },
    @Res() reply: FastifyReply,
  ) {
    const buffer = await this.pdfService.generateReport(resultId, req.user.sub);

    reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="psychassess-report-${resultId}.pdf"`)
      .send(buffer);
  }
}
