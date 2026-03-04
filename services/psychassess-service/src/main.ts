import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3004',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PsychAssess Service')
    .setDescription('Psychological Assessment & Counseling API — Cureocity Platform')
    .setVersion('1.0')
    .addTag('assessments', 'Assessment delivery, scoring, and results')
    .addTag('crisis', 'Crisis detection and resource management')
    .addTag('mood', 'Daily mood logging')
    .addTag('history', 'Longitudinal score tracking')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3029;
  await app.listen(port, '0.0.0.0');
  console.log(`PsychAssess service running on port ${port}`);
}

bootstrap();
