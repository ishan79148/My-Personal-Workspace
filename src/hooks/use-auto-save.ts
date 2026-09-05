// hooks/use-auto-save.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "./use-debounce";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  delayMs = 500
) {
  const debouncedValue = useDebounce(value, delayMs);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    let cancelled = false;

    async function save() {
      setStatus("saving");
      try {
        await onSave(debouncedValue);
        if (!cancelled) setStatus("saved");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    save();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return status;
}
