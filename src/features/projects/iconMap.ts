import {
  Atom,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe2,
  Landmark,
  Lightbulb,
  Music,
  Palette,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import type { ProjectIconId } from "../../types/project";

export const PROJECT_ICON_MAP: Record<ProjectIconId, LucideIcon> = {
  book: BookOpen,
  flask: FlaskConical,
  globe: Globe2,
  palette: Palette,
  calculator: Calculator,
  music: Music,
  landmark: Landmark,
  atom: Atom,
  pen: PenLine,
  lightbulb: Lightbulb,
};

export function getProjectIcon(icon: ProjectIconId): LucideIcon {
  return PROJECT_ICON_MAP[icon] ?? BookOpen;
}
