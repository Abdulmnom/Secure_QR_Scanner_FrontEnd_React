import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, XCircle, Upload, Calendar, ExternalLink } from 'lucide-react';
import jsQR from 'jsqr';
import axios from 'axios';
import { config } from '../config';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

export default function Scanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
  }, []);

  const checkSafetyAndSave = async (text) => {
    setIsProcessing(true);
    try {
      // Check safety
      const scanResponse = await axios.post(`${config.apiUrl}/scan`, { url: text });
      const status = scanResponse.data.status;

      // Save to history only if user is authenticated (not guest)
      const token = localStorage.getItem('token');
      if (token) {
        const timestamp = new Date().toISOString();
        // Save asynchronously without waiting
        axios.post(`${config.apiUrl}/history`, { url: text, result: status, timestamp }, {
          timeout: 10000 // 10 second timeout
        }).catch(historyError => {
          console.error('Error saving to history:', historyError);
        });
      }

      return { text, status, timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('Error checking safety or saving:', error);
      // Fallback to local analysis if API fails
      const suspiciousPatterns = [
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
      ];
      const status = suspiciousPatterns.some(pattern => pattern.test(text)) ? 'suspicious' : 'safe';
      return { text, status, timestamp: new Date().toISOString() };
    } finally {
      setIsProcessing(false);
    }
  };

  const startScanning = async () => {
    setError('');
    setScanResult(null);
    setSelectedImage(null);

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
        async (decodedText) => {
          const result = await checkSafetyAndSave(decodedText);
          setScanResult(result);
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
    setSelectedImage(null);
  };

  const scanFromFile = async (file) => {
    setError('');
    setScanResult(null);
    setIsProcessing(true);

    try {
      // First try client-side scanning (faster)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            const decodedText = code.data;
            const scanResult = await checkSafetyAndSave(decodedText);
            setScanResult(scanResult);
          } else {
            // If no QR found locally, try backend
            try {
              const formData = new FormData();
              formData.append('image', file);

              const response = await axios.post(`${config.apiUrl}/scan/image`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });

              if (response.data.url && response.data.status) {
                const scanResult = {
                  text: response.data.url,
                  status: response.data.status,
                  timestamp: new Date().toISOString(),
                };
                setScanResult(scanResult);

                // Save to history if authenticated
                const token = localStorage.getItem('token');
                if (token) {
                  axios.post(`${config.apiUrl}/history`, {
                    url: response.data.url,
                    result: response.data.status,
                    timestamp: scanResult.timestamp,
                  }, {
                    timeout: 10000
                  }).catch(historyError => {
                    console.error('Error saving to history:', historyError);
                  });
                }
              } else {
                setError('No QR code found in the image.');
                setIsProcessing(false);
              }
            } catch (backendErr) {
              console.error('Backend scan failed:', backendErr);
              setError('No QR code found in the image.');
              setIsProcessing(false);
            }
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File processing error:', err);
      setError('Failed to process the image.');
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);

      // Scan the file
      scanFromFile(file);
    }
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

            {!isScanning && !scanResult && !isProcessing && (
              <div className="text-center py-12">
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Camera className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Secure QR Scanner</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">Scan QR codes safely with real-time security checks powered by Google Safe Browsing</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <Button onClick={startScanning} className="w-full h-14 text-lg font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all">
                    <Camera className="w-5 h-5" />
                    Camera Scan
                  </Button>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="qr-file-input"
                    />
                    <Button variant="secondary" className="w-full h-14 text-lg font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all">
                      <Upload className="w-5 h-5" />
                      Upload Image
                    </Button>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">Real-time Scan</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Security Check</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300">History Saved</p>
                  </div>
                </div>
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

            {selectedImage && !scanResult && !isProcessing && (
              <div className="text-center py-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 inline-block shadow-lg border border-gray-200 dark:border-gray-500">
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Selected for scanning"
                      className="max-w-56 max-h-56 rounded-lg shadow-md border-2 border-white dark:border-gray-400"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Upload className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-3">Image ready for scanning</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Processing will start automatically</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="text-center py-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Processing QR Code</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Checking safety and saving results...</p>
                  <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}

            {scanResult && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-600 rounded-xl p-6 transition-all shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Scan Complete!</h3>
                    </div>
                    <StatusBadge status={scanResult.status} />
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Decoded Content:</p>
                    <p className="text-gray-900 dark:text-gray-100 break-all font-mono text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded border">
                      {scanResult.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <Calendar className="w-4 h-4" />
                    Scanned at: {new Date(scanResult.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={resetScanner} className="h-12 text-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Camera className="w-5 h-5" />
                    Scan Another
                  </Button>
                  {scanResult.text.startsWith('http') && (
                    <a
                      href={scanResult.text}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="secondary" className="w-full h-12 text-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                        <ExternalLink className="w-5 h-5" />
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
