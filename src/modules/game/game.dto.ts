export class OnSuccessResponseDto {
    code: number;

    status: string;
}

export class PlayerHistoryResponse {
    id: number;

    user_id: number;

    game_id: number;

    score: number;

    created_at: Date;
}

export class CreatePlayerHistoryDto {
    game_id: number;

    score: number;
}

export class PLayerDashboardResponse {
    id: number;

    user_id: number;

    game_id: number;

    user_name: string;

    score: number;
}

