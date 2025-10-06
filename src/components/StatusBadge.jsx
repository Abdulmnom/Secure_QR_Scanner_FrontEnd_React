import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const isSafe = status === 'safe';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full ${
        isSafe ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {isSafe ? (
        <>
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Safe</span>
        </>
      ) : (
        <>
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Suspicious</span>
        </>
      )}
    </div>
  );
}
