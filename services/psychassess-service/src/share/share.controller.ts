import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ShareService } from './share.service';
import { CreateShareLinkDto } from './dto/create-share.dto';
import { JwtAuthGuard, SetPublic, RequirePlan } from '../auth/guards/jwt.guard';

@ApiTags('share')
@Controller('share')
@UseGuards(JwtAuthGuard)
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  @ApiBearerAuth()
  @RequirePlan('WELLNESS', 'CLINICAL')
  @ApiOperation({ summary: 'Create a shareable link for a result (Wellness+ plan)' })
  async createShareLink(
    @Request() req: { user: { sub: string } },
    @Body() dto: CreateShareLinkDto,
  ) {
    return this.shareService.createShareLink(req.user.sub, dto.resultId, dto.expiresAt);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all your share links' })
  async getUserShareLinks(@Request() req: { user: { sub: string } }) {
    return this.shareService.getUserShareLinks(req.user.sub);
  }

  @Get(':token')
  @SetPublic()
  @ApiOperation({ summary: 'View a shared result (public, no auth required)' })
  @ApiParam({ name: 'token', description: 'Share link token' })
  async getSharedResult(@Param('token') token: string) {
    return this.shareService.getSharedResult(token);
  }

  @Delete(':token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a share link' })
  @ApiParam({ name: 'token', description: 'Share link token' })
  async deactivateShareLink(
    @Request() req: { user: { sub: string } },
    @Param('token') token: string,
  ) {
    return this.shareService.deactivateShareLink(req.user.sub, token);
  }
}
