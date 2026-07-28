import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "ghost" | "tile";

type ButtonBaseProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: "default" | "sm" | "lg";
};

type ButtonAsButton = ButtonBaseProps & {
  to?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
  form?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

type ButtonAsLink = ButtonBaseProps & {
  to: string;
  onClick?: undefined;
  type?: undefined;
  ariaLabel?: string;
  disabled?: undefined;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-300/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-300/50",
  secondary:
    "bg-white text-slate-700 shadow-[0_2px_12px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(79,70,229,0.12)] hover:text-indigo-700",
  ghost: "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700",
  tile: "bg-white/90 text-indigo-700 shadow-sm backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-md",
};

const sizeStyles = {
  sm: "rounded-xl px-4 py-2 text-xs",
  default: "rounded-2xl px-5 py-3 text-sm",
  lg: "rounded-2xl px-7 py-3.5 text-base",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50";

function Button({
  children,
  className = "",
  variant = "primary",
  size = "default",
  ariaLabel,
  ...props
}: ButtonProps) {
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if ("to" in props && props.to) {
    return (
      <Link to={props.to} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;

  return (
    <button
      type={buttonProps.type ?? "button"}
      onClick={buttonProps.onClick}
      form={buttonProps.form}
      className={classes}
      aria-label={ariaLabel}
      disabled={buttonProps.disabled}
    >
      {children}
    </button>
  );
}

export default Button;
