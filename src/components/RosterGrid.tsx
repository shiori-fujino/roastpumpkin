// src/components/RosterGrid.tsx

import React, { useCallback, useMemo } from "react";
import { Filter, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

import RosterCard from "./RosterCard";
import { useRosterData } from "../hooks/useRosterData";
import { useRosterParams } from "../hooks/useRosterParams";

import {
  buildProvidersIndex,
  buildRosterModel,
  serviceKey,
  type RosterModel,
} from "../lib/roster/providerMap";

import { addDays, getShiftStatusOnDay, startOfDay } from "../lib/roster/time";

function shuffle<T>(array: T[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const RosterGrid: React.FC = () => {
  const { t, i18n } = useTranslation();
  const natLabel = useCallback(
    (raw: string) => {
      const key = `nationalities.${raw}`;
      return i18n.exists(key) ? t(key) : raw;
    },
    [i18n, t]
  );

  const { providers, apiToday, apiTomorrow, apiError, isLoading } = useRosterData();
  const { tab, time, nat, svc, showFilters, commitParams } = useRosterParams();

  const providersIndex = useMemo(() => buildProvidersIndex(providers), [providers]);

  const currentRoster: RosterModel[] = useMemo(() => {
    const roster = tab === "today" ? apiToday : apiTomorrow;
    if (!roster || !providers) return [];

    return roster
      .map((entry) => buildRosterModel(entry, providersIndex))
      .filter(Boolean) as RosterModel[];
  }, [tab, apiToday, apiTomorrow, providers, providersIndex]);

  // ✅ shop "business day" starts at 10:00 and runs until 03:00 next day
  const SHOP_DAY_START_HOUR = 10;

  const rosterDay = useMemo(() => {
    const now = new Date();
    const calendarToday = startOfDay(now);

    // 00:00–09:59 belongs to yesterday's shop day
    const shopToday = now.getHours() < SHOP_DAY_START_HOUR ? addDays(calendarToday, -1) : calendarToday;

    // today tab => shopToday, tomorrow tab => shopToday + 1
    return tab === "tomorrow" ? addDays(shopToday, 1) : shopToday;
  }, [tab]);

  const shuffleKey = useMemo(() => {
    return ["n5m", tab, time, nat.join("|"), svc.join("|")].join("::");
  }, [tab, time, nat, svc]);

  const randomizedRoster = useMemo(() => {
    if (!currentRoster.length) return [];

    const cacheKey = `roster-shuffle:${shuffleKey}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const ids = JSON.parse(cached) as number[];
        const map = new Map(currentRoster.map((m) => [m.id, m]));
        const ordered = ids.map((id) => map.get(id)).filter(Boolean) as RosterModel[];

        if (ordered.length !== currentRoster.length) {
          const seen = new Set(ordered.map((m) => m.id));
          const missing = currentRoster.filter((m) => !seen.has(m.id));
          return [...ordered, ...missing];
        }

        return ordered;
      } catch {
        // fall through
      }
    }

    const newOnes = currentRoster.filter((m) => m.isNew);
    const rest = currentRoster.filter((m) => !m.isNew);
    const shuffled = [...newOnes, ...shuffle(rest)];

    sessionStorage.setItem(cacheKey, JSON.stringify(shuffled.map((m) => m.id)));
    return shuffled;
  }, [currentRoster, shuffleKey]);

  const timeFilteredRoster = useMemo(() => {
    return randomizedRoster.filter((m) => {
      if (!m.startTime || !m.endTime) return true;

      // ✅ today = show full roster for the day (no time filtering)
      if (time === "today") return true;

      // ✅ now = only currently on shift
      return getShiftStatusOnDay(m.startTime, m.endTime, rosterDay) === "now";
    });
  }, [randomizedRoster, time, rosterDay]);

  const nationalities = useMemo(
    () => [...new Set(timeFilteredRoster.map((m) => m.nationality))].filter(Boolean).sort(),
    [timeFilteredRoster]
  );

  const serviceFilterLabels = useMemo(() => {
    return [
      ...new Set(
        timeFilteredRoster
          .flatMap((m) => (m.services || []).filter((s) => s.available).map((s) => s.name))
          .filter(Boolean)
      ),
    ].sort();
  }, [timeFilteredRoster]);

  const modelHasAllSelectedServices = useCallback(
    (model: RosterModel) => {
      if (svc.length === 0) return true;
      const available = (model.services || []).filter((s) => s.available).map((s) => s.name);
      return svc.every((s) => available.includes(s));
    },
    [svc]
  );

  const filteredRoster = useMemo(() => {
    return timeFilteredRoster.filter((model) => {
      if (nat.length > 0 && !nat.includes(model.nationality)) return false;
      if (!modelHasAllSelectedServices(model)) return false;
      return true;
    });
  }, [timeFilteredRoster, nat, modelHasAllSelectedServices]);

  const toggleNationality = (n: string) => {
    const next = nat.includes(n) ? nat.filter((x) => x !== n) : [...nat, n];
    commitParams({ nat: next });
  };

  const toggleService = (s: string) => {
    const next = svc.includes(s) ? svc.filter((x) => x !== s) : [...svc, s];
    commitParams({ svc: next });
  };

  const clearFilters = () => {
    commitParams({ nat: [], svc: [] });
  };

  const activeFilterCount = nat.length + svc.length;

  const showTomorrowReleaseMsg =
    tab === "tomorrow" && apiTomorrow != null && Array.isArray(apiTomorrow) && apiTomorrow.length === 0;

  const emptyText = t("roster.emptyTitleTime", {
    defaultValue:
      "No girls match your current time or filters. Try switching the time filter or clearing filters.",
  });

  // ---------- shared styles ----------
  const selectedBtn = "bg-red-900 border-red-900 text-white";
  const unselectedBtn = "bg-transparent border-red-900 text-zinc-300 hover:text-white hover:bg-white/5";
  const subtleInnerHighlight = "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";

  return (
    <section className="min-h-screen bg-black relative overflow-hidden py-12">
      <div className="relative z-10 w-full">
        {apiError && (
          <div className="mx-6 mb-4 p-3 border border-red-900 bg-red-900/10 text-zinc-200 text-sm">
            API error: {apiError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => commitParams({ tab: "today" })}
            className={`px-6 py-3 font-bold text-2xl border transition-colors ${
              tab === "today" ? `${selectedBtn} ${subtleInnerHighlight}` : unselectedBtn
            }`}
          >
            {t("roster.today")}
          </button>

          <button
            onClick={() => commitParams({ tab: "tomorrow" })}
            className={`px-6 py-3 font-bold text-2xl border transition-colors ${
              tab === "tomorrow" ? `${selectedBtn} ${subtleInnerHighlight}` : unselectedBtn
            }`}
          >
            {t("roster.tomorrow")}
          </button>
        </div>

        {showTomorrowReleaseMsg && (
          <div className="mx-6 mb-6 p-4 border border-red-900 bg-red-900/10 text-zinc-100 text-center">
            {t("roster.tomorrowReleaseTitle", { time: "7:00 PM" })}
            <div className="text-zinc-300 mt-1">{t("roster.tomorrowReleaseSubtitle")}</div>
          </div>
        )}

        {isLoading && (
          <div className="mx-6 mb-8 p-6 border border-red-900 bg-red-900/10 text-center">
            <div className="text-zinc-100 text-xl font-bold">{t("roster.loadingTitle")}</div>
            <div className="text-zinc-400 mt-2">{t("roster.loadingSubtitle")}</div>
          </div>
        )}

        {!showTomorrowReleaseMsg && (
          <div className="flex items-center gap-3 mx-6 mb-6">
            {/* Filters toggle */}
            <button
              onClick={() => commitParams({ filters: !showFilters })}
              className={`flex items-center gap-2 px-4 py-2 text-xl border transition-colors ${
                showFilters ? `${selectedBtn} ${subtleInnerHighlight}` : unselectedBtn
              }`}
            >
              <Filter className="w-4 h-4" />
              {t("filter.filters")}
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full border border-white/20 bg-white/10 text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Time toggle: now <-> today */}
            <button
              onClick={() => {
                const next = time === "now" ? "today" : "now";
                commitParams({ time: next });
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xl border transition-colors ${selectedBtn} ${subtleInnerHighlight}`}
              title="Time filter"
            >
              <Clock className="w-4 h-4" />
              {time === "now" ? t("filter.onNow") : t("filter.seeAll")}
            </button>
          </div>
        )}

        {showFilters && (
          <div className="mb-6 p-4 bg-black/40 border border-red-900 mx-6">
            <div className="flex justify-end items-center mb-4">
              <button onClick={clearFilters} className="text-lg text-zinc-400 hover:text-white">
                {t("filter.clear")}
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-white font-bold mb-2">{t("filter.nationality")}</h4>
              <div className="flex flex-wrap gap-2">
                {nationalities.map((n) => (
                  <button
                    key={n}
                    onClick={() => toggleNationality(n)}
                    className={`px-3 py-1 border transition-colors ${
                      nat.includes(n) ? `${selectedBtn} ${subtleInnerHighlight}` : unselectedBtn
                    }`}
                  >
                    {natLabel(n)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-2">{t("profile.availableServices")}</h4>
              <div className="flex flex-wrap gap-2">
                {serviceFilterLabels.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleService(s)}
                    className={`px-3 py-1 border transition-colors ${
                      svc.includes(s) ? `${selectedBtn} ${subtleInnerHighlight}` : unselectedBtn
                    }`}
                  >
                    {t(`services.${serviceKey(s)}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isLoading && !showTomorrowReleaseMsg && filteredRoster.length === 0 && (
          <div className="mx-6 mb-10 p-8 border border-red-900/20 bg-black/40 text-center">
            <p className="text-zinc-300 text-xl">{emptyText}</p>
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-2 border border-red-900 text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
            >
              {t("filter.clear")}
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="w-full px-0">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-0">
            {filteredRoster.map((model) => (
              <RosterCard key={model.id} model={model} natLabel={natLabel} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RosterGrid;
