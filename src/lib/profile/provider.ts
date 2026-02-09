// src/lib/profile/provider.ts

const PROVIDERS_URL = "/api/providers/";
const ROSTER_TODAY_URL = "/api/roster/today/";

export type ApiRosterEntry = {
  provider_id: number;
  provider_name: string;
  start_time: string;
  end_time: string;
};

export type ApiProviderImage = {
  image: string;
  file_type?: string;
  profile?: boolean;
  priority?: number;
};

export type ApiProvider = {
  id: number;
  slug: string;
  provider_name: string;
  description?: string;
  country?: string | null;

  cup?: string;
  weight?: number;
  height?: number;
  images?: ApiProviderImage[];

  dress_size?: number;
  figure?: string;
  hair?: string;
  skin?: string;
  tattoos?: string;
  pubes?: string;
  requirements?: string;

  is_new?: boolean;

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

  total_30?: number | string | null;
  total_45?: number | string | null;
  total_60?: number | string | null;
};

export type Service = { name: string; available: boolean };

export type ModelProfile = {
  id: number;
  slug: string;
  name: string;
  nationality: string;

  height?: number;
  weight?: number;
  bust?: string;
  dressSize?: number;
  figure?: string;
  hair?: string;
  skin?: string;
  tattoos?: string;
  pubes?: string;
  requirements?: string;

  bio?: string;

  images: string[];
  isNew: boolean;

  workingTime?: string;

  services: Service[];

  rates?: {
    min30?: number;
    min45?: number;
    min60?: number;
  };
};

/* ---------------- helpers ---------------- */

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function bool(v: any) {
  return v === true;
}

function priceOrUndef(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return undefined;
  return n > 0 ? n : undefined;
}

function imagesFromProvider(p: ApiProvider): string[] {
  const all = (p.images || [])
    .filter((x) => x?.image)
    .slice()
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  const noProfile = all.filter((x) => !x.profile);
  const final = noProfile.length > 0 ? noProfile : all;

  return final.map((x) => x.image);
}

function servicesFromProvider(p: ApiProvider): Service[] {
  const flags: Service[] = [
    { name: "bbbj", available: bool(p.service_bbbj) },
    { name: "cim", available: bool(p.service_cim) },
    { name: "dfk", available: bool(p.service_dfk) },
    { name: "69", available: bool(p.service_69) },
    { name: "rimming", available: bool(p.service_rimming) },
    { name: "filming", available: bool(p.service_filming) },
    { name: "cbj", available: bool(p.service_cbj) },
    { name: "massage", available: bool(p.service_massage) },
    { name: "gfe", available: bool(p.service_gfe) },
    { name: "pse", available: bool(p.service_pse) },
    { name: "double", available: bool(p.service_double) },
    { name: "shower", available: bool(p.service_shower) },
  ];

  if (flags.some((s) => s.available)) return flags;

  const text = stripHtml(p.description || "");
  const m = text.match(/Service:\s*([^.\n]+)/i);
  const list = m ? m[1].split(",").map((s) => s.trim()).filter(Boolean) : [];

  const has = (label: string) => list.some((item) => item.toLowerCase() === label.toLowerCase());

  return [
    { name: "bbbj", available: has("BBBJ") },
    { name: "cim", available: has("CIM") },
    { name: "dfk", available: has("DFK") },
    { name: "69", available: has("69") },
    { name: "rimming", available: has("RIMMING") },
    { name: "filming", available: has("FILMING") },
    { name: "cbj", available: has("CBJ") },
    { name: "massage", available: has("MASSAGE") },
    { name: "gfe", available: has("GFE") },
    { name: "pse", available: has("PSE") },
    { name: "double", available: has("DOUBLE") },
    { name: "shower", available: has("SHOWER TOGETHER") || has("SHOWER") },
  ];
}

function formatTimeLabel(hhmmss: string) {
  const [hhStr, mmStr] = (hhmmss || "0:0").split(":");
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

/* ---------------- main API ---------------- */

export async function fetchModelProfile(slug: string): Promise<ModelProfile | null> {
  const [provRes, rosterRes] = await Promise.all([fetch(PROVIDERS_URL), fetch(ROSTER_TODAY_URL)]);

  if (!provRes.ok) throw new Error(`providers fetch failed: ${provRes.status}`);

  const list = (await provRes.json()) as ApiProvider[];
  if (!Array.isArray(list)) throw new Error("providers response not an array");

  const found = list.find((p) => (p.slug || "").toLowerCase() === slug.toLowerCase());
  if (!found) return null;

  let apiWorkingTime: string | undefined;

  if (rosterRes.ok) {
    const roster = (await rosterRes.json()) as ApiRosterEntry[];
    if (Array.isArray(roster)) {
      const entry = roster.find((r) => r.provider_id === found.id);
      if (entry) apiWorkingTime = formatWorkingTime(entry.start_time, entry.end_time);
    }
  }

  const imgs = imagesFromProvider(found);
  const services = servicesFromProvider(found);

  return {
    id: found.id,
    slug: found.slug,
    name: found.provider_name || found.slug,
    nationality: found.country || "Unknown",

    height: found.height || undefined,
    weight: found.weight || undefined,
    bust: found.cup ? `${found.cup}` : undefined,

    dressSize: found.dress_size || undefined,
    figure: found.figure || undefined,
    hair: found.hair || undefined,
    skin: found.skin || undefined,
    tattoos: found.tattoos || undefined,
    pubes: found.pubes || undefined,
    requirements: found.requirements || undefined,

    bio: found.description ? stripHtml(found.description) : undefined,

    images: imgs.length ? imgs : [],
    isNew: found.is_new === true,

    workingTime: apiWorkingTime,

    services,

    rates: {
      min30: priceOrUndef(found.total_30),
      min45: priceOrUndef(found.total_45),
      min60: priceOrUndef(found.total_60),
    },
  };
}
