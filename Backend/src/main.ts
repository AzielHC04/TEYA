import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para que Angular pueda comunicarse con NestJS
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();