import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';

import { User } from '../common/entities/user.entity';

import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const { email, password, name } = signUpDto;

    // email 중복 확인
    const user = await this.userRepository.findOneBy({ email });
    if (user !== null) {
      throw new ConflictException('email already exists');
    }

    const salt = await this.configService.get('BCRYPT_SALT');
    const hashedPassword = await hash(password, salt);

    await this.userRepository.insert({ email, password: hashedPassword, name });
  }

  async signIn() {}
}
