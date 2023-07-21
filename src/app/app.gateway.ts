import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FriendshipService } from 'src/modules/friendship/friendship.service';

@WebSocketGateway()
export class AppGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly friendService: FriendshipService) {}

  handleConnection(client: Socket) {
    // Xử lý khi kết nối
    console.log('Client connected');
  }

  handleDisconnect(client: Socket) {
    // Xử lý khi mất kết nối
    console.log('Client disconnected');
  }

  @SubscribeMessage('update_status') // Cập nhật tên sự kiện thành 'update_status'
  updateStatus(@MessageBody() data: { userId: string; status: string }) {
    // Xử lý yêu cầu đặt trạng thái vào database (ví dụ: "online"/"offline") với thông tin người dùng và trạng thái
    console.log(`User '${data.userId}' is '${data.status}'`);
    this.friendService.updateUserActive(parseInt(data.userId), data.status);
    // Ví dụ gọi phương thức trong service để xử lý
    // this.yourService.updateUserStatus(data.userId, data.status);
  }
}
