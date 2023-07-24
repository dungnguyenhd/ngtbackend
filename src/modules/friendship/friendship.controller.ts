import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Auth } from '../common/decorators/auth.decorator';
import { User } from '../common/decorators/user.decorator';
import {
  FriendRequestDto,
  ResponseFriendRequestDto,
} from './dto/friendship.dto';
import { FriendsGateway } from './friendship.gateway';

@Controller('friendship')
@Auth()
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {
    //
  }

  @Post('send-request')
  sendFriendRequest(@User() user, @Body() params: FriendRequestDto) {
    return this.friendshipService.sendFriendRequest(user, params.friend_name);
  }

  @Patch('response-friend-request')
  responseFriendRequest(@Body() params: ResponseFriendRequestDto) {
    return this.friendshipService.responseFriendRequest(params);
  }

  @Get('list')
  async getUserFriendList(@Query('search') search: string, @User() user) {
    const friendList = await this.friendshipService.getUserFriendList(
      user.id,
      search,
    );
    return { friendList };
  }
}
