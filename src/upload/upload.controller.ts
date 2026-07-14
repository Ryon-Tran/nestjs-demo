import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',

        filename: (_req, file, cb) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9) +
            extname(file.originalname);

          cb(null, uniqueName);
        },
      }),

      fileFilter: (_req, file, cb) => {
        const allowExt = /\.(jpg|jpeg|png|pdf)$/i;

        if (allowExt.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Chỉ cho phép upload JPG, JPEG, PNG hoặc PDF',
            ),
            false,
          );
        }
      },

      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.upload(file);
  }
}
