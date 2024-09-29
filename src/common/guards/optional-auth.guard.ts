import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * 로그인하지 않아도 통과할 수 있도록 하는 Optional Auth Guard
 * authorization 헤더가 존재하지 않는 경우, verify 실패한 경우에도 true 반환하여 통과시킴
 * 정상 로그인 된 사용자의 경우엔 request 객체에 user 정보를 담아 넘김
 * Service에서 req.user 유무로 로직 작성
 */
@Injectable()
export class OptionalAuthGuard {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request: Request = ctx.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      request.user = null;
      return true;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch (err) {
      request.user = null;
      return true;
    }
  }
}
