import { useState, useEffect } from 'react';
import { History as HistoryIcon, ExternalLink, Trash2, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

export default function History() {
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all scan history?')) {
      localStorage.removeItem('scanHistory');
      setScanHistory([]);
    }
  };

  const deleteItem = (id) => {
    const updatedHistory = scanHistory.filter((item) => item.id !== id);
    setScanHistory(updatedHistory);
    localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HistoryIcon className="w-8 h-8 text-white" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Scan History</h1>
                  <p className="text-blue-100 mt-1">View all your scanned QR codes</p>
                </div>
              </div>
              {scanHistory.length > 0 && (
                <Button variant="danger" onClick={clearHistory} className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            {scanHistory.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HistoryIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Scan History</h3>
                <p className="text-gray-500">Your scanned QR codes will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scanHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={item.status} />
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">Content:</p>
                          <p className="text-gray-900 break-all font-mono text-sm">{item.text}</p>
                        </div>

                        {item.text.startsWith('http') && (
                          <a
                            href={item.text}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open Link
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
