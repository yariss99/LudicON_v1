/**
 * Every teacher-facing string the builder can show.
 *
 * Kept in one object so the UX-001 ban list can be checked by reading a single
 * file: no "Blueprint", "Canvas", "Engine", "Pipeline", "Validation", "AI",
 * "Generate", "Error", "Invalid", "Required", "Missing", "No data". Where the
 * design book documents an exact sentence, it is reproduced verbatim.
 */
export const COPY = {
  /* ---- Save state ---- */
  saving: "Se salvează…",
  saved: "✓ Salvat automat",
  savedShort: "Salvat",
  unsaved: "Modificări nesalvate",
  saveNow: "Salvează acum",
  saveFailed: "Nu am putut salva acum. Proiectul e păstrat — încearcă din nou.",
  lastSaved: "Ultima salvare",

  /* ---- Structure rail ---- */
  structure: "STRUCTURĂ",
  sectionComplete: "Completat",
  sectionIncomplete: "Neînceput",
  collapseRail: "Restrânge structura",
  expandRail: "Extinde structura",

  /* ---- Guidance panel (PRIMA) ---- */
  guidance: "Ghidaj",
  guidanceIntro: "Te ghidează — nu te evaluează.",
  scoreExplanation:
    "Scorul te ajută să vezi echilibrul lecției — nu este o notă.",
  apply: "Aplică",
  notNow: "Nu acum",
  suggestionApplied: "Am actualizat secțiunea.",
  noSuggestions: "Deocamdată nu am ce să adaug. Continuă cum ai început.",
  attention: "Merită o privire",
  balance: "Echilibru",

  /* ---- History panel ---- */
  history: "Istoric",
  historyIntro: "Fiecare salvare rămâne aici. Poți reveni oricând.",
  restore: "Revino la această versiune",
  restored: "Am revenit la versiunea aleasă.",
  noHistory: "Istoricul începe la prima salvare.",
  versionLabel: "Versiunea",

  /* ---- Document actions ---- */
  check: "Verifică lecția",
  checkClear: "Totul arată bine.",
  checkFound: "Hai să verificăm împreună un aspect al lecției.",
  publish: "Publică",
  published: "Material publicat.",
  publishBlocked:
    "Mai avem nevoie de câteva informații pentru a putea publica.",
  archive: "Arhivează",
  archived: "Material arhivat.",
  duplicate: "Duplică",
  duplicated: "Material creat.",
  copySuffix: "(copie)",
  more: "Mai multe acțiuni",
  back: "Înapoi la proiect",
  titleLabel: "Titlul materialului",

  /* ---- Version notes (internal, but shown in history) ---- */
  versionNoteDuplicate: "Copiat dintr-un material existent",
  versionNoteRestore: "Revenire la versiunea",

  /* ---- States ---- */
  loading: "Se încarcă…",
  loadingLabel: "Se pregătește materialul",
  missingTitle: "Materialul nu mai este aici",
  missingExplanation:
    "Poate a fost mutat sau arhivat. Deschide proiectul ca să vezi ce materiale sunt disponibile.",
  failedTitle: "Nu am putut deschide materialul",
  failedExplanation:
    "Ce ai lucrat este în siguranță. Încearcă din nou peste câteva momente.",
  unknownKindTitle: "Acest tip de material nu se editează aici",
  unknownKindExplanation:
    "Deschide proiectul ca să alegi un material pe care îl poți lucra.",

  /* ---- Section-level guidance ---- */
  sectionIncompleteHint: "Poți completa această secțiune acum sau mai târziu.",
  addInformation: "Adaugă informații",

  /* ---- List editing ---- */
  addItem: "Adaugă",
  removeItem: "Elimină",
  moveUp: "Mută mai sus",
  moveDown: "Mută mai jos",
  emptyList: "Nimic adăugat încă.",
} as const;
