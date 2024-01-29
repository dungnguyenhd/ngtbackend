import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { GameService } from './game.service';
import { Auth } from '../common/decorators/auth.decorator';
import { User } from '../common/decorators/user.decorator';
import { PlayerHistoryResponse, CreatePlayerHistoryDto, OnSuccessResponseDto, PLayerDashboardResponse } from './game.dto';

@Controller('game')
@Auth()
export class GameController {
  constructor(private readonly gameService: GameService) {
    //
  }

  @Get('player-history')
  async getPlayerHistory(
    @Query('gameId') gameId: number,
    @User() user,
  ): Promise<PlayerHistoryResponse[]> {
    return this.gameService.getPlayerHistory(user.id, gameId);
  }

  @Post('player-history')
  async createPlayerHistory(
    @Body() params: CreatePlayerHistoryDto,
    @User() user,
  ): Promise<OnSuccessResponseDto> {
    return this.gameService.createPlayerHistory(user.id, params.game_id, params.score);
  }

  @Get('player-dashboard')
  async getPlayerDashboard(
    @User() user,
  ): Promise<PLayerDashboardResponse[]> {
    return this.gameService.getPlayerDashboard(user.id);
  }

  @Get('player-dashboard-by-game')
  async getPlayerDashBoardByGame(
    @Query('gameId') gameId: number,
    @User() user,
  ): Promise<PLayerDashboardResponse> {
    return this.gameService.getPlayerDashboardByGame(user.id, gameId);
  }

  @Patch('update-player-dashboard')
  async updatePlayerDashboard(
    @User() user,
    @Body() params: CreatePlayerHistoryDto,
  ): Promise<OnSuccessResponseDto> {
    return this.gameService.updatePlayerDashboard(user.id, params.game_id, params.score);
  }

  @Get('get-top-player-by-game')
  async getTopPlayerByGame(
    @Query('gameId') gameId: number,
    @Query('take') take: number,
  ): Promise<PLayerDashboardResponse[]> {
    return this.gameService.getTopPlayerByGame(gameId, take);
  }
}
