/**
 * The Romanian the pre-print checklist speaks, in one frozen object.
 *
 * Almost every sentence a teacher reads here comes from `validateProject`,
 * which already writes Romanian for a person — so this file deliberately holds
 * only what the SCREEN adds: the heading, the four severity words, and the one
 * check the model cannot make on its own. Restating the model's messages here
 * would give the product two wordings of the same problem, and the one nobody
 * edited would be the one on screen.
 *
 * The severity words are the reason this file is not just a heading. A
 * `ValidationIssue` carries `blocking | error | warning | info`, and printing
 * those on a teacher's screen would be four English architecture words in a row
 * — the exact thing UX-001 bans. They are also the second channel that keeps
 * the list from relying on colour: every row says what it is in words, next to
 * a glyph, next to its own colour.
 *
 * "De rezolvat" and not "Eroare": a blocking issue is not a fault the teacher
 * committed, it is the next thing to do before the paper can be handed out.
 */
export const CHECK_COPY = {
  title: "Înainte de tipar",
  lead: "Ce am găsit uitându-mă peste lucrare așa cum va ieși pe hârtie.",

  checking: "Se verifică lucrarea…",
  allClear: "Nu am găsit nimic de îndreptat. Poți tipări.",
  blockedHint: "Rezolvă mai întâi ce e trecut la „De rezolvat”.",

  /** The four levels, in the order the list shows them. */
  severity: {
    blocking: "De rezolvat",
    error: "De verificat",
    warning: "Merită o privire",
    info: "Bun de știut",
  },

  /**
   * The one check no DOM-free validator can make.
   *
   * A page is a fixed 210×297mm box that clips, so content past the bottom
   * margin is not pushed to the next sheet — it simply never prints. The
   * message says which sheet and roughly how much, because "prea mult conținut"
   * on a four-page paper is not something anyone can act on.
   */
  overflowMessage: (pageIndex: number, millimetres: number) =>
    `Pagina ${pageIndex} are mai mult decât încape — cam ${millimetres} mm rămân sub marginea de jos.`,
  overflowRemedy:
    "Scoate sau scurtează ceva de pe pagină, ori mută restul pe o pagină nouă. Ce trece de margine nu se tipărește.",
} as const;
