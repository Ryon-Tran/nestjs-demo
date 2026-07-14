import { Injectable } from '@nestjs/common';
import 'multer';

@Injectable()
export class UploadService {
  upload(file: Express.Multer.File) {
    return {
      message: 'Upload file thành công',
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `http://localhost:3000/uploads/${file.filename}`,
    };
  }
}
