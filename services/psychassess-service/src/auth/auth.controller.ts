import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, GoogleAuthDto } from './dto/register.dto';
import { JwtAuthGuard, SetPublic } from './guards/jwt.guard';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class MigrateDto {
  @ApiProperty({ description: 'Old client ID from localStorage' })
  @IsString()
  oldClientId!: string;
}

@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @SetPublic()
  @ApiOperation({ summary: 'Register a new account' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @SetPublic()
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('google')
  @SetPublic()
  @ApiOperation({ summary: 'Authenticate with Google OAuth' })
  async googleAuth(@Body() dto: GoogleAuthDto) {
    // In production, verify the idToken with Google's API
    // For now, decode the token payload (the frontend will handle the OAuth flow)
    // This is a simplified flow - in production use passport-google-oauth20
    return { message: 'Google auth endpoint ready. Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: { user: { sub: string } }) {
    return this.authService.getUserProfile(req.user.sub);
  }

  @Post('migrate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Migrate localStorage data to authenticated account' })
  async migrateData(
    @Request() req: { user: { sub: string } },
    @Body() dto: MigrateDto,
  ) {
    return this.authService.migrateClientData(req.user.sub, dto.oldClientId);
  }
}
