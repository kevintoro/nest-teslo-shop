import {
  BadRequestException,
  Controller,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(
    @UploadedFile(new ParseFilePipe()) file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Invalid file type. Only images are allowed.',
      );
    }
    const secureUrl = `${process.env.HOST_API}/files/product/${file.filename}`;
    return {
      fileName: file.originalname,
      secureUrl,
    };
  }
}
