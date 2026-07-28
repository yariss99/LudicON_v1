import { PrimaButton } from "../../../design-system";

type DeskErrorStateProps = {
  onRetry: () => void;
};

function DeskErrorState({ onRetry }: DeskErrorStateProps) {
  return (
    <div className="atelier-card mx-auto max-w-lg text-center">
      <div role="alert">
        <h2 className="atelier-section-title">
          Nu am putut deschide atelierul acum
        </h2>
        <p className="atelier-body mx-auto mt-3 max-w-sm">
          Ceva a întrerupt încărcarea spațiului tău. Munca ta este în siguranță —
          încearcă din nou într-un moment.
        </p>
        <PrimaButton
          variant="primary"
          className="mt-8 min-h-11"
          onClick={onRetry}
        >
          Încearcă din nou
        </PrimaButton>
      </div>
    </div>
  );
}

export default DeskErrorState;
