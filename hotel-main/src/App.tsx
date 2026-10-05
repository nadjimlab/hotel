/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { CustomerPortal } from './components/CustomerPortal.tsx';
import { Hero } from './components/Hero.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { Navbar } from './components/Navbar.tsx';
import { RoomCard } from './components/RoomCard.tsx';
import { RoomsSection } from './components/RoomsSection.tsx';
import {
  ActivitiesSection,
  DiningSection,
  Footer,
  LocationSection,
  SpaSection
} from './components/Sections.tsx';

import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { Room } from './types/index.ts';

function MainLayout() {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<string>('home');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const [preselectedRoom, setPreselectedRoom] = useState<Room | null>(null);
  const [searchParams, setSearchParams] = useState<any>({});

  const handleOpenBooking = (room?: Room) => {
    setPreselectedRoom(room || null);
    setBookingModalOpen(true);
  };

  const handleSearch = (params: any) => {
    setSearchParams(params);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#241C16] flex flex-col font-sans selection:bg-[#D4A359] selection:text-[#17120E] overflow-x-hidden pb-16 lg:pb-0">
      
      {/* Top Navbar */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content Router */}
      <main className="relative z-10 flex-1">
        {currentView === 'home' && (
          <>
            <Hero
              onOpenBooking={() => handleOpenBooking()}
              onExplore={() => {
                const el = document.getElementById('rooms');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onSearch={handleSearch}
            />
            <RoomsSection onSelectRoom={(room) => handleOpenBooking(room)} />
            <DiningSection onOpenBooking={() => handleOpenBooking()} />
            <SpaSection onOpenBooking={() => handleOpenBooking()} />
            <ActivitiesSection onOpenBooking={() => handleOpenBooking()} />
            <LocationSection />
          </>
        )}

        {currentView === 'rooms' && (
          <div className="py-8 bg-[#18120E] min-h-[85vh]">
            <RoomsSection onSelectRoom={(room) => handleOpenBooking(room)} />
          </div>
        )}

        {currentView === 'dining' && (
          <div className="py-8 bg-[#18120E] min-h-[85vh]">
            <DiningSection onOpenBooking={() => handleOpenBooking()} />
          </div>
        )}

        {currentView === 'spa' && (
          <div className="py-8 bg-[#221A15] min-h-[85vh]">
            <SpaSection onOpenBooking={() => handleOpenBooking()} />
          </div>
        )}

        {currentView === 'activities' && (
          <div className="py-8 bg-[#18120E] min-h-[85vh]">
            <ActivitiesSection onOpenBooking={() => handleOpenBooking()} />
          </div>
        )}

        {currentView === 'location' && (
          <div className="py-8 bg-[#221A15] min-h-[85vh]">
            <LocationSection />
          </div>
        )}

        {currentView === 'my-bookings' && (
          <div className="py-8 bg-[#18120E] min-h-[85vh]">
            <CustomerPortal />
          </div>
        )}

        {currentView === 'admin' && (
          <div className="py-8 bg-[#18120E] min-h-[85vh]">
            <AdminDashboard />
          </div>
        )}
      </main>



      {/* Booking Wizard Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setPreselectedRoom(null);
        }}
        preselectedRoom={preselectedRoom}
        initialCheckIn={searchParams.checkIn}
        initialCheckOut={searchParams.checkOut}
        initialAdults={searchParams.adults}
        initialChildren={searchParams.children}
      />

      {/* Global Footer */}
      <Footer />

      {/* Ergonomic Mobile Thumb Navigation */}
      <MobileBottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenBooking={() => handleOpenBooking()}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}
