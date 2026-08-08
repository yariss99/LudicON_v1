import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, letting later Tailwind utilities win over earlier ones.
 *
 * The pre-refactor tree had no class-merge utility at all — components joined
 * strings by hand, so a caller's `className` collided with the component's own
 * classes unpredictably. The workaround was `!important` (`!min-h-8`,
 * `!rounded-xl`), which then fought everything else. This removes the cause.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
