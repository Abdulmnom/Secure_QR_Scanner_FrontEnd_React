import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

export default function Scanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
  }, []);

  const analyzeSafety = (text) => {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        return 'suspicious';
      }
    }

    return 'safe';
  };

  const saveScanToHistory = (result) => {
    const scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    const newScan = {
      id: Date.now(),
      ...result,
    };
    scanHistory.unshift(newScan);
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory.slice(0, 50)));
  };

  const startScanning = async () => {
    setError('');
    setScanResult(null);

    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (e) {}
      }

      scannerRef.current = new Html5Qrcode('qr-reader');

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      setIsScanning(true);

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          const status = analyzeSafety(decodedText);
          const result = {
            text: decodedText,
            timestamp: new Date().toISOString(),
            status,
          };
          setScanResult(result);
          saveScanToHistory(result);
          stopScanning();
        },
        () => {}
      );
    } catch (err) {
      setIsScanning(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      console.error('Camera error:', err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const resetScanner = () => {
    setScanResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Navbar />

      <div className="max-w-2xl mx-auto p-6 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <h1 className="text-3xl font-bold text-white dark:text-gray-100 flex items-center gap-3">
              <Camera className="w-8 h-8" />
              Secure QR Scanner
            </h1>
            <p className="text-blue-100 dark:text-blue-200 mt-2">Scan QR codes safely and securely</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Camera Access Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {!isScanning && !scanResult && (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-12 h-12 text-blue-600" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Click the button below to start scanning</p>
                <Button onClick={startScanning} className="w-full sm:w-auto">
                  Start Scanning
                </Button>
              </div>
            )}

            {isScanning && (
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div id="qr-reader" className="w-full"></div>
                </div>
                <div className="flex justify-center">
                  <Button onClick={stopScanning} variant="danger">
                    Stop Scanning
                  </Button>
                </div>
              </div>
            )}

            {scanResult && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Scan Result</h3>
                    <StatusBadge status={scanResult.status} />
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 transition-colors">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Decoded Content:</p>
                    <p className="text-gray-900 dark:text-gray-100 break-all font-mono text-sm">
                      {scanResult.text}
                    </p>
                  </div>

                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Scanned at: {new Date(scanResult.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={resetScanner} className="flex-1">
                    Scan Another
                  </Button>
                  {scanResult.text.startsWith('http') && (
                    <a
                      href={scanResult.text}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="secondary" className="w-full">
                        Open Link
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          <p>Your camera feed is processed locally in your browser.</p>
          <p>No data is sent to external servers during scanning.</p>
        </div>
      </div>
    </div>
  );
}
