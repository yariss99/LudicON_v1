type ProgressOverlayProps = {
  open: boolean;
};

function ProgressOverlay({ open }: ProgressOverlayProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-6 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-md rounded-3xl bg-white px-6 py-8 text-center shadow-xl">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
        <p className="text-lg font-semibold text-slate-900">
          Pregătim materialele didactice…
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Pornim de la proiectul lecției pe care l-ai confirmat.
        </p>
      </div>
    </div>
  );
}

export default ProgressOverlay;
