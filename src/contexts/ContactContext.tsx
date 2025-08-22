import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, EmergencyContact } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface ContactContextType {
  contacts: EmergencyContact[];
  loading: boolean;
  addContact: (contact: Omit<EmergencyContact, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<EmergencyContact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  setPrimaryContact: (id: string) => Promise<void>;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};

interface ContactProviderProps {
  children: ReactNode;
}

export const ContactProvider: React.FC<ContactProviderProps> = ({ children }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load contacts from database
  useEffect(() => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    const loadContacts = async () => {
      try {
        const { data, error } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false })
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Failed to load contacts:', error);
        } else {
          setContacts(data || []);
        }
      } catch (error) {
        console.error('Failed to load contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('emergency_contacts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_contacts',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadContacts(); // Reload contacts on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const addContact = async (contactData: Omit<EmergencyContact, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          ...contactData,
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<EmergencyContact>) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  };

  const setPrimaryContact = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      // First, set all contacts to non-primary
      await supabase
        .from('emergency_contacts')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Then set the selected contact as primary
      const { error } = await supabase
        .from('emergency_contacts')
        .update({ is_primary: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to set primary contact:', error);
      throw error;
    }
  };

  const value: ContactContextType = {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    setPrimaryContact,
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};