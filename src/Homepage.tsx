import React from 'react';
import Layout from './components/Layout';
import BannerSwipe from './components/BannerSwipe';
import RosterGrid from './components/RosterGrid';
import GirlsCarousel from './components/GirlsCarousel';
import data from './data/data.json';

const Homepage: React.FC = () => {
  return (
    <Layout>
      {/* Section 1: News Banner - fullscreen, auto-swipe */}
      <div className="snap-start h-screen">
        <BannerSwipe banners={data.banners} />
      </div>

      {/* Section 2: Roster Grid - 2x3 grid with batches */}
      <div className="snap-start min-h-screen">
        <RosterGrid 
          rosterToday={data.rosterToday} 
          rosterTomorrow={data.rosterTomorrow}
        />
      </div>

      {/* Section 3: Our Girls Carousel - 3D card stack + Netflix */}
      <div className="snap-start min-h-screen">
        <GirlsCarousel models={data.models} />
      </div>
    </Layout>
  );
};

export default Homepage;