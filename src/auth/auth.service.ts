import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { LoginUserDto } from './dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const newUser = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(newUser);
      delete (newUser as { password?: string }).password;
      return {
        ...newUser,
        token: this.getJwtToken({ id: newUser.id, email: newUser.email }),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true, roles: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      id: user.id,
      email: user.email,
      token: this.getJwtToken({ id: user.id, email: user.email }),
    };
  }

  checkAuthStatus(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      token: this.getJwtToken({ id: user.id, email: user.email }),
    };
  }

  private handleDBExceptions(error: any): never {
    if (error instanceof QueryFailedError) {
      throw new BadRequestException(this.getErrorMessage(error.message));
    }
    this.logger.error(`Error creating user: ${error}`);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  private getErrorMessage(message: string): string {
    // Check for known database errors and return a formalized message
    if (message.includes('duplicate key value')) {
      // Postgres duplicate key on unique constraint error
      return 'User already exists';
    }
    if (message.includes('violates foreign key constraint')) {
      return 'Resource does not exist';
    }
    if (message.includes('violates not-null constraint')) {
      return 'Required field is missing';
    }
    // Add more custom parsing as needed for other messages

    return 'Unexpected database error. Check server logs';
  }

  private getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
