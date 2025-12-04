import { Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">404</h1>
            <p className="text-red-100 text-lg">Page Not Found</p>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              The page you're looking for doesn't exist or has been moved.
              Please check the URL or navigate back to the home page.
            </p>

            <div className="space-y-4">
              <Link to="/" className="block">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Home className="w-5 h-5" />
                  Go to Home
                </Button>
              </Link>

              <button
                onClick={() => window.history.back()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}