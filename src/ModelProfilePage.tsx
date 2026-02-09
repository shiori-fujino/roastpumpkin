// src/pages/ModelProfilePage.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import Layout from "./components/Layout";

import ProfileGallery from "./components/profile/ProfileGallery";
import ProfileHeader from "./components/profile/ProfileHeader";
import AvailableServices from "./components/profile/AvailableServices";
import ProfileBio from "./components/profile/ProfileBio";
import ProfileDetailsGrid from "./components/profile/ProfileDetailGrid";
import MobileCTA from "./components/profile/MobileCTA";

const PROVIDERS_URL = "/api/providers/";
const ROSTER_TODAY_URL = "/api/roster/today/";

type ApiRosterEntry = {
  provider_id: number;
  provider_name: string;
  start_time: string;
  end_time: string;
};

type ApiProviderImage = {
  image: string;
  file_type?: string;
  profile?: boolean;
  priority?: number;
};

type ApiProvider = {
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

type ModelProfile = {
  id: number;
  name: string;
  slug: string;
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

/* ---------------- Helpers ---------------- */

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function bool(v: any) {
  return v === true;
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

function priceOrUndef(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return undefined;
  return n > 0 ? n : undefined;
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

/* ---------------- Component ---------------- */

const ModelProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const natLabel = (raw: string) => {
    const key = `nationalities.${raw}`;
    return i18n.exists(key) ? t(key) : raw;
  };

  const { slug } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [model, setModel] = useState<ModelProfile | null>(null);

  // optional: roster can pass workingTime via navigate state
  const workingTimeFromState = (location.state as any)?.workingTime as string | undefined;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setApiError(null);
        setModel(null);

        if (!slug) {
          setApiError("Missing slug in URL");
          return;
        }

        const [provRes, rosterRes] = await Promise.all([fetch(PROVIDERS_URL), fetch(ROSTER_TODAY_URL)]);

        if (!provRes.ok) throw new Error(`providers fetch failed: ${provRes.status}`);

        const list = (await provRes.json()) as ApiProvider[];
        if (!Array.isArray(list)) throw new Error("providers response not an array");

        const found = list.find((p) => (p.slug || "").toLowerCase() === slug.toLowerCase());
        if (!found) return;

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

        const mapped: ModelProfile = {
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

        if (!cancelled) setModel(mapped);
      } catch (e: any) {
        if (!cancelled) {
          setApiError(e?.message || "Provider API error");
          setModel(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-zinc-400 text-xl">{t("common.loading")}</p>
        </div>
      </Layout>
    );
  }

  if (!model) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4 text-white">404</h2>
            {apiError ? (
              <p className="text-zinc-400 text-xl">
                {t("profile.loadFailed")} ({apiError})
              </p>
            ) : (
              <p className="text-zinc-400 text-xl">{t("profile.notFound")}</p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="min-h-screen bg-black relative overflow-hidden py-12">
        {/* subtle grid, red-900 only */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(127,29,29,0.35) 1px, transparent 1px),
              linear-gradient(90deg, rgba(127,29,29,0.25) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />

        <div className="max-w-6xl mx-auto px-4 relative z-10 pb-24 lg:pb-0">
          {/* Back to roster */}
          <button
            onClick={() => {
              if (window.history.state?.idx > 0) {
                navigate(-1);
                return;
              }
              navigate({ pathname: "/", search: window.location.search, hash: "#roster" }, { state: { scrollTo: "roster" } });
            }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-red-900 bg-black/60 text-zinc-200 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Roster
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: gallery */}
            <div className="space-y-6">
              <ProfileGallery name={model.name} images={model.images} isNew={model.isNew} />
            </div>

            <div className="max-w-[520px] mx-auto flex flex-col gap-10">
  <ProfileHeader
    name={model.name}
    workingTime={workingTimeFromState || model.workingTime}
    rates={model.rates}
  />

  {/* narrower content */}
  <div className="mt-10 w-full max-w-[340px] mx-auto flex flex-col gap-10">
    <AvailableServices services={model.services} />

    <ProfileDetailsGrid
      natLabel={natLabel}
      nationality={model.nationality}
      height={model.height}
      weight={model.weight}
      bust={model.bust}
      dressSize={model.dressSize}
      figure={model.figure}
      hair={model.hair}
      skin={model.skin}
      tattoos={model.tattoos}
      pubes={model.pubes}
    />

    {model.bio && (
      <ProfileBio bio={model.bio} name={model.name} />
    )}
  </div>
</div>

          </div>

          {/* Mobile CTA */}
          <MobileCTA phoneNumber="+61417888123" />
        </div>
      </section>
    </Layout>
  );
};

export default ModelProfilePage;
