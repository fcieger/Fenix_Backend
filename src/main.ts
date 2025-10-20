import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AccessLogInterceptor } from './user-access-logs/interceptors/access-log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3004', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Configurar validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));

  // Configurar interceptor global para logs de acesso
  // const accessLogInterceptor = app.get(AccessLogInterceptor);
  // app.useGlobalInterceptors(accessLogInterceptor);

  // Prefixo global para API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 FENIX Backend rodando na porta ${port}`);
  console.log(`📊 API disponível em: http://localhost:${port}/api`);
}
bootstrap();