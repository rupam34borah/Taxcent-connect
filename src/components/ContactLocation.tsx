import React, { useState } from 'react';
import { Language } from '../types';
import { BUSINESS_CONTACTS } from '../data/content';
import { MapPin, Phone, MessageCircle, Clock, Navigation, CheckCircle2, Send, Mail } from 'lucide-react';

interface ContactLocationProps {
  lang: Language;
}

export const ContactLocation: React.FC<ContactLocationProps> = ({ lang }) => {
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickTopic, setQuickTopic] = useState('Tax & Accounting');
  const [callbackSent, setCallbackSent] = useState(false);

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || quickPhone.length < 10) return;

    const msg = `*Callback Request*\nName: ${quickName}\nPhone: ${quickPhone}\nDepartment: ${quickTopic}\nPlease call me back as soon as possible.`;
    window.open(`https://wa.me/91${BUSINESS_CONTACTS.phone1}?text=${encodeURIComponent(msg)}`, '_blank');
    setCallbackSent(true);
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Ranabari Market, NH 15, Lakhimpur, Assam')}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-12 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-bold text-sky-700 tracking-wider uppercase mb-1">
            {lang === 'as' ? 'স্থান আৰু পোনপটীয়া যোগাযোগ' : 'Location & Office Visit'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {lang === 'as' ? 'ৰণবাৰী বজাৰৰ কাৰ্যালয়লৈ আপোনাক স্বাগতম' : 'Visit Our Office in Ranabari Market, NH-15'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {lang === 'as'
              ? '১৫ নং ৰাষ্ট্ৰীয় ঘাইপথৰ দাঁতিত সুন্দৰ পাৰ্কিং আৰু সহজ যাতায়ত ব্যৱস্থাৰে আমাৰ তিনিওটা প্ৰতিষ্ঠান অৱস্থিত।'
              : 'Conveniently located along the NH-15 highway corridor in Lakhimpur with easy roadside parking and direct public transport connectivity.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Details & Working Hours */}
          <div className="lg:col-span-6 space-y-6">
            {/* Address Card */}
            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">
                    {lang === 'as' ? 'কাৰ্যালয়ৰ ঠিকনা (Office Address)' : 'Official Physical Address'}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {lang === 'as' ? BUSINESS_CONTACTS.addressAs : BUSINESS_CONTACTS.address}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Landmark: {BUSINESS_CONTACTS.landmark}
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={openGoogleMaps}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-sky-400" />
                      <span>{lang === 'as' ? 'Google Maps ত স্থান চাওক' : 'Open in Google Maps'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Phone & WhatsApp Connections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block mb-1">
                  Primary Line
                </span>
                <span className="text-base font-bold text-slate-900 block font-mono">
                  {BUSINESS_CONTACTS.phone1Formatted}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 mb-3">
                  Taxcent & CSC Ranabari
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${BUSINESS_CONTACTS.phone1}`}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold text-center transition-colors"
                  >
                    Call
                  </a>
                  <a
                    href={`https://wa.me/91${BUSINESS_CONTACTS.phone1}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs text-center transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                  Admissions & Desk
                </span>
                <span className="text-base font-bold text-slate-900 block font-mono">
                  {BUSINESS_CONTACTS.phone2Formatted}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 mb-3">
                  Quantum Learning Institute
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${BUSINESS_CONTACTS.phone2}`}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold text-center transition-colors"
                  >
                    Call
                  </a>
                  <a
                    href={`https://wa.me/91${BUSINESS_CONTACTS.phone2}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs text-center transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 shadow-xs flex items-start gap-3">
              <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700">
                <span className="font-bold text-slate-900 block text-sm mb-0.5">
                  {lang === 'as' ? 'কাৰ্যালয় খোলাৰ সময়সূচী' : 'Office & Lab Working Hours'}
                </span>
                <p>{lang === 'as' ? BUSINESS_CONTACTS.workingHoursAs : BUSINESS_CONTACTS.workingHours}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {lang === 'as'
                    ? 'জৰুৰী কৰ ফাইলিং বা নামভৰ্তিৰ বাবে পূৰ্বনিৰ্ধাৰিত সময়ত দেওবাৰেও খোলা থাকে।'
                    : 'Emergency tax return dates and scheduled student practical tests are also accommodated on Sundays.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Map Card + Quick Callback Form */}
          <div className="lg:col-span-6 space-y-6">
            {/* Visual Highway Map Graphic */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 relative">
              <div className="h-56 bg-gradient-to-br from-[#0a2540] to-slate-900 p-6 flex flex-col justify-between text-white relative">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider uppercase text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800">
                      NH-15 Highway Corridor
                    </span>
                    <h3 className="text-xl font-bold mt-1 text-white">
                      Ranabari Market, Lakhimpur
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg animate-pulse">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Distance Landmark</span>
                    <span className="text-slate-200 font-medium">Near Ranabari Tiniali / Chowk</span>
                  </div>
                  <button
                    onClick={openGoogleMaps}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Open Live GPS
                  </button>
                </div>
              </div>
            </div>

            {/* Quick 1-Minute Callback Request Card */}
            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                {lang === 'as' ? 'তৎক্ষণাৎ কলবেকৰ অনুৰোধ (Request a Callback)' : 'Need a Quick Phone Callback?'}
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                {lang === 'as'
                  ? 'আপোনাৰ ফোন নম্বৰ দিয়ক, আমাৰ পৰামৰ্শদাতাই অতি সোনকালে ফোন কৰিব।'
                  : 'Drop your number and our Lakhimpur desk will give you a quick callback.'}
              </p>

              {callbackSent ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {lang === 'as'
                      ? 'কলবেকৰ অনুৰোধ প্ৰেৰণ কৰা হৈছে! অতি সোনকালে ফোন পাম।'
                      : 'Callback request prepared! We will dial you back shortly.'}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="Your Name"
                      className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit Phone"
                      className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={quickTopic}
                      onChange={(e) => setQuickTopic(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="Tax & Accounting">Taxcent: Tax & Accounting</option>
                      <option value="Computer Courses">Quantum: Course Admissions</option>
                      <option value="CSC Digital Service">CSC Ranabari: Citizen Service</option>
                    </select>

                    <button
                      type="submit"
                      className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Send className="w-3.5 h-3.5 text-sky-400" />
                      <span>Request Call</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
