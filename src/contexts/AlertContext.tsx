import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase, EmergencyAlert } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Alert extends Omit<EmergencyAlert, 'created_at' | 'resolved_at'> {
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
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
  const { user } = useAuth();

  const createAlert = async (
    type: Alert['type'],
    location: Alert['location'],
    message?: string
  ): Promise<Alert> => {
    if (!user) {
      throw new Error('User must be authenticated to create alerts');
    }

    try {
      // Insert alert into database
      const { data: alertData, error: alertError } = await supabase
        .from('emergency_alerts')
        .insert({
          user_id: user.id,
          type,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          message: message || '',
        })
        .select()
        .single();

      if (alertError) {
        throw alertError;
      }

      // Record location in history
      await supabase
        .from('location_history')
        .insert({
          user_id: user.id,
          alert_id: alertData.id,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        });

      // Convert database format to local format
      const newAlert: Alert = {
        id: alertData.id,
        user_id: alertData.user_id,
        type: alertData.type,
        status: alertData.status,
        latitude: alertData.latitude,
        longitude: alertData.longitude,
        accuracy: alertData.accuracy,
        message: alertData.message,
        location: {
          latitude: alertData.latitude,
          longitude: alertData.longitude,
          accuracy: alertData.accuracy,
        },
        timestamp: new Date(alertData.created_at).getTime(),
        contacts_notified: [], // Will be populated by trigger
      };

      setAlerts(prev => [newAlert, ...prev]);
      setActiveAlert(newAlert);

      return newAlert;
    } catch (error) {
      console.error('Failed to create alert:', error);
      throw error;
    }
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
    if (!user) return;

    // Update in database
    supabase
      .from('emergency_alerts')
      .update({ status: 'resolved' })
      .eq('id', id)
      .eq('user_id', user.id)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to resolve alert:', error);
        } else {
          updateAlert(id, { status: 'resolved' });
          if (activeAlert?.id === id) {
            setActiveAlert(null);
          }
        }
      });
  };

  const cancelAlert = (id: string) => {
    if (!user) return;

    // Update in database
    supabase
      .from('emergency_alerts')
      .update({ status: 'false-alarm' })
      .eq('id', id)
      .eq('user_id', user.id)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to cancel alert:', error);
        } else {
          updateAlert(id, { status: 'false-alarm' });
          if (activeAlert?.id === id) {
            setActiveAlert(null);
          }
        }
      });
  };

  // Load alerts from database
  React.useEffect(() => {
    if (!user) return;

    const loadAlerts = async () => {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load alerts:', error);
        return;
      }

      const formattedAlerts: Alert[] = data.map(alert => ({
        id: alert.id,
        user_id: alert.user_id,
        type: alert.type,
        status: alert.status,
        latitude: alert.latitude,
        longitude: alert.longitude,
        accuracy: alert.accuracy,
        message: alert.message,
        location: {
          latitude: alert.latitude,
          longitude: alert.longitude,
          accuracy: alert.accuracy,
        },
        timestamp: new Date(alert.created_at).getTime(),
        contacts_notified: [],
      }));

      setAlerts(formattedAlerts);
      
      // Set active alert if there's one
      const activeAlertData = formattedAlerts.find(alert => alert.status === 'active');
      setActiveAlert(activeAlertData || null);
    };

    loadAlerts();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('emergency_alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_alerts',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Alert update received:', payload);
          loadAlerts(); // Reload alerts on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Track location during active alerts
  React.useEffect(() => {
    if (!activeAlert || !user) return;

    const trackLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            supabase
              .from('location_history')
              .insert({
                user_id: user.id,
                alert_id: activeAlert.id,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              })
              .then(({ error }) => {
                if (error) {
                  console.error('Failed to record location:', error);
                }
              });
          },
          (error) => {
            console.error('Failed to get location:', error);
          }
        );
      }
    };

    // Track location immediately and then every 30 seconds
    trackLocation();
    const interval = setInterval(trackLocation, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [activeAlert, user]);

  const cancelAlert = (id: string) => {
    updateAlert(id, { status: 'false-alarm' });
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