export const primaRo = {
  brand: {
    title: "PRIMA",
  },

  welcome: {
    greeting: "Bine ai venit!",
    introLine1: "Ai pășit în universul PRIMA.",
    introLine2:
      "Locul în care experiența ta didactică și inteligența artificială lucrează împreună pentru a crea experiențe autentice de învățare.",
  },

  message: {
    lines: [
      "Eu sunt PRIMA.",
      "Partenerul tău în proiectarea activităților didactice.",
      "Nu sunt un simplu generator de lecții.",
      "Nu sunt un formular.",
      "Nu trebuie să completezi zeci de câmpuri.",
      "Voi înțelege ceea ce dorești să creezi și te voi ghida pas cu pas.",
      "Îți voi adresa doar întrebările care contează cu adevărat.",
      "De restul mă ocup eu.",
    ],
  },

  together: {
    title: "Ce vom realiza împreună?",
    steps: [
      "Vom proiecta o lecție adaptată clasei tale.",
      "Vom integra metode moderne și instrumente digitale.",
      "Vom crea activități captivante pentru elevi.",
      "Vom genera resurse gata de utilizare.",
      "Vom construi o experiență de învățare memorabilă.",
    ],
  },

  motivation: {
    lines: [
      "Nu este nevoie să ai experiență în utilizarea inteligenței artificiale.",
      "Adu doar experiența ta de profesor.",
      "Eu mă ocup de restul.",
    ],
  },

  actions: {
    primary: "Descoperă PRIMA",
    secondary: "Cum funcționează PRIMA?",
  },
} as const;

export type PrimaLocale = typeof primaRo;
