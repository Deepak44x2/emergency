import React from 'react';
import { Clock, MapPin, AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

const AlertHistory: React.FC = () => {
  const { getAlertHistory } = useAlert();
  const alerts = getAlertHistory();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return Shield;
      case 'fire':
        return AlertTriangle;
      case 'police':
        return Shield;
      default:
        return AlertTriangle;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return CheckCircle;
      case 'false-alarm':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-red-600 bg-red-50';
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'false-alarm':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical':
        return 'text-blue-600 bg-blue-50';
      case 'fire':
        return 'text-orange-600 bg-orange-50';
      case 'police':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-red-600 bg-red-50';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (alerts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Alert History</h2>
          <p className="text-slate-600">View your past emergency alerts</p>
        </div>

        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No alerts yet</h3>
          <p className="text-slate-600">Your emergency alert history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Alert History</h2>
        <p className="text-slate-600">{alerts.length} alert{alerts.length !== 1 ? 's' : ''} recorded</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const AlertIcon = getAlertIcon(alert.type);
          const StatusIcon = getStatusIcon(alert.status);

          return (
            <div
              key={alert.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(alert.type)}`}>
                    <AlertIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-slate-800 capitalize">
                        {alert.type} Alert
                      </h3>
                      <div className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getStatusColor(alert.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="capitalize">{alert.status === 'false-alarm' ? 'False Alarm' : alert.status}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(alert.timestamp)}</span>
                      </div>
                      
                      {alert.location.latitude !== 0 && alert.location.longitude !== 0 && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                          </span>
                          <button
                            onClick={() => window.open(`https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`, '_blank')}
                            className="text-blue-600 hover:text-blue-700 text-xs underline"
                          >
                            View
                          </button>
                        </div>
                      )}

                      {alert.message && (
                        <p className="text-slate-700 mt-2 text-sm">
                          "{alert.message}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {alert.contacts_notified.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="text-xs text-slate-500">
                    Contacts notified: {alert.contacts_notified.length}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Alert Statistics</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-800">
              {alerts.filter(a => a.status === 'active').length}
            </div>
            <div className="text-xs text-blue-600">Active</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-800">
              {alerts.filter(a => a.status === 'resolved').length}
            </div>
            <div className="text-xs text-green-600">Resolved</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">
              {alerts.filter(a => a.status === 'false-alarm').length}
            </div>
            <div className="text-xs text-gray-600">False Alarms</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertHistory;