import React from 'react';
import { Phone, MapPin, Clock, Link2 } from 'lucide-react';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main content - NO SNAP SCROLLING */}
      <main className="overflow-y-auto">
        {children}
        
        {/* Footer - normal flow */}
        <footer className="relative bg-black border-t border-red-500/50 py-12 min-h-screen flex items-center"
  style={{
    boxShadow: "0 -10px 12px rgba(255,60,60,0.15)" // layered glow
  }}
>
        {/* Background effect */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,0,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />

        <div className="relative z-10 max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-red-700 font-bold text-lg mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                QUICK LINKS
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/#/rates"
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Rates & Services
                  </a>
                </li>
                <li>
                  <a 
                    href="/#/contact"
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a 
                    href="/#roster"
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Roster
                  </a>
                </li>
                <li>
                  <a 
                    href="/#/news"
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    News
                  </a>
                </li>
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h3 className="text-red-700 font-bold text-lg mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                CONTACT
              </h3>
              <a 
                href="tel:+61417888123"
                className="text-2xl font-bold text-white hover:text-cyan-400 transition-colors"
                style={{
                  textShadow: '0 0 10px rgba(0,255,255,0.8)'
                }}
              >
                0417 888 123
              </a>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-red-700 font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                LOCATION
              </h3>
              <p className="text-gray-400">
                Near Sydenham Station<br />
                Marrickville, NSW 2204<br />
                Sydney, Australia
              </p>
            </div>

            {/* Hours */}
            <div>
              <h3 className="text-red-700 font-bold text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                HOURS
              </h3>
              <p className="text-gray-400">
                Open 7 Days<br />
                10:00 AM - 3:00 AM
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-red-500 via-red-700 to-red-900 opacity-30 mb-8" />

          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm">
              © 2025 The Rotisserie. All rights reserved.
            </div>
          </div>
        </div>

        {/* Neon glow effect */}
        <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 blur-sm" />
      </footer>
      </main>
    </div>
  );
};

export default ProfileLayout;
