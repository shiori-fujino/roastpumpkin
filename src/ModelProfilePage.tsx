import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Phone, Check, X, ArrowLeft } from 'lucide-react';
import ProfileLayout from './components/ProfileLayout';
import data from './data/data.json';

interface Service {
    name: string;
    available: boolean;
}

interface ModelProfile {
    id: number;
    name: string;
    nationality: string;
    age?: number;
    height?: number;
    weight?: number;
    bust?: string;
    dressSize?: number;
    figure?: string;
    hair?: string;
    skin?: string;
    tattoos?: string;
    pubes?: string;
    requirements?: string;
    image: string;
    images?: string[];
    profileLink: string;
    isNew: boolean;
    filming: boolean;
    cim: boolean;
    dfk: boolean;
    workingTime?: string;
    schedule?: string;
    isAvailableNow?: boolean;
    nextAvailable?: string;
    services?: Service[];
    bio?: string;
}

const ModelProfilePage: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const [model, setModel] = useState<ModelProfile | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        // Fetch model from JSON based on URL parameter
        const allGirls = [
            ...data.models,
            ...(data.rosterToday || []),
            ...(data.rosterTomorrow || []),
        ].filter((g: any) => g && typeof g === 'object' && 'name' in g);

        const found = allGirls.find(
            (g: any) => g.name.toLowerCase() === name?.toLowerCase()
        ) as ModelProfile | undefined;
        setModel(found || null);
    }, [name]);

    if (!model) {
        return (
            <ProfileLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold mb-4"
                            style={{
                                background: 'linear-gradient(to right, #ff00ff, #00ffff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            404
                        </h2>
                        <p className="text-gray-400 text-xl">Girl not found 😢</p>
                    </div>
                </div>
            </ProfileLayout>
        );
    }

    // Handle images array - use images if available, otherwise use single image
    const imageArray = model.images && model.images.length > 0 ? model.images : [model.image];

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === imageArray.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? imageArray.length - 1 : prev - 1
        );
    };

    // Default services if not in JSON
    const defaultServices: Service[] = [
        { name: "BBBJ", available: true },
        { name: "CIM", available: model.cim },
        { name: "DFK", available: model.dfk },
        { name: "69", available: true },
        { name: "Rimming", available: false },
        { name: "Filming", available: model.filming },
        { name: "CBJ", available: true },
        { name: "Massage", available: true },
        { name: "GFE", available: true },
        { name: "PSE", available: false },
        { name: "Double", available: true },
        { name: "Shower Together", available: true },
    ];

    const services = model.services || defaultServices;

    return (
        <ProfileLayout>
            <section className="min-h-screen bg-black relative overflow-hidden py-12">
                {/* Cyberpunk background */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `
      linear-gradient(rgba(255,50,50,0.25) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,120,50,0.2) 1px, transparent 1px)
    `,
                        backgroundSize: '30px 30px',
                    }}
                />

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    {/* Back Button */}
                    <button
                        onClick={() => {
                            // Navigate to home page
                            window.location.hash = '#/';

                            // Wait for navigation and page render, then scroll
                            setTimeout(() => {
                                const rosterSection = document.getElementById('roster');
                                if (rosterSection) {
                                    rosterSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }, 300); // Increased timeout to ensure page loads
                        }}
                        className="inline-flex items-center gap-2 mb-6 px-4 py-2 
               bg-gradient-to-r from-red-600/20 to-red-800/20 
               border border-red-500/50 
               text-red-400 hover:text-red-300
               hover:bg-red-600/30 hover:border-red-400
               transition-all duration-300
               uppercase tracking-wider font-bold text-sm
               shadow-[0_0_15px_rgba(255,40,40,0.3)]
               hover:shadow-[0_0_25px_rgba(255,40,40,0.5)]
               cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back to Roster
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left Column - Image Carousel */}
                        <div className="space-y-6">
                            {/* Main Image */}
                            <div
                                className="relative aspect-[3/4] overflow-hidden border-2 transition-all"
                                style={{
                                    borderColor: "rgba(255, 50, 50, 0.8)",
                                    boxShadow: `
      0 0 25px rgba(255, 40, 40, 0.6),
      0 0 60px rgba(255, 150, 50, 0.25),
      inset 0 0 20px rgba(120, 0, 0, 0.4)
    `,
                                    backgroundColor: "rgba(10, 0, 0, 0.5)", // faint warmth behind the photo
                                }}
                            >
                                <img
                                    src={imageArray[currentImageIndex]}
                                    alt={`${model.name} - Photo ${currentImageIndex + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* NEW Badge */}
                                {model.isNew && (
                                    <span className="absolute top-4 right-4 bg-red-500 text-white text-sm px-3 py-1 font-bold uppercase tracking-wider animate-pulse"
                                        style={{
                                            boxShadow: '0 0 15px rgba(255,0,255,0.8)'
                                        }}
                                    >
                                        NEW
                                    </span>
                                )}

                                {/* Navigation Arrows */}
                                {imageArray.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 px-4 py-8 bg-black/70  border-red-500/50 text-red-500 hover:bg-red-500/20 transition-all"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 px-4 py-8 bg-black/70 border-red-500/50 text-red-500 hover:bg-red-500/20 transition-all"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}

                                {/* Dots Navigation */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {imageArray.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`h-2 transition-all ${index === currentImageIndex
                                                ? 'bg-gradient-to-r from-red-500 to-red-900 w-8'
                                                : 'bg-gray-700 w-2 hover:bg-gray-500'
                                                }`}
                                            style={{
                                                boxShadow: index === currentImageIndex
                                                    ? '0 0 10px rgba(255,0,255,0.8)'
                                                    : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Thumbnail Strip */}
                            {imageArray.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {imageArray.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-28 overflow-hidden transition-all border-2 ${index === currentImageIndex
                                                ? 'border-red-500 opacity-100'
                                                : 'border-gray-800 opacity-60 hover:opacity-100 hover:border-red-500/50'
                                                }`}
                                            style={{
                                                boxShadow: index === currentImageIndex
                                                    ? '0 0 15px rgba(255,0,255,0.6)'
                                                    : 'none'
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Rates */}
                            <div className="bg-[#150505]/90 border border-red-600/30 p-6 shadow-[0_0_20px_rgba(255,40,40,0.2)]">
                                <h3 className="text-center text-red-400 font-bold text-xl mb-4 uppercase tracking-widest">Rates</h3>
                                <div className="flex justify-evenly text-center">
                                    <div>
                                        <p className="text-gray-400 text-xl mb-2">30 MIN</p>
                                        <p className="text-3xl font-bold text-white">$180</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xl mb-2">45 MIN</p>
                                        <p className="text-3xl font-bold text-white">$250</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xl mb-2">60 MIN</p>
                                        <p className="text-3xl font-bold text-white">$320</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Info */}
                        <div className="space-y-6">

                            {/* Name + Availability */}
                            <div className="px-4 mb-6 flex flex-col items-center text-center">

                                {/* Top row: nationality + name */}
                                <div className="flex items-baseline gap-3 flex-wrap">


                                    <h1
                                        className="text-5xl font-bold leading-[1.1]"
                                        style={{
                                            background: "linear-gradient(to right, #ff2b2b, #ff8800)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            textShadow: "0 0 8px rgba(255,60,60,0.9), 0 0 20px rgba(255,100,50,0.8)",
                                        }}
                                    >
                                        {model.name}
                                    </h1>
                                </div>

                                {/* Working hours (if exists) */}
                                {model.workingTime && (
                                    <p className="text-gray-300 text-3xl mt-4 tracking-wide">
                                        {model.workingTime}
                                    </p>
                                )}

                                {/* Availability line */}
                                {model.isAvailableNow ? (
                                    <div className="text-5xl mt-4 font-bold text-red-400">
                                        <span className="animate-glow">AVAILABLE NOW</span>
                                    </div>
                                ) : model.nextAvailable ? (
                                    <div className="text-3xl mt-2 font-bold text-red-400">
                                        NEXT AVAILABLE: {model.nextAvailable}
                                    </div>
                                ) : null}
                            </div>


                            {/* Bio */}
                            {model.bio && (
                                <p className="text-gray-300 leading-relaxed">
                                    {model.bio}
                                </p>
                            )}





                            {/* Details */}
                            <div className="bg-gray-900 border border-red-500/30 p-6">
                                <h3 className="text-red-700 font-bold text-lg mb-4 uppercase tracking-widest">
                                    Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {model.nationality && (
                                        <div className="border-b border-gray-800 pb-2">
                                            <span className="text-gray-500 uppercase text-lg">Nationality</span>
                                            <p className="text-white font-bold text-2xl">{model.nationality}</p>
                                        </div>
                                    )}
                                    {model.height && (
                                        <div className="border-b border-gray-800 pb-2">
                                            <span className="text-gray-500 uppercase text-lg">Height</span>
                                            <p className="text-white font-bold text-2xl">{model.height} cm</p>
                                        </div>
                                    )}
                                    {model.weight && (
                                        <div className="border-b border-gray-800 pb-2">
                                            <span className="text-gray-500 uppercase text-lg">Weight</span>
                                            <p className="text-white font-bold text-2xl">{model.weight} kg</p>
                                        </div>
                                    )}
                                    {model.bust && (
                                        <div className="border-b border-gray-800 pb-2">
                                            <span className="text-gray-500 uppercase text-lg">Bust</span>
                                            <p className="text-white font-bold text-2xl">{model.bust}</p>
                                        </div>
                                    )}
                                    {model.dressSize && (
                                        <div className="border-b border-gray-800 pb-2">
                                            <span className="text-gray-500 uppercase text-lg">Dress Size</span>
                                            <p className="text-white font-bold text-2xl">{model.dressSize}</p>
                                        </div>
                                    )}
                                    {model.figure && (
                                        <div className="border-b border-gray-800 pb-2">
                                            <span className="text-gray-500 uppercase text-lg">Figure</span>
                                            <p className="text-white font-bold text-2xl">{model.figure}</p>
                                        </div>
                                    )}
                                    {model.hair && (
                                        <div className="border-b border-gray-800 pb-2">
                                            <span className="text-gray-500 uppercase text-lg">Hair</span>
                                            <p className="text-white font-bold text-2xl">{model.hair}</p>
                                        </div>
                                    )}
                                    {model.skin && (
                                        <div className="border-b border-gray-800 pb-2">
                                            <span className="text-gray-500 uppercase text-lg">Skin</span>
                                            <p className="text-white font-bold text-2xl">{model.skin}</p>
                                        </div>
                                    )}
                                    {model.tattoos && (
                                        <div className="border-b border-gray-800 pb-2">
                                            <span className="text-gray-500 uppercase text-lg">Tattoos</span>
                                            <p className="text-white font-bold text-2xl">{model.tattoos}</p>
                                        </div>
                                    )}
                                    {model.pubes && (
                                        <div className="border-b border-gray-800 pb-2">
                                            <span className="text-gray-500 uppercase text-lg">Pubes</span>
                                            <p className="text-white font-bold text-2xl">{model.pubes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Requirements */}
                            {model.requirements && (
                                <div className="bg-red-900/20 border-l-4 border-red-500 pl-4 py-3">
                                    <p className="text-red-700 font-bold uppercase text-lg mb-1">Requirements</p>
                                    <p className="text-white text-2xl">{model.requirements}</p>
                                </div>
                            )}

                            {/* Available Services */}
                            <div className="bg-gray-900 border border-red-500/30 p-6">
                                <h3 className="text-red-700 font-bold text-lg mb-4 uppercase tracking-widest">
                                    Available Services
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {services.map((service) => (
                                        <div
                                            key={service.name}
                                            className={`flex items-center gap-2 p-3 border transition-all ${service.available
                                                ? 'bg-green-900/20 border-red-500/50 text-red-400'
                                                : 'bg-gray-800/50 border-gray-700 text-gray-600'
                                                }`}
                                        >
                                            {service.available ? (
                                                <Check className="w-4 h-4 flex-shrink-0" />
                                            ) : (
                                                <X className="w-4 h-4 flex-shrink-0" />
                                            )}
                                            <span className={`text-2xl font-bold uppercase ${service.available ? '' : 'line-through'
                                                }`}>
                                                {service.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Sticky Mobile CTA */}
                    <div
                        className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-red-600/50 z-50"
                        style={{
                            boxShadow: "0 -4px 18px rgba(255,40,40,0.35)"
                        }}
                    >
                        <a
                            href="tel:+61417888123"
                            className="w-full flex items-center justify-center gap-3
             bg-gradient-to-b from-red-500 to-red-700
             text-white font-bold py-4 px-6 uppercase tracking-wider
             rounded-md shadow-[0_4px_10px_rgba(255,0,0,0.4)]
             hover:shadow-[0_0_20px_rgba(255,80,0,0.8)]
             hover:from-red-400 hover:to-red-600
             transition-all duration-300"
                        >
                            <Phone className="w-5 h-5" />
                            Book Now
                        </a>
                    </div>
                </div>
            </section>
        </ProfileLayout>
    );
};

export default ModelProfilePage;