import "./ActivityCard.css";

type ActivityCardProps = {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
};

function ActivityCard({
  icon,
  title,
  description,
  selected,
  onClick,
}: ActivityCardProps) {
  return (
    <button
      className={`activity-card ${selected ? "selected" : ""}`}
      onClick={onClick}
      type="button"
    >
      <div className="activity-icon">
        {icon}
      </div>

      <div className="activity-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      {selected && (
        <div className="activity-check">
          ✓
        </div>
      )}
    </button>
  );
}

export default ActivityCard;
