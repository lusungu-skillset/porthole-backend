import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  let app;
  let retries = 5;
  let lastError: Error | unknown;

  while (retries > 0) {
    try {
      app = await NestFactory.create(AppModule);
      break;
    } catch (error) {
      lastError = error;
      retries--;
      if (retries > 0) {
        const errorMsg =
          error instanceof Error ? error.message : String(error);
        console.warn(
          `Failed to create app. Retrying in 3 seconds... (${retries} attempts left)`,
          errorMsg
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  if (!app) {
    console.error('Failed to start application after retries:', lastError);
    process.exit(1);
  }

  app.setGlobalPrefix('');
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
    allowedHeaders: 'Content-Type,Authorization'
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
  );
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on http://0.0.0.0:${port}`);
}

bootstrap();
