import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class LoginDto {
  @IsString()
  user_name: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  type: string;
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
  type: string;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  level: string;

  @IsOptional()
  token?: string;

  @IsString()
  redirectLink: string;

  @IsString()
  locale: string;
}
