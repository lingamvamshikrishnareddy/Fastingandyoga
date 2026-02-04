import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Clock, RefreshCw, BarChart2, Lightbulb, X, Share2, Menu, ArrowRight, Star, Gift } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/card';
import { dashboard } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Enhanced Mobile Nav Hint Component
const EnhancedMobileNavHint = ({ onDismiss, userName }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 z-50 lg:hidden flex items-center justify-center p-4">
    <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-pulse">
      <button 
        onClick={onDismiss} 
        className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
      >
        <X size={18} />
      </button>
      
      <div className="text-center">
        <div className="mb-4">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome, {userName}!</h3>
          <p className="text-gray-600 text-sm">You're in for an amazing wellness journey!</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-center mb-3">
            <Menu className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-semibold text-gray-800">Tap the Menu Button</span>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-2" />
              <span>Discover premium features</span>
            </div>
            <div className="flex items-center">
              <Gift className="h-4 w-4 text-purple-500 mr-2" />
              <span>Access exclusive content</span>
            </div>
            <div className="flex items-center">
              <ArrowRight className="h-4 w-4 text-green-500 mr-2" />
              <span>Unlock your wellness potential</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onDismiss}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Got it! Let's explore 🚀
        </button>
      </div>
    </div>
  </div>
);

// Social Share Component
const SocialShareCard = ({ stats, userName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const shareData = {
    title: `Check out my wellness journey on Fastinjoy!`,
    text: `I've completed ${stats.totalFasts || 0} fasts! 💪 Join me on this amazing wellness journey.`,
    url: window.location.origin
  };

  const socialPlatforms = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.text)}`
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`
    },
    {
      name: 'Instagram',
      icon: '📸',
      color: 'bg-pink-500 hover:bg-pink-600',
      url: `https://www.instagram.com/` // Instagram doesn't support direct sharing via URL
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-sky-400 hover:bg-sky-500',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`
    }
  ];

  const handleShare = async (platform) => {
    if (platform.name === 'Instagram') {
      // For Instagram, copy to clipboard and show instruction
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Text copied to clipboard! You can now paste it in your Instagram story or post.');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
      return;
    }

    // For other platforms, open in new window
    window.open(platform.url, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-700">
          <Share2 className="mr-2 h-5 w-5" />
          Share Your Progress
        </CardTitle>
        <CardDescription>
          Inspire others with your wellness journey!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-white rounded-lg border border-purple-200">
          <p className="text-sm text-gray-700 font-medium">
            "I've completed {stats.totalFasts || 0} fasts! 💪"
          </p>
        </div>
        
        <button
          onClick={handleNativeShare}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share My Journey
        </button>

        {/* Social Platforms Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Share on Social Media</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleShare(platform)}
                    className={`${platform.color} text-white py-3 px-4 rounded-xl font-medium transition-all hover:scale-105 flex items-center justify-center`}
                  >
                    <span className="text-lg mr-2">{platform.icon}</span>
                    {platform.name}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  💡 Tip: Sharing your progress helps motivate others and keeps you accountable!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Quick Action Buttons Component
const QuickActionButtons = () => {
  const quickActions = [
    { label: 'Health Calculator', icon: '🏥', path: '/health-calculator', color: 'from-green-500 to-emerald-500' },
    { label: 'Start Fasting', icon: '⏰', path: '/fasting-timer', color: 'from-blue-500 to-cyan-500' },
    { label: 'Yoga Session', icon: '🧘‍♀️', path: '/yoga-exercises', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-700">
          <ArrowRight className="mr-2 h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Jump right into your wellness activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action) => (
            <a
              key={action.path}
              href={action.path}
              className={`block w-full p-3 bg-gradient-to-r ${action.color} text-white rounded-xl font-medium hover:scale-105 transition-all text-center`}
            >
              <span className="text-lg mr-2">{action.icon}</span>
              {action.label}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

function Dashboard() {
  const { user, refreshUser, isAuthenticated, authInitialized } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showMobileHint, setShowMobileHint] = useState(false);

  const isInitialLoad = useRef(true);

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (isInitialLoad.current) {
        setLoading(true);
    }
    setError(null);

    try {
      if (!authInitialized) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return fetchDashboardData(forceRefresh);
      }
      if (!isAuthenticated) throw new Error('Authentication required.');

      const data = forceRefresh
        ? await dashboard.refreshStats()
        : await dashboard.getDashboardData();

      if (!data || !data.success) throw new Error(data.message || 'Invalid response from server');

      console.log('Dashboard data loaded:', data);
      setDashboardData(data);

      if (forceRefresh) {
        await refreshUser();
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }
    }
  }, [authInitialized, isAuthenticated, refreshUser]);

  const handleManualRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData(true);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (authInitialized && isAuthenticated) {
        fetchDashboardData(false);
    }
  }, [authInitialized, isAuthenticated, fetchDashboardData]);

  useEffect(() => {
    let isMounted = true;
    const handleDashboardUpdateRequired = () => {
      if (isMounted && isAuthenticated) {
        console.log('Dashboard update required, forcing refresh...');
        setRefreshing(true);
        fetchDashboardData(true);
      }
    };
    window.addEventListener('dashboardUpdateRequired', handleDashboardUpdateRequired);

    // Enhanced mobile hint logic - show for new users or after some time
    const hintDismissed = localStorage.getItem('mobileHintDismissed');
    const lastHintShown = localStorage.getItem('lastMobileHintShown');
    const currentTime = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (window.innerWidth < 1024) {
      if (!hintDismissed || (lastHintShown && currentTime - parseInt(lastHintShown) > oneDayInMs)) {
        setTimeout(() => setShowMobileHint(true), 2000); // Show after 2 seconds
      }
    }

    return () => {
      isMounted = false;
      window.removeEventListener('dashboardUpdateRequired', handleDashboardUpdateRequired);
    };
  }, [isAuthenticated]);

  const handleDismissHint = () => {
    localStorage.setItem('mobileHintDismissed', 'true');
    localStorage.setItem('lastMobileHintShown', Date.now().toString());
    setShowMobileHint(false);
  };

  if (loading && isInitialLoad.current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFF]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-t-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wellness dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFF] p-4 text-center">
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle className="text-red-600">An Error Occurred</CardTitle>
                <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
                <button onClick={handleManualRefresh} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600" disabled={refreshing}>
                    {refreshing ? 'Retrying...' : 'Try Again'}
                </button>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F9FAFF] text-gray-500">No data available.</div>;
  }
  
  const { stats, recentFasts, recommendations } = dashboardData;
  const chartData = recentFasts?.map(fast => ({
      date: new Date(fast.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Duration: fast.duration
  })) || [];

  return (
    <div className="min-h-screen bg-[#F9FAFF] p-4 sm:p-6 lg:p-8">
      {showMobileHint && (
        <EnhancedMobileNavHint 
          onDismiss={handleDismissHint} 
          userName={user.username}
        />
      )}
      
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user.username}! 🌟
            </h1>
            <p className="text-gray-600">Your wellness journey continues here</p>
          </div>
          <button 
            onClick={handleManualRefresh} 
            disabled={refreshing} 
            className="flex items-center space-x-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Content - 3 columns on large screens */}
          <div className="space-y-6 lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
                <CardHeader className="flex-row items-center justify-between pb-2">
                  <CardTitle className="text-yellow-700">Total Fasts</CardTitle>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{stats.totalFasts || 0}</div>
                  <p className="text-sm text-yellow-600">Amazing progress! 🏆</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="flex-row items-center justify-between pb-2">
                  <CardTitle className="text-blue-700">Longest Fast</CardTitle>
                  <Clock className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.longestFast || 'N/A'}</div>
                  <p className="text-sm text-blue-600">Personal best! ⏰</p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart2 className="mr-2 h-5 w-5 text-purple-600"/>
                      Fasting History
                    </CardTitle>
                    <CardDescription>Duration of your last {chartData.length} completed fasts (in hours).</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] w-full pr-0">
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12}/>
                            <YAxis unit="h" stroke="#6b7280" fontSize={12}/>
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="Duration" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column on large screens */}
          <div className="space-y-6 lg:col-span-1">
            {/* Quick Insight */}
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-yellow-500"/>
                    Quick Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600">
                        {recommendations && recommendations.length > 0 ? recommendations[0] : "Keep fasting to unlock personalized insights!"}
                    </p>
                </CardContent>
            </Card>

            {/* Social Share */}
            <SocialShareCard stats={stats} userName={user.username} />

            {/* Quick Actions */}
            <QuickActionButtons />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
