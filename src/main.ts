import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(PORT);
}
bootstrap()
  .then(() => {
    Logger.log(`Server is running on port ${PORT}`, 'Bootstrap');
  })
  .catch((error) => {
    Logger.error(`Error starting the server: ${error}`, 'Bootstrap');
  });
