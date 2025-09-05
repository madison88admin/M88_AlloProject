-- Add ID column to M88-NEWDATA table
-- Run this script in your Supabase SQL editor

-- Add the ID column as primary key with auto-increment
ALTER TABLE "M88-NEWDATA" 
ADD COLUMN IF NOT EXISTS "id" SERIAL PRIMARY KEY;

-- If the table already has data, you might need to update existing records
-- This will assign IDs to existing records
UPDATE "M88-NEWDATA" 
SET "id" = nextval('"M88-NEWDATA_id_seq"') 
WHERE "id" IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'M88-NEWDATA' 
AND column_name = 'id';
