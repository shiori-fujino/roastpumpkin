// src/components/RosterGrid.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ IMPORTANT: trailing slash to avoid redirect -> CORS
const PROVIDERS_URL = "/api/providers/";
const ROSTER_TODAY_URL = "/api/roster/today/";
const ROSTER_TOMORROW_URL = "/api/roster/tomorrow/";

/* ---------------- Responsive batch size ---------------- */

const useResponsiveBatchSize = () => {
  const [batchSize, setBatchSize] = useState(() => (window.innerWidth >= 1024 ? 10 : 6));

  useEffect(() => {
    const handleResize = () => setBatchSize(window.innerWidth >= 1024 ? 10 : 6);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return batchSize;
};

/* ---------------- Types ---------------- */

type ApiRosterEntry = {
  provider_id: number;
  provider_name: string;
  start_time: string;
  end_time: string;
};

type ApiProviderImage = {
  image: string;
  priority?: number;
  profile?: boolean;
  real?: boolean;
};

type ApiProvider = {
  id: number;
  slug: string;
  provider_name: string;
  description?: string;
  country?: string | null;
  images?: ApiProviderImage[];
  is_new?: boolean;

  // service flags
  service_bbbj?: boolean;
  service_cim?: boolean;
  service_dfk?: boolean;
  service_69?: boolean;
  service_rimming?: boolean;
  service_filming?: boolean;
  service_cbj?: boolean;
  service_massage?: boolean;
  service_gfe?: boolean;
  service_pse?: boolean;
  service_double?: boolean;
  service_shower?: boolean;

  // ✅ pricing
  total_60?: number | string | null;
};

interface Service {
  name: string;
  available: boolean;
}

interface RosterModel {
  id: number;
  slug: string;
  name: string;
  nationality: string;
  image: string;
  images: string[];
  isNew: boolean;
  workingTime?: string;
  services?: Service[];
  startTime?: string;
  endTime?: string;

  // ✅ hourly teaser for roster card
  hourly?: number;
}

/* ---------------- Helpers ---------------- */

function priceOrUndef(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return undefined;
  return n > 0 ? n : undefined;
}

function keyify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function baseSlug(slug: string) {
  return (slug || "").replace(/-\d+$/, "");
}

function formatTimeLabel(hhmmss: string) {
  const [hhStr, mmStr] = hhmmss.split(":");
  let hh = Number(hhStr);
  const mm = Number(mmStr);
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${String(mm).padStart(2, "0")} ${ampm}`;
}

function formatWorkingTime(start: string, end: string) {
  return `${formatTimeLabel(start)} - ${formatTimeLabel(end)}`;
}

/* ---------------- Time helpers (SHOP DAY anchored) ---------------- */

type ShiftStatus = "now" | "later" | "finished";

function parseHHMMSSParts(hhmmss: string): { hh: number; mm: number; ss: number } {
  const [hhStr, mmStr, ssStr] = (hhmmss || "0:0:0").split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  const ss = Number(ssStr ?? "0");
  return {
    hh: Number.isFinite(hh) ? hh : 0,
    mm: Number.isFinite(mm) ? mm : 0,
    ss: Number.isFinite(ss) ? ss : 0,
  };
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function makeDateOnDay(day: Date, hhmmss: string) {
  const { hh, mm, ss } = parseHHMMSSParts(hhmmss);
  const x = new Date(day);
  x.setHours(hh, mm, ss, 0);
  return x;
}

/**
 * Date-anchored shift status:
 * - rosterDay is the SHOP DAY anchor (today tab => shopToday, tomorrow tab => shopToday+1)
 * - if end <= start => end is next day (overnight)
 * - end "00:00:00" means 24:00 of that day, not start-of-day
 */
function getShiftStatusOnDay(
  startHHMMSS: string,
  endHHMMSS: string,
  rosterDay: Date,
  now: Date = new Date()
): ShiftStatus {
  const day0 = startOfDay(rosterDay);
  const startAt = makeDateOnDay(day0, startHHMMSS);

  const endParts = parseHHMMSSParts(endHHMMSS);
  const isMidnight = endParts.hh === 0 && endParts.mm === 0 && endParts.ss === 0;

  let endAt = makeDateOnDay(day0, endHHMMSS);

  // interpret end=00:00 as 24:00 if start isn't also midnight
  if (
    isMidnight &&
    (startAt.getHours() !== 0 || startAt.getMinutes() !== 0 || startAt.getSeconds() !== 0)
  ) {
    endAt = addDays(day0, 1); // 24:00
  }

  // overnight
  if (endAt.getTime() <= startAt.getTime()) {
    endAt = addDays(endAt, 1);
  }

  if (now.getTime() >= startAt.getTime() && now.getTime() < endAt.getTime()) return "now";
  if (now.getTime() < startAt.getTime()) return "later";
  return "finished";
}

function servicesFromProvider(p: ApiProvider): Service[] {
  const flags: Array<[string, boolean | undefined]> = [
    ["BBBJ", p.service_bbbj],
    ["CIM", p.service_cim],
    ["DFK", p.service_dfk],
    ["69", p.service_69],
    ["Rimming", p.service_rimming],
    ["Filming", p.service_filming],
    ["CBJ", p.service_cbj],
    ["Massage", p.service_massage],
    ["GFE", p.service_gfe],
    ["PSE", p.service_pse],
    ["Double", p.service_double],
    ["Shower Together", p.service_shower],
  ];

  const anyTrue = flags.some(([, v]) => v === true);
  if (anyTrue) return flags.map(([name, v]) => ({ name, available: v === true }));

  // Fallback parse: "Service: BBBJ, DFK, ..."
  const desc = p.description || "";
  const m = desc.match(/Service:\s*([^.<\n\r]+)/i);
  if (!m) return flags.map(([name]) => ({ name, available: false }));

  const listed = m[1]
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const has = (label: string) => listed.includes(label.toUpperCase());

  return [
    { name: "BBBJ", available: has("BBBJ") },
    { name: "CIM", available: has("CIM") },
    { name: "DFK", available: has("DFK") },
    { name: "69", available: has("69") },
    { name: "Rimming", available: has("RIMMING") },
    { name: "Filming", available: has("FILMING") },
    { name: "CBJ", available: has("CBJ") },
    { name: "Massage", available: has("MASSAGE") },
    { name: "GFE", available: has("GFE") },
    { name: "PSE", available: has("PSE") },
    { name: "Double", available: has("DOUBLE") },
    { name: "Shower Together", available: has("SHOWER TOGETHER") || has("SHOWER") },
  ];
}

function imagesFromProvider(p: ApiProvider): string[] {
  return (p.images || [])
    .filter((x) => x?.image)
    .slice()
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .map((x) => x.image);
}

function pickThumbnailFromProvider(p: ApiProvider): string {
  const imgs = (p.images || []).filter((x) => x?.image);
  const profileImg = imgs.find((x) => x.profile === true)?.image;
  if (profileImg) return profileImg;

  const best = imgs.slice().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0]?.image;
  return best || "";
}


function shuffle<T>(array: T[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ✅ map rendered service names -> i18n keys
function serviceKey(name: string) {
  const k = (name || "").toLowerCase().trim();
  if (k === "bbbj") return "bbbj";
  if (k === "cim") return "cim";
  if (k === "dfk") return "dfk";
  if (k === "69") return "69";
  if (k === "rimming") return "rimming";
  if (k === "filming") return "filming";
  if (k === "cbj") return "cbj";
  if (k === "massage") return "massage";
  if (k === "gfe") return "gfe";
  if (k === "pse") return "pse";
  if (k === "double") return "double";
  if (k === "shower together") return "shower";
  return k.replace(/\s+/g, "");
}

/* ---------------- Component ---------------- */

const RosterGrid: React.FC = () => {
  const { t, i18n } = useTranslation();
  const natLabel = useCallback(
    (raw: string) => {
      const key = `nationalities.${raw}`;
      return i18n.exists(key) ? t(key) : raw;
    },
    [i18n, t]
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const BATCH_SIZE = useResponsiveBatchSize();

  // ---- parse URL (single source of truth)
  const time = (searchParams.get("time") as "now" | "later" | "finished") || "now";
  const tab = (searchParams.get("tab") as "today" | "tomorrow") || "today";
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

  // ✅ patch helper (URL only)
  const commitParams = useCallback(
    (patch: {
      tab?: "today" | "tomorrow";
      nat?: string[];
      svc?: string[];
      page?: number;
      filters?: boolean;
      time?: "now" | "later" | "finished";
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

  // ✅ ensure defaults exist (time/tab/page)
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;

    if (!next.get("time")) {
      next.set("time", "now");
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

  // ----- touch swipe state (local is fine)
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // ----- API state
  const [providers, setProviders] = useState<ApiProvider[] | null>(null);
  const [apiToday, setApiToday] = useState<ApiRosterEntry[] | null>(null);
  const [apiTomorrow, setApiTomorrow] = useState<ApiRosterEntry[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // ---- fetch
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

  // ---- mapping helpers
  const upsertBest = (map: Map<string, ApiProvider>, key: string, p: ApiProvider) => {
    const prev = map.get(key);
    if (!prev || p.id > prev.id) map.set(key, p);
  };

  const providerById = useMemo(() => {
    const map = new Map<number, ApiProvider>();
    for (const p of providers || []) map.set(p.id, p);
    return map;
  }, [providers]);

  const providerByName = useMemo(() => {
    const map = new Map<string, ApiProvider>();
    for (const p of providers || []) upsertBest(map, keyify(p.provider_name), p);
    return map;
  }, [providers]);

  const providerBySlug = useMemo(() => {
    const map = new Map<string, ApiProvider>();
    for (const p of providers || []) upsertBest(map, keyify(p.slug), p);
    return map;
  }, [providers]);

  const providerByBaseSlug = useMemo(() => {
    const map = new Map<string, ApiProvider>();
    for (const p of providers || []) upsertBest(map, keyify(baseSlug(p.slug)), p);
    return map;
  }, [providers]);

  const currentRoster: RosterModel[] = useMemo(() => {
    const roster = tab === "today" ? apiToday : apiTomorrow;
    if (!roster || !providers) return [];

    return roster
      .map((entry) => {
        const key = keyify(entry.provider_name);

        const p =
          providerById.get(entry.provider_id) ??
          providerByName.get(key) ??
          providerBySlug.get(key) ??
          providerByBaseSlug.get(key);

        if (!p) return null;

        const images = imagesFromProvider(p);
        const thumb = pickThumbnailFromProvider(p) || images[0] || "";

        return {
          startTime: entry.start_time,
          endTime: entry.end_time,
          id: p.id,
          slug: p.slug,
          name: p.provider_name,
          nationality: p.country || "Unknown",
          image: thumb,
          images,
          isNew: p.is_new === true,
          workingTime: formatWorkingTime(entry.start_time, entry.end_time),
          services: servicesFromProvider(p),
          hourly: priceOrUndef(p.total_60),
        } as RosterModel;
      })
      .filter(Boolean) as RosterModel[];
  }, [tab, apiToday, apiTomorrow, providers, providerById, providerByName, providerBySlug, providerByBaseSlug]);

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
    // include tab + time + selected filters so each "view" has its own stable order
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

        // If API roster changed, append missing ones at the end
        if (ordered.length !== currentRoster.length) {
          const seen = new Set(ordered.map((m) => m.id));
          const missing = currentRoster.filter((m) => !seen.has(m.id));
          return [...ordered, ...missing];
        }

        return ordered;
      } catch {
        // fall through to reshuffle
      }
    }

    const newOnes = currentRoster.filter((m) => m.isNew);
    const rest = currentRoster.filter((m) => !m.isNew);
    const shuffled = [...newOnes, ...shuffle(rest)];

    sessionStorage.setItem(cacheKey, JSON.stringify(shuffled.map((m) => m.id)));
    return shuffled;
  }, [currentRoster, shuffleKey]);

  // ✅ TIME filter using SHOP DAY anchor (fixes 12:41am “everything later” bug)
  const timeFilteredRoster = useMemo(() => {
    return randomizedRoster.filter((m) => {
      if (!m.startTime || !m.endTime) return true; // don't hide all if missing
      return getShiftStatusOnDay(m.startTime, m.endTime, rosterDay) === time;
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

  const modelHasAllSelectedServices = (model: RosterModel) => {
    if (svc.length === 0) return true;
    const available = (model.services || []).filter((s) => s.available).map((s) => s.name);
    return svc.every((s) => available.includes(s));
  };

  const filteredRoster = useMemo(() => {
    return timeFilteredRoster.filter((model) => {
      if (nat.length > 0 && !nat.includes(model.nationality)) return false;
      if (!modelHasAllSelectedServices(model)) return false;
      return true;
    });
  }, [timeFilteredRoster, nat, svc]);

  const totalBatches = Math.max(1, Math.ceil(filteredRoster.length / BATCH_SIZE));
  const safePage = useMemo(() => ((page % totalBatches) + totalBatches) % totalBatches, [page, totalBatches]);

  const currentBatchModels = useMemo(() => {
    return filteredRoster.slice(safePage * BATCH_SIZE, (safePage + 1) * BATCH_SIZE);
  }, [filteredRoster, safePage, BATCH_SIZE]);

  // ✅ if URL page is out of range (after filters), snap to 0
  useEffect(() => {
    if (page >= totalBatches) {
      commitParams({ page: 0 });
    }
  }, [page, totalBatches, commitParams]);

  const goPrev = useCallback(() => {
    const next = (safePage - 1 + totalBatches) % totalBatches;
    commitParams({ page: next });
  }, [safePage, totalBatches, commitParams]);

  const goNext = useCallback(() => {
    const next = (safePage + 1) % totalBatches;
    commitParams({ page: next });
  }, [safePage, totalBatches, commitParams]);

  const toggleNationality = (n: string) => {
    const next = nat.includes(n) ? nat.filter((x) => x !== n) : [...nat, n];
    commitParams({ nat: next, page: 0 });
  };

  const toggleService = (s: string) => {
    const next = svc.includes(s) ? svc.filter((x) => x !== s) : [...svc, s];
    commitParams({ svc: next, page: 0 });
  };

  const clearFilters = () => {
    commitParams({ nat: [], svc: [], page: 0 });
  };

  const activeFilterCount = nat.length + svc.length;

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) goNext();
    if (distance < -50) goPrev();
    setTouchStart(0);
    setTouchEnd(0);
  };

  const showTomorrowReleaseMsg =
    tab === "tomorrow" && apiTomorrow != null && Array.isArray(apiTomorrow) && apiTomorrow.length === 0;

  const isLoading = providers === null || apiToday === null || apiTomorrow === null;

  // ✅ better empty text when time filter is involved
  const emptyText = t("roster.emptyTitleTime", {
    defaultValue:
      "No girls match your current time or filters. Try switching the time filter or clearing filters.",
  });

  return (
    <section className="min-h-screen bg-black relative overflow-hidden py-12">
      <div className="relative z-10 max-w-screen-xl mx-auto">
        {apiError && (
          <div className="mx-6 mb-4 p-3 border border-red-500/40 bg-red-900/20 text-red-300 text-sm">
            API error: {apiError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => commitParams({ tab: "today", page: 0 })}
            className={`px-6 py-3 font-bold text-2xl border-2 transition-all ${
              tab === "today" ? "border-red-500 text-red-300" : "border-gray-700 text-gray-300"
            }`}
            style={tab === "today" ? { boxShadow: "0 0 18px rgba(255,40,40,0.55)" } : undefined}
          >
            {t("roster.today")}
          </button>

          <button
            onClick={() => commitParams({ tab: "tomorrow", page: 0 })}
            className={`px-6 py-3 font-bold text-2xl border-2 transition-all ${
              tab === "tomorrow" ? "border-red-500 text-red-300" : "border-gray-700 text-gray-300"
            }`}
            style={tab === "tomorrow" ? { boxShadow: "0 0 18px rgba(255,40,40,0.55)" } : undefined}
          >
            {t("roster.tomorrow")}
          </button>
        </div>

        {showTomorrowReleaseMsg && (
          <div className="mx-6 mb-6 p-4 border border-red-500/30 bg-red-900/10 text-red-200 text-center">
            {t("roster.tomorrowReleaseTitle", { time: "7:00 PM" })}
            <div className="text-gray-300 mt-1">{t("roster.tomorrowReleaseSubtitle")}</div>
          </div>
        )}

        {isLoading && (
          <div className="mx-6 mb-8 p-6 border border-red-500/30 bg-red-900/10 text-center">
            <div className="text-red-200 text-xl font-bold">{t("roster.loadingTitle")}</div>
            <div className="text-gray-400 mt-2">{t("roster.loadingSubtitle")}</div>
          </div>
        )}

        {!showTomorrowReleaseMsg && (
          <div className="flex items-center gap-3 mx-6 mb-6">
            <button
              onClick={() => commitParams({ filters: !showFilters })}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-red-500/50 text-red-400 text-xl"
            >
              <Filter className="w-4 h-4" />
              {t("filter.filters")}
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                const order: Array<"now" | "later" | "finished"> = ["now", "later", "finished"];
                const idx = order.indexOf(time);
                const next = order[(idx + 1) % order.length];
                commitParams({ time: next, page: 0 });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-red-500/30 text-gray-200 text-xl hover:bg-red-500/10"
              title="Time filter"
            >
              <Clock className="w-4 h-4 text-red-400" />
              {time === "now" ? t("filter.onNow") : time === "later" ? t("filter.startLater") : t("filter.finished")}
            </button>
          </div>
        )}

        {showFilters && (
          <div className="mb-6 p-4 bg-gray-900 border border-red-500/50 mx-6">
            <div className="flex justify-end items-center mb-4">
              <button onClick={clearFilters} className="text-lg text-gray-500 hover:text-white">
                {t("filter.clear")}
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-red-500 font-bold mb-2">{t("filter.nationality")}</h4>
              <div className="flex flex-wrap gap-2">
                {nationalities.map((n) => (
                  <button
                    key={n}
                    onClick={() => toggleNationality(n)}
                    className={`px-3 py-1 border ${
                      nat.includes(n) ? "bg-red-700 text-white border-red-500" : "bg-gray-800 text-gray-400 border-gray-700"
                    }`}
                  >
                    {natLabel(n)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-red-500 font-bold mb-2">{t("profile.availableServices")}</h4>
              <div className="flex flex-wrap gap-2">
                {serviceFilterLabels.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleService(s)}
                    className={`px-3 py-1 border ${
                      svc.includes(s) ? "bg-red-700 text-white border-red-500" : "bg-gray-800 text-gray-400 border-gray-700"
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
          <div className="mx-6 mb-10 p-8 border border-red-500/20 bg-black/40 text-center">
            <p className="text-gray-300 text-xl">{emptyText}</p>
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-2 border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-all"
            >
              {t("filter.clear")}
            </button>
          </div>
        )}

        {/* Grid with navigation */}
        <div className="relative">
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-red-500/20 text-red-500 p-3 backdrop-blur-sm transition-all border border-red-500/30"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="grid grid-cols-2 lg:grid-cols-5 gap-0 mb-8"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {currentBatchModels.map((model) => (
              <Link
                key={model.id}
                to={`/profile/${model.slug}`}
                className="relative aspect-[3/4] overflow-hidden group block"
                style={{ boxShadow: "inset 0 0 0 1px rgba(255,0,255,0.2)" }}
              >
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-full h-full object-cover object-[center_35%] transition-transform duration-500 group-hover:scale-110"
                />

                

                

                {typeof model.hourly === "number" && (
                  <span
                    className="z-10 absolute bottom-3 right-3 bg-black/75 text-white text-sm px-2 py-1 font-bold tracking-wide border border-red-500/40"
                    style={{ boxShadow: "0 0 12px rgba(255,40,40,0.35)" }}
                  >
                    ${model.hourly} <span className="text-xs text-gray-300">/hr</span>
                  </span>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
  <div className="flex items-center gap-2">
    <h3
      className="text-white font-bold text-lg"
      style={{ textShadow: "0 0 10px rgba(0,0,0,0.9)" }}
    >
      {model.name}
    </h3>

    {model.isNew && (
      <span
        className="bg-red-900 text-white text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider animate-pulse relative right-[-2px]"
style={{ boxShadow: "0 0 10px rgba(255, 120, 80, 0.35)" }}
      >
        {t("badges.new")}
      </span>
    )}
  </div>

  <p className="text-red-300 text-lg">
    {natLabel(model.nationality)}
  </p>

  {model.workingTime && (
    <p className="text-gray-200 text-sm mt-1">
      {model.workingTime}
    </p>
  )}
</div>

              </Link>
            ))}
          </div>

          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-red-500/20 text-red-500 p-3 backdrop-blur-sm transition-all border border-red-500/30"
            aria-label="Next page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RosterGrid;
