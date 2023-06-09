import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { FriendshipModule } from './modules/friendship/friendship.module';

@Module({
  imports: [AuthModule, ChatModule, FriendshipModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
