import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Alert {
  id: string;
  type: 'emergency' | 'medical' | 'fire' | 'police';
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
  status: 'active' | 'resolved' | 'false-alarm';
  message?: string;
  contacts_notified: string[];
}

interface AlertContextType {
  alerts: Alert[];
  activeAlert: Alert | null;
  createAlert: (type: Alert['type'], location: Alert['location'], message?: string) => Promise<Alert>;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  resolveAlert: (id: string) => void;
  cancelAlert: (id: string) => void;
  getAlertHistory: () => Alert[];
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);

  const createAlert = async (
    type: Alert['type'],
    location: Alert['location'],
    message?: string
  ): Promise<Alert> => {
    const newAlert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      location,
      timestamp: Date.now(),
      status: 'active',
      message,
      contacts_notified: [],
    };

    setAlerts(prev => [newAlert, ...prev]);
    setActiveAlert(newAlert);

    // Here you would integrate with Supabase to save the alert
    // and notify emergency contacts
    console.log('Alert created:', newAlert);

    return newAlert;
  };

  const updateAlert = (id: string, updates: Partial<Alert>) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, ...updates } : alert
    ));

    if (activeAlert?.id === id) {
      setActiveAlert(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const resolveAlert = (id: string) => {
    updateAlert(id, { status: 'resolved' });
    if (activeAlert?.id === id) {
      setActiveAlert(null);
    }
  };

  const cancelAlert = (id: string) => {
    updateAlert(id, { status: 'false-alarm' });
    if (activeAlert?.id === id) {
      setActiveAlert(null);
    }
  };

  const getAlertHistory = () => {
    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  };

  const value: AlertContextType = {
    alerts,
    activeAlert,
    createAlert,
    updateAlert,
    resolveAlert,
    cancelAlert,
    getAlertHistory,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};