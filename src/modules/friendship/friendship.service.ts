import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  ALREADY_FRIEND,
  FRIEND_NOT_FOUND,
  FRIEND_REQUEST_ALREADY_SENT,
} from '../common/constants/error.constant';
import { Friend, ResponseFriendRequestDto } from './dto/friendship.dto';
import { Messenger, Prisma } from '@prisma/client';

@Injectable()
export class FriendshipService {
  constructor(private prismaService: PrismaService) {}
  async sendFriendRequest(userId: number, friendId: number) {
    try {
      const friend = await this.prismaService.user.findUnique({
        where: { id: friendId },
      });

      if (!friend) {
        throw new ForbiddenException(FRIEND_NOT_FOUND);
      }

      const existingFriendship = await this.prismaService.friendship.findFirst({
        where: {
          user_id: userId,
          friend_id: friend.id,
        },
      });

      if (existingFriendship) {
        throw new ForbiddenException(FRIEND_REQUEST_ALREADY_SENT);
      }

      const readyFriendship = await this.prismaService.friendship.findFirst({
        where: {
          OR: [
            { user_id: userId, friend_id: friend.id, isAccept: true },
            { user_id: friend.id, friend_id: userId, isAccept: true },
          ],
        },
      });

      if (readyFriendship) {
        throw new ForbiddenException(ALREADY_FRIEND);
      }

      await this.prismaService.friendship.create({
        data: {
          user_id: userId,
          friend_id: friend.id,
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

        if (!params.accept) {
          await this.prismaService.friendship.delete({
            where: { id: params.friendship_id },
          });
        }
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
          const currentInfo = await this.prismaService.user.findUnique({
            where: { id: friendship.friend_id },
          });
          return {
            friendshipId: friendship.id,
            friendId: friendship.friend_id,
            friendName: currentInfo.user_name,
            friendAvatar: currentInfo.avatar,
            friendFullname: currentInfo.full_name,
          };
        } else {
          const currentInfo = await this.prismaService.user.findUnique({
            where: { id: friendship.user_id },
          });
          return {
            friendshipId: friendship.id,
            friendId: friendship.user_id,
            friendName: currentInfo.user_name,
            friendAvatar: currentInfo.avatar,
            friendFullname: currentInfo.full_name,
          };
        }
      }),
    );

    return formattedFriendList;
  }

  async searchForUsers(search: string, take: number, userId: number) {
    const conditions = search
      ? {
          AND: [
            {
              OR: [
                { user_name: { contains: search } },
                { full_name: { contains: search } },
              ],
            },
            {
              NOT: {
                id: userId,
              },
            },
          ],
        }
      : {
          NOT: {
            id: userId,
          },
        };

    return this.prismaService.user.findMany({
      where: conditions,
      take: take,
    });
  }

  async getUserFriendRequest(userId: number, search: string) {
    const query = search
      ? `(u.user_name LIKE '%${search}%' OR u.full_name LIKE '%${search}%') AND`
      : ``;

    const raw_query =
      Prisma.raw(`SELECT fs.id as id, fs.user_id as user_id, fs.friend_id as friend_id, u.user_name as friend_name, u.full_name as friend_fullName, u.avatar as friend_avatar, fs.isAccept as isAccept, fs.created_at as created_at
    FROM railway.friendship fs INNER JOIN railway.user u ON fs.user_id = u.id WHERE ${query} fs.friend_id = ${userId} AND fs.isAccept = 0`);

    const friends = await this.prismaService.$queryRaw<Friend[]>(raw_query);

    const formattedFriends = friends.map((friend) => ({
      id: friend.id,
      user_id: friend.user_id,
      friend_id: friend.friend_id,
      friend_name: friend.friend_name,
      friend_fullName: friend.friend_fullName,
      friend_avatar: friend.friend_avatar,
      isAccept: friend.isAccept,
      created_at: friend.created_at,
    }));

    return formattedFriends;
  }

  async saveMessage(
    userId: number,
    friendId: number,
    message: string,
    image: string,
  ): Promise<Messenger> {
    const saveMessage = await this.prismaService.messenger.create({
      data: {
        user_id: userId,
        friend_id: friendId,
        message: message,
        image: image,
        isRead: false,
      },
    });
    return saveMessage;
  }

  async markAsRead(ids: number[]) {
    try {
      await this.prismaService.messenger.updateMany({
        where: { id: { in: ids } },
        data: {
          isRead: true,
        },
      });
      return 'ok';
    } catch (err) {
      throw new ForbiddenException(err);
    }
  }

  async getChatHistory(userId: number) {
    return this.prismaService.messenger.findMany({
      where: {
        OR: [{ user_id: userId }, { friend_id: userId }],
      },
      orderBy: { created_at: 'asc' },
    });
  }
}
