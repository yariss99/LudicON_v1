import type { LessonStyleId, LessonWizardStepId } from "../../types/lesson";

export const LESSON_WIZARD_STEPS: Array<{
  id: LessonWizardStepId;
  index: number;
  title: string;
  description: string;
}> = [
  {
    id: "general",
    index: 0,
    title: "Informații generale",
    description: "Titlu, clasă, durată și autor",
  },
  {
    id: "curriculum",
    index: 1,
    title: "Curriculum",
    description: "Competențe și obiective",
  },
  {
    id: "teaching",
    index: 2,
    title: "Design didactic",
    description: "Metode, resurse și organizare",
  },
  {
    id: "style",
    index: 3,
    title: "Stilul lecției",
    description: "Alege un singur stil",
  },
  {
    id: "review",
    index: 4,
    title: "Revizuire",
    description: "Verifică și generează",
  },
];

export const LESSON_DURATIONS = [30, 45, 50, 90] as const;

export const GENERAL_COMPETENCIES = [
  "Rezolvarea de probleme",
  "Gândire critică",
  "Comunicare eficientă",
  "Colaborare",
  "Autonomie în învățare",
  "Utilizarea instrumentelor digitale",
] as const;

export const SPECIFIC_COMPETENCIES = [
  "Identifică concepte-cheie",
  "Aplică proceduri învățate",
  "Explică relații cauză-efect",
  "Argumentează alegeri",
  "Realizează sarcini practice",
  "Evaluează rezultatele muncii",
] as const;

export const LEARNING_OBJECTIVES = [
  "Elevii vor putea explica ideea centrală",
  "Elevii vor putea aplica noțiunile în exemple noi",
  "Elevii vor putea colabora pentru a rezolva o sarcină",
  "Elevii vor putea evalua propriul progres",
  "Elevii vor putea transfera învățarea în contexte reale",
] as const;

export const TEACHING_METHODS = [
  "Conversație euristică",
  "Explicație",
  "Demonstrație",
  "Lucru în grup",
  "Învățare prin descoperire",
  "Joc didactic",
  "Problematizare",
] as const;

export const TEACHING_RESOURCES = [
  "Manual",
  "Fișă de lucru",
  "Prezentare",
  "Videoclip educațional",
  "Material manipulative",
  "Platformă digitală",
] as const;

export const TEACHING_MATERIALS = [
  "Tablă / flipchart",
  "Proiector",
  "Foi și instrumente de scris",
  "Fișe tipărite",
  "Kit experimental",
  "Dispozitive digitale",
] as const;

export const CLASSROOM_ORGANIZATIONS = [
  "Frontal",
  "Individual",
  "Perechi",
  "Grupuri mici",
  "Stații de învățare",
  "Mixt",
] as const;

export type LessonStyleOption = {
  id: LessonStyleId;
  title: string;
  description: string;
};

export const LESSON_STYLES: readonly LessonStyleOption[] = [
  {
    id: "traditional",
    title: "Traditional",
    description: "Structură clară, explicație și consolidare.",
  },
  {
    id: "modern",
    title: "Modern",
    description: "Interactiv, digital și centrat pe elev.",
  },
  {
    id: "inquiry",
    title: "Inquiry-Based",
    description: "Întrebări, investigație și descoperire.",
  },
  {
    id: "steam",
    title: "STEAM",
    description: "Integrare știință, tehnologie, artă și proiect.",
  },
  {
    id: "gamified",
    title: "Gamified",
    description: "Provocări, niveluri și feedback imediat.",
  },
  {
    id: "inclusive",
    title: "Inclusive",
    description: "Diferențiere, accesibilitate și participare pentru toți.",
  },
] as const;

export function getLessonStyleLabel(style: LessonStyleId): string {
  return LESSON_STYLES.find((item) => item.id === style)?.title ?? style;
}
