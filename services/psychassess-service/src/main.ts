import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ThrottleInterceptor } from './common/interceptors/throttle.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ThrottleInterceptor(configService),
  );

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || 'http://localhost:3004',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PsychAssess Service')
    .setDescription('Psychological Assessment & Counseling API — Cureocity Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('assessments', 'Assessment delivery, scoring, and results')
    .addTag('crisis', 'Crisis detection and resource management')
    .addTag('mood', 'Daily mood logging')
    .addTag('history', 'Longitudinal score tracking')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 3029;
  await app.listen(port, '0.0.0.0');
  Logger.log(`PsychAssess service running on port ${port}`, 'Bootstrap');
}

bootstrap();
