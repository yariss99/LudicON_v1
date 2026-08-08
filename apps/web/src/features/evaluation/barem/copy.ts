/**
 * The Romanian the barem speaks, in one frozen object.
 *
 * "Barem" is not a translation of "answer key" — it is the word Romanian
 * teachers already use for the marking scheme, and it carries the two halves
 * this screen shows: what the correct answer is, and how the points are
 * awarded. Nothing here says "răspunsuri corecte" as a heading for that reason;
 * the sheet is the barem, and its columns say what each column is.
 *
 * `pointsLabel` is the only function that does real linguistic work, and it is
 * here rather than inline because Romanian counts differently from English —
 * see its own note.
 */
export const BAREM_COPY = {
  /* ---- Opening it ---- */
  open: "Baremul",
  title: "Baremul",
  lead: "Răspunsurile, punctajele și lămuririle, în ordinea exercițiilor.",
  close: "Închide",

  /* ---- One entry ---- */
  answer: "Răspunsul corect",
  clarification: "Ce i se cere elevului",
  note: "Însemnarea ta",
  /** Shown in place of an answer that was never filled in. */
  answerNotSet: "Nu ai completat încă răspunsul.",
  /**
   * An exercise whose type is no longer registered.
   *
   * The name is all the barem can honestly print: without the definition there
   * is no way to say what the question asked, and inventing one would put a
   * sentence on a marking sheet that nobody wrote.
   */
  unknownExercise: "Exercițiu care nu mai este disponibil",

  /* ---- The foot of the sheet ---- */
  total: "Total",
  /**
   * Romanian puts "de" between a number and its noun from 20 upwards, except
   * where the last two digits fall between 1 and 19: 1 punct, 19 puncte, 20 de
   * puncte, 101 puncte, 120 de puncte.
   *
   * Written out rather than always printing "puncte" because the barem's total
   * is read aloud in front of a class, and "20 puncte" is the kind of small
   * wrongness that makes a document feel machine-made.
   */
  pointsLabel: (value: number) => {
    if (value === 1) return "1 punct";
    if (!Number.isInteger(value)) return `${value} puncte`;
    const lastTwo = value % 100;
    const linked = value >= 20 && !(lastTwo >= 1 && lastTwo <= 19);
    return linked ? `${value} de puncte` : `${value} puncte`;
  },

  /* ---- Nothing to show ---- */
  emptyTitle: "Baremul este încă gol",
  emptyExplanation:
    "Pune primul exercițiu în lucrare și răspunsul lui va apărea aici.",

  /** The heading printed at the top of the first barem sheet. */
  sheetTitle: (paper: string) => `Barem — ${paper}`,
  sheetTitleUntitled: "Barem",
  /** Printed under the heading, so a loose sheet says which paper it marks. */
  sheetSubtitle: "Foaia profesorului. Nu se dă elevilor.",
} as const;
