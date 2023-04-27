import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  ALREADY_FRIEND,
  FRIEND_NOT_FOUND,
  FRIEND_REQUEST_ALREADY_SENT,
} from '../common/constants/error.constant';
import {
  ResponseFriendRequestDto,
  UpdateUserStatusDto,
} from './dto/friendship.dto';

@Injectable()
export class FriendshipService {
  constructor(private prismaService: PrismaService) {}

  async updateUserStatus(user: any, params: UpdateUserStatusDto) {
    try {
      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          active: params.status,
        },
      });
      return { code: 200, message: 'Update user status success' };
    } catch (err) {
      return err;
    }
  }

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
            { user_id: user.id, friend_id: friend.id },
            { user_id: friend.id, friend_id: user.id },
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
        code: 200,
        message: params.accept
          ? 'Accepted friend request'
          : 'Reject friend request',
      };
    } catch (err) {
      return { code: 404, message: 'Response request fail!' };
    }
  }
  async getUserFriendList(user: any, search: string) {
    const friendList = await this.prismaService.friendship.findMany({
      where: {
        OR: [
          { user_id: user.id },
          { friend_id: user.id },
          {
            AND: [
              { NOT: { user_name: user.user_name } },
              {
                OR: [
                  { user_name: { contains: search ? search : undefined } },
                  { friend_name: { contains: search ? search : undefined } },
                ],
              },
            ],
          },
        ],
        isAccept: true,
      },
      select: {
        id: true,
        user_name: true,
        friend_name: true,
        user_id: true,
        friend_id: true,
      },
    });

    const formattedFriendList = await Promise.all(
      friendList.map(async (friendship) => {
        if (friendship.user_id === user.id) {
          const friend = await this.prismaService.user.findUnique({
            where: { id: friendship.friend_id },
          });

          return {
            friendshipId: friendship.id,
            friend: friendship.friend_name,
            active: friend ? friend.active : 'UNKNOWN',
          };
        } else {
          const friend = await this.prismaService.user.findUnique({
            where: { id: friendship.user_id },
          });

          return {
            friendshipId: friendship.id,
            friend: friendship.user_name,
            active: friend ? friend.active : 'UNKNOWN',
          };
        }
      }),
    );

    return formattedFriendList;
  }
}
