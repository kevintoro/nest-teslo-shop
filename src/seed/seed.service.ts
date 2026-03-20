import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    try {
      await this.deleteAllData();
      await this.insertUsers();
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
    const seedUser = await this.userRepository.findOneBy({
      email: initialData.users[0].email,
    });
    if (!seedUser) {
      throw new InternalServerErrorException('Seed user not found');
    }
    const products = initialData.products;
    const insertPromises = products.map((product) =>
      this.productsService.create(product, seedUser),
    );
    await Promise.all(insertPromises);
    return true;
  }

  private async insertUsers() {
    const users = initialData.users;
    const insertPromises = users.map((user) => {
      user.password = bcrypt.hashSync(user.password, 10);
      return this.userRepository.save(this.userRepository.create(user));
    });
    await Promise.all(insertPromises);
    return true;
  }

  private async deleteAllData() {
    await this.productsService.deleteAllProducts();
    const userQuery = this.userRepository.createQueryBuilder('user');
    await userQuery.delete().where({}).execute();
  }
}
