-- Add missing fields to payments table for proper data structure
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS plan_name TEXT;

-- Update existing records
UPDATE payments SET status = 'completed' WHERE status IS NULL;
