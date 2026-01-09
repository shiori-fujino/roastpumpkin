import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Phone, Check, X, ArrowLeft } from "lucide-react";
import ProfileLayout from "./components/ProfileLayout";

const PROVIDERS_URL = "/api/uuozkzutzpgf/providers/";

/* ---------------- Types ---------------- */

interface Service {
  name: string;
  available: boolean;
}

interface ModelProfile {
  id: number;
  name: string;
  nationality: string;
  age?: number;
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
  image: string;
  images?: string[];
  profileLink: string;
  isNew: boolean;

  // legacy flags (kept for compatibility)
  filming: boolean;
  cim: boolean;
  dfk: boolean;

  workingTime?: string;
  schedule?: string;
  services?: Service[];
  bio?: string;

  // ✅ NEW: rates from provider API
  rates?: {
    min30?: number;
    min45?: number;
    min60?: number;
  };
}

type ApiProviderImage = {
  image: string;
  file_type?: string;
  profile?: boolean;
  priority?: number;
  real?: boolean;
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

  // ✅ NEW: pricing fields (can be number OR string depending on backend)
  total_30?: number | string | null;
  total_45?: number | string | null;
  total_60?: number | string | null;
};

/* ---------------- Helpers ---------------- */

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function bool(v: any) {
  return v === true;
}

/** ✅ NEW: keep real flag per image */
type ImgItem = { src: string; real: boolean; profile: boolean };

function imagesFromProviderWithMeta(p: ApiProvider): ImgItem[] {
  return (p.images || [])
    .filter((x) => x?.image)
    .slice()
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .map((x) => ({
      src: x.image,
      real: x.real === true,
      profile: x.profile === true,
    }));
}




function servicesFromProvider(p: ApiProvider): Service[] {
  const flags: Service[] = [
    { name: "BBBJ", available: bool(p.service_bbbj) },
    { name: "CIM", available: bool(p.service_cim) },
    { name: "DFK", available: bool(p.service_dfk) },
    { name: "69", available: bool(p.service_69) },
    { name: "Rimming", available: bool(p.service_rimming) },
    { name: "Filming", available: bool(p.service_filming) },
    { name: "CBJ", available: bool(p.service_cbj) },
    { name: "Massage", available: bool(p.service_massage) },
    { name: "GFE", available: bool(p.service_gfe) },
    { name: "PSE", available: bool(p.service_pse) },
    { name: "Double", available: bool(p.service_double) },
    { name: "Shower Together", available: bool(p.service_shower) },
  ];

  // If backend flags actually contain info, trust them.
  if (flags.some((s) => s.available)) return flags;

  // Fallback: parse "Service: ...." from description
  const text = stripHtml(p.description || "");
  const m = text.match(/Service:\s*([^.\n]+)/i);
  const list = m ? m[1].split(",").map((s) => s.trim()).filter(Boolean) : [];

  const has = (label: string) =>
    list.some((item) => item.toLowerCase() === label.toLowerCase());

  return [
    { name: "BBBJ", available: has("BBBJ") },
    { name: "CIM", available: has("CIM") },
    { name: "DFK", available: has("DFK") },
    { name: "69", available: has("69") },
    { name: "Rimming", available: has("Rimming") },
    { name: "Filming", available: has("Filming") },
    { name: "CBJ", available: has("CBJ") },
    { name: "Massage", available: has("Massage") },
    { name: "GFE", available: has("GFE") },
    { name: "PSE", available: has("PSE") },
    { name: "Double", available: has("Double") },
    { name: "Shower Together", available: has("shower together") || has("shower") },
  ];
}

// ✅ Normalize backend price values.
// - handles "180" strings
// - treats 0 / null / NaN as "no rate" (undefined)
function priceOrUndef(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return undefined;
  return n > 0 ? n : undefined;
}

/* ---------------- Component ---------------- */

const ModelProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // IMPORTANT: make route param :slug (App.tsx must match)
  const { slug } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [model, setModel] = useState<ModelProfile | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /** ✅ NEW: store image meta (real flag) aligned with imageArray index */
  const [imageMeta, setImageMeta] = useState<ImgItem[]>([]);

  // optional: roster can pass workingTime via navigate state
  const workingTimeFromState = (location.state as any)?.workingTime as string | undefined;

  useEffect(() => {
    let cancelled = false;

    async function loadProvider() {
      try {
        setLoading(true);
        setApiError(null);
        setModel(null);
        setImageMeta([]); // ✅ NEW: clear meta on each load

        if (!slug) {
          setApiError("Missing slug in URL");
          return;
        }

        const res = await fetch(PROVIDERS_URL);
        if (!res.ok) throw new Error(`providers fetch failed: ${res.status}`);

        const list = (await res.json()) as ApiProvider[];
        if (!Array.isArray(list)) throw new Error("providers response not an array");

        const found = list.find((p) => (p.slug || "").toLowerCase() === slug.toLowerCase());

        if (!found) {
          setModel(null);
          return;
        }

/** ✅ NEW: get meta + plain string list */
// 1) load all images (sorted by priority)
// 2) remove profile:true from gallery (low-res thumb)
// 3) if that removes everything, fall back to all images (safety)
const imgsMetaAll = imagesFromProviderWithMeta(found);
const imgsMeta = imgsMetaAll.filter((x) => !x.profile);
const finalMeta = imgsMeta.length > 0 ? imgsMeta : imgsMetaAll;

const imgs = finalMeta.map((x) => x.src);


        const services = servicesFromProvider(found);

        const mapped: ModelProfile = {
          id: found.id,
          name: found.provider_name || found.slug,
          nationality: found.country || "Unknown",
          height: found.height || undefined,
          weight: found.weight || undefined,

          // backend only gives cup. keep it simple.
          bust: found.cup ? `${found.cup}` : undefined,

          dressSize: found.dress_size || undefined,
          figure: found.figure || undefined,
          hair: found.hair || undefined,
          skin: found.skin || undefined,
          tattoos: found.tattoos || undefined,
          pubes: found.pubes || undefined,
          requirements: found.requirements || undefined,

          bio: found.description ? stripHtml(found.description) : undefined,

          image: imgs[0] || "",
          images: imgs.length ? imgs : undefined,

          profileLink: `/models/${found.slug}`,
          isNew: found.is_new === true,

          filming: services.find((s) => s.name === "Filming")?.available ?? false,
          cim: services.find((s) => s.name === "CIM")?.available ?? false,
          dfk: services.find((s) => s.name === "DFK")?.available ?? false,

          services,

          // ✅ NEW: map rates from API (handles string numbers + ignores 0)
          rates: {
            min30: priceOrUndef(found.total_30),
            min45: priceOrUndef(found.total_45),
            min60: priceOrUndef(found.total_60),
          },
        };

        if (!cancelled) {
          setModel(mapped);
          setImageMeta(finalMeta); 
          setCurrentImageIndex(0);
        }
      } catch (e: any) {
        if (!cancelled) {
          setApiError(e?.message || "Provider API error");
          setModel(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProvider();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const imageArray = useMemo(() => {
    if (!model) return [];
    const arr =
      model.images && model.images.length > 0 ? model.images : model.image ? [model.image] : [];
    return arr;
  }, [model]);

  const services = model?.services || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
  };

  /* ---------------- Render states ---------------- */

  if (loading) {
    return (
      <ProfileLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-gray-400 text-xl">Loading profile…</p>
        </div>
      </ProfileLayout>
    );
  }

  if (!model) {
    return (
      <ProfileLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h2
              className="text-4xl font-bold mb-4"
              style={{
                background: "linear-gradient(to right, #ff00ff, #00ffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              404
            </h2>

            {apiError ? (
              <p className="text-gray-400 text-xl">
                Provider load failed 😢 ({apiError})
              </p>
            ) : (
              <p className="text-gray-400 text-xl">Girl not found 😢</p>
            )}
          </div>
        </div>
      </ProfileLayout>
    );
  }

  /* ---------------- Main UI ---------------- */

  return (
    <ProfileLayout>
      <section className="min-h-screen bg-black relative overflow-hidden py-12">
        {/* Cyberpunk background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,50,50,0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,120,50,0.2) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => navigate("/", { state: { scrollTo: "roster" } })}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 
              bg-gradient-to-r from-red-600/20 to-red-800/20 
              border border-red-500/50 
              text-red-400 hover:text-red-300
              hover:bg-red-600/30 hover:border-red-400
              transition-all duration-300
              uppercase tracking-wider font-bold text-sm
              shadow-[0_0_15px_rgba(255,40,40,0.3)]
              hover:shadow-[0_0_25px_rgba(255,40,40,0.5)]
              cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back to Roster
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image Carousel */}
            <div className="space-y-6">
              <div
                className="relative aspect-[3/4] overflow-hidden border-2 transition-all"
                style={{
                  borderColor: "rgba(255, 50, 50, 0.8)",
                  boxShadow: `
                    0 0 25px rgba(255, 40, 40, 0.6),
                    0 0 60px rgba(255, 150, 50, 0.25),
                    inset 0 0 20px rgba(120, 0, 0, 0.4)
                  `,
                  backgroundColor: "rgba(10, 0, 0, 0.5)",
                }}
              >
                {imageArray.length > 0 ? (
                  <img
                    src={imageArray[currentImageIndex]}
                    alt={`${model.name} - Photo ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    No image
                  </div>
                )}

                {model.isNew && (
                  <span
                    className="absolute top-4 right-4 bg-red-500 text-white text-sm px-3 py-1 font-bold uppercase tracking-wider animate-pulse"
                    style={{ boxShadow: "0 0 15px rgba(255,0,255,0.8)" }}
                  >
                    NEW
                  </span>
                )}

                {/* ✅ NEW: REAL PHOTO badge when current image has real:true */}
                {imageMeta[currentImageIndex]?.real && (
                  <span
                    className="absolute top-4 left-4 bg-emerald-400 text-black text-sm px-3 py-1 font-bold uppercase tracking-wider"
                    style={{ boxShadow: "0 0 12px rgba(16,185,129,0.9)" }}
                  >
                    REAL PHOTO
                  </span>
                )}

                {imageArray.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-0 top-1/2 -translate-y-1/2 px-4 py-8 bg-black/70 border-red-500/50 text-red-500 hover:bg-red-500/20 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-0 top-1/2 -translate-y-1/2 px-4 py-8 bg-black/70 border-red-500/50 text-red-500 hover:bg-red-500/20 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {imageArray.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {imageArray.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 transition-all ${
                          index === currentImageIndex
                            ? "bg-gradient-to-r from-red-500 to-red-900 w-8"
                            : "bg-gray-700 w-2 hover:bg-gray-500"
                        }`}
                        style={{
                          boxShadow:
                            index === currentImageIndex
                              ? "0 0 10px rgba(255,0,255,0.8)"
                              : "none",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {imageArray.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {imageArray.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-28 overflow-hidden transition-all border-2 ${
                        index === currentImageIndex
                          ? "border-red-500 opacity-100"
                          : "border-gray-800 opacity-60 hover:opacity-100 hover:border-red-500/50"
                      }`}
                      style={{
                        boxShadow:
                          index === currentImageIndex
                            ? "0 0 15px rgba(255,0,255,0.6)"
                            : "none",
                      }}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Rates */}
              <div className="bg-[#150505]/90 border border-red-600/30 p-6 shadow-[0_0_20px_rgba(255,40,40,0.2)]">
                <h3 className="text-center text-red-400 font-bold text-xl mb-4 uppercase tracking-widest">
                  Rates
                </h3>
                <div className="flex justify-evenly text-center">
                  <div>
                    <p className="text-gray-400 text-xl mb-2">30 MIN</p>
                    <p className="text-3xl font-bold text-white">
                      {typeof model.rates?.min30 === "number" ? `$${model.rates.min30}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xl mb-2">45 MIN</p>
                    <p className="text-3xl font-bold text-white">
                      {typeof model.rates?.min45 === "number" ? `$${model.rates.min45}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xl mb-2">60 MIN</p>
                    <p className="text-3xl font-bold text-white">
                      {typeof model.rates?.min60 === "number" ? `$${model.rates.min60}` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Info */}
            <div className="space-y-6">
              <div className="px-4 mb-6 flex flex-col items-center text-center">
                <h1
                  className="text-5xl font-bold leading-[1.1]"
                  style={{
                    background: "linear-gradient(to right, #ff2b2b, #ff8800)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "0 0 8px rgba(255,60,60,0.9), 0 0 20px rgba(255,100,50,0.8)",
                  }}
                >
                  {model.name}
                </h1>

                {(workingTimeFromState || model.workingTime) && (
                  <p className="text-gray-300 text-3xl mt-4 tracking-wide">
                    {workingTimeFromState || model.workingTime}
                  </p>
                )}
              </div>

              {model.bio && <p className="text-gray-300 leading-relaxed">{model.bio}</p>}

              {/* Details */}
              <div className="bg-gray-900 border border-red-500/30 p-6">
                <h3 className="text-red-700 font-bold text-lg mb-4 uppercase tracking-widest">
                  Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {model.nationality && (
                    <div className="border-b border-gray-800 pb-2">
                      <span className="text-gray-500 uppercase text-lg">Nationality</span>
                      <p className="text-white font-bold text-2xl">{model.nationality}</p>
                    </div>
                  )}
                  {model.height && (
                    <div className="border-b border-gray-800 pb-2">
                      <span className="text-gray-500 uppercase text-lg">Height</span>
                      <p className="text-white font-bold text-2xl">{model.height} cm</p>
                    </div>
                  )}
                  {model.weight && (
                    <div className="border-b border-gray-800 pb-2">
                      <span className="text-gray-500 uppercase text-lg">Weight</span>
                      <p className="text-white font-bold text-2xl">{model.weight} kg</p>
                    </div>
                  )}
                  {model.bust && (
                    <div className="border-b border-gray-800 pb-2">
                      <span className="text-gray-500 uppercase text-lg">Bust</span>
                      <p className="text-white font-bold text-2xl">{model.bust}</p>
                    </div>
                  )}
                  {model.dressSize && (
                    <div className="border-b border-gray-800 pb-2">
                      <span className="text-gray-500 uppercase text-lg">Dress Size</span>
                      <p className="text-white font-bold text-2xl">{model.dressSize}</p>
                    </div>
                  )}
                  {model.figure && (
                    <div className="border-b border-gray-800 pb-2">
                      <span className="text-gray-500 uppercase text-lg">Figure</span>
                      <p className="text-white font-bold text-2xl">{model.figure}</p>
                    </div>
                  )}
                  {model.hair && (
                    <div className="border-b border-gray-800 pb-2">
                      <span className="text-gray-500 uppercase text-lg">Hair</span>
                      <p className="text-white font-bold text-2xl">{model.hair}</p>
                    </div>
                  )}
                  {model.skin && (
                    <div className="border-b border-gray-800 pb-2">
                      <span className="text-gray-500 uppercase text-lg">Skin</span>
                      <p className="text-white font-bold text-2xl">{model.skin}</p>
                    </div>
                  )}
                  {model.tattoos && (
                    <div className="border-b border-gray-800 pb-2">
                      <span className="text-gray-500 uppercase text-lg">Tattoos</span>
                      <p className="text-white font-bold text-2xl">{model.tattoos}</p>
                    </div>
                  )}
                  {model.pubes && (
                    <div className="border-b border-gray-800 pb-2">
                      <span className="text-gray-500 uppercase text-lg">Pubes</span>
                      <p className="text-white font-bold text-2xl">{model.pubes}</p>
                    </div>
                  )}
                </div>
              </div>

              {model.requirements && (
                <div className="bg-red-900/20 border-l-4 border-red-500 pl-4 py-3">
                  <p className="text-red-700 font-bold uppercase text-lg mb-1">Requirements</p>
                  <p className="text-white text-2xl">{model.requirements}</p>
                </div>
              )}

              {/* Available Services */}
              <div className="bg-gray-900 border border-red-500/30 p-6">
                <h3 className="text-red-700 font-bold text-lg mb-4 uppercase tracking-widest">
                  Available Services
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {services.map((service) => (
                    <div
                      key={service.name}
                      className={`flex items-center gap-2 p-3 border transition-all ${
                        service.available
                          ? "bg-red-900/20 border-red-500/50 text-white-500"
                          : "bg-gray-800/50 border-gray-700 text-gray-600"
                      }`}
                    >
                      {service.available ? (
                        <Check className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span
                        className={`text-2xl font-bold uppercase ${
                          service.available ? "" : "line-through"
                        }`}
                      >
                        {service.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Mobile CTA */}
          <div
            className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-red-600/50 z-50"
            style={{ boxShadow: "0 -4px 18px rgba(255,40,40,0.35)" }}
          >
            <a
              href="tel:+61417888123"
              className="w-full flex items-center justify-center gap-3
                bg-gradient-to-b from-red-500 to-red-700
                text-white font-bold py-4 px-6 uppercase tracking-wider
                rounded-md shadow-[0_4px_10px_rgba(255,0,0,0.4)]
                hover:shadow-[0_0_20px_rgba(255,80,0,0.8)]
                hover:from-red-400 hover:to-red-600
                transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              Book Now
            </a>
          </div>
        </div>
      </section>
    </ProfileLayout>
  );
};

export default ModelProfilePage;
