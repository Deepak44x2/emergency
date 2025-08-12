import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Clock, MapPin, Phone } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import { useAlert } from '../contexts/AlertContext';

const SOSButton: React.FC = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [alertType, setAlertType] = useState<'emergency' | 'medical' | 'fire' | 'police'>('emergency');
  const { location, getCurrentLocation, error: locationError } = useLocation();
  const { activeAlert, createAlert, resolveAlert, cancelAlert } = useAlert();

  const alertTypes = [
    { id: 'emergency', label: 'General Emergency', icon: AlertTriangle, color: 'bg-red-600 hover:bg-red-700' },
    { id: 'medical', label: 'Medical Emergency', icon: Shield, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'fire', label: 'Fire Emergency', icon: AlertTriangle, color: 'bg-orange-600 hover:bg-orange-700' },
    { id: 'police', label: 'Police Emergency', icon: Shield, color: 'bg-purple-600 hover:bg-purple-700' },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            handleEmergencyAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleEmergencyAlert = async () => {
    try {
      let currentLocation = location;
      if (!currentLocation) {
        currentLocation = await getCurrentLocation();
      }

      if (currentLocation) {
        await createAlert(alertType as any, {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          accuracy: currentLocation.accuracy,
        });
      } else {
        // Create alert without location if location is unavailable
        await createAlert(alertType as any, {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
        });
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleSOSPress = () => {
    if (countdown > 0) {
      // Cancel countdown
      setCountdown(0);
      setIsPressed(false);
      return;
    }

    if (activeAlert) {
      return;
    }

    setIsPressed(true);
    setCountdown(5);
  };

  const handleResolveAlert = () => {
    if (activeAlert) {
      resolveAlert(activeAlert.id);
    }
  };

  const handleCancelAlert = () => {
    if (activeAlert) {
      cancelAlert(activeAlert.id);
    }
  };

  if (activeAlert) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Alert Active</h2>
          <p className="text-red-700 mb-4">Emergency services and contacts have been notified</p>
          <div className="text-sm text-red-600 space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{new Date(activeAlert.timestamp).toLocaleTimeString()}</span>
            </div>
            {activeAlert.location.latitude !== 0 && (
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Location shared</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleResolveAlert}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
          >
            Mark as Resolved
          </button>
          <button
            onClick={handleCancelAlert}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            False Alarm
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Stay calm and wait for help to arrive. If this was a false alarm, please cancel it immediately.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      {/* Alert Type Selection */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Emergency Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {alertTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setAlertType(type.id as any)}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  alertType === type.id
                    ? type.color + ' text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-medium">{type.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SOS Button */}
      <div className="relative">
        <button
          onClick={handleSOSPress}
          disabled={countdown > 0 && countdown < 5}
          className={`w-40 h-40 mx-auto rounded-full font-bold text-2xl transition-all duration-200 ${
            countdown > 0
              ? 'bg-orange-600 hover:bg-orange-700 text-white animate-pulse'
              : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 shadow-lg'
          } ${isPressed ? 'scale-95' : ''}`}
        >
          {countdown > 0 ? (
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">{countdown}</span>
              <span className="text-sm">Tap to Cancel</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <AlertTriangle className="w-8 h-8 mb-1" />
              <span>SOS</span>
            </div>
          )}
        </button>

        {countdown > 0 && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full">
              Activating in {countdown}s
            </div>
          </div>
        )}
      </div>

      {/* Location Status */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className={`w-5 h-5 ${location ? 'text-green-600' : 'text-slate-400'}`} />
            <div>
              <div className="text-sm font-medium text-slate-800">Location Status</div>
              <div className={`text-xs ${location ? 'text-green-600' : 'text-slate-500'}`}>
                {location ? 'Location available' : locationError || 'Getting location...'}
              </div>
            </div>
          </div>
          {location && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">How to use SOS</h3>
        <div className="text-xs text-slate-600 space-y-1">
          <p>• Select your emergency type above</p>
          <p>• Press and hold SOS button</p>
          <p>• Alert activates after 5 seconds</p>
          <p>• Emergency contacts will be notified</p>
        </div>
      </div>

      {/* Emergency Call */}
      <button
        onClick={() => window.open('tel:911')}
        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <Phone className="w-5 h-5" />
        <span>Call 911 Directly</span>
      </button>
    </div>
  );
};

export default SOSButton;