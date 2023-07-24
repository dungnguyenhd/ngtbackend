import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from './friendship.service';

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
    await this.sendOnlineUsers(Number(userId));
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.connectedUsers.delete(Number(userId));
    await this.sendOnlineUsers(Number(userId));
  }

  async sendOnlineUsers(userId: number) {
    const onlineUsers = Array.from(this.connectedUsers.keys());
    const friendList = await this.friendService.getUserFriendList(userId, null);
    friendList.forEach((friend) => {
      const clientSocket = this.getClientByUserId(friend.friendId);
      if (clientSocket) {
        clientSocket.emit('onlineUsers', onlineUsers);
      }
    });
  }

  getClientByUserId(userId: number): Socket {
    return this.connectedUsers.get(userId);
  }
}
