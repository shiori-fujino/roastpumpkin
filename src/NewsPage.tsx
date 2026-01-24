import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Layout from "./components/Layout";
import { Link, useNavigate } from "react-router-dom";

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

// IMPORTANT: use the same proxy pattern as roster/providers
const NEWS_URL = "/api/news/";

/* ---------------- Component ---------------- */

const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch(NEWS_URL)
      .then((res) => res.json())
      .then((items: NewsItem[]) => {
        const sorted = items
          .filter((x) => x.is_public)
          .sort(
            (a, b) =>
              +new Date(b.publish_date) -
              +new Date(a.publish_date)
          );

        setNews(sorted);
      })
      .catch((err) => {
        console.error("Failed to load news", err);
      });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <section className="min-h-screen bg-black relative overflow-hidden py-12">
        {/* Subtle warm ambiance */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,50,50,0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,120,50,0.2) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => {
              window.history.replaceState(
                null,
                "",
                window.location.pathname
              );
              navigate("/");
            }}
            className="inline-flex items-center gap-2 mb-12 px-4 py-2 
              text-red-400 hover:text-red-300
              transition-all duration-300
              uppercase tracking-wider text-sm
              cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Header */}
          <div className="text-center mb-16">
            <h1
              className="text-3xl font-bold mb-6"
              style={{
                background: "linear-gradient(to right, #ff2b2b, #ff8800)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow:
                  "0 0 8px rgba(255,60,60,0.9), 0 0 20px rgba(255,100,50,0.8)",
              }}
            >
              News & Updates
            </h1>
            <p className="text-xl text-gray-400">
              Stay informed with our latest announcements.
            </p>
          </div>

          {/* News List */}
          <div className="space-y-6">
            {news.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="group block"
              >
                <div className="flex items-baseline py-6 border-b border-red-900/20 hover:border-red-500/30 transition-all">
                  {/* Date */}
                  <time className="text-red-400 text-lg font-light min-w-[120px] group-hover:text-red-300 transition-colors">
                    {formatDate(item.publish_date)}
                  </time>

                  {/* Title */}
                  <h2 className="text-white text-lg font-light flex-1 group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h2>

                  {/* Arrow */}
                  <span className="text-red-400 text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="h-12" />
        </div>
      </section>
    </Layout>
  );
};

export default NewsPage;
