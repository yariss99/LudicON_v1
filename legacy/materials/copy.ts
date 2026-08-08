/**
 * Teacher-facing copy for material preparation and for the approval gate that
 * guards it.
 *
 * Kept in one object so the UX-001 ban list can be checked by reading a single
 * file. Nothing here blames the teacher, and every failure sentence says first
 * that the work is safe.
 */
export const MATERIALS_COPY = {
  /* ---- The gate, from the design studio ---- */
  approveAction: "Confirmă designul lecției",
  approveActionBusy: "Se confirmă…",
  continueAction: "Mergi la materiale",
  approveTitle: "Confirmi designul lecției?",
  approveBody:
    "Materialele se nasc din lecția pe care o confirmi acum, ca să semene cu ce ai gândit tu. Rămâi la fel de liberă să schimbi lecția după aceea — confirmarea spune doar că designul este al tău.",
  approveNoteLabel: "Vrei să adaugi o notă? (opțional)",
  approveNotePlaceholder:
    "De exemplu: am pus accent pe lucrul în perechi, pentru că grupa lucrează mai bine așa.",
  approveConfirm: "Da, designul este gata",
  approveCancel: "Nu acum",
  approved: "Designul lecției este confirmat.",
  approveFailed:
    "Nu am putut confirma acum. Lecția e păstrată așa cum ai lăsat-o — încearcă din nou.",
  notReadyLead: "Mai avem nevoie de câteva informații înainte de materiale:",

  /* ---- The materials page ---- */
  pageTitle: "Pregătirea materialelor",
  pickerTitle: "Materialele lecției",
  pickerLead:
    "Alege ce să pregătim din lecția ta. Poți reveni oricând pentru altele.",
  alreadyMade: "Deja pregătit",
  prepare: "Pregătește materialele",
  preparing: "Se pregătesc…",
  pickSomething: "Bifează cel puțin un material ca să continuăm.",
  chosenOne: "1 material ales",
  chosenMany: (count: number) => `${count} materiale alese`,
  preparedOne: "Material pregătit. Îl poți deschide acum.",
  preparedMany: (count: number) =>
    `${count} materiale pregătite. Le poți deschide acum.`,
  prepareFailed:
    "Nu am putut pregăti materialele acum. Lecția e păstrată — încearcă din nou.",

  /* ---- What was prepared ---- */
  preparedHeading: "Pregătite pentru această lecție",
  preparedLead:
    "Deschide un material ca să îl lucrezi. Le găsești oricând și în bibliotecă.",
  open: "Deschide",
  openLibrary: "Deschide biblioteca",
  versionNoteCreated: "Pregătit din designul lecției",
  shelfSummary: (lesson: string) => `Pentru lecția „${lesson}”.`,

  /* ---- The closed gate ---- */
  gateTitle: "Mai întâi confirmi designul lecției",
  gateExplanation:
    "Materialele se nasc din lecția pe care ai confirmat-o, ca să semene cu ce ai gândit tu. Întoarce-te la designul lecției și, când ești mulțumită de el, pornim de acolo.",
  gateAction: "Înapoi la designul lecției",

  /* ---- States ---- */
  loading: "Se pregătește lecția",
  failedTitle: "Nu am putut deschide lecția acum",
  failedExplanation:
    "Ce ai lucrat este în siguranță. Încearcă din nou peste câteva momente.",
  missingTitle: "Lecția aceasta nu se mai află aici",
  missingExplanation:
    "Poate a fost mutată sau linkul e vechi. Proiectele tale te așteaptă la locul lor.",
  toProjects: "Vezi proiectele",
} as const;
