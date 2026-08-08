import { useMemo } from "react";
import { motion } from "framer-motion";

export function GreetingHeader() {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-[#F7F8FA] to-slate-100/80 px-6 py-8 sm:px-8"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-slate-900/[0.04]"
        aria-hidden
      />
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Home workspace
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {greeting}
      </h1>
      <p className="mt-2 max-w-xl text-base text-slate-500 sm:text-lg">
        What would you like to create today?
      </p>
    </motion.header>
  );
}
