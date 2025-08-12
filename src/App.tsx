import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Users, History, Settings, Phone, Shield } from 'lucide-react';
import SOSButton from './components/SOSButton';
import LocationTracker from './components/LocationTracker';
import ContactManager from './components/ContactManager';
import AlertHistory from './components/AlertHistory';
import EmergencyProfile from './components/EmergencyProfile';
import { LocationProvider } from './contexts/LocationContext';
import { AlertProvider } from './contexts/AlertContext';

function App() {
  const [activeTab, setActiveTab] = useState('sos');

  const tabs = [
    { id: 'sos', label: 'SOS', icon: Shield },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'sos':
        return <SOSButton />;
      case 'location':
        return <LocationTracker />;
      case 'contacts':
        return <ContactManager />;
      case 'history':
        return <AlertHistory />;
      case 'profile':
        return <EmergencyProfile />;
      default:
        return <SOSButton />;
    }
  };

  return (
    <LocationProvider>
      <AlertProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-md mx-auto px-4 py-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-800">Emergency SOS</h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-md mx-auto px-4 py-6">
            {renderActiveTab()}
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
            <div className="max-w-md mx-auto px-2 py-2">
              <div className="flex justify-around">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'text-red-600 bg-red-50'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-red-600' : ''}`} />
                      <span className="text-xs font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Emergency Call Button */}
          <div className="fixed top-4 right-4">
            <button
              onClick={() => window.open('tel:911')}
              className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>
      </AlertProvider>
    </LocationProvider>
  );
}

export default App;