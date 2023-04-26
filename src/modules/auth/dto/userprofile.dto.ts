import { IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  full_name?: string;

  @IsString()
  avatar?: string;
}
