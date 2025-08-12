import React, { useState } from 'react';
import { User, Heart, Pill, AlertCircle, Edit, Save } from 'lucide-react';

interface MedicalInfo {
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyNotes: string;
}

interface PersonalInfo {
  name: string;
  age: string;
  emergencyId: string;
}

const EmergencyProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: 'John Doe',
    age: '35',
    emergencyId: 'EMR-2024-001',
  });

  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    bloodType: 'O+',
    allergies: ['Peanuts', 'Penicillin'],
    medications: ['Aspirin 81mg daily'],
    conditions: ['Hypertension'],
    emergencyNotes: 'Wear glasses for reading',
  });

  const [tempMedical, setTempMedical] = useState<MedicalInfo>(medicalInfo);
  const [tempPersonal, setTempPersonal] = useState<PersonalInfo>(personalInfo);

  const handleEdit = () => {
    setIsEditing(true);
    setTempMedical(medicalInfo);
    setTempPersonal(personalInfo);
  };

  const handleSave = () => {
    setMedicalInfo(tempMedical);
    setPersonalInfo(tempPersonal);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempMedical(medicalInfo);
    setTempPersonal(personalInfo);
    setIsEditing(false);
  };

  const addItem = (category: 'allergies' | 'medications' | 'conditions', value: string) => {
    if (value.trim()) {
      setTempMedical(prev => ({
        ...prev,
        [category]: [...prev[category], value.trim()],
      }));
    }
  };

  const removeItem = (category: 'allergies' | 'medications' | 'conditions', index: number) => {
    setTempMedical(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

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
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
            >
              <Save className="w-3 h-3" />
              <span>Save</span>
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
                  value={tempPersonal.name}
                  onChange={(e) => setTempPersonal(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-slate-800">{personalInfo.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempPersonal.age}
                  onChange={(e) => setTempPersonal(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-slate-800">{personalInfo.age} years old</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency ID</label>
              <p className="text-slate-600 text-sm font-mono">{personalInfo.emergencyId}</p>
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
                value={tempMedical.bloodType}
                onChange={(e) => setTempMedical(prev => ({ ...prev, bloodType: e.target.value }))}
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
              <p className="text-slate-800 font-semibold">{medicalInfo.bloodType || 'Not specified'}</p>
            )}
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Allergies</label>
            <div className="space-y-2">
              {(isEditing ? tempMedical.allergies : medicalInfo.allergies).map((allergy, index) => (
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
              {(!isEditing && medicalInfo.allergies.length === 0) && (
                <p className="text-slate-500 text-sm">No known allergies</p>
              )}
            </div>
          </div>

          {/* Medications */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Current Medications</label>
            <div className="space-y-2">
              {(isEditing ? tempMedical.medications : medicalInfo.medications).map((medication, index) => (
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
              {(!isEditing && medicalInfo.medications.length === 0) && (
                <p className="text-slate-500 text-sm">No current medications</p>
              )}
            </div>
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Medical Conditions</label>
            <div className="space-y-2">
              {(isEditing ? tempMedical.conditions : medicalInfo.conditions).map((condition, index) => (
                <div key={index} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <span className="text-amber-800">{condition}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeItem('conditions', index)}
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
                        addItem('conditions', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              )}
              {(!isEditing && medicalInfo.conditions.length === 0) && (
                <p className="text-slate-500 text-sm">No known medical conditions</p>
              )}
            </div>
          </div>

          {/* Emergency Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Notes</label>
            {isEditing ? (
              <textarea
                value={tempMedical.emergencyNotes}
                onChange={(e) => setTempMedical(prev => ({ ...prev, emergencyNotes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information emergency responders should know..."
              />
            ) : (
              <p className="text-slate-800">{medicalInfo.emergencyNotes || 'No additional notes'}</p>
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