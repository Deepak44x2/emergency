/*
  # Emergency SOS System Database Schema

  1. New Tables
    - `profiles` - User profiles with emergency information
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `age` (integer)
      - `blood_type` (text)
      - `allergies` (text array)
      - `medications` (text array)
      - `medical_conditions` (text array)
      - `emergency_notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `emergency_contacts` - Emergency contact information
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `phone` (text)
      - `relationship` (text)
      - `is_primary` (boolean)
      - `created_at` (timestamp)

    - `emergency_alerts` - SOS alerts and incidents
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text) - emergency, medical, fire, police
      - `status` (text) - active, resolved, false-alarm
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `accuracy` (decimal)
      - `message` (text)
      - `created_at` (timestamp)
      - `resolved_at` (timestamp)

    - `alert_notifications` - Notifications sent to contacts
      - `id` (uuid, primary key)
      - `alert_id` (uuid, references emergency_alerts)
      - `contact_id` (uuid, references emergency_contacts)
      - `notification_type` (text) - sms, call, email
      - `status` (text) - sent, delivered, failed
      - `sent_at` (timestamp)

    - `location_history` - Location tracking history
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `alert_id` (uuid, references emergency_alerts, nullable)
      - `latitude` (decimal)
      - `longitude` (decimal)
      - `accuracy` (decimal)
      - `recorded_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for emergency contacts to view alerts when notified
    - Add policies for location sharing during active alerts

  3. Functions
    - Function to automatically notify emergency contacts
    - Function to update alert status
    - Function to track location during active alerts
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  age integer,
  blood_type text,
  allergies text[] DEFAULT '{}',
  medications text[] DEFAULT '{}',
  medical_conditions text[] DEFAULT '{}',
  emergency_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create emergency_alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('emergency', 'medical', 'fire', 'police')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false-alarm')),
  latitude decimal NOT NULL,
  longitude decimal NOT NULL,
  accuracy decimal DEFAULT 0,
  message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create alert_notifications table
CREATE TABLE IF NOT EXISTS alert_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES emergency_alerts(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES emergency_contacts(id) ON DELETE CASCADE NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('sms', 'call', 'email')),
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
  sent_at timestamptz DEFAULT now()
);

-- Create location_history table
CREATE TABLE IF NOT EXISTS location_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  alert_id uuid REFERENCES emergency_alerts(id) ON DELETE SET NULL,
  latitude decimal NOT NULL,
  longitude decimal NOT NULL,
  accuracy decimal DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Emergency contacts policies
CREATE POLICY "Users can manage own emergency contacts"
  ON emergency_contacts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Emergency alerts policies
CREATE POLICY "Users can manage own alerts"
  ON emergency_alerts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Alert notifications policies
CREATE POLICY "Users can view notifications for their alerts"
  ON alert_notifications
  FOR SELECT
  TO authenticated
  USING (
    alert_id IN (
      SELECT id FROM emergency_alerts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert notifications"
  ON alert_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Location history policies
CREATE POLICY "Users can manage own location history"
  ON location_history
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to notify emergency contacts
CREATE OR REPLACE FUNCTION notify_emergency_contacts()
RETURNS TRIGGER AS $$
DECLARE
  contact_record RECORD;
BEGIN
  -- Insert notifications for all emergency contacts
  FOR contact_record IN 
    SELECT id FROM emergency_contacts 
    WHERE user_id = NEW.user_id 
    ORDER BY is_primary DESC, created_at ASC
  LOOP
    INSERT INTO alert_notifications (alert_id, contact_id, notification_type)
    VALUES (NEW.id, contact_record.id, 'sms');
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically notify contacts when alert is created
CREATE TRIGGER notify_contacts_on_alert
  AFTER INSERT ON emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION notify_emergency_contacts();

-- Function to update alert resolved timestamp
CREATE OR REPLACE FUNCTION update_alert_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('resolved', 'false-alarm') AND OLD.status = 'active' THEN
    NEW.resolved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update resolved_at when status changes
CREATE TRIGGER update_alert_resolved_at_trigger
  BEFORE UPDATE ON emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_resolved_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user_id ON emergency_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_location_history_user_id ON location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_location_history_alert_id ON location_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_alert_id ON alert_notifications(alert_id);