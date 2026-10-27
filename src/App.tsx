import React, { useState, useEffect } from 'react';
import { ActiveTab, Language } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BusinessPillars } from './components/BusinessPillars';
import { TaxServices } from './components/TaxServices';
import { QuantumCourses } from './components/QuantumCourses';
import { CSCServices } from './components/CSCServices';
import { Announcements } from './components/Announcements';
import { EnquirySection } from './components/EnquirySection';
import { ContactLocation } from './components/ContactLocation';
import { AboutSection } from './components/AboutSection';
import { QuickTaxEstimator } from './components/QuickTaxEstimator';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { FreeDeploymentModal } from './components/FreeDeploymentModal';
import { AcademicPortal } from './components/AcademicPortal';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

const VALID_TABS: ActiveTab[] = [
  'home',
  'tax',
  'courses',
  'csc',
  'estimator',
  'verify',
  'academic',
  'about',
  'contact',
  'enquire',
];

const getInitialTab = (): ActiveTab => {
  if (typeof window !== 'undefined') {
    // 1. Check URL hash (e.g. #verify, #estimator, #tax, etc.)
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
    if (hash && VALID_TABS.includes(hash as ActiveTab)) {
      return hash as ActiveTab;
    }
    // 2. Check localStorage fallback
    try {
      const stored = localStorage.getItem('taxcent_active_tab') as ActiveTab;
      if (stored && VALID_TABS.includes(stored)) {
        return stored;
      }
    } catch {}
  }
  return 'home';
};

const getInitialLang = (): Language => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('taxcent_lang') as Language;
      if (saved === 'en' || saved === 'as') return saved;
    } catch {}
  }
  return 'en';
};

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialTab);
  const [lang, setLang] = useState<Language>(getInitialLang);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState<boolean>(false);

  // Sync activeTab to URL hash and localStorage so refreshing reloads the exact same page
  useEffect(() => {
    try {
      localStorage.setItem('taxcent_active_tab', activeTab);
      const currentHash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
      if (activeTab === 'home') {
        if (currentHash && VALID_TABS.includes(currentHash as ActiveTab)) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        if (currentHash !== activeTab) {
          window.history.replaceState(null, '', `#${activeTab}`);
        }
      }
    } catch (err) {
      console.warn('Could not persist tab state:', err);
    }
  }, [activeTab]);

  // Sync language selection to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('taxcent_lang', lang);
    } catch {}
  }, [lang]);

  // Support browser Back and Forward buttons via hashchange
  useEffect(() => {
    const handleHashOrPop = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
      if (hash && VALID_TABS.includes(hash as ActiveTab)) {
        setActiveTab(hash as ActiveTab);
      } else if (!hash) {
        setActiveTab('home');
      }
    };

    window.addEventListener('hashchange', handleHashOrPop);
    window.addEventListener('popstate', handleHashOrPop);
    return () => {
      window.removeEventListener('hashchange', handleHashOrPop);
      window.removeEventListener('popstate', handleHashOrPop);
    };
  }, []);

  // Scroll to top on tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleSelectServiceForEnquiry = (service: string) => {
    setSelectedService(service);
    setSelectedCourse('');
    setActiveTab('enquire');
  };

  const handleSelectCourseForAdmission = (course: string) => {
    setSelectedCourse(course);
    setSelectedService('');
    setActiveTab('enquire');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Offline Connectivity Indicator */}
      <OfflineIndicator lang={lang} />

      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onOpenDeploymentGuide={() => setIsDeploymentGuideOpen(true)}
        onOpenQuickCallback={() => setActiveTab('contact')}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              lang={lang}
              setActiveTab={setActiveTab}
              onSelectServiceForEnquiry={handleSelectServiceForEnquiry}
            />
            <BusinessPillars
              lang={lang}
              setActiveTab={setActiveTab}
              onSelectServiceForEnquiry={handleSelectServiceForEnquiry}
              onSelectCourseForAdmission={handleSelectCourseForAdmission}
            />
            <Announcements
              lang={lang}
              setActiveTab={setActiveTab}
            />
            <ContactLocation
              lang={lang}
            />
            <AboutSection
              lang={lang}
              setActiveTab={setActiveTab}
            />
          </>
        )}

        {activeTab === 'tax' && (
          <TaxServices
            lang={lang}
            setActiveTab={setActiveTab}
            onSelectServiceForEnquiry={handleSelectServiceForEnquiry}
          />
        )}

        {activeTab === 'estimator' && (
          <QuickTaxEstimator
            lang={lang}
            setActiveTab={setActiveTab}
            onSelectServiceForEnquiry={handleSelectServiceForEnquiry}
          />
        )}

        {activeTab === 'courses' && (
          <QuantumCourses
            lang={lang}
            setActiveTab={setActiveTab}
            onSelectCourseForAdmission={handleSelectCourseForAdmission}
          />
        )}

        {activeTab === 'csc' && (
          <CSCServices
            lang={lang}
            setActiveTab={setActiveTab}
            onSelectServiceForEnquiry={handleSelectServiceForEnquiry}
          />
        )}

        {activeTab === 'verify' && (
          <AcademicPortal
            lang={lang}
            initialSubTab="verify"
          />
        )}

        {activeTab === 'academic' && (
          <AcademicPortal
            lang={lang}
            initialSubTab="student"
          />
        )}

        {activeTab === 'enquire' && (
          <EnquirySection
            lang={lang}
            initialService={selectedService}
            initialCourse={selectedCourse}
          />
        )}

        {activeTab === 'contact' && (
          <div className="py-6">
            <ContactLocation lang={lang} />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="py-6">
            <AboutSection lang={lang} setActiveTab={setActiveTab} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        lang={lang}
        onOpenDeploymentGuide={() => setIsDeploymentGuideOpen(true)}
      />

      {/* Mobile Sticky Bottom Tab Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
      />

      {/* Free Deployment & Android Testing Guide Modal */}
      <FreeDeploymentModal
        isOpen={isDeploymentGuideOpen}
        onClose={() => setIsDeploymentGuideOpen(false)}
        lang={lang}
      />

      {/* Authentication Modal for Student, Staff and Admin */}
      <AuthModal lang={lang} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
