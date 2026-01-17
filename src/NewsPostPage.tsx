import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ProfileLayout from "./components/ProfileLayout";
import { ArrowLeft } from "lucide-react";

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

const NEWS_URL = "/api/news/";

const NewsPostPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const newsId = Number(id);

  const [post, setPost] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!newsId || Number.isNaN(newsId)) {
      setErrorMsg("Invalid news id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    fetch(NEWS_URL)
      .then((res) => res.json())
      .then((items: NewsItem[]) => {
        const found = items.find((x) => x.id === newsId && x.is_public);
        if (!found) {
          setPost(null);
          setErrorMsg("News post not found.");
        } else {
          setPost(found);
        }
      })
      .catch((err) => {
        console.error("Failed to load news post", err);
        setErrorMsg("Failed to load news post.");
      })
      .finally(() => setLoading(false));
  }, [newsId]);


  return (
    <ProfileLayout>
      <section className="bg-black text-white relative overflow-hidden">
        {/* Back button (same vibe as NewsPage) */}
        <div className="p-6">
          <button
            onClick={() => navigate("/news")}
            className="inline-flex items-center gap-2 text-red-400 hover:text-red-300
              transition-all duration-300 uppercase tracking-wider text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {loading && (
          <div className="px-6 pb-12">
            <p className="opacity-70">Loading…</p>
          </div>
        )}

        {!loading && errorMsg && (
          <div className="px-6 pb-12">
            <Link to="/news" className="text-white/70 hover:text-white">
              ← Back to News
            </Link>
            <p className="mt-6 text-red-300">{errorMsg}</p>
          </div>
        )}

        {!loading && !errorMsg && post && (
          <>

            <div className="p-6 max-w-3xl">
              <h1 className="text-3xl font-bold">{post.title}</h1>

              <p className="mt-2 text-white/60 text-sm">
                {new Date(post.publish_date).toLocaleDateString("en-AU", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>

              <div className="my-10 whitespace-pre-line text-white/90 leading-relaxed">
                {post.content}
              </div>
            </div>
          </>
        )}
      </section>
    </ProfileLayout>
  );
};

export default NewsPostPage;
