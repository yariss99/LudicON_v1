function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bună dimineața";
  if (hour < 18) return "Bună ziua";
  return "Bună seara";
}

function DashboardWelcome() {
  return (
    <header className="mb-8 max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {greeting()}.
      </h1>
      <p className="mt-3 text-base text-slate-500 sm:text-lg">
        Astăzi proiectăm împreună experiențe de învățare cu sens.
      </p>
    </header>
  );
}

export default DashboardWelcome;
