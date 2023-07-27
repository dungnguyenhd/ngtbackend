import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from './friendship.service';
import { DateTime } from 'aws-sdk/clients/devicefarm';

@WebSocketGateway({ cors: true })
export class FriendsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
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
    this.sendToUser(client, friendId, {
      user_id: userId,
      friend_id: friendId,
      message,
      image,
    });
    console.log(message);
  }

  private async sendToUser(
    client: Socket,
    friendId: number,
    messageData: {
      user_id: number;
      friend_id: number;
      message: string;
      image: string;
    },
  ) {
    const friendSocket = this.connectedUsers.get(friendId);

    if (client) {
      const newMessage = await this.friendService.saveMessage(
        messageData.user_id,
        messageData.friend_id,
        messageData.message,
        messageData.image,
      );
      client.emit('newMessage', newMessage);
      if (friendSocket) {
        friendSocket.emit('newMessage', newMessage);
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
}
