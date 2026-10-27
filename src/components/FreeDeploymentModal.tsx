import React, { useState } from 'react';
import { X, Smartphone, Globe, Share2, Sheet, FileCode2, Check, Copy, ExternalLink, HelpCircle } from 'lucide-react';
import { Language } from '../types';
import { BUSINESS_CONTACTS } from '../data/content';

interface FreeDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const FreeDeploymentModal: React.FC<FreeDeploymentModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'hosting' | 'sheets' | 'edit'>('android');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0a2540] text-white p-5 flex items-center justify-between border-b border-sky-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {lang === 'as' ? 'মোবাইল পৰীক্ষা আৰু ১০০% বিনামূলীয়া প্ৰকাশৰ গাইড' : 'Android Testing & 100% Free Publishing Guide'}
              </h2>
              <span className="text-[11px] text-sky-200/80">
                Zero Budget Blueprint for Taxcent Connect (Ranabari Market, Lakhimpur)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('android')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'android'
                ? 'border-sky-600 text-sky-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-sky-600" />
            <span>1. Test on Android Phone</span>
          </button>

          <button
            onClick={() => setActiveTab('hosting')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'hosting'
                ? 'border-sky-600 text-sky-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>2. 100% Free Hosting (GitHub / Vercel)</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'sheets'
                ? 'border-sky-600 text-sky-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sheet className="w-4 h-4 text-amber-600" />
            <span>3. Connect Free Google Sheets</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'edit'
                ? 'border-sky-600 text-sky-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-blue-600" />
            <span>4. Easy Editing for Beginners</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed flex-1">
          {activeTab === 'android' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                How to Preview & Install Taxcent Connect on Your Android Phone:
              </h3>
              <p>
                This app is configured as a fully compliant <strong>Progressive Web App (PWA)</strong>. It can be installed like a native Android app directly from Chrome without paying the Google Play Store fee ($25 saved)!
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-1">Open on Mobile Chrome</strong>
                    <p className="text-xs text-slate-600">
                      Open your app link (or scan its QR code) on Google Chrome on your Android smartphone.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-1">Tap "Install App" or Chrome Menu</strong>
                    <p className="text-xs text-slate-600">
                      Tap the blue <strong>"Install App"</strong> button in the top navigation, OR tap the three dots in the top-right of Google Chrome and choose <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-1">Appears on Home Screen</strong>
                    <p className="text-xs text-slate-600">
                      The Taxcent Connect icon with your custom navy shield will appear on your phone screen. When tapped, it opens in standalone fullscreen without any browser address bar!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hosting' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                How to Host & Publish Taxcent Connect 100% Free Forever:
              </h3>
              <p>
                You have a zero budget, which is completely fine! Modern frontend applications like this can be hosted for <strong>₹0.00 / free forever</strong> with fast SSL (HTTPS) encryption on any of these platforms:
              </p>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-sm">Deploy on Netlify via Mobile (1-Tap Upload)</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Fastest for Phone</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Tap the button below to download the ready-to-deploy zip file directly into your phone's <strong>Downloads</strong> folder:
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/taxcent-connect-dist.zip');
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'taxcent-connect-dist.zip';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      } catch (e) {
                        window.location.href = '/taxcent-connect-dist.zip';
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>📥 Download Netlify Zip (dist)</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/taxcent-connect-source.zip');
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'taxcent-connect-source.zip';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      } catch (e) {
                        window.location.href = '/taxcent-connect-source.zip';
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <FileCode2 className="w-4 h-4 text-sky-400" />
                    <span>📦 Download Full Source Zip</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Option A: Vercel (Recommended)</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Fastest</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
                    <li>Create a free account at <code>vercel.com</code></li>
                    <li>Push your code to a free GitHub repository</li>
                    <li>Click "Import Project" in Vercel & click "Deploy"</li>
                    <li>You get a free URL like: <code>taxcent-connect.vercel.app</code> with free automatic HTTPS!</li>
                  </ol>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Option B: GitHub Pages</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">100% Free</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
                    <li>Create a repository on GitHub (e.g. <code>taxcent-connect</code>)</li>
                    <li>Run <code>npm run build</code></li>
                    <li>Deploy the <code>dist</code> folder via GitHub Actions or gh-pages</li>
                    <li>Free URL: <code>username.github.io/taxcent-connect</code></li>
                  </ol>
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs flex items-center justify-between">
                <span>npm run build</span>
                <button
                  onClick={() => handleCopy('npm run build', 'build_cmd')}
                  className="text-sky-700 font-bold hover:underline"
                >
                  {copiedCode === 'build_cmd' ? 'Copied!' : 'Copy Build Command'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                How to Connect Google Sheets & Forms for Free Enquiry Storage:
              </h3>
              <p>
                Right now, enquiries generate formatted WhatsApp messages to your numbers (<code>8876824424</code> / <code>8638270649</code>) with zero setup. If you also want every enquiry logged automatically into a spreadsheet:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <strong className="block font-bold text-slate-900 mb-1">Step 1: Create a Google Form</strong>
                  <p className="text-xs text-slate-600">
                    Go to <code>forms.google.com</code> and add 4 fields: <em>1. Full Name</em>, <em>2. Mobile Number</em>, <em>3. Business & Service</em>, <em>4. Notes/Batch</em>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <strong className="block font-bold text-slate-900 mb-1">Step 2: Link to Google Sheet</strong>
                  <p className="text-xs text-slate-600">
                    In your Google Form, click the "Responses" tab, then click "Link to Sheets". Google will create a live Google Sheet that receives every entry in real time.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <strong className="block font-bold text-slate-900 mb-1">Step 3: Free Email Notifications</strong>
                  <p className="text-xs text-slate-600">
                    In Google Forms, click "..." in Responses and turn on <em>"Get email notifications for new responses"</em>. You will receive an instant email on Gmail whenever a client submits an enquiry!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                Easy Beginner Editing: How to Update Phone Numbers & Content:
              </h3>
              <p>
                You don't need complex coding skills to update course fees, change phone numbers, or add new services. All business information is stored in one single, clean file:
              </p>

              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-sky-400">
                  <span>File: src/data/content.ts</span>
                  <button
                    onClick={() => handleCopy('src/data/content.ts', 'file_path')}
                    className="hover:underline text-[11px]"
                  >
                    {copiedCode === 'file_path' ? 'Copied' : 'Copy Path'}
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Open <code>src/data/content.ts</code> to edit:
                </p>
                <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                  <li>Phone numbers: <code>8876824424</code> & <code>8638270649</code></li>
                  <li>Address: <code>Ranabari Market, NH-15, Lakhimpur, Assam</code></li>
                  <li>Course syllabi, fees, and batch times</li>
                  <li>Assamese & English translations</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950">
                <strong>Logo Replacement:</strong>
                <p className="mt-1">
                  When you are ready with your official Taxcent, Quantum, or CSC logos, simply save your image file as <code>public/logo.png</code> or replace <code>public/icon.svg</code>. The entire applet will adapt instantly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Taxcent Connect · Ranabari Market, Lakhimpur
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
