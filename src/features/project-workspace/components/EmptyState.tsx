type Props = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="pw-empty">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
