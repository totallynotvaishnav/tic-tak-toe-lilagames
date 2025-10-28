import { Player } from '../utils/gameLogic';

interface PlayerInfoProps {
  player: Player | null;
  isCurrentTurn: boolean;
  userId: string | null;
}

export const PlayerInfo = ({ player, isCurrentTurn }: PlayerInfoProps) => {
  if (!player) return null;

  const playerMark = (player.mark || player.symbol) as 'X' | 'O';

  return (
    <div className={`bg-white rounded-lg p-4 shadow-tile transition-all duration-300 ${isCurrentTurn ? 'ring-4 ring-tile-x ring-opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-text-dark opacity-60">
            {playerMark === 'X' ? 'PLAYER X' : 'PLAYER O'}
          </p>
          <p className="text-lg font-bold text-text-dark mt-1">
            {player.username}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold ${playerMark === 'X' ? 'bg-tile-x' : 'bg-tile-o'}`}>
          {playerMark}
        </div>
      </div>
      {isCurrentTurn && (
        <div className="mt-3 text-sm font-bold text-tile-x animate-pulse">
          YOUR TURN
        </div>
      )}
    </div>
  );
};
