import { GameButton } from './GameButton';

interface GameOverModalProps {
  winner: string | null;
  winnerId: string | null;
  currentUserId: string | null;
  isDraw: boolean;
  onPlayAgain: () => void;
  show: boolean;
}

export const GameOverModal = ({ winner, winnerId, currentUserId, isDraw, onPlayAgain, show }: GameOverModalProps) => {
  if (!show) return null;

  console.log('GameOverModal render:', {
    winner,
    winnerId,
    currentUserId,
    isDraw,
    comparison: winnerId === currentUserId
  });

  const iWon = winnerId && currentUserId && winnerId === currentUserId;
  const isActualDraw = isDraw || winner === 'draw';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-game-bg rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slide-in">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {isActualDraw ? '🤝' : iWon ? '🎉' : '😔'}
          </div>
          <h2 className="text-3xl font-bold text-text-dark mb-2">
            {isActualDraw ? 'Draw!' : iWon ? 'You Won!' : 'You Lost!'}
          </h2>
          {!isActualDraw && winner && winner !== 'draw' && (
            <p className="text-xl text-text-dark mb-6">
              {iWon ? 'Congratulations!' : `${winner} wins the game!`}
            </p>
          )}
          {isActualDraw && (
            <p className="text-xl text-text-dark mb-6">
              It's a tie game!
            </p>
          )}
          <GameButton onClick={onPlayAgain} fullWidth>
            Play Again
          </GameButton>
        </div>
      </div>
    </div>
  );
};
