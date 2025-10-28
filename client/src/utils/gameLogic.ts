export type PlayerMark = 'X' | 'O' | null;
export type Board = PlayerMark[];
export type GameStatus = 'waiting' | 'playing' | 'active' | 'finished';

export interface Player {
    mark?: PlayerMark;
    symbol?: string;
    username: string;
    sessionId: string;
}

export interface GameState {
    board: Board;
    currentPlayer: string;
    currentPlayerName: string;
    gameStatus: GameStatus;
    moveCount: number;
    players: { [userId: string]: Player };
    winner?: string | null;
    winnerId?: string | null;
    winnerMark?: PlayerMark;
}

export interface WinningLine {
    positions: number[];
    mark: PlayerMark;
}

export const WIN_PATTERNS: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

export const checkWinner = (board: Board): WinningLine | null => {
    for (const pattern of WIN_PATTERNS) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return {
                positions: pattern,
                mark: board[a] as PlayerMark,
            };
        }
    }
    return null;
};

export const checkDraw = (board: Board): boolean => {
    return board.every((cell) => cell !== null) && !checkWinner(board);
};

export const getEmptyCells = (board: Board): number[] => {
    return board.map((cell, index) => (cell === null ? index : -1)).filter((index) => index !== -1);
};

export const isValidMove = (board: Board, position: number): boolean => {
    return position >= 0 && position < 9 && board[position] === null;
};
