/**
 * Every visible string on the public page, in one place.
 *
 * The page has one job: tell a teacher who has never heard of this what the
 * product does, in the order the product actually works, and then get out of
 * the way with a single door in. So the copy is written the way a colleague
 * would explain it over coffee — concrete verbs, no adjectives about how
 * revolutionary anything is, no numbers we cannot stand behind.
 *
 * Two vocabulary rules run through all of it. Nothing here names the machinery
 * — a teacher does not care what the thing is built from, only what it does to
 * their Tuesday. And nothing claims a result we have not measured, which is why
 * there is not a single statistic, testimonial or customer count on the page.
 */

export const LANDING_COPY = {
  brand: "LUDI ON",
  skipToContent: "Sari la conținut",

  header: {
    signIn: "Intră în cont",
  },

  hero: {
    eyebrow: "Studio de proiectare pedagogică pentru învățământul primar",
    /* The whole product thesis in eight words. If a teacher reads only this
       line and leaves, they still know the one thing that makes this different
       from everything else that promises to write their lesson for them. */
    title: "Întâi proiectăm lecția. Materialele vin după ce o aprobi.",
    lead: "Spui în cuvintele tale ce vrei să facă elevii la ora următoare. PRIMA îți pune întrebările care lipsesc, îți propune un proiect de lecție și se oprește acolo. Nimic nu ia formă până nu îl citești și nu îl aprobi.",
    primaryAction: "Intră în cont",
    secondaryLead: "Nu ai încă un cont?",
    secondaryAction: "Creează unul",
    assurance: "PRIMA propune și explică. Decizia pedagogică rămâne a ta.",
  },

  loop: {
    heading: "Cum se lucrează",
    /* One line, on purpose. The longer version pointed at the fourth step in
       words, which the step already does for itself in both colour and copy —
       and it wrapped to a two-word orphan every time. */
    supporting: "Șase pași, în ordinea în care se întâmplă.",
    /* Named on the step itself rather than in a tooltip: the moment the teacher
       holds the pen is the product's central promise, so it is said out loud
       where it happens. */
    gateLabel: "Aici decizi tu",
  },

  authority: {
    heading: "Cine decide",
    supporting: "Trei limite pe care produsul nu le trece.",
    closing:
      "LUDI ON nu este o platformă de management școlar, nu este o mașină de făcut lecții și nu este un chat. Este locul în care îți proiectezi ora.",
  },

  close: {
    heading: "Începe cu lecția de mâine",
    lead: "Ai nevoie doar de o frază despre ce vrei să facă elevii.",
    primaryAction: "Intră în cont",
    secondaryAction: "Creează un cont",
  },

  footer: {
    tagline:
      "Studio de proiectare pedagogică pentru învățământul primar. Interfața este în limba română.",
  },
} as const;

export interface LoopStep {
  readonly title: string;
  readonly body: string;
  /**
   * The binding gate.
   *
   * Exactly one step carries this, and the section reads wrong if a second one
   * ever does — the point of the flag is that the teacher's approval is the
   * single place the process stops and waits.
   */
  readonly isGate?: boolean;
}

/** The teacher's loop, in the order a teacher lives it. */
export const LOOP_STEPS: readonly LoopStep[] = [
  {
    title: "Spui ce urmărești",
    body: "O frază despre ce vrei să facă elevii la ora următoare. Fără formular, fără pași de completat.",
  },
  {
    title: "Vorbiți despre lecție",
    body: "PRIMA întreabă ce mai are nevoie să știe: clasa, timpul avut la dispoziție, ce știu deja copiii. O discuție, nu un chestionar.",
  },
  {
    title: "Primești propunerea",
    body: "Obiective, pașii orei, materialele necesare și felul în care verifici ce au înțeles — scrise ca un proiect pe care îl citești cap-coadă.",
  },
  {
    title: "Aprobi tu",
    body: "Aici se oprește totul până te pronunți. Poți schimba, poți cere altceva, poți refuza. Fără acordul tău nu merge nimic mai departe.",
    isGate: true,
  },
  {
    title: "Materialele iau formă",
    body: "Fișe de lucru, evaluări, prezentări, povești și jocuri — toate editabile, toate pornind din lecția pe care ai aprobat-o.",
  },
  {
    title: "Duci lecția la clasă",
    body: "Publici sau exporți ce ai nevoie, iar după oră notezi ce a mers. Ce reții acum scurtează discuția data viitoare.",
  },
];

export interface AuthorityPoint {
  readonly title: string;
  readonly body: string;
}

/** What the product refuses to do, stated as promises rather than disclaimers. */
export const AUTHORITY_POINTS: readonly AuthorityPoint[] = [
  {
    title: "Propunerea vine cu motivul ei",
    body: "Fiecare sugestie spune de ce a fost făcută, ca să o poți primi sau respinge în cunoștință de cauză. Nimic nu îți este prezentat ca literă de lege.",
  },
  {
    title: "Nimic nu ajunge la elevi de la sine",
    body: "Publicarea rămâne de fiecare dată o acțiune a ta, făcută în momentul în care ești gata.",
  },
  {
    title: "Nu ți se numără clicurile",
    body: "Ce contează aici este timpul pe care îl recâștigi, încrederea cu care intri la oră și calitatea lecției.",
  },
];
