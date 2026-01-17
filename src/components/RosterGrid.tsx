import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

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
  isRealPhoto: boolean;
}

/* ---------------- Helpers ---------------- */

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

  const best = imgs
    .slice()
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0]?.image;

  return best || "";
}

function hasAnyRealPhoto(p: ApiProvider): boolean {
  return (p.images || []).some((img) => img.real === true);
}

function shuffle<T>(array: T[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------------- Component ---------------- */

const RosterGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow">("today");
  const [currentBatch, setCurrentBatch] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const [providers, setProviders] = useState<ApiProvider[] | null>(null);
  const [apiToday, setApiToday] = useState<ApiRosterEntry[] | null>(null);
  const [apiTomorrow, setApiTomorrow] = useState<ApiRosterEntry[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const BATCH_SIZE = useResponsiveBatchSize();

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

  useEffect(() => setCurrentBatch(0), [BATCH_SIZE]);
  useEffect(() => setCurrentBatch(0), [activeTab]);
  useEffect(() => setCurrentBatch(0), [selectedNationalities, selectedServices]);

  const upsertBest = (map: Map<string, ApiProvider>, key: string, p: ApiProvider) => {
    const prev = map.get(key);
    if (!prev || p.id > prev.id) map.set(key, p);
  };

  const providerById = useMemo(() => {
    const map = new Map<number, ApiProvider>();
    for (const p of providers || []) map.set(p.id, p);
    return map;
  }, [providers]);

  // legacy fallback maps
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
    const roster = activeTab === "today" ? apiToday : apiTomorrow;
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
          id: p.id,
          slug: p.slug,
          name: p.provider_name,
          nationality: p.country || "Unknown",
          image: thumb,
          images,
          isNew: p.is_new === true,
          isRealPhoto: hasAnyRealPhoto(p),
          workingTime: formatWorkingTime(entry.start_time, entry.end_time),
          services: servicesFromProvider(p),
        } as RosterModel;
      })
      .filter(Boolean) as RosterModel[];
  }, [
    activeTab,
    apiToday,
    apiTomorrow,
    providers,
    providerById,
    providerByName,
    providerBySlug,
    providerByBaseSlug,
  ]);

  // ✅ NEW always on top, rest shuffled ONCE per roster load (refresh -> new order)
  const randomizedRoster = useMemo(() => {
    if (!currentRoster.length) return [];
    const newOnes = currentRoster.filter((m) => m.isNew);
    const rest = currentRoster.filter((m) => !m.isNew);
    return [...newOnes, ...shuffle(rest)];
  }, [currentRoster]);

  const nationalities = useMemo(
    () => [...new Set(randomizedRoster.map((m) => m.nationality))].filter(Boolean).sort(),
    [randomizedRoster]
  );

  const services = useMemo(() => {
    return [
      ...new Set(
        randomizedRoster
          .flatMap((m) => (m.services || []).filter((s) => s.available).map((s) => s.name))
          .filter(Boolean)
      ),
    ].sort();
  }, [randomizedRoster]);

  const modelHasAllSelectedServices = (model: RosterModel) => {
    if (selectedServices.length === 0) return true;
    const available = (model.services || []).filter((s) => s.available).map((s) => s.name);
    return selectedServices.every((s) => available.includes(s));
  };

  const filteredRoster = useMemo(() => {
    return randomizedRoster.filter((model) => {
      if (selectedNationalities.length > 0 && !selectedNationalities.includes(model.nationality)) return false;
      if (!modelHasAllSelectedServices(model)) return false;
      return true;
    });
  }, [randomizedRoster, selectedNationalities, selectedServices]);

  const totalBatches = Math.max(1, Math.ceil(filteredRoster.length / BATCH_SIZE));

  // ✅ Looping page index (always valid)
  const safeCurrentBatch = useMemo(() => {
    return ((currentBatch % totalBatches) + totalBatches) % totalBatches;
  }, [currentBatch, totalBatches]);

  const currentBatchModels = useMemo(() => {
    return filteredRoster.slice(
      safeCurrentBatch * BATCH_SIZE,
      (safeCurrentBatch + 1) * BATCH_SIZE
    );
  }, [filteredRoster, safeCurrentBatch, BATCH_SIZE]);

  const goPrev = useCallback(() => {
    setCurrentBatch((prev) => (prev - 1 + totalBatches) % totalBatches);
  }, [totalBatches]);

  const goNext = useCallback(() => {
    setCurrentBatch((prev) => (prev + 1) % totalBatches);
  }, [totalBatches]);

  const toggleNationality = (nat: string) => {
    setSelectedNationalities((prev) => (prev.includes(nat) ? prev.filter((n) => n !== nat) : [...prev, nat]));
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) => (prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]));
  };

  const clearFilters = () => {
    setSelectedNationalities([]);
    setSelectedServices([]);
  };

  const activeFilterCount = selectedNationalities.length + selectedServices.length;

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
    activeTab === "tomorrow" &&
    apiTomorrow != null &&
    Array.isArray(apiTomorrow) &&
    apiTomorrow.length === 0;

  return (
    <section id="roster" className="min-h-screen bg-black relative overflow-hidden py-12">
      <div className="relative z-10 max-w-screen-xl mx-auto">
        {apiError && (
          <div className="mx-6 mb-4 p-3 border border-red-500/40 bg-red-900/20 text-red-300 text-sm">
            API error: {apiError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-6 py-3 font-bold text-2xl border-2 transition-all ${
              activeTab === "today" ? "border-red-500 text-red-300" : "border-gray-700 text-gray-300"
            }`}
            style={activeTab === "today" ? { boxShadow: "0 0 18px rgba(255,40,40,0.55)" } : undefined}
          >
            TODAY
          </button>

          <button
            onClick={() => setActiveTab("tomorrow")}
            className={`px-6 py-3 font-bold text-2xl border-2 transition-all ${
              activeTab === "tomorrow" ? "border-red-500 text-red-300" : "border-gray-700 text-gray-300"
            }`}
            style={activeTab === "tomorrow" ? { boxShadow: "0 0 18px rgba(255,40,40,0.55)" } : undefined}
          >
            TOMORROW
          </button>
        </div>

        {showTomorrowReleaseMsg && (
          <div className="mx-6 mb-6 p-4 border border-red-500/30 bg-red-900/10 text-red-200 text-center">
            Tomorrow roster releases by <span className="font-bold">7 PM</span>.
          </div>
        )}

        {/* Filter button */}
        <div className="flex justify-between items-center ml-6 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-red-500/50 text-red-400 text-xl"
          >
            <Filter className="w-4 h-4" />
            FILTERS
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{activeFilterCount}</span>
            )}
          </button>

          <div className="text-red-800 text-xl mr-6">
            Page {safeCurrentBatch + 1} / {totalBatches}
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-900 border border-red-500/50 mx-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-red-500 font-bold">FILTERS</h3>
              <button onClick={clearFilters} className="text-lg text-gray-500 hover:text-white">
                CLEAR ALL
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-red-500 font-bold mb-2">NATIONALITY</h4>
              <div className="flex flex-wrap gap-2">
                {nationalities.map((nat) => (
                  <button
                    key={nat}
                    onClick={() => toggleNationality(nat)}
                    className={`px-3 py-1 border ${
                      selectedNationalities.includes(nat)
                        ? "bg-red-700 text-white border-red-500"
                        : "bg-gray-800 text-gray-400 border-gray-700"
                    }`}
                  >
                    {nat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-red-500 font-bold mb-2">SERVICES</h4>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <button
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`px-3 py-1 border ${
                      selectedServices.includes(service)
                        ? "bg-red-700 text-white border-red-500"
                        : "bg-gray-800 text-gray-400 border-gray-700"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
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
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {model.isNew && (
                  <span
                    className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 font-bold uppercase tracking-wider animate-pulse"
                    style={{ boxShadow: "0 0 12px rgba(255,0,255,0.7)" }}
                  >
                    NEW
                  </span>
                )}

                {model.isRealPhoto && (
                  <span
                    className="absolute top-3 left-3 bg-emerald-400 text-black text-xs px-2 py-1 font-bold uppercase tracking-wider"
                    style={{ boxShadow: "0 0 12px rgba(16,185,129,0.65)" }}
                  >
                    REAL
                  </span>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
                  <h3 className="text-white font-bold text-lg" style={{ textShadow: "0 0 10px rgba(0,0,0,0.9)" }}>
                    {model.name}
                  </h3>
                  <p className="text-red-300 text-lg" style={{ textShadow: "0 0 10px rgba(0,0,0,0.9)" }}>
                    {model.nationality}
                  </p>
                  {model.workingTime && (
                    <p className="text-gray-200 text-sm mt-1" style={{ textShadow: "0 0 10px rgba(0,0,0,0.9)" }}>
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
