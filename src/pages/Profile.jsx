import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import axios from 'axios';
import { config } from '../config';
import Button from '../components/Button';

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsFetching(false);
        return;
      }
      const response = await axios.get(`${config.apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProfileUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to stored user data
      const token = localStorage.getItem('token');
      if (user && !user.isGuest) {
        setProfileUser(user);
      } else if (token) {
        // Try to get from localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== 'undefined') {
          try {
            const userData = JSON.parse(savedUser);
            if (!userData.isGuest) {
              setProfileUser(userData);
            }
          } catch (e) {
            console.error('Error parsing saved user:', e);
          }
        }
      }
    } finally {
      setIsFetching(false);
    }
  }, [user]);

  useEffect(() => {
    // Wait for loading to complete before making decisions
    if (loading) {
      return;
    }

    // Only redirect guests or users without token
    const token = localStorage.getItem('token');
    if (user && user.isGuest) {
      navigate('/login');
      return;
    }

    // If we have a token or authenticated user, fetch profile
    if (token || (user && !user.isGuest)) {
      // Only fetch if we don't already have profileUser
      if (!profileUser) {
        fetchProfile();
      }
    } else if (!user && !token) {
      // No user and no token - redirect to login
      navigate('/login');
      return;
    }
  }, [user, loading, navigate, fetchProfile, profileUser]);

  // Show loading only while AuthContext is loading OR while fetching profile
  // But allow rendering if we have profileUser data
  const token = localStorage.getItem('token');
  const shouldShowLoading = loading || (isFetching && !profileUser);
  const shouldRedirect = !loading && !token && !user && !profileUser;
  
  if (shouldRedirect) {
    return null; // Will redirect in useEffect
  }

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Don't show profile if user is guest
  if (user && user.isGuest) {
    return null; // Will redirect in useEffect
  }

  const displayUser = profileUser || user;
  
  // If we still don't have user data, show loading
  if (!displayUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white dark:text-gray-100">{displayUser.fullName || displayUser.name}</h1>
                <p className="text-blue-100 dark:text-blue-200 mt-1">User Profile</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Account Information</h2>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-start gap-4 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Full Name</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">{displayUser.fullName || displayUser.name}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-start gap-4 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Email Address</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">{displayUser.email}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-start gap-4 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Member Since</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-start gap-4 transition-colors">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Account Status</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1">Active</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Actions</h3>
              <div className="flex gap-4">
                <Button variant="danger" onClick={handleLogout} className="flex-1">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
