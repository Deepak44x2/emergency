import React, { useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, Share2, Clock } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

const LocationTracker: React.FC = () => {
  const { location, isTracking, error, startTracking, stopTracking, getCurrentLocation } = useLocation();

  useEffect(() => {
    if (!location) {
      getCurrentLocation();
    }
  }, []);

  const formatAccuracy = (accuracy: number) => {
    if (accuracy < 1000) {
      return `±${Math.round(accuracy)}m`;
    }
    return `±${(accuracy / 1000).toFixed(1)}km`;
  };

  const formatCoordinate = (coord: number, isLatitude: boolean) => {
    const direction = isLatitude ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  const shareLocation = async () => {
    if (!location) return;
    
    const locationText = `My current location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Current Location',
          text: locationText,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(locationText);
      alert('Location copied to clipboard!');
    }
  };

  const openInMaps = () => {
    if (!location) return;
    window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Location Tracking</h2>
        <p className="text-slate-600">Real-time GPS location for emergency services</p>
      </div>

      {/* Location Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                location ? 'bg-green-100' : 'bg-slate-100'
              }`}>
                <MapPin className={`w-5 h-5 ${location ? 'text-green-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">GPS Status</h3>
                <p className={`text-sm ${location ? 'text-green-600' : 'text-slate-500'}`}>
                  {location ? 'Location available' : 'Getting location...'}
                </p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              location ? 'bg-green-500' : 'bg-slate-300'
            } ${isTracking ? 'animate-pulse' : ''}`}></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {location && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Latitude
                  </div>
                  <div className="font-mono text-sm text-slate-800">
                    {formatCoordinate(location.latitude, true)}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Longitude
                  </div>
                  <div className="font-mono text-sm text-slate-800">
                    {formatCoordinate(location.longitude, false)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  <Navigation className="w-3 h-3" />
                  <span>Accuracy: {formatAccuracy(location.accuracy)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(location.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={isTracking ? stopTracking : startTracking}
            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isTracking
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isTracking ? (
              <>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Stop Tracking</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Start Tracking</span>
              </>
            )}
          </button>

          <button
            onClick={getCurrentLocation}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update</span>
          </button>
        </div>

        {location && (
          <>
            <button
              onClick={openInMaps}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium bg-slate-700 hover:bg-slate-800 text-white transition-all duration-200"
            >
              <MapPin className="w-4 h-4" />
              <span>View in Maps</span>
            </button>

            <button
              onClick={shareLocation}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Location</span>
            </button>
          </>
        )}
      </div>

      {/* Location Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Location Privacy</h3>
        <p className="text-xs text-blue-700">
          Your location is only shared during active emergency alerts. Location data is encrypted and used solely for emergency response purposes.
        </p>
      </div>
    </div>
  );
};

export default LocationTracker;