import React, { useState, useEffect } from 'react';
import { Language, EnquiryRecord } from '../types';
import { BUSINESS_CONTACTS } from '../data/content';
import { 
  Send, 
  MessageCircle, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  GraduationCap, 
  ShieldCheck,
  History,
  Copy,
  ExternalLink
} from 'lucide-react';

interface EnquirySectionProps {
  lang: Language;
  initialService?: string;
  initialCourse?: string;
}

export const EnquirySection: React.FC<EnquirySectionProps> = ({
  lang,
  initialService = '',
  initialCourse = '',
}) => {
  const [formType, setFormType] = useState<'service' | 'course'>('service');
  
  // Service Form State
  const [serviceBusiness, setServiceBusiness] = useState<'taxcent' | 'csc'>('taxcent');
  const [serviceName, setServiceName] = useState<string>(initialService || 'GST Registration & Return Filing');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientLocality, setClientLocality] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('Morning (9 AM - 12 PM)');
  const [serviceNotes, setServiceNotes] = useState<string>('');

  // Course Form State
  const [courseName, setCourseName] = useState<string>(initialCourse || 'DCA (Diploma in Computer Applications)');
  const [studentName, setStudentName] = useState<string>('');
  const [studentPhone, setStudentPhone] = useState<string>('');
  const [studentQualification, setStudentQualification] = useState<string>('Higher Secondary (12th Pass)');
  const [preferredBatch, setPreferredBatch] = useState<string>('Morning (8:00 AM - 9:30 AM)');
  const [courseNotes, setCourseNotes] = useState<string>('');

  // UI & Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submittedTicket, setSubmittedTicket] = useState<EnquiryRecord | null>(null);
  const [history, setHistory] = useState<EnquiryRecord[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showSheetsGuide, setShowSheetsGuide] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Sync initial props
  useEffect(() => {
    if (initialService) {
      setFormType('service');
      setServiceName(initialService);
    }
  }, [initialService]);

  useEffect(() => {
    if (initialCourse) {
      setFormType('course');
      setCourseName(initialCourse);
    }
  }, [initialCourse]);

  // Load local submission history
  useEffect(() => {
    try {
      const saved = localStorage.getItem('taxcent_connect_enquiries');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // localStorage may be unavailable in some private windows
    }
  }, []);

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};

    if (!clientName.trim()) {
      errs.name = lang === 'as' ? 'অনুগ্ৰহ কৰি আপোনাৰ নাম লিখক' : 'Please enter your name';
    }
    if (!clientPhone.trim() || !validatePhone(clientPhone)) {
      errs.phone = lang === 'as' ? '১০ টা সংখ্যাৰ বৈধ ফোন নম্বৰ দিয়ক' : 'Enter a valid 10-digit mobile number';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    const record: EnquiryRecord = {
      id: `TC-${Date.now().toString().slice(-6)}`,
      type: serviceBusiness === 'taxcent' ? 'tax_service' : 'csc_service',
      businessName: serviceBusiness === 'taxcent' ? 'Taxcent Consulting Services' : 'CSC Ranabari',
      serviceOrCourse: serviceName,
      clientName: clientName.trim(),
      phone: clientPhone.trim(),
      location: clientLocality.trim() || 'Lakhimpur, Assam',
      notes: serviceNotes.trim(),
      submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      status: 'saved_locally',
    };

    saveRecordLocally(record);
    setSubmittedTicket(record);
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};

    if (!studentName.trim()) {
      errs.name = lang === 'as' ? 'অনুগ্ৰহ কৰি শিক্ষাৰ্থীৰ নাম লিখক' : 'Please enter student name';
    }
    if (!studentPhone.trim() || !validatePhone(studentPhone)) {
      errs.phone = lang === 'as' ? '১০ টা সংখ্যাৰ বৈধ ফোন নম্বৰ দিয়ক' : 'Enter a valid 10-digit mobile number';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    const record: EnquiryRecord = {
      id: `QL-${Date.now().toString().slice(-6)}`,
      type: 'course_admission',
      businessName: 'Quantum Learning Institute',
      serviceOrCourse: courseName,
      clientName: studentName.trim(),
      phone: studentPhone.trim(),
      location: `Qualification: ${studentQualification} | Batch: ${preferredBatch}`,
      notes: courseNotes.trim(),
      submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      status: 'saved_locally',
    };

    saveRecordLocally(record);
    setSubmittedTicket(record);
  };

  const saveRecordLocally = (record: EnquiryRecord) => {
    try {
      const updated = [record, ...history].slice(0, 20);
      setHistory(updated);
      localStorage.setItem('taxcent_connect_enquiries', JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  // Generate WhatsApp Direct link
  const openWhatsAppSubmission = (record: EnquiryRecord, targetPhone: string) => {
    let msg = '';
    if (record.type === 'course_admission') {
      msg = `*New Admission Enquiry [Quantum Learning Institute]*\nTicket: ${record.id}\nStudent: ${record.clientName}\nMobile: ${record.phone}\nCourse: ${record.serviceOrCourse}\nDetails: ${record.location}\nNotes: ${record.notes || 'None'}\nSent from Taxcent Connect web app`;
    } else {
      msg = `*New Service Enquiry [${record.businessName}]*\nTicket: ${record.id}\nClient: ${record.clientName}\nMobile: ${record.phone}\nService: ${record.serviceOrCourse}\nLocality: ${record.location}\nNotes: ${record.notes || 'None'}\nSent from Taxcent Connect web app`;
    }

    window.open(`https://wa.me/91${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyTicketDetails = (record: EnquiryRecord) => {
    const text = `Enquiry ID: ${record.id}\nBusiness: ${record.businessName}\nItem: ${record.serviceOrCourse}\nName: ${record.clientName}\nPhone: ${record.phone}\nDate: ${record.submittedAt}`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <section id="enquiry-section" className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Title & Subheading */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-sky-700 tracking-wider uppercase block mb-1">
            {lang === 'as' ? 'প্ৰত্যক্ষ যোগাযোগ আৰু অনলাইন অনুসন্ধান' : 'Direct Inquiry & Admission Portal'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {lang === 'as' ? 'অনলাইন অনুসন্ধান আৰু নামভৰ্তি ফৰ্ম' : 'Submit Service or Admission Enquiry'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            {lang === 'as'
              ? 'তলৰ ফৰ্মখন পূৰণ কৰক। আপোনাৰ তথ্য প্ৰস্তুত হ’লে পোনে পোনে আমাৰ হোৱাটছএপলৈ প্ৰেৰণ কৰিব পাৰিব অথবা আমাৰ দলে আপোনাক ফোন কৰিব।'
              : 'Select your requirement below. We validate your details locally and prepare a ready-to-send WhatsApp ticket or direct phone callback.'}
          </p>
        </div>

        {/* Form Type Tabs: Service vs Course */}
        <div className="flex rounded-xl bg-slate-200/80 p-1 mb-6 max-w-md mx-auto">
          <button
            onClick={() => {
              setFormType('service');
              setSubmittedTicket(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              formType === 'service'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>{lang === 'as' ? 'কৰ আৰু চিএছচি সেৱা' : 'Tax & CSC Services'}</span>
          </button>
          <button
            onClick={() => {
              setFormType('course');
              setSubmittedTicket(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              formType === 'course'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>{lang === 'as' ? 'কম্পিউটাৰ নামভৰ্তি' : 'Course Admission'}</span>
          </button>
        </div>

        {/* Confirmation Screen / WhatsApp Action Card if submitted */}
        {submittedTicket ? (
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-sky-300 shadow-xl space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-sky-700 uppercase">
                  Ticket Generated #{submittedTicket.id}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {lang === 'as' ? 'অনুসন্ধান প্ৰস্তুত কৰা হৈছে!' : 'Enquiry Ticket Prepared Successfully!'}
                </h3>
              </div>
            </div>

            {/* Honest Transparency Notice */}
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-900 space-y-1">
              <strong className="block font-semibold">
                {lang === 'as' ? 'গুৰুত্বপূৰ্ণ সতৰ্কতা (Client-Side Verification):' : 'Transparent Processing Notice:'}
              </strong>
              <p>
                {lang === 'as'
                  ? 'এই ফৰ্মৰ তথ্যসমূহ ব্ৰাউজাৰত সাজু হৈছে। আমাৰ কাৰ্যালয়ত তৎক্ষণাৎ পোনপটীয়াকৈ জমা দিবলৈ তলৰ "Send via WhatsApp" বুটামত ক্লিক কৰক।'
                  : 'Your request details have been processed and validated in your browser. To ensure instantaneous response without delay, tap below to dispatch directly to our WhatsApp numbers, or our office will review during business hours.'}
              </p>
            </div>

            {/* Generated Ticket Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Business:</span>
                  <span className="font-bold text-slate-900">{submittedTicket.businessName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Item:</span>
                  <span className="font-bold text-slate-900">{submittedTicket.serviceOrCourse}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">Client Name:</span>
                  <span className="font-medium text-slate-800">{submittedTicket.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Mobile Number:</span>
                  <span className="font-mono font-medium text-slate-800">{submittedTicket.phone}</span>
                </div>
              </div>
            </div>

            {/* Dispatch Action Buttons (WhatsApp & Call) */}
            <div className="space-y-3 pt-2">
              <span className="block text-xs font-bold text-slate-700 text-center">
                {lang === 'as' ? 'তৎক্ষণাৎ হোৱাটছএপত প্ৰেৰণ কৰক:' : 'Send Ticket Directly to Our Phone via WhatsApp:'}
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => openWhatsAppSubmission(submittedTicket, BUSINESS_CONTACTS.phone1)}
                  className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send to {BUSINESS_CONTACTS.phone1}</span>
                </button>

                <button
                  onClick={() => openWhatsAppSubmission(submittedTicket, BUSINESS_CONTACTS.phone2)}
                  className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send to {BUSINESS_CONTACTS.phone2}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  onClick={() => copyTicketDetails(submittedTicket)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Ticket Text'}</span>
                </button>

                <button
                  onClick={() => setSubmittedTicket(null)}
                  className="text-xs font-bold text-sky-700 hover:text-sky-900"
                >
                  {lang === 'as' ? 'অন্য এটা অনুসন্ধান কৰক' : 'Submit Another Enquiry'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* The Form */
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-md">
            {formType === 'service' ? (
              /* Service Enquiry Form */
              <form onSubmit={handleServiceSubmit} className="space-y-5">
                {/* Business selection: Taxcent vs CSC */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {lang === 'as' ? 'প্ৰতিষ্ঠান বাছনি কৰক:' : 'Choose Operation:'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setServiceBusiness('taxcent');
                        setServiceName('GST Registration & Return Filing');
                      }}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        serviceBusiness === 'taxcent'
                          ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-bold ring-2 ring-sky-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="block font-bold">Taxcent Consulting</span>
                      <span className="text-[11px] font-normal text-slate-500">GST, ITR, Accounts, DSC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setServiceBusiness('csc');
                        setServiceName('Govt Recruitment Online Application');
                      }}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        serviceBusiness === 'csc'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="block font-bold">CSC Ranabari</span>
                      <span className="text-[11px] font-normal text-slate-500">Sewa Setu, Forms, Bills</span>
                    </button>
                  </div>
                </div>

                {/* Specific Service Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'as' ? 'নিৰ্দিষ্ট সেৱা বাছনি কৰক:' : 'Specific Service Required:'}
                  </label>
                  <select
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    {serviceBusiness === 'taxcent' ? (
                      <>
                        <option value="GST Registration & Monthly Return Filing">GST Registration & Return Filing (GSTR-1/3B)</option>
                        <option value="Income Tax Return (ITR) Filing (Salaried/Business)">Income Tax Return (ITR-1/2/3/4) Filing</option>
                        <option value="TDS Return Filing & Form 16/16A Assistance">TDS Return Filing & Challans</option>
                        <option value="Commercial Bookkeeping & Tally Accounting">Tally Prime Bookkeeping & Accounting</option>
                        <option value="Udyam (MSME) Registration & Trade License">Udyam (MSME) Registration</option>
                        <option value="Class-3 Digital Signature Certificate (DSC)">Class-3 Digital Signature (DSC e-Token)</option>
                        <option value="PAN / TAN Card Services (New / Correction)">PAN / TAN Card Application & Correction</option>
                        <option value="Partnership Deed & Business Registration Setup">Partnership Deed & Business Setup</option>
                        <option value="Other Taxation / Legal Advisory">Other Accounting / Tax Compliance Query</option>
                      </>
                    ) : (
                      <>
                        <option value="Govt Recruitment Online Application (ADRE/APSC/Police)">Government Job & Exam Online Application</option>
                        <option value="Sewa Setu Assam & e-District Certificates (PRC/Caste/Income)">Sewa Setu Assam Certificates (PRC, Caste, Income)</option>
                        <option value="Ration Card / NFSA Assistance & Member Addition">Ration Card & NFSA Portal Assistance</option>
                        <option value="Dharitree Jamabandi & Mission Basundhara">Dharitree Jamabandi & Land Records</option>
                        <option value="Voter ID (EPIC) Online Application / Correction">Voter ID (EPIC) Online Services</option>
                        <option value="APDCL Electricity Bill & Instant Payment Receipt">APDCL Electricity Bill Payment & Receipt</option>
                        <option value="Passport Seva Application & Appointment Slot">Passport Seva Application & Appointment</option>
                        <option value="Other Digital Citizen Service">Other Citizen / Digital Portal Service</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Client Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'as' ? 'আপোনাৰ সম্পূৰ্ণ নাম *' : 'Your Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Rupom Borah"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 ${
                        errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                    />
                    {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'as' ? 'মোবাইল / হোৱাটছএপ নম্বৰ (১০ টা সংখ্যা) *' : 'Mobile / WhatsApp Number (10 digits) *'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 font-mono">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="8876824424"
                        className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500 ${
                          errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Locality & Callback time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {lang === 'as' ? 'ঠিকনা / অঞ্চল (ঐচ্ছিক)' : 'Locality / Village / Town (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={clientLocality}
                      onChange={(e) => setClientLocality(e.target.value)}
                      placeholder="e.g. Ranabari, Lakhimpur, Bihpuria"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {lang === 'as' ? 'ফোন কৰাৰ সুবিধাজনক সময়' : 'Preferred Callback Time'}
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                      <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                      <option value="Evening (5 PM - 7:30 PM)">Evening (5 PM - 7:30 PM)</option>
                      <option value="Anytime during working hours">Anytime during working hours</option>
                    </select>
                  </div>
                </div>

                {/* Optional Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'as' ? 'আপোনাৰ প্ৰয়োজনৰ বিষয়ে চমুকৈ লিখক (ঐচ্ছিক)' : 'Brief Description / Message (Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={serviceNotes}
                    onChange={(e) => setServiceNotes(e.target.value)}
                    placeholder={
                      lang === 'as'
                        ? 'যেনে: মোক নতুন জিএছটি পঞ্জীয়নৰ মাচুল জানিবলৈ ফোন কৰিব লাগে...'
                        : 'e.g. I need to file ITR for FY 2024-25 salaried income...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>{lang === 'as' ? 'অনুসন্ধান দাখিল কৰক (Submit Enquiry)' : 'Submit Enquiry & Prepare Ticket'}</span>
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-2">
                    🔒 Zero spam guarantee. We do not ask for bank passwords, PAN OTPs, or sensitive private documents online.
                  </p>
                </div>
              </form>
            ) : (
              /* Course Admission Enquiry Form */
              <form onSubmit={handleCourseSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'as' ? 'পাঠ্যক্ৰম বাছনি কৰক *' : 'Select Program / Course *'}
                  </label>
                  <select
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="DCA (Diploma in Computer Applications - 6 Months)">DCA (Diploma in Computer Applications) - 6 Months</option>
                    <option value="ADCA (Advanced Diploma in Computer Applications - 1 Year)">ADCA (Advanced Diploma) - 1 Year</option>
                    <option value="Tally Prime with GST & Computerized Accounting (3 Months)">Tally Prime with GST Accounting - 3 Months</option>
                    <option value="CCA (Certificate in Computer Applications - 3 Months)">CCA (Computer Basics Crash Course) - 3 Months</option>
                    <option value="Graphic Design & Adobe Photoshop Fundamentals (2 Months)">Graphic Design & Adobe Photoshop - 2 Months</option>
                    <option value="Web Development & Coding Fundamentals (3 Months)">Web Development & Coding - 3 Months</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'as' ? 'শিক্ষাৰ্থীৰ সম্পূৰ্ণ নাম *' : 'Student Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Manash Jyoti Nath"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                    />
                    {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {lang === 'as' ? 'মোবাইল / হোৱাটছএপ নম্বৰ (১০ টা সংখ্যা) *' : 'Mobile / WhatsApp Number (10 digits) *'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 font-mono">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="8638270649"
                        className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {lang === 'as' ? 'বৰ্তমান শিক্ষাগত অৰ্হতা' : 'Current Qualification'}
                    </label>
                    <select
                      value={studentQualification}
                      onChange={(e) => setStudentQualification(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Class 8th / 9th">Class 8th / 9th</option>
                      <option value="HSLC (10th Pass / Appearing)">HSLC (10th Pass / Appearing)</option>
                      <option value="Higher Secondary (12th Pass / Arts/Sc/Com)">Higher Secondary (12th Pass)</option>
                      <option value="Graduate / BA / BSc / BCom">Graduate (Degree completed/running)</option>
                      <option value="Working Professional / Business">Working Professional / Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {lang === 'as' ? 'সুবিধাজনক বেচৰ সময়' : 'Preferred Batch Timing'}
                    </label>
                    <select
                      value={preferredBatch}
                      onChange={(e) => setPreferredBatch(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Early Morning (7:30 AM - 9:00 AM)">Early Morning (7:30 AM - 9:00 AM)</option>
                      <option value="Morning (9:30 AM - 11:00 AM)">Morning (9:30 AM - 11:00 AM)</option>
                      <option value="Afternoon (1:30 PM - 3:00 PM)">Afternoon (1:30 PM - 3:00 PM)</option>
                      <option value="Evening (4:30 PM - 6:00 PM)">Evening (4:30 PM - 6:00 PM)</option>
                      <option value="Late Evening (6:00 PM - 7:30 PM)">Late Evening (6:00 PM - 7:30 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'as' ? 'বিশেষ প্ৰশ্ন বা অনুৰোধ (ঐচ্ছিক)' : 'Any Specific Queries about Syllabus or Installments (Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={courseNotes}
                    onChange={(e) => setCourseNotes(e.target.value)}
                    placeholder="e.g. Please send the fee structure and upcoming batch start date..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>{lang === 'as' ? 'নামভৰ্তিৰ বাবে আবেদন কৰক' : 'Apply for Admission & Reserve Seat'}</span>
                  </button>
                  <p className="text-[11px] text-slate-500 text-center mt-2">
                    🎓 Verified curriculum certificate issued upon course completion. 1-to-1 computer lab access.
                  </p>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Local History Drawer Toggle & Google Sheet Connector Guide */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {showHistory ? 'Hide History' : `My Past Enquiries (${history.length})`}
                </span>
              </button>
            )}

            <button
              onClick={() => setShowSheetsGuide(!showSheetsGuide)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showSheetsGuide ? 'Hide Google Sheets Guide' : 'Connect Google Sheets / Forms (Free)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Direct Call:</span>
            <a href={`tel:${BUSINESS_CONTACTS.phone1}`} className="font-semibold text-slate-800 hover:underline">
              {BUSINESS_CONTACTS.phone1}
            </a>
            <span>/</span>
            <a href={`tel:${BUSINESS_CONTACTS.phone2}`} className="font-semibold text-slate-800 hover:underline">
              {BUSINESS_CONTACTS.phone2}
            </a>
          </div>
        </div>

        {/* Past Enquiries List */}
        {showHistory && history.length > 0 && (
          <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Client Enquiries Stored in This Browser
            </h4>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {history.map((rec) => (
                <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div>
                    <span className="font-mono text-[10px] text-sky-700 font-bold block">{rec.id}</span>
                    <span className="font-bold text-slate-900">{rec.clientName}</span>
                    <span className="text-slate-500 ml-2">({rec.serviceOrCourse})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{rec.submittedAt}</span>
                    <button
                      onClick={() => openWhatsAppSubmission(rec, BUSINESS_CONTACTS.phone1)}
                      className="px-2 py-1 rounded-md bg-[#25D366] text-slate-950 font-bold text-[10px] hover:bg-[#20ba59]"
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Google Sheets / Forms Free Integration Guide */}
        {showSheetsGuide && (
          <div className="mt-4 p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm text-xs text-slate-700 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                How to Receive Leads Automatically into a Free Google Sheet:
              </h4>
            </div>
            <p className="leading-relaxed">
              Because you have a <strong>₹0 zero budget</strong>, you do NOT need to pay for any backend database (like Firebase or PostgreSQL) if you just want to collect leads! Here is how to configure it completely free:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-1">
              <li>
                <strong>Option A (Ready right now):</strong> When a client clicks <em>"Submit"</em>, the app pre-fills their exact details directly into your WhatsApp (8876824424 / 8638270649). You receive an instant alert on your phone with zero setup and zero cost.
              </li>
              <li>
                <strong>Option B (Google Form Webhook):</strong> Create a simple free Google Form with fields: <em>Name, Phone, Service/Course, Locality</em>.
              </li>
              <li>
                Link that Google Form to a <strong>Google Sheet</strong> (one click in Google Forms &gt; Responses &gt; Link to Sheets).
              </li>
              <li>
                Copy the Google Form submission URL (<code>formResponse</code>) and paste it into this app’s configuration to log every lead into your Google Sheet automatically!
              </li>
            </ol>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-[11px]">
              💡 <em>This app is engineered to be 100% cost-free forever with no paid servers or maintenance fees.</em>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
