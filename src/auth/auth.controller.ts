import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 회원가입 API
   * @param signUpDto
   */
  @Post('sign-up')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signUp(@Body() signUpDto: SignUpDto): Promise<void> {
    await this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(): Promise<void> {
    await this.authService.signIn();
  }
}
