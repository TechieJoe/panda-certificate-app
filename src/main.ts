import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import expressLayouts from 'express-ejs-layouts';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(process.cwd(), 'src', 'views'));

  app.setViewEngine('ejs');

  app.use(expressLayouts);
    
  app.set('layout', 'layout/main');

  app.useStaticAssets(
    join(process.cwd(), 'src', 'public'), 
  );
                            
  app.enableCors({
    origin: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}

bootstrap();