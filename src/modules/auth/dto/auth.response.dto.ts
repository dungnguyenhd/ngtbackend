import { DateTime } from 'aws-sdk/clients/devicefarm';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginResponseDto {
  @IsNotEmpty()
  expiresIn: string | number;

  @IsNotEmpty()
  @IsString()
  accessToken: string;
}

export class SocialLoginDto {
  @IsNotEmpty()
  @IsString()
  credential: string;

  @IsNotEmpty()
  @IsString()
  platfrorm: string;
}

export class SignupResponseDto {
  @IsNotEmpty()
  @IsString()
  user_name: string;

  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  created_at: DateTime;
}

export class UserProfileResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  user_name: string;

  @IsString()
  full_name: string | null;

  @IsString()
  avatar: string | null;

  type: string;

  @IsString()
  email: string | null;

  user_id_social: string | null;

  @IsString()
  token: string | null;

  @IsString()
  refresh_token: string | null;

  @IsNumber()
  summoner_id: number | null;

  @IsString()
  summoner_name: string | null;

  @IsString()
  summoner_region: string | null;

  status: string;

  level: string;

  created_at: Date;

  updated_at: Date;

  last_login: Date | null;

  last_logout: Date | null;

  @IsNumber()
  current_used_product: number | null;
}

export class OnSuccessResponseDto {
  code: number;

  status: string;
}

export class OnSuccessChangePassResponseDto {
  redirect_url: string;
}
