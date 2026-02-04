import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Play, Timer, Heart, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>FastAndYoga - Intermittent Fasting & Yoga App | Track Your Wellness Journey</title>
        <meta name="description" content="Transform your health with FastAndYoga. Track intermittent fasting, practice guided yoga, calculate BMR, and achieve your wellness goals. Start your free journey today!" />
        <meta name="keywords" content="intermittent fasting, yoga app, wellness tracker, BMR calculator, fasting timer, health app, weight loss, mindfulness" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://www.fastandyoga.com/" />

        {/* Open Graph for Social Sharing */}
        <meta property="og:title" content="FastAndYoga - Your Personal Fasting & Yoga Companion" />
        <meta property="og:description" content="Join thousands who transformed their health with intermittent fasting and yoga. Free tools, guided sessions, and progress tracking." />
        <meta property="og:image" content="https://www.fastandyoga.com/og-image.jpg" />
        <meta property="og:url" content="https://www.fastandyoga.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="FastAndYoga" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FastAndYoga - Transform Your Health Today" />
        <meta name="twitter:description" content="Free intermittent fasting tracker with guided yoga sessions. Start your wellness journey now!" />
        <meta name="twitter:image" content="https://www.fastandyoga.com/twitter-image.jpg" />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="FastAndYoga Team" />
        <meta name="language" content="en" />
        <meta name="revisit-after" content="7 days" />

        {/* Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "FastAndYoga",
            "description": "Intermittent fasting and yoga tracking application",
            "url": "https://www.fastandyoga.com",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section - Focused on Login/Signup */}
        <section className="relative py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your Health with
              <span className="text-blue-600 block">Fasting & Yoga</span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
              Join thousands who've transformed their lives through intermittent fasting and mindful yoga practice. Start your free wellness journey today.
            </p>

            {/* CTA Buttons */}
            <div className="space-y-4 mb-16">
              {isAuthenticated ? (
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={handleGetStarted}
                    className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Start Free Today
                  </button>
                  <Link 
                    to="/login" 
                    className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              )}
           
            </div>
          </div>
        </section>

        {/* Key Features Preview - Minimal but Compelling */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Everything You Need to Succeed
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                <Timer className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Smart Fasting Timer</h3>
                <p className="text-gray-600 mb-4">Track your fasting windows with precision and get personalized insights.</p>
                <span className="text-blue-600 font-medium">Login to explore →</span>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                <Play className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Guided Yoga</h3>
                <p className="text-gray-600 mb-4">Access expert-led yoga sessions for all levels and goals.</p>
                <span className="text-green-600 font-medium">Login to practice →</span>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Health Insights</h3>
                <p className="text-gray-600 mb-4">Monitor your progress with BMR calculator and wellness metrics.</p>
                <span className="text-purple-600 font-medium">Login to track →</span>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              Loved by Wellness Enthusiasts Worldwide
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-gray-700 mb-4 italic">
                  "FastAndYoga helped me lose 15 pounds and find inner peace. The combination of fasting tracking and yoga is perfect!"
                </p>
                <div className="font-semibold text-gray-900">- Suraj Sharma.</div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-gray-700 mb-4 italic">
                  "Finally, an app that understands both my body and mind. The yoga sessions perfectly complement my fasting routine."
                </p>
                <div className="font-semibold text-gray-900">- Likitha.</div>
              </div>
            </div>

            {!isAuthenticated && (
              <button 
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Join Our Community Today
              </button>
            )}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands who've already started their wellness journey. It's completely free to begin.
            </p>
            
            {!isAuthenticated && (
              <div className="space-y-4">
                <button 
                  onClick={handleGetStarted}
                  className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg mr-4"
                >
                  Create Free Account
                </button>
                <Link 
                  to="/login" 
                  className="text-white border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all inline-block"
                >
                  I Have an Account
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
