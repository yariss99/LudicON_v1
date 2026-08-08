import type {
  ColorToken,
  ExerciseNumbering,
  TypographySlot,
} from "@ludicon/evaluation";

/**
 * Every Romanian string this feature shows, in one object.
 *
 * Kept together so the UX-001 ban list can be checked by reading a single file.
 * Nothing here may say "Canvas", "Element", "Container", "Section" as a noun a
 * teacher reads, "Engine", "Pipeline", "Validation", "AI", "Generate", "Error",
 * "Invalid", "Required", "Missing" or "No data". Those are architecture words;
 * they stay in the code.
 *
 * That single-file check is the reason `builder/theme-copy.ts` no longer exists.
 * It was a holding pen opened while this file belonged to another agent, and a
 * second vocabulary file is exactly the thing the rule above is written to
 * prevent: two objects, two review passes, and a `Container` reaching a teacher
 * from whichever one nobody read that week. Its strings are below, verbatim,
 * inside the groups they belong to. The rejected alternative — keeping it and
 * importing both — is a merge convenience that costs the rule its teeth.
 *
 * The vocabulary this feature settled on, and why:
 *
 * - the document is a **proiect** — the owner's choice, kept even though the
 *   artefact is specifically an evaluation, because it is the word already in
 *   the navigation and on every existing screen;
 * - a page is a **pagină**, never a "canvas";
 * - what you drop onto a page is a **piesă** — "element" is the code word and
 *   reads as jargon; a teacher places pieces;
 * - a row of columns is a **rând**, not a "section";
 * - an exercise is an **exercițiu**, and its answer data is the **barem**,
 *   which is the actual Romanian term teachers use for a marking scheme;
 * - how the whole paper looks is its **înfățișare**. "Temă" is the word the
 *   model uses and it is also what a teacher's phone calls dark mode, so it
 *   names the wrong thing on the one screen where both meanings are on offer;
 * - a text colour is **cerneală** and a page colour is **hârtie**. The paper
 *   metaphor is what the whole editor is built on, and "culoarea textului
 *   principal" is four words for something a teacher already has one for.
 */
export const EVALUATION_COPY = {
  /* ---- Creating ---- */
  createTitle: "Un proiect nou",
  createLead: "Câteva lucruri despre evaluare, apoi treci la pagină.",
  createSubmit: "Începe proiectul",
  createCancel: "Renunță",

  fieldTitle: "Cum se numește?",
  fieldTitlePlaceholder: "ex. Fracții — evaluare de final de unitate",
  fieldDescription: "Despre ce este",
  fieldDescriptionPlaceholder:
    "O propoziție pentru tine, ca să îl recunoști peste o lună.",
  fieldDiscipline: "Disciplina",
  fieldGrade: "Clasa",
  fieldDuration: "Cât durează",
  fieldDurationUnit: "minute",

  titleNeeded: "Dă-i un nume ca să îl poți găsi mai târziu.",
  disciplineNeeded: "Alege disciplina.",
  gradeNeeded: "Alege clasa.",
  durationNeeded: "Scrie câte minute are ora, între 5 și 240.",
  createFailed: "Nu am putut începe proiectul acum. Mai încearcă o dată.",
  choosePlaceholder: "Alege…",

  /* ---- The builder ---- */
  exit: "Înapoi la proiecte",
  untitled: "Proiect fără nume",
  renameLabel: "Numele proiectului",

  undo: "Pasul înapoi",
  redo: "Pasul înainte",
  preview: "Vezi cum arată",
  edit: "Înapoi la lucru",
  print: "Tipărește",

  /* ---- Pages ---- */
  pages: "Pagini",
  pageCover: "Coperta",
  pageNumbered: (index: number) => `Pagina ${index}`,
  addPage: "Adaugă o pagină",
  duplicatePage: "Fă o copie a paginii",
  removePage: "Șterge pagina",
  removePageConfirm:
    "Ștergi pagina și tot ce ai pus pe ea. Nu se mai poate aduce înapoi.",

  /* ---- The library ---- */
  libraryTitle: "Ce poți adăuga",
  librarySearch: "Caută",
  librarySearchPlaceholder: "Caută după nume…",
  libraryEmpty: "Nimic nu se potrivește cu ce ai scris.",

  groupLayout: "Așezare",
  groupText: "Text",
  groupMedia: "Imagini și semne",
  groupExercises: "Exerciții",

  /* ---- Pieces ---- */
  pieceHeading: "Titlu",
  pieceParagraph: "Paragraf",
  pieceList: "Listă",
  pieceQuote: "Citat",
  pieceImage: "Imagine",
  pieceDivider: "Linie",
  pieceSpacer: "Spațiu",
  pieceTable: "Tabel",
  pieceCallout: "Casetă",
  pieceAnswerSpace: "Loc de răspuns",

  rowFull: "Un singur rând",
  rowHalves: "Două coloane egale",
  rowThirdTwoThirds: "O treime și două treimi",
  rowTwoThirdsThird: "Două treimi și o treime",
  rowThirds: "Trei coloane egale",
  rowQuarters: "Patru coloane egale",

  /* ---- Selection and editing ---- */
  inspectorEmptyTitle: "Nu ai ales nimic",
  inspectorEmptyExplanation:
    "Alege ceva de pe pagină ca să îi schimbi înfățișarea.",

  moveUp: "Mai sus",
  moveDown: "Mai jos",
  duplicate: "Fă o copie",
  remove: "Scoate de pe pagină",

  groupContent: "Conținut",
  groupTypography: "Scrisul",
  groupSpacing: "Spațierea",
  groupBackground: "Fundalul",
  groupBorder: "Marginea",

  /* ---- Saving ---- */
  saveIdle: "Salvat",
  saveSaving: "Se salvează…",
  saveSaved: "Salvat",
  saveFailed: "Nu am putut salva acum. Am păstrat ce ai lucrat.",
  /**
   * The same fact, short enough for the bar.
   *
   * The sentence above is the one the teacher needs and it is 47 characters:
   * in a toolbar it either wraps the whole bar onto a second line — which moves
   * the paper down a row at the exact moment something went wrong — or it
   * truncates to "Nu am putut salva ac…", which reads as a shrug. So the bar
   * says the short one and carries the full sentence as its title, where a
   * pointer and a screen reader both reach it.
   */
  saveFailedShort: "Nu s-a salvat",

  /* ---- Empty states ---- */
  emptyPageTitle: "Pagină goală",
  emptyPageExplanation:
    "Adaugă un rând din panoul din dreapta, apoi pune text sau un exercițiu în el.",

  notFoundTitle: "Nu găsim proiectul",
  notFoundExplanation:
    "Poate a fost șters, sau adresa nu mai este bună. Proiectele tale sunt în listă.",

  loading: "Se deschide proiectul…",

  /* ---- The canvas ---- */
  zoom: "Mărimea paginii",
  /** The readout doubles as the way back; the number alone would not say so. */
  zoomActual: "Revino la mărimea obișnuită",
  /**
   * A row with no pieces in it draws nothing at all, so adding one used to look
   * like nothing had happened. This is what the reserved area says instead.
   */
  emptyRowHint: "Pune o piesă aici",
  /** Announced on the page box so a screen reader hears which sheet it is on. */
  pageOf: (index: number, total: number) => `Pagina ${index} din ${total}`,
  selectPiece: "Alege piesa",

  /* ---- Moving over the pages without a mouse ---- */
  /**
   * The name of the one stop the Tab key makes on the paper.
   *
   * It names what the teacher will be moving through — sheets and the pieces on
   * them — rather than the region that holds them, because "zona de lucru" is a
   * fact about the screen and the list is a fact about their paper.
   */
  paperStops: "Paginile și piesele de pe ele",
  /**
   * Read once, when the paper takes keyboard focus.
   *
   * Three keys, in the order they are needed. Everything else on the paper —
   * mai sus, mai jos, schimbă textul, scoate — is a button one Tab away, so it
   * teaches itself and does not belong in a sentence a teacher hears every
   * time they arrive.
   */
  paperKeys:
    "Săgețile te mută de la o piesă la alta. Enter alege piesa. Escape renunță la alegere.",
  editText: "Schimbă textul",
  editTextDone: "Gata",
  /** Shown on the page only while editing, never in the printed paper. */
  emptyTextHint: "Scrie aici",
  emptyImageHint: "Pune o imagine",

  /**
   * The four kinds the next slice fills in. The placeholder says what it will
   * be, not that something is missing — a teacher who put it on the page did so
   * on purpose and the paper should show them their intention.
   */
  pieceSoon: (name: string) => `${name} — se poate scrie în pasul următor`,

  /* ---- Exercises ---- */
  /**
   * The exercise strings, and the one rule they follow that the rest do not.
   *
   * The words that belong to one KIND of exercise are not here: its name, its
   * description, the words a teacher searches for, and the labels of its own
   * fields all live in that type's directory, next to the schema they describe.
   * A type ships as one directory or the abstraction has failed, and a name in
   * this file would make adding a type edit a file two packages away.
   *
   * The ban list still applies to every one of them — each type keeps its
   * strings in a single `COPY` object at the top of its module for exactly that
   * reason. What is here is the chrome around all of them, which belongs to the
   * feature rather than to any one question.
   */
  exercisesTitle: "Exerciții",
  /** Said on the page for an exercise whose parts have not been written yet. */
  exerciseUnfinished: "Completează exercițiul din panoul din dreapta",
  /** Said on the page while the teacher is still writing the cerință. */
  exercisePromptHint: "Scrie ce le ceri elevilor",
  exercisePoints: (points: number, unit: string) => `${points} ${unit}`,
  /**
   * A paper can outlive a kind of exercise. Says what happened and what to do,
   * without naming the type id — that is a code word the teacher never chose.
   */
  exerciseGone:
    "Acest exercițiu nu mai poate fi tipărit. Alege altul din listă.",

  fieldExercisePrompt: "Cerința",
  fieldExercisePromptHint: "Ce le ceri elevilor să facă.",
  fieldExercisePoints: "Cât valorează",
  fieldExerciseLayout: "Cum este așezat",

  /**
   * The two halves of writing a question, named for what they are.
   *
   * "Baremul" is the word Romanian teachers already use for a marking scheme,
   * so the panel does not have to teach it.
   */
  groupExerciseQuestion: "Întrebarea",
  groupExerciseAnswer: "Baremul",
  /** Shown in a row-by-row picker for a row nothing has been chosen for yet. */
  answerNotChosen: "—",

  /* ---- Inspector fields ---- */
  fieldHeadingLevel: "Cât de mare",
  headingLevel: {
    h1: "Foarte mare",
    h2: "Mare",
    h3: "Mediu",
    h4: "Mic",
  },
  fieldAlign: "Așezarea textului",
  align: {
    left: "La stânga",
    center: "La mijloc",
    right: "La dreapta",
    justify: "Aliniat pe ambele margini",
  },
  fieldText: "Textul",
  fieldItems: "Rândurile listei",
  fieldItemsHint: "Câte un rând pe linie.",
  fieldListStyle: "Cum arată lista",
  listStyle: {
    bullet: "Cu buline",
    numbered: "Numerotată",
    lettered: "Cu litere",
    none: "Fără semne",
  },
  fieldImageSrc: "Adresa imaginii",
  fieldImageAlt: "Ce se vede în imagine",
  fieldImageAltHint: "Pentru elevii care ascultă pagina, și pentru tipar.",
  fieldDividerStyle: "Felul liniei",
  dividerStyle: {
    solid: "Continuă",
    dashed: "Întreruptă",
    dotted: "Punctată",
  },
  fieldSpacerHeight: "Înălțimea spațiului",
  fieldRowLayout: "Coloanele rândului",

  /* ---- How the whole paper looks ---- */
  themeTitle: "Înfățișarea lucrării",
  themeLead:
    "Aici schimbi cum arată toată lucrarea. Alege o piesă de pe pagină ca să schimbi doar piesa aceea.",

  groupColors: "Culorile",
  groupFrames: "Chenare și colțuri",
  groupMoreSizes: "Toate mărimile",
  groupMoreColors: "Mai multe culori",

  /* ---- Colours ---- */
  colorName: {
    text: "Cerneala textului",
    heading: "Cerneala titlurilor",
    background: "Hârtia",
    surface: "Fundalul casetelor",
    accent: "Culoarea de accent",
    rule: "Liniile pe care scrie elevul",
  } satisfies Partial<Record<ColorToken, string>>,

  colorCustom: "Altă culoare",
  colorCustomHint: "Scrie culoarea ca #rrggbb, de exemplu #2563eb.",
  colorCustomPlaceholder: "#2563eb",
  colorApply: "Folosește culoarea",
  /**
   * What the teacher is told when the guard turns a colour down.
   *
   * It says what happened to their work first — nothing was lost — and the rule
   * second. A message that leads with the rule reads as a telling-off for a
   * choice the product never told them about.
   */
  colorRefusedBanned:
    "Mov, indigo și violet nu se folosesc în această lucrare. Am păstrat culoarea de dinainte.",
  colorRefusedShape:
    "Scrie culoarea cu diez și șase semne, de exemplu #2563eb. Am păstrat culoarea de dinainte.",
  colorSwatch: (name: string) => `Culoarea ${name}`,

  /** The handful of theme colours a line or a rule is allowed to borrow. */
  tokenName: {
    border: "Chenar deschis",
    borderStrong: "Chenar închis",
    rule: "Linii de scris",
    text: "Cerneala textului",
    textMuted: "Cerneală palidă",
    accent: "Accent",
  } satisfies Partial<Record<ColorToken, string>>,

  swatchName: {
    ink: "cerneală neagră",
    inkSoft: "cerneală gri",
    slate: "gri-albăstrui",
    silver: "gri deschis",
    mist: "gri foarte deschis",
    blue: "albastru",
    blueDeep: "albastru închis",
    green: "verde",
    greenDeep: "verde închis",
    amber: "chihlimbar",
    gold: "auriu",
    red: "roșu",
    redDeep: "roșu închis",
    paper: "alb",
    paperWarm: "alb cald",
    blueTint: "albastru foarte deschis",
    greenTint: "verde foarte deschis",
    amberTint: "galben foarte deschis",
    redTint: "roz foarte deschis",
  },

  /* ---- Typography ---- */
  fieldFont: "Litera",
  /**
   * Three, not a font menu.
   *
   * A teacher choosing between forty families on a paper a child reads is being
   * given a decision nobody asked them to make. These are the three that behave
   * differently on A4 — and all three carry ș and ț with the comma below, which
   * is the only requirement the product genuinely has.
   */
  fontName: {
    sans: "Fără serife",
    serif: "Cu serife",
    mono: "Cu spațiu egal",
  },
  fieldBodySize: "Mărimea textului",
  fieldLeading: "Distanța dintre rânduri",
  slotName: {
    h1: "Titlu foarte mare",
    h2: "Titlu mare",
    h3: "Titlu mediu",
    h4: "Titlu mic",
    body: "Text obișnuit",
    small: "Text mărunt",
  } satisfies Record<TypographySlot, string>,
  fieldWeight: "Grosimea",
  weightName: {
    regular: "Normală",
    medium: "Medie",
    bold: "Îngroșată",
  },

  /* ---- Spacing, across the whole paper ---- */
  fieldBlockGap: "Între piese",
  fieldSectionGap: "Între rânduri",
  fieldColumnGap: "Între coloane",
  fieldListIndent: "Cât intră listele",
  fieldParagraphSpacing: "Sub paragrafe",

  /* ---- Frames ---- */
  fieldHairline: "Linie subțire",
  fieldRegularLine: "Linie obișnuită",
  fieldThickLine: "Linie groasă",
  fieldFrameColor: "Culoarea chenarelor",
  fieldRadiusSmall: "Colț mic",
  fieldRadiusMedium: "Colț mediu",
  fieldRadiusLarge: "Colț mare",

  /* ---- Exercise defaults ---- */
  fieldNumbering: "Cum se numerotează",
  numbering: {
    arabic: "1, 2, 3",
    roman: "I, II, III",
    letters: "a, b, c",
    none: "Fără numere",
  } satisfies Record<ExerciseNumbering, string>,
  fieldShowPoints: "Arată punctele",
  fieldPointsLabel: "Cum scrie lângă punctaj",
  fieldSpacingAbove: "Deasupra exercițiului",
  fieldSpacingBelow: "Sub exercițiu",
  fieldRuleColor: "Culoarea liniilor de scris",
  fieldRuleWidth: "Grosimea liniilor de scris",
  fieldLineGap: "Distanța dintre liniile de scris",

  /* ---- What is behind one sheet ---- */
  groupPageBackground: "Fundalul paginii",
  fieldBackgroundKind: "Ce se vede în spate",
  backgroundKind: {
    theme: "Ca restul lucrării",
    color: "O culoare",
    gradient: "O trecere de culori",
    image: "O imagine",
  },
  fieldBackgroundColor: "Culoarea paginii",
  fieldBackgroundImage: "Adresa imaginii",
  fieldBackgroundImageHint:
    "Imaginea acoperă toată pagina. Lasă-o palidă ca să se citească textul peste ea.",
  fieldBackgroundOpacity: "Cât de tare se vede",
  fieldFreePlacement: "Pot pune piese oriunde pe pagină",
  fieldFreePlacementHint:
    "Bun pentru copertă. Pe paginile cu text, piesele așezate liber nu se dau la o parte când crește ce e deasupra lor.",

  /**
   * A trecere de culori, named the way a teacher would describe one.
   *
   * "Degrade" is the loanword a designer uses and a fair number of teachers
   * would read it as a mark going down. Two colours and where they go is the
   * whole of the idea, so the words say exactly that and no more.
   */
  fieldGradientShape: "Cum se face trecerea",
  gradientShape: {
    linear: "Dintr-o parte în alta",
    radial: "Din mijloc în afară",
  },
  fieldGradientDirection: "Încotro merge",
  gradientDirection: {
    down: "De sus în jos",
    up: "De jos în sus",
    right: "De la stânga la dreapta",
    left: "De la dreapta la stânga",
  },
  fieldGradientFrom: "Culoarea de la început",
  fieldGradientTo: "Culoarea de la sfârșit",

  /** How an image meets a sheet it is not the same shape as. */
  fieldImageFit: "Cum umple pagina",
  imageFit: {
    cover: "Acoperă toată pagina",
    contain: "Încape întreagă",
    tile: "Se repetă ca un mozaic",
  },
  fieldImagePosition: "Unde stă imaginea",
  imagePosition: {
    "top-left": "Sus, la stânga",
    top: "Sus, la mijloc",
    "top-right": "Sus, la dreapta",
    left: "La mijloc, la stânga",
    center: "La mijloc",
    right: "La mijloc, la dreapta",
    "bottom-left": "Jos, la stânga",
    bottom: "Jos, la mijloc",
    "bottom-right": "Jos, la dreapta",
  },

  /* ---- What is selected ---- */
  selectedPiece: (name: string) => `Piesă: ${name}`,
  selectedRow: "Rând",
  selectedPage: "Pagină",

  /**
   * ---- The three seams, each named for what it moves ----
   *
   * `@ludicon/ui` gives every seam the same default name, which is right for a
   * component that does not know what it sits between and wrong the moment a
   * screen reads three of them: "Redimensionează panoul" three times in one Tab
   * pass names nothing. Each is named here for the region it grows.
   */
  resizePages: "Cât loc ocupă lista de pagini",
  resizeSidePanel: "Cât loc ocupă coloana din dreapta",
  resizeSettings: "Cât loc ocupă setările piesei",

  /* ---- Dragging ---- */
  dragPiece: (name: string) => `Mută piesa: ${name}`,
  dragRow: "Mută rândul",
  /**
   * The two the library adds rather than moves.
   *
   * "Mută" would be a lie on a chip carrying something that is not on the paper
   * yet, and the difference matters at exactly the moment the teacher is
   * deciding whether to let go: nothing is being taken from anywhere.
   */
  dragNewPiece: (name: string) => `Piesă nouă: ${name}`,
  dragNewRow: (name: string) => `Rând nou: ${name}`,
  /**
   * Read out by dnd-kit's own live region while a drag is running. Short,
   * because a screen-reader user hears it on every pointer move.
   */
  dragStarted: (name: string) => `Ai ridicat ${name}.`,
  dragOverSeam: "Se așază aici.",
  dragEnded: (name: string) => `Ai așezat ${name}.`,
  dragCancelled: (name: string) => `Ai renunțat să muți ${name}.`,
  /** Sits under the up/down buttons' promise, not in place of it. */
  dragKeyboardNote:
    "Poți muta piesele și cu butoanele „Mai sus” și „Mai jos”, fără mouse. Apasă pe ceva din listă ca să îl adaugi, fără să îl tragi.",
} as const;
