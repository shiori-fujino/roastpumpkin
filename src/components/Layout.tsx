import React from 'react';
import { Phone, MapPin, Clock, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main content */}
      <main className="h-screen overflow-y-scroll snap-y snap-mandatory">
        {children}

        {/* Footer - inside snap container */}
        <footer
          className="snap-start relative bg-black py-12 min-h-screen flex items-center"
          style={{
            boxShadow: "0 -8px 12px rgba(255,60,60,0.15)" // layered glow
          }}
        >
          <div className="relative z-10 max-w-screen-xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Quick Links */}
              <div>
                <h3 className="text-red-700 font-bold text-lg mb-4 flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  QUICK LINKS
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/rates"
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Rates & Services
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#roster"
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Roster
                    </a>
                  </li>
                  <li>
                    <Link
                      to="/news"
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      News
                    </Link>
                  </li>
                </ul>
              </div>



              {/* Location */}
              <div>
                <h3 className="text-red-700 font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  LOCATION
                </h3>
                <a href="https://www.google.com/maps/dir//Sydenham+Station,+Marrickville+NSW+2204"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-colors block"
                >                  Near Sydenham Station<br />
                  Marrickville, NSW 2204<br />
                  Sydney, Australia
                </a>
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

              {/* Contact */}
              <div>
                <h3 className="text-red-700 font-bold text-lg mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  CONTACT
                </h3>
                <a
                  href="tel:+61417888123"
                  className="text-2xl font-bold text-white hover:text-red-500 transition-colors"
                  style={{
                    textShadow: '0 0 10px rgba(255,40,40,0.9)'
                  }}
                >
                  0417 888 123
                </a>
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

export default Layout;