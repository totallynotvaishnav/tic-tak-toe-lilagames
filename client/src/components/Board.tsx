import { Board as BoardType, WinningLine } from '../utils/gameLogic';
import { Tile } from './Tile';

interface BoardProps {
  board: BoardType;
  onMove: (position: number) => void;
  disabled: boolean;
  winningLine: WinningLine | null;
  lastMove: number | null;
  isMyTurn?: boolean;
}

export const Board = ({ board, onMove, disabled, winningLine, lastMove, isMyTurn }: BoardProps) => {
  const isWinningPosition = (position: number): boolean => {
    return winningLine ? winningLine.positions.includes(position) : false;
  };

  const shouldAnimate = (position: number): boolean => {
    return lastMove === position;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-grid-bg p-4 rounded-xl shadow-lg">
        <div className={`grid grid-cols-3 gap-3 ${isMyTurn === false ? 'cursor-not-allowed' : ''}`}>
          {board.map((mark, index) => (
            <div key={index} className="aspect-square">
              <Tile
                mark={mark}
                onClick={() => onMove(index)}
                disabled={disabled}
                isWinning={isWinningPosition(index)}
                animate={shouldAnimate(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
