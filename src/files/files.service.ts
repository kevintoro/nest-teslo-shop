import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    const path = join(process.cwd(), 'static', 'products', imageName);
    if (!existsSync(path)) {
      throw new NotFoundException('Image not found');
    }
    return path;
  }
}
