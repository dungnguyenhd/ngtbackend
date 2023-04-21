import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  OnSuccessResponseDto,
  LoginResponseDto,
  UserProfileResponseDto,
} from './dto/auth.response.dto';
import { SignupDto, LoginDto } from './dto/login.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { User } from '../common/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';

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
      ? `https://6442539828ed063b4a5d4a51--ngtstudio.netlify.app/signin?confirm=true`
      : `https://6442539828ed063b4a5d4a51--ngtstudio.netlify.app/signin?confirm=false`;
    return {
      url: returnUrl,
    };
  }

  @Auth()
  @Get('profile')
  getProfile(@User() user): Promise<UserProfileResponseDto> {
    return user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    //do nothing
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleAuthRedirect(@Req() req) {
    const token = await this.authService.googleLogin(req);

    if (typeof token === 'string') {
      // handle error case
      return `https://6442539828ed063b4a5d4a51--ngtstudio.netlify.app/?token=null`;
    } else {
      // success case
      return `https://6442539828ed063b4a5d4a51--ngtstudio.netlify.app/?token=${token.accessToken}`;
    }
  }
}
