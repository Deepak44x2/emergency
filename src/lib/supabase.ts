import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  full_name: string | null;
  age: number | null;
  blood_type: string | null;
  allergies: string[];
  medications: string[];
  medical_conditions: string[];
  emergency_notes: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
}

export interface EmergencyAlert {
  id: string;
  user_id: string;
  type: 'emergency' | 'medical' | 'fire' | 'police';
  status: 'active' | 'resolved' | 'false-alarm';
  latitude: number;
  longitude: number;
  accuracy: number;
  message: string;
  created_at: string;
  resolved_at: string | null;
}

export interface LocationHistory {
  id: string;
  user_id: string;
  alert_id: string | null;
  latitude: number;
  longitude: number;
  accuracy: number;
  recorded_at: string;
}

export interface AlertNotification {
  id: string;
  alert_id: string;
  contact_id: string;
  notification_type: 'sms' | 'call' | 'email';
  status: 'sent' | 'delivered' | 'failed';
  sent_at: string;
}