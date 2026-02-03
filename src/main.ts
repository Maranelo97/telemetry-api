import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // MUY IMPORTANTE: Usar process.env.PORT
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // El '0.0.0.0' es vital en la nube
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
