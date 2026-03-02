import {
  BadRequestException,
  Controller,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
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
    return {
      fileName: file.originalname,
    };
  }
}
