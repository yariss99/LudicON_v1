import "./GameTypeCard.css";

type GameTypeCardProps = {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
};

function GameTypeCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: GameTypeCardProps) {
  return (
    <button
      className={`game-type-card ${selected ? "selected" : ""}`}
      onClick={onClick}
      type="button"
    >
      <div className="game-type-icon">
        {icon}
      </div>

      <div className="game-type-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      {selected && (
        <div className="game-type-check">
          ✓
        </div>
      )}
    </button>
  );
}

export default GameTypeCard;
