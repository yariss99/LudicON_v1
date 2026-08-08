/**
 * Teacher-facing copy for the project workspace.
 *
 * The old workspace had twelve tabs whose labels named implementation surfaces
 * ("Sugestii PRIMA", "Versiuni", "Activitate", one tab per asset type). Five
 * tabs remain, each named after something a teacher would say out loud.
 */
export const WORKSPACE_COPY = {
  back: "Toate proiectele",

  tabs: {
    overview: "Privire de ansamblu",
    materials: "Materiale",
    versions: "Istoric",
    activity: "Ce s-a întâmplat",
    settings: "Setări",
  },

  /* ---- Overview ---- */
  overviewHeading: "Unde ai ajuns",
  continueHeading: "Continuă lucrul",
  continueAction: "Continuă",
  progressLabel: "Materiale publicate",
  emptyOverviewTitle: "Proiectul e la început",
  emptyOverviewExplanation:
    "Aici se adună lecția, materialele și reflecțiile care aparțin acestui proiect. Începe cu designul lecției.",

  /* ---- Materials ---- */
  materialsHeading: "Materialele proiectului",
  materialsLead: "Tot ce ai creat pentru această temă, la un loc.",
  addMaterial: "Adaugă un material",
  emptyMaterialsTitle: "Niciun material încă",
  emptyMaterialsExplanation:
    "Alege ce vrei să pregătești mai întâi. Materialele rămân legate de acest proiect și pot fi refolosite oricând.",
  openMaterial: "Deschide",
  materialActions: "Mai multe acțiuni",
  duplicateMaterial: "Fă o copie",
  removeMaterial: "Șterge materialul",
  removeMaterialTitle: "Ștergi acest material?",
  removeMaterialBody:
    "Materialul și istoricul lui dispar de aici și din bibliotecă. Restul proiectului rămâne neatins. Dacă vrei doar să îl dai la o parte, arhivează-l din interiorul materialului.",
  removeMaterialConfirm: "Da, șterge-l",
  removeMaterialCancel: "Nu acum",
  materialRemoved: "Materialul a fost șters.",
  materialCopied: "Copia e gata.",
  removeFailed:
    "Nu am putut șterge acum. Materialul e păstrat — încearcă din nou.",
  copySuffix: "(copie)",
  versionNoteCreated: "Material nou în proiect",
  versionNoteCopied: "Copiat dintr-un material existent",
  createdOn: "Creat",
  updatedOn: "Ultima modificare",

  /* ---- Versions ---- */
  versionsHeading: "Istoricul proiectului",
  versionsLead: "Fiecare salvare rămâne aici. Nimic nu se pierde.",
  emptyVersionsTitle: "Istoricul începe la prima salvare",
  emptyVersionsExplanation:
    "Pe măsură ce lucrezi la materiale, fiecare versiune apare aici și poate fi deschisă din nou.",

  /* ---- Activity ---- */
  activityHeading: "Ce s-a întâmplat în proiect",
  activityLead: "Ordinea în care s-au petrecut lucrurile.",
  emptyActivityTitle: "Nimic de povestit încă",
  emptyActivityExplanation:
    "Când începi să creezi materiale, pașii apar aici în ordine cronologică.",
  eventCreated: "a fost creat",
  eventUpdated: "a fost actualizat",
  eventPublished: "a fost publicat",

  /* ---- Settings ---- */
  settingsHeading: "Setările proiectului",
  settingsLead:
    "Titlul, disciplina și clasa se propagă în toate materialele proiectului.",
  fieldTitle: "Titlul proiectului",
  fieldDescription: "Despre ce este",
  fieldSubject: "Disciplina",
  fieldGrade: "Clasa",
  fieldFavorite: "Ține-l la îndemână",
  fieldFavoriteHint: "Proiectele marcate apar primele pe Biroul meu.",
  save: "Salvează setările",
  saved: "Setări salvate.",
  saveFailed: "Nu am putut salva acum. Proiectul e păstrat — încearcă din nou.",

  /* ---- States ---- */
  loading: "Se pregătește proiectul",
  missingTitle: "Proiectul nu mai este aici",
  missingExplanation:
    "Poate a fost arhivat. Deschide lista de proiecte ca să vezi ce este disponibil.",
  failedTitle: "Nu am putut deschide proiectul",
  failedExplanation:
    "Ce ai lucrat este în siguranță. Încearcă din nou peste câteva momente.",
} as const;

/** Project lifecycle, in the teacher's words. */
export const PROJECT_STATE_LABEL = {
  discovery: "La început",
  design: "În proiectare",
  approved: "Aprobat",
  materials_ready: "Materiale pregătite",
  published: "Publicat",
} as const;
