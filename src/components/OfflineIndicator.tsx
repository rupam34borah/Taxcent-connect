import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';
import { Language } from '../types';

interface OfflineIndicatorProps {
  lang: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside aria-label="Connectivity warning" className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-lg animate-fade-in">
      <WifiOff className="w-3.5 h-3.5" />
      <span>
        {lang === 'as' 
          ? 'অফলাইন মোড — কেচ থকা তথ্য প্ৰদৰ্শন হৈছে' 
          : 'Offline Mode — Showing cached services and contact info'}
      </span>
    </aside>
  );
};
