import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import BannerSwipe from "./components/BannerSwipe";
import RosterGrid from "./components/RosterGrid";

/* ---------------- Types ---------------- */

interface NewsItem {
  id: number;
  title: string;
  publish_date: string;
  is_public: boolean;
  media: { id: number; file_url: string; file_type: string }[];
}

interface Banner {
  id: number;
  image: string;
  title: string;
  newsId?: number;
}

/* ---------------- API ---------------- */

const NEWS_URL = "/api/news/";

/* ---------------- Helpers ---------------- */

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${res.statusText}`);
  return res.json();
}

function scrollContainerToRoster(): boolean {
  const container = document.getElementById("app-scroll");
  const roster = document.getElementById("roster");
  if (!container || !roster) return false;

  const cRect = container.getBoundingClientRect();
  const rRect = roster.getBoundingClientRect();
  const top = container.scrollTop + (rRect.top - cRect.top);

  container.scrollTo({ top, behavior: "smooth" });
  return true;
}

/* ---------------- Component ---------------- */

const Homepage: React.FC = () => {
  const location = useLocation();
  const [banners, setBanners] = useState<Banner[]>([]);

  // Scroll to roster (hash or state)
  useEffect(() => {
    const shouldGoRoster =
      location.hash === "#roster" || location.state?.scrollTo === "roster";
    if (!shouldGoRoster) return;

    let tries = 0;

    const tick = () => {
      tries += 1;
      const ok = scrollContainerToRoster(); // ✅ re-check each frame
      if (!ok && tries < 5) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [location.hash, location.state]);

  // Fetch news banners
  useEffect(() => {
    let cancelled = false;

    fetchJson<NewsItem[]>(NEWS_URL)
      .then((items) => {
        if (cancelled) return;

        const mapped: Banner[] = (items || [])
          .filter((x) => x.is_public)
          .sort((a, b) => +new Date(b.publish_date) - +new Date(a.publish_date))
          .map((x) => ({
            id: x.id,
            image: x.media?.[0]?.file_url || "",
            title: x.title,
            newsId: x.id,
          }))
          .filter((b) => b.image);

        setBanners(mapped);
      })
      .catch((err) => console.error("Failed to load news banners", err));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      {/* Banner */}
      <section className="min-h-screen">
        {banners.length > 0 ? (
          <BannerSwipe banners={banners} />
        ) : (
          <div className="min-h-screen w-full bg-black" />
        )}
      </section>

      {/* Roster */}
      <section id="roster" className="min-h-screen">
        <RosterGrid />
      </section>
    </Layout>
  );
};

export default Homepage;
