import { IsNotEmpty, IsString } from 'class-validator';

export class FriendRequestDto {
  @IsNotEmpty()
  @IsString()
  friend_name: string;
}

export class ResponseFriendRequestDto {
  friendship_id: number;
  accept: boolean;
}
