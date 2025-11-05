import React from 'react';
import { ArrowLeft, Phone } from 'lucide-react';
import ProfileLayout from './components/ProfileLayout';

const RatesPage: React.FC = () => {
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

                    {/* Main Content - Conversational Style */}
                    <div className="space-y-12 text-gray-300 leading-relaxed">
                        {/* Pricing section */}
                        <div>
                            <h2 className="text-3xl text-red-700 mb-6 font-light">
                                About Our Pricing
                            </h2>

                            <p className="text-xl mb-6 leading-relaxed">
                                Our rates vary depending on which lady you'd like to spend time with,
                                and the services you're interested in. Think of it as... everyone has
                                their own style, their own preferences.
                            </p>

                            <p className="text-xl mb-8 leading-relaxed">
                                As a general guide, our rates typically range:
                            </p>

                            {/* Rates - Clean Typography */}
                            <div className="space-y-4 mb-8 ml-8">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-2xl text-red-500 font-light">30 minutes</span>
                                    <span className="text-xl text-gray-500">—</span>
                                    <span className="text-2xl text-white">$160 to $250</span>
                                </div>

                                <div className="flex items-baseline gap-4">
                                    <span className="text-2xl text-red-500 font-light">45 minutes</span>
                                    <span className="text-xl text-gray-500">—</span>
                                    <span className="text-2xl text-white">$220 to $300</span>
                                </div>

                                <div className="flex items-baseline gap-4">
                                    <span className="text-2xl text-red-500 font-light">60 minutes</span>
                                    <span className="text-xl text-gray-500">—</span>
                                    <span className="text-2xl text-white">$270 to $500</span>
                                </div>
                            </div>

                            <p className="text-xl leading-relaxed text-gray-400 italic">
                                But here's the thing.. when you call, we'll give you the exact rate
                                for the lady you're interested in. Much easier that way, don't you think?
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-12">
                            
                        </div>

                        {/* Service Information */}
                        <div>
                            <h2 className="text-3xl text-red-700 mb-6 font-light">
                                How We Operate
                            </h2>

                            <p className="text-xl mb-6 leading-relaxed">
                                All our ladies are independent service providers. We're a legal establishment —
                                we simply provide the space, and they run their own business.
                            </p>

                            <p className="text-xl mb-6 leading-relaxed">
                                What does that mean for you? Well, when you meet your chosen lady,
                                feel free to have a conversation with her about what you're looking for.
                                She'll let you know what she offers and her rates for those services.
                            </p>

                            <p className="text-xl leading-relaxed text-gray-400">
                                The rates we mentioned above? Those are just guides.
                                Each lady sets her own pricing based on what she provides.
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-12">
                       
                        </div>

                        {/* Closing CTA */}
                        <div className="text-center py-12">
                            <p className="text-2xl text-gray-400 mb-8">
                                Any questions? Just give us a call.
                            </p>


                            <a href="tel:+61417888123"
                                className="inline-flex items-center gap-3 text-2xl text-red-500 hover:text-red-300 transition-all duration-300"
                            >
                                <Phone className="w-6 h-6" />
                                0417 888 123
                            </a>

                            <p className="text-gray-500 mt-4">
                                We're here to help.
                            </p>
                        </div>

                    </div>
                </div>
            </section>
        </ProfileLayout>
    );
};

export default RatesPage;