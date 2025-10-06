import { Link, useNavigate } from 'react-router-dom';
import { Camera, History, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Camera className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">Secure QR</span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/scanner"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span className="font-medium">Scanner</span>
            </Link>

            <Link
              to="/history"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <History className="w-5 h-5" />
              <span className="font-medium">History</span>
            </Link>

            {!user.isGuest && (
              <Link
                to="/profile"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
