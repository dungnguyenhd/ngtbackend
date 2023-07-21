import { Body, Controller, Get, Param, Patch, Post, Sse } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Auth } from '../common/decorators/auth.decorator';
import { User } from '../common/decorators/user.decorator';
import {
  FriendRequestDto,
  ResponseFriendRequestDto,
  UpdateUserActiveDto,
} from './dto/friendship.dto';
import { Observable, interval, map, merge, of } from 'rxjs';

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

  @Sse('friend-list/:search')
  async getUserFriendList(
    @Param('search') search: string,
    @User() user,
  ): Promise<Observable<any>> {
    const friendList = await this.friendshipService.getUserFriendList(
      user,
      search,
    );

    console.log(search);

    return merge(
      of({
        data: friendList,
      }),
      interval(60000).pipe(
        map(() => ({
          data: friendList,
        })),
      ),
    );
  }
}
