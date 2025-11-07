import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProfileLayout from './components/ProfileLayout';
import data from './data/data.json';

interface NewsItem {
  date: string;
  title: string;
  body: string;
}

const NewsPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);

  useEffect(() => {
    if (id) {
      const index = parseInt(id);
      const sorted = [...data.news].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setNewsItem(sorted[index] || null);
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!newsItem) {
    return (
      <ProfileLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h2
              className="text-6xl font-bold mb-4"
              style={{
                background: 'linear-gradient(to right, #ff2b2b, #ff8800)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 8px rgba(255,60,60,0.9)',
              }}
            >
              404
            </h2>
            <p className="text-gray-400 text-2xl mb-6">Article not found</p>
            <a 
              href="/#/news"
              className="text-red-400 hover:text-red-300 transition-colors text-lg"
            >
              ← Back to news
            </a>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <section className="min-h-screen bg-black relative overflow-hidden py-12">
        {/* Subtle warm ambiance */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,50,50,0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,120,50,0.2) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => {
              window.location.hash = '#/news';
            }}
            className="inline-flex items-center gap-2 mb-12 px-4 py-2 
               text-red-400 hover:text-red-300
               transition-all duration-300
               uppercase tracking-wider text-sm
               cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </button>

          {/* Article */}
          <article className="space-y-8">
            {/* Date */}
            <time className="block text-red-400 text-lg font-light">
              {formatDate(newsItem.date)}
            </time>

            {/* Title */}
            <h1
              className="text-2xl font-bold leading-tight"
              style={{
                background: 'linear-gradient(to right, #ff2b2b, #ff8800)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 8px rgba(255,60,60,0.9), 0 0 20px rgba(255,100,50,0.8)',
              }}
            >
              {newsItem.title}
            </h1>

            {/* Body Content */}
            <div 
              className="prose prose-invert prose-lg max-w-none
                prose-p:text-gray-300 prose-p:text-xl prose-p:leading-relaxed
                prose-img:rounded-none prose-img:my-8
                prose-figcaption:text-gray-500 prose-figcaption:text-center
                prose-figure:my-8"
              dangerouslySetInnerHTML={{ __html: newsItem.body }}
            />
          </article>

          {/* Bottom spacing */}
          <div className="h-12"></div>
        </div>
      </section>
    </ProfileLayout>
  );
};

export default NewsPostPage;