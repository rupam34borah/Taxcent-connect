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
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { FreeDeploymentModal } from './components/FreeDeploymentModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [lang, setLang] = useState<Language>('en');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState<boolean>(false);

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
    </div>
  );
}
