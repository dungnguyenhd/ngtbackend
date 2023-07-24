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
  constructor(private readonly friendService: FriendshipService) {}

  @WebSocketServer() server: Server;
  private connectedUsers: Map<number, Socket> = new Map<number, Socket>();
  private userRooms: Map<number, string[]> = new Map<number, string[]>();

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.connectedUsers.set(Number(userId), client);
    await this.sendOnlineUsers(client, Number(userId));
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.connectedUsers.delete(Number(userId));
    await this.sendOnlineUsers(client, Number(userId));
  }

  async sendOnlineUsers(client: Socket, userId: number) {
    const onlineUsers = Array.from(this.connectedUsers.keys());
    const userFriends = await this.friendService.getUserFriendList(
      userId,
      null,
    ); // Lấy danh sách bạn bè của user

    const friendSockets: Socket[] = [];
    userFriends.forEach((friend) => {
      const friendSocket = this.connectedUsers.get(friend.friendId);
      if (friendSocket) {
        friendSockets.push(friendSocket);
      }
    });

    // Tạo các rooms tương ứng với danh sách bạn bè của user
    const userRoom = `user_${userId}`;
    this.userRooms.set(userId, [userRoom]);
    friendSockets.forEach((friendSocket) => {
      const friendId = Number(friendSocket.handshake.query.userId);
      const friendRoom = `user_${friendId}`;
      friendSocket.join(userRoom);
      client.join(friendRoom);
      if (onlineUsers.includes(friendId)) {
        // Gửi trạng thái online cho bạn bè đã kết nối
        friendSocket.emit('onlineUsers', [userId]);
      }
      if (onlineUsers.includes(userId)) {
        // Gửi trạng thái online của bạn bè cho user đang kết nối
        client.emit('onlineUsers', [friendId]);
      }
    });

    // Gửi trạng thái online của user cho bạn bè đã kết nối
    if (onlineUsers.includes(userId)) {
      this.server.to(userRoom).emit('onlineUsers', [userId]);
    }
  }
}
