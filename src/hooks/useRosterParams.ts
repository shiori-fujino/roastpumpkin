// src/hooks/useRosterParams.ts

import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { ShiftStatus } from "../lib/roster/time";

export type RosterTab = "today" | "tomorrow";

function normalizeTime(v: string | null): ShiftStatus {
  // default: today (See All)
  if (v == null) return "today";
  return v === "today" ? "today" : "now";
}

export function useRosterParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- parse URL (single source of truth)
  const time = normalizeTime(searchParams.get("time"));
  const tab = (searchParams.get("tab") as RosterTab) || "today";

  const nat = (searchParams.get("nat") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const svc = (searchParams.get("svc") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const page = Math.max(0, Number(searchParams.get("page") || "0") || 0);
  const showFilters = searchParams.get("filters") === "1";

  const commitParams = useCallback(
    (patch: {
      tab?: RosterTab;
      nat?: string[];
      svc?: string[];
      page?: number;
      filters?: boolean;
      time?: ShiftStatus;
    }) => {
      const next = new URLSearchParams(searchParams);

      if (patch.time) next.set("time", patch.time);
      if (patch.tab) next.set("tab", patch.tab);

      if (patch.nat) {
        if (patch.nat.length) next.set("nat", patch.nat.join(","));
        else next.delete("nat");
      }

      if (patch.svc) {
        if (patch.svc.length) next.set("svc", patch.svc.join(","));
        else next.delete("svc");
      }

      if (typeof patch.page === "number") next.set("page", String(patch.page));

      if (typeof patch.filters === "boolean") {
        if (patch.filters) next.set("filters", "1");
        else next.delete("filters");
      }

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // ✅ ensure defaults exist (time/tab/page) + normalize legacy time values
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;

    const rawTime = next.get("time");
    const normalized = normalizeTime(rawTime);

    if (!rawTime || rawTime !== normalized) {
      next.set("time", normalized);
      changed = true;
    }

    if (!next.get("tab")) {
      next.set("tab", "today");
      changed = true;
    }

    if (!next.get("page")) {
      next.set("page", "0");
      changed = true;
    }

    if (changed) setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return {
    time,
    tab,
    nat,
    svc,
    page,
    showFilters,
    commitParams,
  };
}
