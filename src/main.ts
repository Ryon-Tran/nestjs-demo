import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Bật validation toàn cục cho mọi request vào API.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các thuộc tính không có trong DTO.
      forbidNonWhitelisted: true, // Trả lỗi nếu dữ liệu không hợp lệ
      transform: true, // Tự động chuyển đổi các kiểu dữ liệu
    }),
  );
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Áp dụng Exception Filter toàn cục
  app.useGlobalFilters(new HttpExceptionFilter());

  // Áp dụng Interceptor toàn cục
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Hệ Thống Quản Lý API') // Thay đổi tiêu đề chính tại đây
    .setDescription('Tài liệu hướng dẫn sử dụng và test các API') // Thay đổi mô tả tại đây
    .setVersion('1.0') // Phiên bản API
    .addBearerAuth() // Thêm cấu hình JWT Token nếu API của bạn cần bảo mật
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}
void bootstrap();
