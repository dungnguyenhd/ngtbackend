import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from 'src/modules/friendship/friendship.service';

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly friendService: FriendshipService) {}

  handleConnection(client: Socket) {
    // Lấy userId từ thông báo kết nối của client
    const userId = client.handshake.query.userId as string;

    if (userId) {
      // Cập nhật trạng thái người dùng thành "online"
      this.friendService.updateUserActive(parseInt(userId), 'ONLINE');
    }
  }

  handleDisconnect(client: Socket) {
    // Lấy userId từ thông báo kết nối của client
    const userId = client.handshake.query.userId as string;

    if (userId) {
      // Cập nhật trạng thái người dùng thành "offline"
      this.friendService.updateUserActive(parseInt(userId), 'OFFLINE');
    }
  }
}
