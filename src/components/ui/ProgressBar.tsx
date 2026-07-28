type ProgressBarProps = {
  value: number;
  className?: string;
  size?: "default" | "lg";
};

function ProgressBar({
  value,
  className = "",
  size = "default",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const height = size === "lg" ? "h-2.5" : "h-2";

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-slate-100/80 ${height} ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export default ProgressBar;
