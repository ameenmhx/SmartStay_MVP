-- SmartStay: Rooms Table Migration
-- Run this in your Supabase SQL Editor to enable guest phone check-in.

-- Create the rooms table with is_active and guest_phone columns
CREATE TABLE IF NOT EXISTS rooms (
  room_number TEXT PRIMARY KEY,
  is_active   BOOLEAN  DEFAULT false,
  guest_phone TEXT     NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- If the table already exists but is missing columns, run these ALTER statements:
-- ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
-- ALTER TABLE rooms ADD COLUMN IF NOT EXISTS guest_phone TEXT NULL;
