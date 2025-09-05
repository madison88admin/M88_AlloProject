-- Drop local_md columns from M88-Account_Allocation table
-- Run this script in your Supabase SQL editor

-- Drop the local_md columns that are no longer needed
ALTER TABLE "M88-Account_Allocation" 
DROP COLUMN IF EXISTS "wuxi_local_md",
DROP COLUMN IF EXISTS "pt_ujump_local_md",
DROP COLUMN IF EXISTS "singfore_local_md",
DROP COLUMN IF EXISTS "koreamel_local_md",
DROP COLUMN IF EXISTS "headsup_local_md";

-- Verify the columns were dropped
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'M88-Account_Allocation' 
AND column_name LIKE '%local_md%'
ORDER BY column_name;

-- Show remaining columns to confirm the structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'M88-Account_Allocation' 
AND column_name LIKE '%md%'
ORDER BY column_name;
