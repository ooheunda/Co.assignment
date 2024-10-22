import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { User } from '../common/entities/user.entity';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            insert: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    jest.spyOn(bcrypt, 'hash').mockClear();
    jest.spyOn(bcrypt, 'compare').mockClear();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<jest.Mocked<Repository<User>>>(getRepositoryToken(User));
    configService = module.get<jest.Mocked<ConfigService>>(ConfigService);
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(configService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto: SignUpDto = { email: 'email@email.com', password: 'password', name: 'name' };
    const mockSalt = 3;

    it('성공적으로 회원가입', async () => {
      userRepository.findOneBy.mockResolvedValue(null);
      configService.get.mockResolvedValue(mockSalt as never);
      const hashedPassword = await bcrypt.hash(signUpDto.password, mockSalt);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never); // 외부 라이브러리는 spyOn

      await authService.signUp(signUpDto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: signUpDto.email });
      expect(configService.get).toHaveBeenCalledWith('BCRYPT_SALT');
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, mockSalt);
      expect(userRepository.insert).toHaveBeenCalledWith({
        email: signUpDto.email,
        password: hashedPassword,
        name: signUpDto.name,
      });
    });

    it('이미 존재하는 email 주소로 가입하는 경우 ConflictException', async () => {
      const existUser = { email: 'email@email.com' } as User;
      userRepository.findOneBy.mockResolvedValue(existUser);

      await expect(authService.signUp(signUpDto)).rejects.toThrow(ConflictException);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: signUpDto.email });
      expect(configService.get).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    const signInDto: SignInDto = { email: 'email@email.com', password: 'password' };
    const user = { password: 'hashedPassword', userType: 'userType', deletedAt: null } as unknown as User;

    it('성공적으로 로그인하고 accessToken 발급', async () => {
      const mockToken = { accessToken: 'mockToken' };

      userRepository.findOne.mockResolvedValue(user);
      jwtService.sign.mockReturnValue(mockToken.accessToken);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.signIn(signInDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: signInDto.email },
        select: ['password', 'userType', 'deletedAt'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(signInDto.password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: signInDto.email, type: user.userType });
      expect(result).toEqual(mockToken);
    });

    it('email이 틀린(없는) 경우 NotFoundException', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(NotFoundException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('탈퇴한 유저인 경우 NotFoundException', async () => {
      const deletedUser = { ...user, deletedAt: new Date() } as User;
      userRepository.findOne.mockResolvedValue(deletedUser);

      await expect(authService.signIn(signInDto)).rejects.toThrow(NotFoundException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('비밀번호가 틀린 경우 UnauthorizedException', async () => {
      userRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
