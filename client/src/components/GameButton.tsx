import { ReactNode } from 'react';

interface GameButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  fullWidth?: boolean;
}

export const GameButton = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  disabled = false,
  fullWidth = false 
}: GameButtonProps) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 shadow-button';
  
  const variantClasses = variant === 'primary'
    ? 'bg-button-bg text-text-light hover:bg-opacity-90 active:bg-opacity-80'
    : 'bg-tile-x text-text-dark hover:bg-opacity-90 active:bg-opacity-80';
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'hover:shadow-tile-hover active:scale-95';
  
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${widthClasses}`}
    >
      {children}
    </button>
  );
};
