import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: unknown =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Lỗi hệ thống' };

    // Nếu message là một object (thường là từ ValidationPipe), trích xuất message thực sự ra
    if (
      typeof message === 'object' &&
      message !== null &&
      'message' in message
    ) {
      message = (message as Record<string, unknown>).message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
