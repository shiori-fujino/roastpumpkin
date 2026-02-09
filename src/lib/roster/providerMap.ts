// src/lib/roster/providermap.ts

import { formatWorkingTime } from "./time";

/* ---------------- Types ---------------- */

export type ApiRosterEntry = {
  provider_id: number;
  provider_name: string;
  start_time: string;
  end_time: string;
};

export type ApiProviderImage = {
  image: string;
  priority?: number;
  profile?: boolean;
  real?: boolean;
};

export type ApiProvider = {
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

  // pricing
  total_60?: number | string | null;
};

export interface Service {
  name: string;
  available: boolean;
}

export interface RosterModel {
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

  // hourly teaser for roster card
  hourly?: number;
}

export type ProvidersIndex = {
  byId: Map<number, ApiProvider>;
  byName: Map<string, ApiProvider>;
  bySlug: Map<string, ApiProvider>;
  byBaseSlug: Map<string, ApiProvider>;
};

/* ---------------- Helpers ---------------- */

export function priceOrUndef(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return undefined;
  return n > 0 ? n : undefined;
}

export function keyify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function baseSlug(slug: string) {
  return (slug || "").replace(/-\d+$/, "");
}

export function servicesFromProvider(p: ApiProvider): Service[] {
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

export function imagesFromProvider(p: ApiProvider): string[] {
  return (p.images || [])
    .filter((x) => x?.image)
    .slice()
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .map((x) => x.image);
}

export function pickThumbnailFromProvider(p: ApiProvider): string {
  const imgs = (p.images || []).filter((x) => x?.image);
  const profileImg = imgs.find((x) => x.profile === true)?.image;
  if (profileImg) return profileImg;

  const best = imgs.slice().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0]?.image;
  return best || "";
}

function upsertBest(map: Map<string, ApiProvider>, key: string, p: ApiProvider) {
  const prev = map.get(key);
  if (!prev || p.id > prev.id) map.set(key, p);
}

export function buildProvidersIndex(providers: ApiProvider[] | null): ProvidersIndex {
  const byId = new Map<number, ApiProvider>();
  const byName = new Map<string, ApiProvider>();
  const bySlug = new Map<string, ApiProvider>();
  const byBaseSlug = new Map<string, ApiProvider>();

  for (const p of providers || []) {
    byId.set(p.id, p);
    upsertBest(byName, keyify(p.provider_name), p);
    upsertBest(bySlug, keyify(p.slug), p);
    upsertBest(byBaseSlug, keyify(baseSlug(p.slug)), p);
  }

  return { byId, byName, bySlug, byBaseSlug };
}

export function buildRosterModel(entry: ApiRosterEntry, idx: ProvidersIndex): RosterModel | null {
  const key = keyify(entry.provider_name);

  const p =
    idx.byId.get(entry.provider_id) ??
    idx.byName.get(key) ??
    idx.bySlug.get(key) ??
    idx.byBaseSlug.get(key);

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
  };
}

// ✅ map rendered service names -> i18n keys
export function serviceKey(name: string) {
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
