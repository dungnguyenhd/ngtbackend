import { LoginType, Status, UserLevel } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
} from 'class-validator';

export class LoginDto {
  @IsString()
  user_name: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  type: LoginType;
}

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @IsEnum(LoginType)
  type: LoginType;

  @IsNotEmpty()
  @IsEnum(Status)
  status: Status;

  @IsNotEmpty()
  @IsEnum(UserLevel)
  level: UserLevel;

  @IsOptional()
  token?: string;

  @IsString()
  redirectLink: string;

  @IsString()
  locale: string;
}
