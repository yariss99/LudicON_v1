export const dashboardRo = {
  workspace: {
    ariaLabel: "Spațiu creativ",
    heroTitle: "Bine ai venit în universul LUDI ON",
    mission:
      "Locul în care ideile tale didactice devin experiențe de învățare memorabile.",
    actionTitle: "Ce dorești să creezi astăzi?",
    helperText:
      "Alege tipul activității, iar PRIMA te va ghida pas cu pas până la o resursă completă, gata de utilizare.",
  },

  header: {
    searchPlaceholder: "Caută activități, lecții sau resurse...",
    notifications: "Notificări",
    settings: "Setări",
    role: "Profesor",
  },

  sections: {
    continueWork: "Continuă experiența de învățare",
    viewAll: "Vezi toate",
    primaRecommendations: "Recomandări PRIMA",
    recentResources: "Resurse recente",
    openLibrary: "Deschide biblioteca",
    overview: "Prezentare generală",
  },

  continue: {
    progress: "Progres",
    edited: "Editat",
    continue: "Continuă",
  },

  resources: {
    download: "Descarcă",
  },

  stats: {
    projects: "Experiențe de învățare",
    activities: "Activități",
    resources: "Resurse",
    aiGenerations: "Generări AI",
    trendProjects: "+2 luna aceasta",
    trendActivities: "+5 luna aceasta",
    trendResources: "+8 luna aceasta",
    trendAiGenerations: "+12 luna aceasta",
  },

  time: {
    twoHoursAgo: "acum 2 ore",
    yesterday: "ieri",
    threeDaysAgo: "acum 3 zile",
    today: "astăzi",
    twoDaysAgo: "acum 2 zile",
    lastWeek: "săptămâna trecută",
  },

  resourceTypes: {
    flashcards: "Fișe ilustrate",
    presentation: "Prezentare",
    worksheet: "Fișă de lucru",
    escapeRoom: "Misiune educațională",
  },

  builderTypes: {
    lesson: "Lecție",
    worksheet: "Fișă de lucru",
    game: "Joc didactic",
    assessment: "Evaluare",
    story: "Poveste educațională",
    presentation: "Prezentare",
    mission: "Misiune educațională",
  },

  recommendationTags: {
    engagement: "Implicare",
    differentiation: "Diferențiere",
    resource: "Resursă",
  },
} as const;

export type DashboardLocale = typeof dashboardRo;
