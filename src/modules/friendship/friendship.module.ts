import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { FriendsGateway } from './friendship.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [FriendshipController],
  providers: [FriendshipService, FriendsGateway],
  exports: [FriendshipService],
})
export class FriendshipModule {}
