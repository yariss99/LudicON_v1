import { forwardRef, useState, type HTMLAttributes } from "react";

import { cn } from "../lib/cn";

const SIZE_CLASS = {
  sm: "size-8 text-[0.8125rem]",
  md: "size-10 text-base",
  lg: "size-12 text-lg",
} as const;

export type AvatarSize = keyof typeof SIZE_CLASS;

export interface AvatarProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  /** Photo URL. Omit it and the initials render instead. */
  src?: string;
  /** Accessible name for the photo — the person's name, not "avatar". */
  alt?: string;
  /** Initials or short text shown when there is no usable photo. */
  fallback: string;
  size?: AvatarSize;
}

/**
 * A person's picture.
 *
 * This is a teacher's own profile image, not a product mascot — CH12's ban on
 * "mascots / robots / avatars" is about giving the software a face, which this
 * deliberately does not do.
 *
 * A broken image URL falls back to initials rather than to a broken-image icon,
 * because a failed avatar must never look like a failed page.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, src, alt, fallback, size = "md", ...props },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      ref={ref}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-muted font-medium text-muted-foreground ring-1 ring-border",
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? fallback}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden className="select-none leading-none">
          {fallback}
        </span>
      )}
      {showImage ? null : <span className="sr-only">{alt ?? fallback}</span>}
    </span>
  );
});
