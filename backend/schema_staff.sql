-- Supabase SQL Schema for SmartStay Staff Management
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('MANAGER', 'WAITER')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial seed data for Staff
INSERT INTO public.staff (name, email, password, role)
VALUES 
    ('Resort General Manager', 'manager@smartstay.com', 'manager123', 'MANAGER'),
    ('Head Waiter - Lead', 'waiter@smartstay.com', 'waiter123', 'WAITER')
ON CONFLICT (email) DO NOTHING;
