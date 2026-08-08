/**
 * Every Romanian string the printing half shows, in one frozen object.
 *
 * Separate from the builder's `../copy.ts` rather than added to it, for the
 * reason that file gives for existing at all: it is read top to bottom to check
 * the UX-001 ban list, and a file that grows a section per slice stops being
 * readable in one pass. The ban list is the same one — nothing here may say
 * "Canvas", "Element", "Container", "Section" as a noun a teacher reads,
 * "Engine", "Pipeline", "Validation", "AI", "Generate", "Error", "Invalid",
 * "Required", "Missing" or "No data".
 *
 * The vocabulary this half settled on, and why:
 *
 * - the two outputs are **lucrarea elevilor** and **copia ta** — not "student
 *   version" and "teacher version", because a teacher does not think of the
 *   sheet they hand out as a variant of anything; it is the paper, and the
 *   other one is their own copy of it with the answers on;
 * - what the print window is called is a **fereastra de tipărire**, which is
 *   what Windows and macOS both call it in Romanian, so the sentence about
 *   background graphics names something the teacher is looking at;
 * - "Grafică de fundal" is quoted exactly as Chrome's Romanian interface
 *   labels it. A paraphrase would be kinder to read and useless to follow.
 */
export const PRINT_COPY = {
  /* ---- Opening the print window ---- */
  open: "Tipărește",
  title: "Tipărește lucrarea",
  lead: "Alege ce pui pe hârtie, apoi treci o dată prin listă.",
  close: "Închide",
  cancel: "Renunță",

  /* ---- The two outputs ---- */
  chooseLabel: "Ce tipărești",
  student: "Lucrarea elevilor",
  studentExplanation: "Fără răspunsuri. Asta primesc copiii pe bancă.",
  teacher: "Copia ta",
  teacherExplanation:
    "Aceeași lucrare, urmată de barem: răspunsurile, punctajele și lămuririle.",

  /* ---- What the browser cannot do for us ---- */
  backgroundsTitle: "Ca să iasă și culorile",
  backgroundsExplanation:
    "În fereastra de tipărire, bifează „Grafică de fundal”. Fără ea, casetele colorate ies albe pe hârtie.",
  /**
   * Said out loud because the button next to it does something else.
   *
   * `Tipărește` opens the operating system's print window; whether a file comes
   * out of it is the teacher's choice inside that window, not something this
   * app does. Letting them discover that by looking for a download that never
   * arrives is the kind of small dishonesty that costs trust in everything else
   * on the screen.
   */
  pdfTitle: "Dacă vrei un fișier",
  pdfExplanation:
    "În fereastra de tipărire alege „Salvează ca PDF”. Descărcarea dintr-o singură apăsare vine mai târziu.",

  /* ---- While the sheets are being laid out ---- */
  preparing: "Se pregătesc paginile…",
} as const;
