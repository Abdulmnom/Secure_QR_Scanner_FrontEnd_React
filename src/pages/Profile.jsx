import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import axios from 'axios';
import { config } from '../config';
import Button from '../components/Button';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    if (!user || user.isGuest) {
      navigate('/login');
      return;
    }

    if (user && !user.isGuest) {
      fetchProfile();
    } else if (user && user.isGuest) {
      setProfileUser(user);
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/auth/me`);
      setProfileUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to stored user data
      setProfileUser(user);
    }
  };

  // Don't render anything while redirecting
  if (!user || user.isGuest) {
    return null;
  }

  const displayUser = profileUser || user;

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
