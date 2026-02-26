import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  executeSeed() {
    return this.seedService.runSeed();
  }
}
