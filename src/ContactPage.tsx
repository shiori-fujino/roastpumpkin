import React from 'react';
import { ArrowLeft, Phone, MapPin, Briefcase } from 'lucide-react';
import ProfileLayout from './components/ProfileLayout';

const ContactPage: React.FC = () => {
  return (
    <ProfileLayout>
      <section className="relative  bg-black overflow-hidden py-12">

        {/* Red grid glow */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,50,50,0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,80,50,0.25) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6">

          {/* Back */}
          <button
            onClick={() => (window.location.hash = '/')}
            className="inline-flex items-center gap-2 mb-12 text-sm text-red-400 hover:text-red-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>


          {/* Phone */}
          <div className="text-center space-y-3 my-16">
            <div className="flex items-center justify-center gap-2 text-red-500">
              <Phone className="w-6 h-6" />
              <h2 className="text-2xl font-light">Call Us</h2>
            </div>
            <a
              href="tel:+61417888123"
              className="block hover:text-red-500 text-xl text-center"
              style={{ textShadow: '0 0 10px rgba(255,60,60,0.6)' }}
            >
              0417 888 123
            </a>
            <p className="text-gray-400">Open 7 Days — 10am to 3am</p>
          </div>

          {/* Address */}
          <div className="text-center space-y-3 mb-16">
            <div className="flex items-center justify-center gap-2 text-red-500">
              <MapPin className="w-6 h-6" />
              <h2 className="text-2xl font-light">Visit Us</h2>
            </div>
            <a
              href="https://www.google.com/maps/dir//5+Gerald+Street,+Marrickville+NSW+2204"
              target="_blank"
              className="block hover:text-red-500 text-xl text-center"
            >
              5 Gerald Street, Marrickville<br></br>
              NSW 2204 Sydney, Australia</a>
          </div>

          {/* Join Us */}
          <div className="text-center space-y-3 mb-16">
            <div className="flex items-center justify-center gap-2 text-red-500">
              <Briefcase className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-light">Work With Us</h2>
            </div>
            <p className="text-xl hover:text-red-500 transition animate-pulse">We’re hiring</p>
            <a href="#" className="text-red-400 mt-4">Learn more →</a>

        </div>

      </div>
    </section>
    </ProfileLayout >
  );
};

export default ContactPage;
