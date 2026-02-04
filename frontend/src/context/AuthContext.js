import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { auth as apiAuth, ERROR_CODES } from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';

// Helper function to check if localStorage is accessible
const checkStorageAccess = () => {
  try {
    localStorage.setItem('test', 'test');
    const result = localStorage.getItem('test');
    localStorage.removeItem('test');
    return result === 'test';
  } catch (e) {
    console.error('[AuthContext] localStorage access error:', e);
    return false;
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState('login');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if localStorage is accessible
  const hasStorageAccess = checkStorageAccess();
  if (!hasStorageAccess) {
    console.error('[AuthContext] Cannot access localStorage - authentication persistence will not work!');
  }

  // Function to clear auth state - reused in multiple places
  const clearAuthState = useCallback(() => {
    if (hasStorageAccess) {
      localStorage.removeItem('token');
    }
    setUser(null);
  }, [hasStorageAccess]);

  // Modal controls
  const toggleAuthModal = () => setShowAuthModal(!showAuthModal);
  const openAuthModal = (type = 'login') => {
    setAuthType(type);
    setShowAuthModal(true);
  };
  const closeAuthModal = () => setShowAuthModal(false);

  // Improved auth expiration handler
  useEffect(() => {
    let redirectTimeoutId = null;
    let handlingExpiration = false;

    const handleAuthExpired = () => {
      if (handlingExpiration) return;

      handlingExpiration = true;
      console.log('[AuthContext] Auth expired event received');

      setTimeout(() => {
        clearAuthState();

        if (redirectTimeoutId) {
          clearTimeout(redirectTimeoutId);
        }

        if (!location.pathname.includes('/login')) {
          redirectTimeoutId = setTimeout(() => {
            navigate('/login', { state: { reason: 'session_expired' } });
            redirectTimeoutId = null;
            setTimeout(() => {
              handlingExpiration = false;
            }, 500);
          }, 100);
        } else {
          handlingExpiration = false;
        }
      }, 100);
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
      if (redirectTimeoutId) {
        clearTimeout(redirectTimeoutId);
      }
    };
  }, [clearAuthState, navigate, location.pathname]);

  // Improved fetchUserData with retry logic
  const fetchUserData = useCallback(async () => {
    try {
      if (!hasStorageAccess) {
        console.error('[AuthContext] Cannot access localStorage for auth token');
        return null;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        console.log('[AuthContext] No token found');
        return null;
      }

      console.log('[AuthContext] Attempting to fetch user with token');

      let retries = 2;
      let userData = null;

      while (retries >= 0 && !userData) {
        try {
          const response = await apiAuth.getCurrentUser();

          if (response && (response.user || response.data?.user)) {
            userData = response.user || response.data?.user;
            console.log('[AuthContext] User loaded successfully:', userData);
            return userData;
          } else {
            console.error('[AuthContext] Invalid user data in response:', response);
            retries--;
            if (retries < 0) {
              clearAuthState();
            }
          }
        } catch (err) {
          console.error(`[AuthContext] Failed to load user with token (retries left: ${retries}):`, err);

          if (err.code === ERROR_CODES.AUTH_ERROR) {
            clearAuthState();
            return null;
          }

          retries--;
          if (retries >= 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      return userData;
    } catch (err) {
      console.error('[AuthContext] Failed to load user with token:', err);

      if (err.code === ERROR_CODES.AUTH_ERROR) {
        clearAuthState();
      }

      return null;
    }
  }, [hasStorageAccess, clearAuthState]);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        setAuthInitialized(false);

        const token = localStorage.getItem('token');
        console.log('[AuthContext] Checking for token on load:', token ? 'Token exists' : 'No token');

        if (!token) {
          setLoading(false);
          setAuthInitialized(true);
          return;
        }

        const userData = await fetchUserData();

        if (userData) {
          setUser(userData);
        }
      } catch (e) {
        console.error('[AuthContext] Error during auth check:', e);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    checkUserLoggedIn();
  }, [fetchUserData]);

  // Login function - fixed to return consistent format
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      console.log('[AuthContext] Login attempt with:', email);
      const response = await apiAuth.login({ email, password });
      const token = response.token;
      console.log('[AuthContext] Token received:', token ? 'Valid token' : 'No token');

      if (!token) {
        console.error('[AuthContext] No token found in response:', response);
        throw new Error('No authentication token received');
      }

      if (hasStorageAccess) {
        console.log('[AuthContext] Attempting to store token...');
        localStorage.setItem('token', token);

        await new Promise(resolve => setTimeout(resolve, 100));

        const storedToken = localStorage.getItem('token');
        if (storedToken === token) {
          console.log('[AuthContext] Token successfully stored.');
          const userData = await fetchUserData();
          if (userData) {
            setUser(userData);
            setLoading(false);
            closeAuthModal(); // Close modal on successful login
            return { success: true };
          } else {
            clearAuthState();
            throw new Error('Could not retrieve user data after login.');
          }
        } else {
          console.error('[AuthContext] CRITICAL: Failed to verify token storage!');
          throw new Error('Failed to store authentication token.');
        }
      } else {
        console.error('[AuthContext] Cannot store token - localStorage not accessible');
        throw new Error('Cannot store authentication data - browser storage not accessible');
      }

    } catch (err) {
      console.error('[AuthContext] Login error:', err.message);
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Register function - fixed to match expected format
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('[AuthContext] Register attempt with:', userData.email);
      const response = await apiAuth.register(userData);

      const token = response.token || response.data?.token;
      if (!token) {
        console.error('[AuthContext] No token found in register response:', response);
        throw new Error('No authentication token received');
      }

      if (hasStorageAccess) {
        console.log('[AuthContext] Storing token in localStorage');
        localStorage.setItem('token', token);
      } else {
        console.error('[AuthContext] Cannot store token - localStorage not accessible');
        throw new Error('Cannot store authentication data - browser storage not accessible');
      }

      const userDataResponse = response.user || response.data?.user;
      if (!userDataResponse) {
        console.error('[AuthContext] No user data found in response:', response);
        throw new Error('No user data received');
      }

      console.log('[AuthContext] Setting user data after registration:', userDataResponse);
      setUser(userDataResponse);
      setLoading(false);
      closeAuthModal(); // Close modal on successful registration

      const tokenVerified = localStorage.getItem('token') === token;
      return { success: tokenVerified };
    } catch (err) {
      console.error('[AuthContext] Register error:', err);
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Google OAuth login
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Redirect to Google OAuth endpoint
      window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/google`;
    } catch (err) {
      console.error('[AuthContext] Google login error:', err);
      setError('Google login failed');
      setLoading(false);
      return { success: false, error: 'Google login failed' };
    }
  };

  // Handle OAuth callback
  const handleOAuthCallback = async (token) => {
    try {
      if (!token) {
        throw new Error('No token received from OAuth callback');
      }

      if (hasStorageAccess) {
        localStorage.setItem('token', token);
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
          return { success: true };
        }
      }
      
      throw new Error('Failed to process OAuth callback');
    } catch (err) {
      console.error('[AuthContext] OAuth callback error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiAuth.logout().catch(err => {
        console.warn('[AuthContext] Server logout failed, continuing with client logout:', err);
      });
    } finally {
      clearAuthState();
      navigate('/login');
      console.log('[AuthContext] User logged out');
    }
  };

  // Refresh user data utility
  const refreshUserData = async () => {
    if (!user) return false;

    try {
      const userData = await fetchUserData();
      if (userData) {
        setUser(userData);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[AuthContext] Failed to refresh user data:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        authInitialized,
        showAuthModal,
        authType,
        login,
        register,
        loginWithGoogle,
        handleOAuthCallback,
        logout,
        hasStorageAccess,
        refreshUser: refreshUserData,
        toggleAuthModal,
        openAuthModal,
        closeAuthModal,
        setAuthType
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};