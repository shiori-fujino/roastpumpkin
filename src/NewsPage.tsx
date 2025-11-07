import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ProfileLayout from './components/ProfileLayout';
import data from './data/data.json';

interface NewsItem {
  date: string;
  title: string;
  body: string;
}

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Sort by date descending (newest first)
    const sorted = [...data.news].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setNews(sorted);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => {
              window.location.hash = '#/';
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
                background: 'linear-gradient(to right, #ff2b2b, #ff8800)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 8px rgba(255,60,60,0.9), 0 0 20px rgba(255,100,50,0.8)',
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
            {news.map((item, index) => (
              <a 
                key={index}
                href={`/#/news/${index}`}
                className="group block"
              >
                <div className="flex items-baseline py-6 border-b border-red-900/20 hover:border-red-500/30 transition-all">
                  {/* Date */}
                  <time className="text-red-400 text-lg font-light min-w-[120px] group-hover:text-red-300 transition-colors">
                    {formatDate(item.date)}
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
              </a>
            ))}
          </div>

          {/* Bottom spacing */}
          <div className="h-12"></div>
        </div>
      </section>
    </ProfileLayout>
  );
};

export default NewsPage;