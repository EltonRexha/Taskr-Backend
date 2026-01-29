import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Taskr API')
    .setDescription('API for my taskr platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app
    .getHttpAdapter()
    .get('/docs-json', (req: Request, res: Response) => res.json(document));

  app.use(
    '/webhooks/clerk',
    bodyParser.json({
      verify: (req: any, res, buf) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        req.rawBody = buf.toString();
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
