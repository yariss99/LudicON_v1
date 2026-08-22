import type { AssistantContextPackage } from "../types";

export type SuggestionGroupId =
  | "planificare"
  | "idei"
  | "imbunatatire"
  | "transformare";

export type AssistantSuggestion = {
  readonly id: string;
  readonly label: string;
  readonly prompt: string;
};

export type AssistantSuggestionGroup = {
  readonly id: SuggestionGroupId;
  readonly label: string;
  readonly items: readonly AssistantSuggestion[];
};

const KIND_LABELS: Record<string, string> = {
  lesson: "Lecție",
  assessment: "Evaluare",
  story: "Poveste",
  game: "Joc",
  presentation: "Prezentare",
};

export function documentKindLabel(kind?: string): string | undefined {
  if (!kind) return undefined;
  return KIND_LABELS[kind] ?? kind;
}

function inferKind(
  context: AssistantContextPackage,
): string | "home" | "project" {
  if (context.documentKind) return context.documentKind;
  const path = context.workflowPath ?? "";
  if (
    path === "/" ||
    path === "" ||
    path.startsWith("/create") ||
    path.startsWith("/projects") ||
    path.startsWith("/activity") ||
    path.startsWith("/library")
  ) {
    return "home";
  }
  if (context.projectId) return "project";
  return "home";
}

const HOME_GROUPS: readonly AssistantSuggestionGroup[] = [
  {
    id: "planificare",
    label: "Planificare",
    items: [
      {
        id: "home-choose",
        label: "Ajută-mă să aleg ce să creez",
        prompt: "Ajută-mă să aleg ce să creez astăzi, după clasa și disciplina mea.",
      },
      {
        id: "home-next",
        label: "Propune o idee pentru următoarea lecție",
        prompt: "Propune o idee pentru următoarea lecție, pe disciplina și clasa proiectului meu recent.",
      },
      {
        id: "home-class",
        label: "Ce pot pregăti pentru clasa mea?",
        prompt: "Ce pot pregăti pentru clasa mea în perioada următoare?",
      },
      {
        id: "home-continue",
        label: "Continuă proiectul meu recent",
        prompt: "Ajută-mă să continui proiectul meu recent: ce ar urma pedagogic?",
      },
    ],
  },
];

const PROJECT_GROUPS: readonly AssistantSuggestionGroup[] = [
  {
    id: "idei",
    label: "Idei",
    items: [
      {
        id: "proj-ideas",
        label: "Propune idei",
        prompt: "Propune 3 idei de continuare pentru proiectul curent.",
      },
      {
        id: "proj-activities",
        label: "Sugerează activități",
        prompt: "Sugerează activități de consolidare potrivite pentru clasa acestui proiect.",
      },
    ],
  },
  {
    id: "imbunatatire",
    label: "Îmbunătățire",
    items: [
      {
        id: "proj-improve",
        label: "Verifică și îmbunătățește",
        prompt: "Verifică proiectul curent și propune îmbunătățiri pe care le pot accepta sau respinge.",
      },
      {
        id: "proj-diff",
        label: "Diferențiază",
        prompt: "Ajută-mă să diferențiez sarcinile din acest proiect.",
      },
    ],
  },
  {
    id: "transformare",
    label: "Transformare",
    items: [
      {
        id: "proj-game",
        label: "Transformă în joc",
        prompt: "Transformă ideea acestui proiect într-un joc educativ.",
      },
      {
        id: "proj-adapt",
        label: "Adaptează pentru alt nivel",
        prompt: "Adaptează materialul pentru un alt nivel de clasă.",
      },
    ],
  },
];

const KIND_GROUPS: Record<string, readonly AssistantSuggestionGroup[]> = {
  assessment: [
    {
      id: "idei",
      label: "Idei",
      items: [
        {
          id: "as-obj",
          label: "Propune 3 variante de obiective",
          prompt: "Propune 3 variante de obiective pentru această evaluare.",
        },
        {
          id: "as-items",
          label: "Sugerează itemi",
          prompt: "Sugerează itemi potriviți pentru clasa și disciplina acestei evaluări.",
        },
      ],
    },
    {
      id: "imbunatatire",
      label: "Îmbunătățire",
      items: [
        {
          id: "as-check",
          label: "Verifică dacă itemii sunt potriviți",
          prompt: "Verifică dacă itemii sunt potriviți pentru clasă.",
        },
        {
          id: "as-bar",
          label: "Verifică baremul",
          prompt: "Verifică baremul acestei evaluări.",
        },
        {
          id: "as-diff",
          label: "Diferențiază evaluarea",
          prompt: "Ajută-mă să diferențiez această evaluare.",
        },
      ],
    },
  ],
  lesson: [
    {
      id: "idei",
      label: "Idei",
      items: [
        {
          id: "ls-act",
          label: "Propune o activitate",
          prompt: "Propune o activitate de consolidare pentru această lecție.",
        },
      ],
    },
    {
      id: "imbunatatire",
      label: "Îmbunătățire",
      items: [
        {
          id: "ls-seq",
          label: "Verifică succesiunea",
          prompt: "Verifică succesiunea activităților din această lecție.",
        },
        {
          id: "ls-diff",
          label: "Diferențiază sarcinile",
          prompt: "Ajută-mă să diferențiez sarcinile din această lecție.",
        },
      ],
    },
  ],
  game: [
    {
      id: "idei",
      label: "Idei",
      items: [
        {
          id: "gm-mech",
          label: "Propune o mecanică",
          prompt: "Propune o mecanică de joc potrivită obiectivului educațional.",
        },
      ],
    },
    {
      id: "imbunatatire",
      label: "Îmbunătățire",
      items: [
        {
          id: "gm-diff",
          label: "Crește dificultatea",
          prompt: "Propune cum pot crește dificultatea jocului fără a pierde obiectivul.",
        },
        {
          id: "gm-obj",
          label: "Verifică obiectivul educațional",
          prompt: "Verifică dacă jocul servește obiectivul educațional.",
        },
      ],
    },
  ],
  story: [
    {
      id: "idei",
      label: "Idei",
      items: [
        {
          id: "st-scene",
          label: "Dezvoltă scena",
          prompt: "Dezvoltă scena curentă a poveștii, păstrând intenția mea.",
        },
        {
          id: "st-q",
          label: "Propune întrebări",
          prompt: "Propune întrebări de înțelegere pe baza acestei povești.",
        },
      ],
    },
    {
      id: "imbunatatire",
      label: "Îmbunătățire",
      items: [
        {
          id: "st-lang",
          label: "Simplifică limbajul",
          prompt: "Simplifică limbajul poveștii pentru nivelul clasei.",
        },
      ],
    },
  ],
  presentation: [
    {
      id: "idei",
      label: "Idei",
      items: [
        {
          id: "pr-struct",
          label: "Structurează ideile",
          prompt: "Structurează ideile acestei prezentări pe slide-uri clare.",
        },
        {
          id: "pr-act",
          label: "Propune o activitate",
          prompt: "Propune o activitate de clasă legată de această prezentare.",
        },
      ],
    },
    {
      id: "imbunatatire",
      label: "Îmbunătățire",
      items: [
        {
          id: "pr-slide",
          label: "Simplifică slide-ul",
          prompt: "Simplifică slide-ul curent ca să rămână lizibil în clasă.",
        },
      ],
    },
  ],
};

export function buildContextualSuggestions(
  context: AssistantContextPackage,
): readonly AssistantSuggestionGroup[] {
  const kind = inferKind(context);
  if (kind === "home") return HOME_GROUPS;
  if (kind === "project") return PROJECT_GROUPS;
  return KIND_GROUPS[kind] ?? PROJECT_GROUPS;
}
