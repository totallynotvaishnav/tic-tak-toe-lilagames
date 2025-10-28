interface ScorePanelProps {
  title: string;
  value: string | number;
  highlight?: boolean;
}

export const ScorePanel = ({ title, value, highlight = false }: ScorePanelProps) => {
  return (
    <div className={`bg-grid-bg rounded-lg p-3 shadow-tile transition-all duration-300 ${highlight ? 'scale-105' : ''}`}>
      <div className="text-xs font-bold text-text-dark opacity-60 uppercase tracking-wide">
        {title}
      </div>
      <div className="text-2xl font-bold text-text-dark mt-1">
        {value}
      </div>
    </div>
  );
};
