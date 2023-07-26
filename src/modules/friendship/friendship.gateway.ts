import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from './friendship.service';

@WebSocketGateway({ cors: true })
export class FriendsGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedUsers = new Map<number, Socket>();

  constructor(private readonly friendService: FriendshipService) { }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.connectedUsers.set(Number(userId), client);
    await this.sendOnlineUsers(Number(userId), client);
    await this.sendChatHistory(Number(userId));
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
  async handleSendMessage(client: Socket, payload: { userId: number, friendId: number, message: string, image: string }) {
    const { userId, friendId, message, image } = payload;
    this.sendToUser(userId, friendId, { message, image });
    console.log(message);
    await this.friendService.saveMessage(userId, friendId, message, image);
    client.emit('chatHistory', { userId: userId });
    const friendSocket = this.connectedUsers.get(friendId);
    if (friendSocket) {
      friendSocket.emit('chatHistory', { userId: friendId });
    }
  }

  @SubscribeMessage('chatHistory')
  async handleChatHistory(client: Socket, payload: { userId: number }) {
    const chatHistory = await this.friendService.getChatHistory(payload.userId);
    client.emit('chatHistory', chatHistory);
  }

  private async sendToUser(userId: number, friendId: number, messageData: { message: string; image: string }) {
    const socket = this.connectedUsers.get(userId);
    const friendSocket = this.connectedUsers.get(friendId)
    if (socket) {
      socket.emit('newMessage', messageData);
      if (friendSocket) {
        friendSocket.emit('newMessage', messageData);
      }
    }
  }

  private async sendChatHistory(userId: number) {
    const chatHistory = await this.friendService.getChatHistory(userId);
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit('chatHistory', chatHistory);
    }
  }

  getClientByUserId(userId: number): Socket {
    return this.connectedUsers.get(userId);
  }
}
