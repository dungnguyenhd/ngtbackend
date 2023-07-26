import { IsNotEmpty, IsString } from 'class-validator';

export class FriendRequestDto {
  @IsNotEmpty()
  @IsString()
  friend_name: string;
}

export class Friend {
  @IsNotEmpty()
  id: number;
  user_id: number;
  friend_id: number;
  friend_name: string;
  friend_fullName: string;
  friend_avatar: string;
  isAccept: number;
  created_at: string;
}

export class ResponseFriendRequestDto {
  friendship_id: number;
  accept: boolean;
}

export class UpdateUserActiveDto {
  active: string;
}
