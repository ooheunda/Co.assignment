import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { User } from '../common/entities/user.entity';
import { UserPayload } from '../common/types/user-payload.type';

import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * email이 중복되지 않았다면 회원가입합니다.
   * @param signUpDto
   */
  async signUp(signUpDto: SignUpDto): Promise<void> {
    const { email, password, name } = signUpDto;

    // email 중복 확인
    const user = await this.userRepository.findOneBy({ email });
    if (user !== null) {
      throw new ConflictException('email already exists');
    }

    const salt = await this.configService.get('BCRYPT_SALT');
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.userRepository.insert({ email, password: hashedPassword, name });
  }

  /**
   * 암호화된 비밀번호와의 대조를 통해 로그인합니다.
   * 아이디/비밀번호가 다를 때 각각 다른 예외처리를 합니다.
   * @param signInDto
   * @returns Access Token
   */
  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { email, password } = signInDto;

    const user = await this.userRepository.findOne({ where: { email }, select: ['password', 'userType', 'deletedAt'] });

    // email이 틀린(없는) 경우
    if (user === null) {
      throw new NotFoundException('email not found');
    }

    // 탈퇴한 유저인 경우
    if (user.deletedAt !== null) {
      throw new NotFoundException('deleted user');
    }

    // 비밀번호가 틀린 경우
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('invalid password');
    }

    const payload: UserPayload = { sub: email, type: user.userType };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
