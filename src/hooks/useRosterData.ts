// src/hooks/useRosterData.ts

import { useEffect, useState } from "react";
import type { ApiProvider, ApiRosterEntry } from "../lib/roster/providerMap";

// ✅ IMPORTANT: trailing slash to avoid redirect -> CORS
const PROVIDERS_URL = "/api/providers/";
const ROSTER_TODAY_URL = "/api/roster/today/";
const ROSTER_TOMORROW_URL = "/api/roster/tomorrow/";

export function useRosterData() {
  const [providers, setProviders] = useState<ApiProvider[] | null>(null);
  const [apiToday, setApiToday] = useState<ApiRosterEntry[] | null>(null);
  const [apiTomorrow, setApiTomorrow] = useState<ApiRosterEntry[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setApiError(null);

        const [provRes, todayRes, tomorrowRes] = await Promise.all([
          fetch(PROVIDERS_URL),
          fetch(ROSTER_TODAY_URL),
          fetch(ROSTER_TOMORROW_URL),
        ]);

        if (!provRes.ok) throw new Error(`providers fetch failed: ${provRes.status}`);
        if (!todayRes.ok) throw new Error(`today fetch failed: ${todayRes.status}`);
        if (!tomorrowRes.ok) throw new Error(`tomorrow fetch failed: ${tomorrowRes.status}`);

        const provJson = (await provRes.json()) as ApiProvider[];
        const todayJson = (await todayRes.json()) as ApiRosterEntry[];
        const tomorrowJson = (await tomorrowRes.json()) as ApiRosterEntry[];

        if (!cancelled) {
          setProviders(Array.isArray(provJson) ? provJson : []);
          setApiToday(Array.isArray(todayJson) ? todayJson : []);
          setApiTomorrow(Array.isArray(tomorrowJson) ? tomorrowJson : []);
        }
      } catch (e: any) {
        if (!cancelled) {
          setApiError(e?.message || "API error");
          setProviders(null);
          setApiToday(null);
          setApiTomorrow(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const isLoading = providers === null || apiToday === null || apiTomorrow === null;

  return {
    providers,
    apiToday,
    apiTomorrow,
    apiError,
    isLoading,
  };
}
