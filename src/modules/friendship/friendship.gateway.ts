import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class FriendsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private connectedUsers: Set<number> = new Set<number>();

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.connectedUsers.add(Number(userId));
    await this.sendOnlineUsers(client);
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.connectedUsers.delete(Number(userId));
    await this.sendOnlineUsers();
  }

  async sendOnlineUsers(client?: Socket) {
    const onlineUsers = Array.from(this.connectedUsers);
    console.log('co goi emit');
    if (client) {
      console.log('chay emit');
      client.emit('onlineUsers', onlineUsers);
    } else {
      console.log('chay emit server');
      this.server.emit('onlineUsers', onlineUsers);
    }
  }
}
