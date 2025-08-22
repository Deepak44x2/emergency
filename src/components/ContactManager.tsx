import React, { useState } from 'react';
import { Plus, Phone, MessageCircle, Edit, Trash2, User, Shield } from 'lucide-react';
import { useContacts } from '../contexts/ContactContext';

const ContactManager: React.FC = () => {
  const { contacts, loading, addContact, updateContact, deleteContact, setPrimaryContact } = useContacts();

  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    is_primary: false,
  });
  const [saving, setSaving] = useState(false);

  const handleAddContact = () => {
    setShowForm(true);
    setEditingContact(null);
    setFormData({ name: '', phone: '', relationship: '', is_primary: false });
  };

  const handleEditContact = (contact: any) => {
    setShowForm(true);
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      is_primary: contact.is_primary,
    });
  };

  const handleSaveContact = async () => {
    if (!formData.name || !formData.phone) return;

    setSaving(true);
    try {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
      } else {
        await addContact(formData);
      }
      setShowForm(false);
      setEditingContact(null);
    } catch (error) {
      console.error('Failed to save contact:', error);
      alert('Failed to save contact. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
      } catch (error) {
        console.error('Failed to delete contact:', error);
        alert('Failed to delete contact. Please try again.');
      }
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimaryContact(id);
    } catch (error) {
      console.error('Failed to set primary contact:', error);
      alert('Failed to set primary contact. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            {editingContact ? 'Edit Contact' : 'Add Contact'}
          </h2>
          <button
            onClick={() => setShowForm(false)}
            className="text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Relationship
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select relationship</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Child">Child</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_primary" className="text-sm font-medium text-slate-700">
                Set as primary emergency contact
              </label>
            </div>
          </div>

          <button
            onClick={handleSaveContact}
            disabled={!formData.name || !formData.phone}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {editingContact ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <span>{editingContact ? 'Update Contact' : 'Add Contact'}</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Emergency Contacts</h2>
          <p className="text-slate-600">Manage your emergency contact list</p>
        </div>
        <button
          onClick={handleAddContact}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No contacts added</h3>
          <p className="text-slate-600 mb-4">Add emergency contacts to be notified during alerts</p>
          <button
            onClick={handleAddContact}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
          >
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    contact.is_primary ? 'bg-red-100' : 'bg-slate-100'
                  }`}>
                    {contact.is_primary ? (
                      <Shield className="w-5 h-5 text-red-600" />
                    ) : (
                      <User className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-slate-800">{contact.name}</h3>
                      {contact.is_primary && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{contact.relationship}</p>
                    <p className="text-sm text-slate-500">{contact.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(`tel:${contact.phone}`)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(`sms:${contact.phone}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!contact.is_primary && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => handleSetPrimary(contact.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Set as Primary Contact
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Important Notes</h3>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>• Primary contact will be notified first during emergencies</li>
          <li>• All contacts will receive location updates during active alerts</li>
          <li>• Make sure all phone numbers are correct and active</li>
          <li>• Inform your contacts about this emergency system</li>
        </ul>
      </div>
    </div>
  );
};

export default ContactManager;