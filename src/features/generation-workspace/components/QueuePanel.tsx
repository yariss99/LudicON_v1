import { assetRegistry } from "../services/assetRegistry";
import type { QueueItem } from "../types";

type QueuePanelProps = {
  queue: QueueItem[];
};

const STATUS_RO: Record<string, string> = {
  queued: "în așteptare",
  generating: "se pregătesc",
  completed: "gata",
  failed: "reîncercăm împreună",
};

function QueuePanel({ queue }: QueuePanelProps) {
  const active = queue.filter(
    (item) => item.status === "queued" || item.status === "generating",
  );
  const recent = queue.slice(-6).reverse();

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Pregătire în curs
      </p>
      {recent.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">Nimic în pregătire acum.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {recent.map((item) => {
            const def = assetRegistry.get(item.assetTypeId);
            return (
              <li
                key={item.id}
                className="rounded-2xl bg-slate-50 px-3 py-2 text-xs ring-1 ring-slate-100"
              >
                <p className="font-semibold text-slate-800">
                  {def?.title ?? item.assetTypeId}
                </p>
                <p className="mt-0.5 text-slate-500">
                  {STATUS_RO[item.status] ?? item.status} ·{" "}
                  {item.scope.replace(/_/g, " ")}
                  {active.some((a) => a.id === item.id) ? " · în lucru" : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default QueuePanel;
