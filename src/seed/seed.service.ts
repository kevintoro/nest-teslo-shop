import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    try {
      await this.insertProducts();
    } catch (error) {
      this.logger.error('Error inserting products', error);
      throw new InternalServerErrorException(
        'Error executing seed - Check server logs for more details',
      );
    }
    return {
      message: 'Seed executed successfully',
    };
  }

  private async insertProducts() {
    await this.productsService.deleteAllProducts();
    const products = initialData.products;
    const insertPromises = products.map((product) =>
      this.productsService.create(product),
    );
    await Promise.all(insertPromises);
    return true;
  }
}
