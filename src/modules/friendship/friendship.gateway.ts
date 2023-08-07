import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from './friendship.service';
import Semaphore from 'semaphore-async-await';

@WebSocketGateway({ cors: true })
export class FriendsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private semaphore = new Semaphore(1);

  @WebSocketServer() server: Server;
  private connectedUsers = new Map<number, Socket>();

  constructor(private readonly friendService: FriendshipService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.connectedUsers.set(Number(userId), client);
    await this.sendOnlineUsers(Number(userId), client);
    await this.sendChatHistory(client, Number(userId));
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.connectedUsers.delete(Number(userId));
    await this.sendOnlineUsers(Number(userId), client);
  }

  async sendOnlineUsers(userId: number, client: Socket) {
    const onlineUsers = Array.from(this.connectedUsers.keys());
    const friendList = await this.friendService.getUserFriendList(userId, null);
    client.emit('onlineUsers', onlineUsers);
    friendList.forEach((friend) => {
      const clientSocket = this.getClientByUserId(friend.friendId);
      if (clientSocket) {
        clientSocket.emit('onlineUsers', onlineUsers);
      }
    });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: {
      userId: number;
      friendId: number;
      message: string;
      image: string;
    },
  ) {
    const { userId, friendId, message, image } = payload;

    if (client) {
      const friendSocket = this.connectedUsers.get(friendId);
      const sentAt = new Date();
      try {
        // Acquire the semaphore before performing any critical operations
        await this.semaphore.acquire();

        const isDuplicate = await this.isDuplicateMessage(
          userId,
          friendId,
          message,
          sentAt,
        );

        if (!isDuplicate) {
          const newMessage = await this.friendService.saveMessage(
            userId,
            friendId,
            message,
            image,
            sentAt,
          );
          client.emit('newMessage', newMessage);
          if (friendSocket) {
            friendSocket.emit('newMessage', newMessage);
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      } finally {
        // Release the semaphore after the critical operations are done
        this.semaphore.release();
      }
    }
  }

  private async sendChatHistory(client: Socket, userId: number) {
    const chatHistory = await this.friendService.getChatHistory(userId);
    if (client) {
      client.emit('chatHistory', chatHistory);
    }
  }

  getClientByUserId(userId: number): Socket {
    return this.connectedUsers.get(userId);
  }

  async isDuplicateMessage(
    userId: number,
    friendId: number,
    message: string,
    sentAt: Date,
  ): Promise<boolean> {
    // Thực hiện truy vấn để kiểm tra sự tồn tại của tin nhắn trong khoảng thời gian cho phép
    const existingMessage =
      await this.friendService.findMessageByContentAndTime(
        userId,
        friendId,
        message,
        sentAt,
      );
    return !!existingMessage; // Trả về true nếu tin nhắn đã tồn tại
  }
}
