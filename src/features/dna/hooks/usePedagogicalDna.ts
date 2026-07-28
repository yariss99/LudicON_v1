import { useMemo } from "react";
import { pedagogicalDnaService } from "../../../services/pedagogicalDnaService";

export function usePedagogicalDna() {
  const profile = useMemo(() => pedagogicalDnaService.getProfile(), []);

  return {
    profile,
    exportMarkdown: () => pedagogicalDnaService.exportMarkdown(profile),
    exportJson: () => pedagogicalDnaService.exportJson(profile),
  };
}
