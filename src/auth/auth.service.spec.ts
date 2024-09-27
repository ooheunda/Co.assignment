import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { User } from '../common/entities/user.entity';

import { AuthService } from './auth.service';
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

    it('이미 존재하는 email 주소로 가입하는 경우', async () => {
      const existUser = { email: 'email@email.com' } as User;
      userRepository.findOneBy.mockResolvedValue(existUser);

      await expect(authService.signUp(signUpDto)).rejects.toThrow(ConflictException);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: signUpDto.email });
      expect(configService.get).not.toHaveBeenCalled();
    });
  });
});
