import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn().mockResolvedValue({ accessToken: 'mockToken' }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<jest.Mocked<AuthService>>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto: SignUpDto = { email: 'email@email.com', password: 'password', name: 'name' };

    it('성공적으로 회원가입', async () => {
      await authController.signUp(signUpDto);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });

    it('이미 존재하는 email 주소로 가입하는 경우 ConflictException', async () => {
      authService.signUp.mockRejectedValue(new ConflictException());
      await expect(authController.signUp(signUpDto)).rejects.toThrow(ConflictException);
    });
  });
});
