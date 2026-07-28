/**
 * UX-001 / UX-002 — Teacher Language First
 *
 * Glossary for all teacher-facing copy.
 * Architecture terms (Engine, Pipeline, Blueprint, Canvas…) stay in code only.
 */

export const teacherLanguage = {
  nav: {
    desk: "Biroul meu",
    createLesson: "Creează o lecție",
    library: "Biblioteca",
    settings: "Setări",
    workspaceSubtitle: "Spațiul tău de predare",
    mainNav: "Navigare principală",
    myLessons: "Lecțiile mele",
  },

  actions: {
    continue: "Continuă",
    startLesson: "Începe lecția",
    createLesson: "Creează o lecție",
    continueLesson: "Continuă lecția",
    verify: "Verifică",
    modify: "Modifică",
    save: "Salvează",
    createMaterials: "Creează materialele",
    prepareAgain: "Pregătește din nou",
    download: "Descarcă",
    share: "Distribuie",
    finish: "Finalizare",
    reviewLesson: "Verifică și modifică lecția",
    openMaterials: "Deschide materialele",
    approveLesson: "Confirmă proiectul lecției",
    approving: "Confirmăm…",
    retry: "Încearcă din nou",
    close: "Închide",
    browseLibrary: "Deschide biblioteca",
    cancel: "Anulează",
  },

  screens: {
    deskQuestion: "Cu ce dorești să lucrezi astăzi?",
    conversation: "Spune-mi despre lecția ta.",
    lessonPlan: "Iată proiectul lecției.",
    lessonProject: "Proiectul lecției",
    preparingMaterials: "Pregătirea materialelor",
    lessonMaterials: "Materialele lecției",
    resources: "Materialele sunt pregătite.",
    export: "Lecția este gata.",
    colleague: "Colegul tău de design",
  },

  labels: {
    myLesson: "Lecția mea",
    lessonProject: "Proiectul lecției",
    lessonPlan: "Planul lecției",
    lessonMaterials: "Materialele lecției",
    preparingMaterials: "Se pregătesc materialele",
    designingTogether: "Proiectăm împreună",
    whatUnderstood: "Ce am înțeles",
    whyItMatters: "De ce contează",
    nextQuestion: "Următoarea întrebare",
    planUpdated: "Planul lecției",
  },

  loading: {
    analyzing: "Analizăm informațiile…",
    preparingProject: "Pregătim proiectul lecției…",
    preparingMaterials: "Pregătim materialele didactice…",
    preparingActivities: "Pregătim activitățile de învățare…",
    listening: "Ascultăm ce contează pentru elevii tăi…",
    reflectingPlan: "Actualizăm planul lecției…",
    findingNext: "Pregătim următorul pas…",
    loadingLesson: "Se încarcă lecția…",
  },

  empty: {
    noLessonYet:
      "Nu ai început încă o lecție. Spune-mi despre lecția pe care dorești să o pregătești, iar PRIMA te va ghida pas cu pas.",
    materialsNotReady:
      "Confirmă mai întâi proiectul lecției. Materialele pornesc întotdeauna de acolo.",
  },

  reassurance: {
    needDetails: "Mai avem nevoie de câteva detalii.",
    needInfo: "Mai avem nevoie de câteva informații pentru a continua.",
    checkTogether: "Hai să verificăm împreună un aspect al lecției.",
    neededForNext: "Necesar pentru următorul pas",
    interrupted:
      "Ceva a întrerupt conversația. Ce ai scris este în siguranță — încearcă din nou.",
  },

  progress: {
    definingObjectives: "Definim obiectivele lecției.",
    materialsReady: "Materialele sunt pregătite.",
    lessonReady: "Proiectul lecției este gata de confirmare.",
  },

  status: {
    notStarted: "Neînceput",
    inProgress: "În lucru",
    completed: "Completat",
    needsReview: "De revăzut",
    unknown: "Încă necompletat",
    detected: "Identificat",
    excellent: "Excelent",
    good: "Bine",
    needsOneDetail: "Mai lipsește un detaliu",
    needsClarification: "Mai clarificăm un aspect",
    incomplete: "Incomplet",
  },

  inferred: "✓ Dedus",
  newBadge: "Nou",
} as const;

export type TeacherLanguage = typeof teacherLanguage;
