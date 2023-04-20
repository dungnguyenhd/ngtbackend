import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
} from '@nestjs/common';
import {
  OnSuccessResponseDto,
  LoginResponseDto,
} from './dto/auth.response.dto';
import { SignupDto, LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
    //
  }

  @Post('signup')
  signup(@Body() params: SignupDto): Promise<OnSuccessResponseDto> {
    return this.authService.signup(params);
  }

  @Post('signin')
  login(@Req() params: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(params);
  }

  @Get('confirm-email')
  @Redirect()
  async confirmEmail(@Query('jwt') jwt: string) {
    console.log('test');
    const result = await this.authService.confirmEmail(jwt);
    const returnUrl = result
      ? `https://643fc54f2a457a12e57afca4--ngtstudio.netlify.app/login?confirm=true`
      : `https://643fc54f2a457a12e57afca4--ngtstudio.netlify.app/login?confirm=false`;
    return {
      url: returnUrl,
    };
  }
}
