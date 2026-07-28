import type { ApprovalState, ValidationReport } from "../types";



type ApprovalBarProps = {

  approvalState: ApprovalState;

  validation: ValidationReport | null;

  generationUnlocked: boolean;

  approving?: boolean;

  onApprove: () => void;

  onOpenGeneration?: () => void;

};



function ApprovalBar({

  approvalState,

  validation,

  generationUnlocked,

  approving,

  onApprove,

  onOpenGeneration,

}: ApprovalBarProps) {

  const frozen = approvalState === "frozen";

  const ready = Boolean(validation?.readyForApproval) && !frozen;



  return (

    <div className="sticky bottom-0 z-20 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">

      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-sm font-semibold text-slate-900">

            {frozen

              ? "Proiectul lecției este confirmat"

              : ready

                ? "Gata de confirmare"

                : "Mai verificăm împreună un aspect al lecției"}

          </p>

          <p className="mt-0.5 text-xs text-slate-500">

            {frozen

              ? "Poți trece la pregătirea materialelor pentru această versiune."

              : ready

                ? "Verificarea e completă — confirmă ca să pregătim materialele."

                : (validation?.blockingReasons[0] ??

                  "Mai avem nevoie de câteva detalii înainte de confirmare.")}

          </p>

        </div>



        <div className="flex flex-wrap gap-2">

          {generationUnlocked && onOpenGeneration ? (

            <button

              type="button"

              onClick={onOpenGeneration}

              className="rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"

            >

              Creează materialele

            </button>

          ) : null}

          <button

            type="button"

            disabled={!ready || approving || frozen}

            onClick={onApprove}

            className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"

          >

            {approving ? "Confirmăm…" : "Confirmă proiectul lecției"}

          </button>

        </div>

      </div>

    </div>

  );

}



export default ApprovalBar;


