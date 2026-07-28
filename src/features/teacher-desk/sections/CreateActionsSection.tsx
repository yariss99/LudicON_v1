import { BookOpen, Library, Palette, Puzzle } from "lucide-react";
import CreateActionCard from "../components/CreateActionCard";

const ACTIONS = [
  {
    id: "lesson",
    title: "Lecție nouă",
    description: "De la intenție la materiale, pas cu pas.",
    icon: BookOpen,
    href: "/create/experience",
    accent: "blue" as const,
  },
  {
    id: "material",
    title: "Material nou",
    description: "Fișă, evaluare sau prezentare pentru clasă.",
    icon: Palette,
    href: "/editor",
    accent: "green" as const,
  },
  {
    id: "game",
    title: "Joc educațional",
    description: "O experiență ludică legată de obiective.",
    icon: Puzzle,
    href: "/create/experience",
    accent: "amber" as const,
  },
  {
    id: "template",
    title: "Din șablon",
    description: "Pornește de la un tipar didactic dovedit.",
    icon: Library,
    href: "/library",
    accent: "blue" as const,
  },
] as const;

function CreateActionsSection() {
  return (
    <section className="atelier-section--after-hero" aria-label="Acțiuni rapide">
      <div className="atelier-grid-actions">
        {ACTIONS.map((action) => (
          <CreateActionCard
            key={action.id}
            title={action.title}
            description={action.description}
            icon={action.icon}
            href={action.href}
            accent={action.accent}
          />
        ))}
      </div>
    </section>
  );
}

export default CreateActionsSection;
