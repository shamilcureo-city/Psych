import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  plan: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    plan: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.jwtSecret = this.config.get<string>('JWT_SECRET') || 'change-me-in-production';
    this.jwtExpiresIn = this.config.get<string>('JWT_EXPIRES_IN') || '24h';
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        subscription: {
          create: { plan: 'FREE', status: 'ACTIVE' },
        },
      },
      include: { subscription: true },
    });

    this.logger.log(`User registered: ${user.email}`);
    return this.generateAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { subscription: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`User logged in: ${user.email}`);
    return this.generateAuthResponse(user);
  }

  async googleAuth(googleId: string, email: string, name?: string, avatarUrl?: string): Promise<AuthResponse> {
    let user = await this.prisma.user.findUnique({
      where: { googleId },
      include: { subscription: true },
    });

    if (!user) {
      // Check if email exists (link accounts)
      user = await this.prisma.user.findUnique({
        where: { email },
        include: { subscription: true },
      });

      if (user) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatarUrl, name: user.name || name },
          include: { subscription: true },
        });
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email,
            name,
            googleId,
            avatarUrl,
            emailVerified: true,
            subscription: {
              create: { plan: 'FREE', status: 'ACTIVE' },
            },
          },
          include: { subscription: true },
        });
        this.logger.log(`Google user registered: ${user.email}`);
      }
    }

    return this.generateAuthResponse(user);
  }

  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch {
      return null;
    }
  }

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      plan: user.subscription?.plan || 'FREE',
      subscriptionStatus: user.subscription?.status || 'ACTIVE',
      currentPeriodEnd: user.subscription?.currentPeriodEnd,
      createdAt: user.createdAt,
    };
  }

  // Migrate localStorage data to user account
  async migrateClientData(userId: string, oldClientId: string): Promise<{ migrated: number }> {
    let migrated = 0;

    // Migrate assessment sessions
    const sessions = await this.prisma.assessmentSession.updateMany({
      where: { clientId: oldClientId, userId: null },
      data: { userId },
    });
    migrated += sessions.count;

    // Migrate results
    await this.prisma.assessmentResult.updateMany({
      where: { clientId: oldClientId, userId: null },
      data: { userId },
    });

    // Migrate mood logs
    await this.prisma.moodLog.updateMany({
      where: { clientId: oldClientId, userId: null },
      data: { userId },
    });

    // Migrate score history
    await this.prisma.clientScoreHistory.updateMany({
      where: { clientId: oldClientId, userId: null },
      data: { userId },
    });

    // Migrate crisis events
    await this.prisma.crisisEvent.updateMany({
      where: { clientId: oldClientId, userId: null },
      data: { userId },
    });

    this.logger.log(`Migrated ${migrated} items from client ${oldClientId} to user ${userId}`);
    return { migrated };
  }

  private generateAuthResponse(user: { id: string; email: string; name: string | null; role: string; subscription?: { plan: string } | null }): AuthResponse {
    const plan = user.subscription?.plan || 'FREE';
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      plan,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as string & jwt.SignOptions['expiresIn'],
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan,
      },
    };
  }
}
