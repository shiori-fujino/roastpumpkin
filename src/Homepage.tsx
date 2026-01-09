import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import BannerSwipe from "./components/BannerSwipe";
import RosterGrid from "./components/RosterGrid";
import data from "./data/data.json";

/* ---------------- Types ---------------- */

interface NewsItem {
  id: number;
  title: string;
  publish_date: string;
  is_public: boolean;
  content: string;
  media: {
    id: number;
    file_url: string;
    file_type: string;
  }[];
}

interface Banner {
  id: number;
  image: string;
  title: string;
  newsId?: number;
}

/* ---------------- Component ---------------- */

const Homepage: React.FC = () => {
  const location = useLocation();
  const [banners, setBanners] = useState<Banner[]>([]);

  // Scroll to roster if requested
  useEffect(() => {
    if (location.state?.scrollTo === "roster") {
      const el = document.getElementById("roster");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.state]);

  // Fetch news banners
  useEffect(() => {
    fetch("/api/uuozkzutzpgf/news/")
      .then((res) => res.json())
      .then((items: NewsItem[]) => {
        const mapped: Banner[] = items
          .filter((x) => x.is_public)
          .sort(
            (a, b) =>
              +new Date(b.publish_date) - +new Date(a.publish_date)
          )
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
  }, []);

  return (
    <Layout>
      {/* Section 1: Banner */}
      <div className="snap-start h-screen">
        {banners.length > 0 ? (
          <BannerSwipe banners={banners} />
        ) : (
          <div className="h-screen w-full bg-black" />
        )}
      </div>

      {/* Section 2: Roster Grid */}
      <div id="roster" className="snap-start min-h-screen">
        <RosterGrid
          rosterToday={data.rosterToday}
          rosterTomorrow={data.rosterTomorrow}
        />
      </div>

      {/*
      Section 3 – disabled for now
      <div className="snap-start min-h-screen">
        <GirlsCarousel models={data.models} />
      </div>
      */}
    </Layout>
  );
};

export default Homepage;
