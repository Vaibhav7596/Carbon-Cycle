import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-btn px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 my-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong className="font-semibold">Indicative Demo Assumptions:</strong> Carbon impact metrics & economic estimates are calculated using default regional emission factors for tracking, decision support, and demonstration. They do not represent certified carbon credits or regulatory offsets.
        </span>
      </div>
    </div>
  );
};
