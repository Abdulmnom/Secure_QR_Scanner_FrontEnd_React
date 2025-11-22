import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user data
      checkAuth();
    } else {
      // Check if user is guest
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.isGuest) {
          setUser(userData);
        }
      }
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/login`, { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      let errorMessage = 'Login failed';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || error.response.data?.error || `Server error (${error.response.status})`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else {
        // Something else happened
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (fullName, email, password) => {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/signup`, { 
        name: fullName,  // Backend expects 'name' not 'fullName'
        email, 
        password 
      });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Signup failed:', error);
      let errorMessage = 'Signup failed';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || error.response.data?.error || `Server error (${error.response.status})`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else {
        // Something else happened
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const loginAsGuest = () => {
    const guestUser = {
      fullName: 'Guest User',
      email: 'guest@guest.com',
      isGuest: true,
    };
    setUser(guestUser);
    // No token for guest
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const checkBackendHealth = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}`);
      return { healthy: true, data: response.data };
    } catch (error) {
      console.error('Backend health check failed:', error);
      return { 
        healthy: false, 
        error: error.response?.status ? 
          `Server returned ${error.response.status}` : 
          'Cannot connect to backend server'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginAsGuest, logout, checkBackendHealth, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
