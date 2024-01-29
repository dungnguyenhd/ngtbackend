import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { OnSuccessResponseDto, PLayerDashboardResponse, PlayerHistoryResponse } from './game.dto';

@Injectable()
export class GameService {
  constructor(private prismaService: PrismaService) { }

  async getPlayerHistory(userId: number, gameId: number): Promise<PlayerHistoryResponse[]> {
    const playerHistories = await this.prismaService.userPlayHistory.findMany({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });
    return playerHistories;
  }

  async createPlayerHistory(userId: number, gameId: number, score: number): Promise<OnSuccessResponseDto> {
    try {
      const userHistory = await this.prismaService.userPlayHistory.create({
        data: {
          user_id: userId,
          game_id: gameId,
          score: score,
        },
      });

      const playerDashboard = await this.prismaService.userDashboard.findMany({
        where: {
          user_id: userId,
          game_id: gameId,
        }
      });

      if (playerDashboard.length == 0) {
        const dashboard = await this.prismaService.userDashboard.create({
          data: {
            user_id: userId,
            game_id: gameId,
            score: score,
            game_played: 1,
          }
        })
      } else {
        this.updatePlayerDashboard(userId, gameId, score);
      }

      return { code: 200, status: "OK" };
    } catch (err) {
      throw new ForbiddenException(err);
    }
  }

  async getPlayerDashboard(userId: number): Promise<PLayerDashboardResponse[]> {
    try {
      const playerDashboard = await this.prismaService.userDashboard.findMany({
        where: {
          user_id: userId
        },
      })
      return playerDashboard;
    } catch (err) {
      throw new ForbiddenException(err);
    }
  }

  async getPlayerDashboardByGame(userId: number, gameId: number): Promise<PLayerDashboardResponse> {
    try {
      const playerDashboard = await this.prismaService.userDashboard.findFirst({
        where: {
          user_id: userId,
          game_id: gameId
        },
      })
      return playerDashboard;
    } catch (err) {
      throw new ForbiddenException(err);
    }
  }

  async updatePlayerDashboard(userId: number, gameId: number, score: number) {
    try {
      const playerDashboard = await this.prismaService.userDashboard.findFirst({
        where: {
          user_id: userId,
          game_id: gameId
        }
      });

      const gamePlayed = playerDashboard.game_played + 1;
      const updatedScore = (playerDashboard.score * playerDashboard.game_played + score) / gamePlayed;

      await this.prismaService.userDashboard.update({
        where: {
          id: playerDashboard.id,
        },
        data: {
          score: updatedScore,
          game_played: gamePlayed,
        }
      })

      return { code: 200, status: "OK" }
    } catch (err) {
      throw new ForbiddenException(err);
    }
  }

  async getTopPlayerByGame(gameId: number, take: number): Promise<PLayerDashboardResponse[]> {
    try {
      return this.prismaService.userDashboard.findMany({
        where: {
          game_id: gameId,
        },
        orderBy: {
          score: 'desc',
        },
        take: take || 10,
      })
    } catch (err) {
      throw new ForbiddenException(err);
    }
  }

  
}
