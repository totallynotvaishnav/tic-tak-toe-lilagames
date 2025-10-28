import { PlayerMark } from '../utils/gameLogic';

interface TileProps {
  mark: PlayerMark;
  onClick: () => void;
  disabled: boolean;
  isWinning: boolean;
  animate: boolean;
}

export const Tile = ({ mark, onClick, disabled, isWinning, animate }: TileProps) => {
  const baseClasses = 'w-full h-full rounded-lg flex items-center justify-center text-6xl font-bold transition-all duration-200 cursor-pointer select-none';
  
  const bgClasses = mark === null
    ? 'bg-tile-empty hover:bg-opacity-80'
    : isWinning
    ? 'win-tile'
    : mark === 'X'
    ? 'bg-tile-x'
    : 'bg-tile-o';
  
  const textClasses = mark ? 'text-text-dark' : '';
  
  const shadowClasses = mark === null 
    ? 'shadow-tile hover:shadow-tile-hover' 
    : 'shadow-tile';
  
  const animationClasses = animate && mark !== null ? 'tile-appear' : '';
  
  const disabledClasses = disabled ? 'cursor-not-allowed opacity-90' : '';

  return (
    <div
      className={`${baseClasses} ${bgClasses} ${textClasses} ${shadowClasses} ${animationClasses} ${disabledClasses}`}
      onClick={!disabled && mark === null ? onClick : undefined}
    >
      {mark}
    </div>
  );
};
