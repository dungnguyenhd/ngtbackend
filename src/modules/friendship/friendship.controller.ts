import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Auth } from '../common/decorators/auth.decorator';
import { User } from '../common/decorators/user.decorator';
import {
  FriendRequestDto,
  ResponseFriendRequestDto,
  UpdateUserActiveDto,
} from './dto/friendship.dto';

@Controller('friendship')
@Auth()
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {
    //
  }

  @Patch('user-active')
  updateUserActive(@User() user, @Body() params: UpdateUserActiveDto) {
    return this.friendshipService.updateUserActive(user, params);
  }

  @Post('send-request')
  sendFriendRequest(@User() user, @Body() params: FriendRequestDto) {
    return this.friendshipService.sendFriendRequest(user, params.friend_name);
  }

  @Patch('response-friend-request')
  responseFriendRequest(@Body() params: ResponseFriendRequestDto) {
    return this.friendshipService.responseFriendRequest(params);
  }

  @Get('friend-list/:search')
  getUserFriendList(@Param('search') search: string, @User() user) {
    return this.friendshipService.getUserFriendList(user, search);
  }
}
