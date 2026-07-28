import { useState } from "react";

export function useDeskUiState() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return {
    mobileNavOpen,
    setMobileNavOpen,
  };
}
