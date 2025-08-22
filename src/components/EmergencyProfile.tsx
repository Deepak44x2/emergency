import React, { useState } from 'react';
import { User, Heart, Pill, AlertCircle, Edit, Save } from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../hooks/useAuth';

const EmergencyProfile: React.FC = () => {
  const { profile, loading, updateProfile, createProfile } = useProfile();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    age: profile?.age || null,
    blood_type: profile?.blood_type || '',
    allergies: profile?.allergies || [],
    medications: profile?.medications || [],
    medical_conditions: profile?.medical_conditions || [],
    emergency_notes: profile?.emergency_notes || '',
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      full_name: profile?.full_name || '',
      age: profile?.age || null,
      blood_type: profile?.blood_type || '',
      allergies: profile?.allergies || [],
      medications: profile?.medications || [],
      medical_conditions: profile?.medical_conditions || [],
      emergency_notes: profile?.emergency_notes || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile) {
        await updateProfile(formData);
      } else {
        await createProfile(formData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const addItem = (category: 'allergies' | 'medications' | 'medical_conditions', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [category]: [...prev[category], value.trim()],
      }));
    }
  };

  const removeItem = (category: 'allergies' | 'medications' | 'medical_conditions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Emergency Profile</h2>
          <p className="text-slate-600">Medical and personal emergency information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-slate-600 hover:text-slate-700 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-3 py-1 rounded-lg text-sm"
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">Personal Information</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-slate-800">{profile?.full_name || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-slate-800">{profile?.age ? `${profile.age} years old` : 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency ID</label>
              <p className="text-slate-600 text-sm font-mono">{user?.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-slate-800">Medical Information</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* Blood Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Type</label>
            {isEditing ? (
              <select
                value={formData.blood_type}
                onChange={(e) => setFormData(prev => ({ ...prev, blood_type: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            ) : (
              <p className="text-slate-800 font-semibold">{profile?.blood_type || 'Not specified'}</p>
            )}
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Allergies</label>
            <div className="space-y-2">
              {(isEditing ? formData.allergies : profile?.allergies || []).map((allergy, index) => (
                <div key={index} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <span className="text-red-800">{allergy}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeItem('allergies', index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add allergy"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem('allergies', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              )}
              {(!isEditing && (!profile?.allergies || profile.allergies.length === 0)) && (
                <p className="text-slate-500 text-sm">No known allergies</p>
              )}
            </div>
          </div>

          {/* Medications */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Current Medications</label>
            <div className="space-y-2">
              {(isEditing ? formData.medications : profile?.medications || []).map((medication, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <span className="text-blue-800">{medication}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeItem('medications', index)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add medication"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem('medications', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              )}
              {(!isEditing && (!profile?.medications || profile.medications.length === 0)) && (
                <p className="text-slate-500 text-sm">No current medications</p>
              )}
            </div>
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Medical Conditions</label>
            <div className="space-y-2">
              {(isEditing ? formData.medical_conditions : profile?.medical_conditions || []).map((condition, index) => (
                <div key={index} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <span className="text-amber-800">{condition}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeItem('medical_conditions', index)}
                      className="text-amber-600 hover:text-amber-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add condition"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addItem('medical_conditions', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              )}
              {(!isEditing && (!profile?.medical_conditions || profile.medical_conditions.length === 0)) && (
                <p className="text-slate-500 text-sm">No known medical conditions</p>
              )}
            </div>
          </div>

          {/* Emergency Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Notes</label>
            {isEditing ? (
              <textarea
                value={formData.emergency_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information emergency responders should know..."
              />
            ) : (
              <p className="text-slate-800">{profile?.emergency_notes || 'No additional notes'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800 mb-1">Important Notice</h3>
            <p className="text-xs text-red-700">
              This information will be shared with emergency responders and your emergency contacts during active alerts. 
              Keep this information accurate and up-to-date. This is not a substitute for medical identification cards or bracelets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyProfile;