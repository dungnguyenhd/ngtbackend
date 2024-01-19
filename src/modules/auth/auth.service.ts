/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.payload';
import { throwIf } from '../common/helpers/index.helper';
import {
  EMAIL_NOT_FOUND,
  WRONG_PASSWORD,
  USER_NOT_VERIFIED,
  USER_BLOCKED,
  DUPLICATE_EMAIL,
  LINK_EXPIRED,
  WRONG_USER_NAME,
} from '../common/constants/error.constant';
import * as bcryptjs from 'bcryptjs';
import { OnSuccessResponseDto } from './dto/auth.response.dto';
import { SignupDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/userprofile.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Normal Signup
  async signup(params: SignupDto): Promise<OnSuccessResponseDto> {
    const hashedPassword = await bcryptjs.hash(params.password, 10);
    const existingUser = await this.prismaService.user.findUnique({
      where: { user_name: params.userName },
    });
    throwIf(
      existingUser && existingUser.status === 'ACTIVE',
      new UnauthorizedException(DUPLICATE_EMAIL),
    );

    const userData = {
      user_name: params.userName,
      password: hashedPassword,
      email: params.userName,
      full_name: params.fullName,
      avatar:
        'https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png',
      status: 'ACTIVE',
      level: 'USER',
      type: 'ACCOUNT',
      has_password: true,
    };

    const user = existingUser
      ? await this.prismaService.user.update({
          where: { user_name: params.userName },
          data: userData,
        })
      : await this.prismaService.user.create({ data: userData });

    // const { accessToken } = this.generateToken(user.id, user.user_name, null);
    // this.sendMail(user.email, accessToken);
    return {
      code: 200,
      status: 'ok',
    };
  }

  public async validateByJwt(payload: JwtPayload) {
    const user = await this.prismaService.user.findUnique({
      where: { user_name: payload.username },
    });
    user && delete user.password;
    return user;
  }

  async login(params: any): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { user_name: params.body.user_name },
    });

    throwIf(!user, new UnauthorizedException(EMAIL_NOT_FOUND));
    throwIf(user.password == null, new UnauthorizedException(WRONG_PASSWORD));
    throwIf(
      user.status == 'UNCONFIRM',
      new UnauthorizedException(USER_NOT_VERIFIED),
    );
    throwIf(user.status !== 'ACTIVE', new UnauthorizedException(USER_BLOCKED));

    const passwordMatching = await bcryptjs.compare(
      params.body.password,
      user.password,
    );
    throwIf(!passwordMatching, new UnauthorizedException(WRONG_PASSWORD));

    // this.saveUserHistory(params, user.id, UserStatusType.LOGIN);

    return this.generateToken(user.id, user.user_name, null);
  }

  private generateToken(id: number, username: string, type) {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = type ? now + 86400000 / 1000 : now + 2592000000 / 1000;
    const payload = {
      id: id,
      username,
      expiresIn,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      expiresIn: expiresIn,
      accessToken,
    };
  }

  public async sendMail(email: string, jwt: string) {
    const hiText = `Hi, ${email}`;
    const mailText01 =
      'Thank you for signup account on NGT Studio with' +
      `&nbsp;<span style="color: #3a89fb">${email}</span>`;
    const mailText02 =
      'Please verify your email before logging in. To confirm your email please click the button below.';
    const mailText03 =
      'If you did not make this request, please disregard this email.';
    const mailText04 = 'CONFIRM';

    const content = `<div class="container" align="center">
    <div
      style="width: 100%;max-width: 595px;min-width: 327px;border: solid #000000 2px;border-radius: 24px;overflow: hidden;">
      <div
        style="height:180px;background-color:#febd00;background-position: center;background-repeat: no-repeat;background-size: cover;background-image: url('https://media.istockphoto.com/id/1341408852/video/colored-smoke-on-a-dark-background-blue-and-red-light-with-smoke.jpg?s=640x640&k=20&c=v2DQUY8IVbli_6FH_9KAs6YWRXlDdYiBJHfp7JFh7NY=')">
        <a href="https://ngtstudio.netlify.app/"
          style="position:absolute;bottom: 18px;;left:50%;transform:translateX(-50%);text-decoration: unset;">
          <img src="https://i.postimg.cc/5tnmTsLj/New-Project-1.png" style="margin-top: 44px" alt="logo">
          <div
            style="font-weight: 700;font-size: 24px;line-height: 32px;letter-spacing: 0.16em;color: #FFFFFF;margin-top: 24px;">
            NGT STUDIO</div>
        </a>
      </div>
      <div align="left" class="content" style="background-color: ##000000;font-family: 'SVN-Cera';padding: 32px 16px 48px;">
        <div>
          <div style=" font-style: normal;font-size: 18px;line-height: 26px;color: black;">
            ${hiText}
          </div><br>
          <div class="fw-medium" style="font-style: normal;font-weight: 500;font-size: 18px;line-height: 26px;">
            <span style="color: black">
              ${mailText01}</span>
          </div>
        </div>
        <br>
        <div class="fs-lg" style="color: black;font-size: 16px;line-height: 24px;">
          <div>
            ${mailText02}
          </div><br>
          <div>
            ${mailText03}
          </div>
        </div>
        <div style="text-align: center;margin-top: 40px;">
          <a href="https://ngtbackend-v1.fly.dev/auth/confirm-email?jwt=${jwt}"
            style="display: inline-block;cursor: pointer;text-decoration: unset;padding: 12px 24px;background: #4834f1;border-radius: 100px;">
            <span style="font-weight: 500;font-size: 16px;line-height: 24px;letter-spacing: 0.02em;color: #1f1f1f;">
              ${mailText04}
            </span>
          </a>
        </div>
      </div>
    </div>
  </div>`;

    const axios = require('axios');
    const data = JSON.stringify({
      personalizations: [
        {
          to: [
            {
              email: email,
            },
          ],
          subject: '[NGT Studio] CONFIRM ACCOUNT EMAIL',
        },
      ],
      from: {
        email: 'ngtstudio@dev.gg',
      },
      content: [
        {
          type: 'text/html',
          value: content,
        },
      ],
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '161c0f8a5emsh6f0acc0af1ec2b6p11e379jsn7cd7c0697694',
        'X-RapidAPI-Host': 'rapidprod-sendgrid-v1.p.rapidapi.com',
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });

    return {
      message: 'Send link success',
    };
  }

  public async confirmEmail(jwt: string): Promise<any> {
    try {
      const payLoad: any = this.jwtService.decode(jwt);
      const expired =
        !payLoad || payLoad.expiresIn < Math.floor(Date.now() / 1000);
      throwIf(expired, new RequestTimeoutException(LINK_EXPIRED));

      const user =
        payLoad &&
        (await this.prismaService.user.findUnique({
          where: { id: +payLoad.id },
        }));
      throwIf(!user, new NotFoundException(WRONG_USER_NAME));

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          status: 'ACTIVE',
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    try {
      const check = await this.prismaService.user.findUnique({
        where: { user_name: req.user.email },
      });

      if (check) {
        throwIf(!check, new UnauthorizedException(EMAIL_NOT_FOUND));
        throwIf(
          check.status == 'UNCONFIRM',
          new UnauthorizedException(USER_NOT_VERIFIED),
        );
        throwIf(
          check.status !== 'ACTIVE',
          new UnauthorizedException(USER_BLOCKED),
        );
        const token = this.generateToken(check.id, check.user_name, null);
        return token;
      } else {
        const userData = {
          user_name: req.user.email,
          password: null,
          email: req.user.email,
          avatar: req.user.picture,
          full_name: null,
          status: 'ACTIVE',
          level: 'USER',
          type: 'GOOGLE',
          has_password: true,
        };

        const newUser = await this.prismaService.user.create({
          data: userData,
        });

        const token = this.generateToken(newUser.id, newUser.user_name, null);
        return token;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async updateProfile(params: UpdateProfileDto, userId) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        full_name: params.full_name,
        avatar: params.avatar,
      },
      select: {
        avatar: true,
        created_at: true,
        current_used_product: true,
        email: true,
        full_name: true,
        has_password: true,
        id: true,
        last_login: true,
        last_logout: true,
        level: true,
        status: true,
        type: true,
        updated_at: true,
        user_id_social: true,
        user_name: true,
      },
    });
  }
}
