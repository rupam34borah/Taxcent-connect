import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { Language } from '../types';

interface PWAInstallButtonProps {
  lang: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    }
  };

  return (
    <>
      {/* Chromium / Android install trigger */}
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
          title={lang === 'as' ? 'মোবাইলত এপ ইনষ্টল কৰক' : 'Install app on Android phone'}
        >
          {installSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-200" />
              <span>{lang === 'as' ? 'ইনষ্টল হৈছে!' : 'Installed!'}</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'as' ? 'এপ ইনষ্টল কৰক' : 'Install App'}</span>
            </>
          )}
        </button>
      )}

      {/* iOS Safari banner trigger */}
      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white/90 text-slate-700 hover:bg-slate-50 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          <span>{lang === 'as' ? 'আইফোনত ইনষ্টল' : 'Add to Home'}</span>
        </button>
      )}

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'as' ? 'আইফোন / আইপেডত ইনষ্টল কৰক' : 'Install on iPhone / iPad'}
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">1</span>
                <p>
                  {lang === 'as' 
                    ? 'Safari ব্ৰাউজাৰৰ তলত থকা Share বুটামত স্পৰ্শ কৰক।' 
                    : 'Tap the Share icon in the bottom toolbar of Safari.'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">2</span>
                <p>
                  {lang === 'as' 
                    ? 'তললৈ স্ক্ৰল কৰি "Add to Home Screen" ত ক্লিক কৰক।' 
                    : 'Scroll down and tap "Add to Home Screen".'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">3</span>
                <p>
                  {lang === 'as' 
                    ? 'ওপৰৰ সোঁফালে থকা "Add" বুটামত ক্লিক কৰিলে এপ আইকন সৃষ্টি হ’ব।' 
                    : 'Tap "Add" in the top right to access Taxcent Connect directly anytime!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              {lang === 'as' ? 'বুজি পালোঁ' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
