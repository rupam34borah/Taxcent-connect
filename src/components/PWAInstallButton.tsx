import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Laptop, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface PWAInstallButtonProps {
  lang: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
        return;
      }
    }
    // If beforeinstallprompt hasn't fired yet or browser requires manual menu action:
    setShowModal(true);
  };

  return (
    <>
      {/* Prominent Always-Visible Download App Button on Top */}
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-bold shadow-xs hover:shadow-emerald-600/20 transition-all cursor-pointer shrink-0 active:scale-95"
        title={lang === 'as' ? 'মোবাইলত এপ ডাউনল’ড বা ইনষ্টল কৰক' : 'Download or Install App on Phone'}
      >
        {installSuccess ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
            <span className="text-[11px] sm:text-xs">{lang === 'as' ? 'ইনষ্টল হ’ল' : 'Installed'}</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold">
              <span className="hidden sm:inline">{lang === 'as' ? 'এপ ডাউনল’ড' : 'Download App'}</span>
              <span className="inline sm:hidden">{lang === 'as' ? 'এপ' : 'App'}</span>
            </span>
          </>
        )}
      </button>

      {/* Responsive How to Install / Download App Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {lang === 'as' ? 'Taxcent Connect এপ ডাউনল’ড / ইনষ্টল' : 'Download & Install Taxcent App'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'as' ? 'মোবাইল আৰু কম্পিউটাৰৰ বাবে' : 'Works on Android, iPhone & Desktop'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-700">
              {/* Android Guide */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'as' ? 'এণ্ড্ৰইড ফোনত (Android Chrome):' : 'For Android Phones (Google Chrome):'}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 pl-1">
                  <li>
                    {lang === 'as'
                      ? 'Chrome ব্ৰাউজাৰৰ ওপৰৰ সোঁফালে থকা তিনিটা বিন্দুত (⋮) ক্লিক কৰক।'
                      : 'Tap the three dots (⋮) in the top-right corner of Google Chrome.'}
                  </li>
                  <li>
                    {lang === 'as'
                      ? 'তাত থকা "Install app" বা "Add to Home screen" ত ক্লিক কৰক।'
                      : 'Tap "Install app" or "Add to Home screen".'}
                  </li>
                  <li>
                    {lang === 'as'
                      ? 'এপ আইকনটো আপোনাৰ ফোনৰ স্ক্ৰীনত ওলাব আৰু ইণ্টাৰনেট থকা-নথকা অবস্থাতো চলিব!'
                      : 'The Taxcent app icon will be added to your home screen!'}
                  </li>
                </ol>
                {isInstallable && (
                  <button
                    onClick={async () => {
                      setShowModal(false);
                      await install();
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    {lang === 'as' ? 'এতিয়াই ইনষ্টল কৰক (Install Now)' : 'Install Now'}
                  </button>
                )}
              </div>

              {/* iPhone Guide */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'as' ? 'আইফোনত (iOS Safari):' : 'For iPhone / iPad (Safari):'}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 pl-1">
                  <li>Tap the <strong>Share</strong> icon in the bottom Safari toolbar.</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                  <li>Tap <strong>Add</strong> in the top right.</li>
                </ol>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  {lang === 'as'
                    ? 'এপ ইনষ্টল কৰিলে কোনো মাচুল বা Play Store একাউণ্টৰ প্ৰয়োজন নাই।'
                    : 'Zero storage bloat. Runs instantly like a native app with fast offline caching.'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              {lang === 'as' ? 'বুজি পালোঁ (Close)' : 'Got It, Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
