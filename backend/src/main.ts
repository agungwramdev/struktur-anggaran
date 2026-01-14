import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Configuration - Allow multiple origins
  const allowedOrigins = [
    'http://localhost:4000',           // Local development
    'http://172.16.2.24:4000',         // VPS IP
    process.env.FRONTEND_URL,          // Dynamic from environment
  ].filter(Boolean); // Remove undefined values

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Struktur Anggaran API')
    .setDescription('API Documentation for Struktur Anggaran 2026 Application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('struktur-anggaran', 'Budget structure endpoints')
    .addTag('satker', 'Satker data endpoints')
    .addTag('logs', 'Activity logs endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const usersService = app.get(UsersService);
  await usersService.seedSuperAdmin();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap();
