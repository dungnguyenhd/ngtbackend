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

  @Get('search-friend-list')
  async searchForUsers(
    @Query('search') search: string,
    @Query('take') take: string,
  ) {
    const userList = await this.friendshipService.searchForUsers(
      search,
      Number(take),
    );
    return { userList };
  }

  @Post('send-request')
  sendFriendRequest(@User() user, @Query('friendId') friendId: number) {
    return this.friendshipService.sendFriendRequest(user, Number(friendId));
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
