// Enhanced Header Component with Better Mobile Discovery & Health Calculator
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

const NavigationLink = ({ to, children, isSpecial = false, description = '' }) => {
  if (isSpecial) {
    return (
      <Link
        to={to}
        className="relative group px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        style={{
          boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
        }}
      >
        <span className="relative z-10 flex items-center">
          💖 {children}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200 rounded-md hover:bg-gray-50"
    >
      {children}
    </Link>
  );
};

const MobileNavigationCard = ({ to, title, description, icon, isSpecial = false, onClick }) => {
  if (isSpecial) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="block p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        <div className="flex items-center text-white">
          <span className="text-2xl mr-3">{icon}</span>
          <div>
            <h3 className="font-bold text-base">{title}</h3>
            <p className="text-sm text-pink-100 mt-1">{description}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className="block p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-300 active:scale-95"
    >
      <div className="flex items-center">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-800 text-base">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
};

// Updated navigation links with Health Calculator and descriptions
const NAVIGATION_LINKS = [
  { 
    to: '/dashboard', 
    label: 'Dashboard',
    icon: '📊',
    description: 'View your progress and stats'
  },
  { 
    to: '/fasting-timer', 
    label: 'Fasting Timer',
    icon: '⏰',
    description: 'Track your fasting periods'
  },
  { 
    to: '/yoga-exercises', 
    label: 'Yoga Exercises',
    icon: '🧘‍♀️',
    description: 'Guided yoga sessions'
  },
  { 
    to: '/health-calculator', 
    label: 'Health Calculator',
    icon: '🏥',
    description: 'Get personalized fasting, calories, steps & exercise recommendations'
  },
  { 
    to: '/health-benefits', 
    label: 'Health Benefits',
    icon: '💪',
    description: 'Learn about wellness benefits'
  }
];

const DONATION_LINK = { 
  to: '/donation', 
  label: 'Support Us', 
  icon: '💖',
  description: 'Help keep this app running',
  isSpecial: true 
};

const Navigation = ({ links, donationLink }) => (
  <div className="hidden md:flex items-center space-x-6">
    {links.map(({ to, label }) => (
      <NavigationLink key={to} to={to}>
        {label}
      </NavigationLink>
    ))}
    <NavigationLink 
      key={donationLink.to} 
      to={donationLink.to} 
      isSpecial={donationLink.isSpecial}
    >
      {donationLink.label}
    </NavigationLink>
  </div>
);

const MobileMenu = ({ links, donationLink, isOpen, toggleMenu }) => {
  // Close menu when a link is clicked
  const handleLinkClick = () => {
    toggleMenu();
  };

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="text-gray-600 hover:text-blue-600 focus:outline-none focus:text-blue-600 relative z-50"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      
      {/* Enhanced Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu}>
          <div 
            className="absolute top-0 right-0 left-0 bg-gray-50 z-50 min-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Large Close Button at Top */}
            <div className="sticky top-0 bg-white shadow-md z-10 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Menu</h2>
              <button
                onClick={toggleMenu}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors duration-200"
                aria-label="Close menu"
              >
                <svg 
                  className="h-7 w-7 text-gray-700" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Welcome Message */}
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to Fastinjoy! 🌟</h2>
                <p className="text-sm text-gray-600">Discover all our amazing features below</p>
              </div>

              {/* Feature Cards Grid */}
              <div className="space-y-4 mb-6">
                {links.map(({ to, label, icon, description }) => (
                  <MobileNavigationCard
                    key={to}
                    to={to}
                    title={label}
                    description={description}
                    icon={icon}
                    onClick={handleLinkClick}
                  />
                ))}
              </div>

              {/* Special Donation Section */}
              <div className="border-t border-gray-300 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">💝 Support Our Mission</h3>
                <MobileNavigationCard
                  to={donationLink.to}
                  title={donationLink.label}
                  description={donationLink.description}
                  icon={donationLink.icon}
                  isSpecial={donationLink.isSpecial}
                  onClick={handleLinkClick}
                />
              </div>

              {/* Quick Tips Section */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Quick Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Start with our Health Calculator for personalized recommendations</li>
                  <li>• Use the Fasting Timer to track your progress</li>
                  <li>• Try our guided Yoga Exercises daily</li>
                </ul>
              </div>

              {/* Bottom padding for scroll */}
              <div className="h-8"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FloatingDonationButton = () => {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    const floatAnimation = gsap.timeline({
      repeat: -1,
      yoyo: true
    });

    floatAnimation
      .to(buttonRef.current, {
        duration: 3,
        y: -3,
        ease: 'power1.inOut',
      })
      .to(buttonRef.current, {
        duration: 3,
        y: 3,
        ease: 'power1.inOut',
      });

    return () => floatAnimation.kill();
  }, []);

  return (
    <div 
      ref={buttonRef}
      className="fixed bottom-6 right-6 z-50 md:hidden"
    >
      <Link
        to="/donation"
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white font-bold text-base shadow-lg hover:scale-110 transition-transform duration-300"
        style={{
          boxShadow: '0 8px 25px rgba(236, 72, 153, 0.4)'
        }}
        title="Support Fastinjoy"
      >
        💖
      </Link>
    </div>
  );
};

const Header = () => {
  const { user, logout } = useAuth();
  const logoRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!logoRef.current) return;

    const logoAnimation = gsap.timeline({
      repeat: -1,
      repeatDelay: 15
    });

    logoAnimation
      .to(logoRef.current, {
        duration: 1.5,
        opacity: 0.8,
        scale: 1.02,
        ease: 'power1.inOut',
      })
      .to(logoRef.current, {
        duration: 1.5,
        opacity: 1,
        scale: 1,
        ease: 'power1.inOut',
      });

    return () => logoAnimation.kill();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu when clicking outside or on navigation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 relative">
            {/* Logo */}
            <Link
              to="/"
              ref={logoRef}
              className="flex items-center text-2xl font-bold transition-all duration-300 hover:scale-105 mr-8"
            >
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Fast
              </span>
              <span className="text-green-600 mx-1">and</span>
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Yoga
              </span>
            </Link>

            {/* Navigation Links */}
            {user && (
              <div className="flex items-center flex-1 justify-end">
                <div className="flex items-center space-x-8 mr-8">
                  <Navigation links={NAVIGATION_LINKS} donationLink={DONATION_LINK} />
                </div>
                
                {/* Mobile Menu */}
                <div className="md:hidden mr-4">
                  <MobileMenu 
                    links={NAVIGATION_LINKS} 
                    donationLink={DONATION_LINK}
                    isOpen={isMenuOpen} 
                    toggleMenu={toggleMenu} 
                  />
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl active:scale-95"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Enhanced Donation Banner */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white text-center py-2">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <span className="animate-bounce">💝</span>
            <span>Help us keep this amazing wellness app running!</span>
            <Link 
              to="/donation" 
              className="underline hover:no-underline font-semibold hover:text-pink-100 transition-colors duration-200"
            >
              Donate Now
            </Link>
            <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>💝</span>
          </div>
        </div>
      </header>

      {/* Floating Donation Button for Mobile */}
      <FloatingDonationButton />
    </>
  );
};

export default Header;
