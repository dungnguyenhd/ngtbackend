import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  ALREADY_FRIEND,
  FRIEND_NOT_FOUND,
  FRIEND_REQUEST_ALREADY_SENT,
} from '../common/constants/error.constant';
import { ResponseFriendRequestDto } from './dto/friendship.dto';

@Injectable()
export class FriendshipService {
  constructor(private prismaService: PrismaService) {}
  async sendFriendRequest(user: any, friendName: string) {
    try {
      const friend = await this.prismaService.user.findUnique({
        where: { user_name: friendName },
      });

      if (!friend) {
        throw new ForbiddenException(FRIEND_NOT_FOUND);
      }

      const existingFriendship = await this.prismaService.friendship.findFirst({
        where: {
          user_id: user.id,
          friend_id: friend.id,
        },
      });

      if (existingFriendship) {
        throw new ForbiddenException(FRIEND_REQUEST_ALREADY_SENT);
      }

      const readyFriendship = await this.prismaService.friendship.findFirst({
        where: {
          OR: [
            { user_id: user.id, friend_id: friend.id, isAccept: true },
            { user_id: friend.id, friend_id: user.id, isAccept: true },
          ],
        },
      });

      if (readyFriendship) {
        throw new ForbiddenException(ALREADY_FRIEND);
      }

      await this.prismaService.friendship.create({
        data: {
          user_id: user.id,
          user_name: user.user_name,
          user_avatar: user.avatar ? user.avatar : null,
          user_fullName: user.full_name ? user.full_name : null,
          friend_avatar: friend.avatar ? friend.avatar : null,
          friend_fullName: friend.full_name ? friend.full_name : null,
          friend_id: friend.id,
          friend_name: friend.user_name,
          isAccept: false,
        },
      });

      return { code: 200, message: 'Send success' };
    } catch (error) {
      return error;
    }
  }

  async responseFriendRequest(params: ResponseFriendRequestDto) {
    try {
      const updatedFriendship = await this.prismaService.friendship.update({
        where: { id: params.friendship_id },
        data: {
          isAccept: params.accept,
        },
      });

      if (updatedFriendship) {
        await this.prismaService.friendship.deleteMany({
          where: {
            user_id: updatedFriendship.friend_id,
            friend_id: updatedFriendship.user_id,
          },
        });
      }

      return {
        code: params.accept ? 200 : 201,
        message: params.accept
          ? 'Accepted friend request'
          : 'Reject friend request',
      };
    } catch (err) {
      return { code: 404, message: 'Response request fail!' };
    }
  }

  async getUserFriendList(userId: number, search: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    const friendList = await this.prismaService.friendship.findMany({
      where: {
        AND: [
          {
            OR: [
              { user_fullName: { contains: search ? search : undefined } },
              { friend_fullName: { contains: search ? search : undefined } },
            ],
          },
          {
            OR: [{ user_id: user.id }, { friend_id: user.id }],
          },
          { isAccept: true },
        ],
      },
    });

    const formattedFriendList = await Promise.all(
      friendList.map(async (friendship) => {
        if (friendship.user_id === user.id) {
          return {
            friendshipId: friendship.id,
            friendId: friendship.friend_id,
            friendName: friendship.friend_name,
            friendAvatar: friendship.friend_avatar,
            friendFullname: friendship.friend_fullName,
          };
        } else {
          return {
            friendshipId: friendship.id,
            friendId: friendship.user_id,
            friendName: friendship.user_name,
            friendAvatar: friendship.user_avatar,
            friendFullname: friendship.user_fullName,
          };
        }
      }),
    );

    return formattedFriendList;
  }

  async searchForUsers(search: string, take: number) {
    const conditions = search
      ? {
          OR: [
            { user_name: { contains: search } },
            { full_name: { contains: search } },
          ],
        }
      : {};

    return this.prismaService.user.findMany({
      where: conditions,
      take: take,
    });
  }
}
