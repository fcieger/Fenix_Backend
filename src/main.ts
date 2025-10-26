import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AccessLogInterceptor } from './user-access-logs/interceptors/access-log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS dinamicamente
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3004', // ambiente local do frontend
    'https://fenixfrontendatual.vercel.app', // domínio real do frontend no Vercel
  ];

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configurar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

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
