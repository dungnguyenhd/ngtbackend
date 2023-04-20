import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '9nCArUjGO6iCApM6AGuX8ETQHbnDXV1RvDIsL3hfmbU=',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateByJwt(payload);
    return user;
    // switch (user.status) {
    //   case null:
    //     throw new UnauthorizedException();
    //   case Status.DISABLE:
    //     throw new UnauthorizedException(USER_BLOCKED);
    //   case Status.DELETED:
    //     throw new UnauthorizedException(WRONG_USER_NAME);
    //   default:
    //     return user;
    // }
  }
}
