import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('/api');

  const PORT = await app.get(ConfigService).get('SERVER_PORT');
  await app.listen(PORT);
};
bootstrap();
