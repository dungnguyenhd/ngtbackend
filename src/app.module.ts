import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { FriendshipModule } from './modules/friendship/friendship.module';
import { FriendshipService } from './modules/friendship/friendship.service';
import { PrismaService } from './modules/common/prisma/prisma.service';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [AuthModule, ChatModule, FriendshipModule, GameModule],
  controllers: [AppController],
  providers: [AppService, FriendshipService, PrismaService],
})
export class AppModule {}
