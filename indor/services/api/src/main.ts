import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Helmet HTTP headers
  app.use(helmet());

  // Security: CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Security: Rate limiting
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per IP per minute
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('INDOR API')
    .setDescription('Home Services Marketplace + Home Operating System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & authorization')
    .addTag('users', 'User management')
    .addTag('properties', 'Property management')
    .addTag('services', 'Service marketplace')
    .addTag('orders', 'Order lifecycle & tracking')
    .addTag('providers', 'Provider management')
    .addTag('payments', 'Payment processing')
    .addTag('documents', 'Document & file uploads')
    .addTag('admin', 'Admin operations')
    .addTag('audit-logs', 'Audit trail')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`INDOR API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api`);
}

bootstrap();
