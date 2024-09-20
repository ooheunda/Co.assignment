import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';

import { User } from '../common/entities/user.entity';

import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { email, password } = signInDto;

    const user = await this.userRepository.findOne({ where: { email }, select: ['password'] });

    // email이 틀린(없는) 경우
    if (user === null) {
      throw new NotFoundException('email not found');
    }

    // 비밀번호가 틀린 경우
    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('invalid password');
    }

    const accessToken = this.jwtService.sign({ sub: email });

    return { accessToken };
  }
}
