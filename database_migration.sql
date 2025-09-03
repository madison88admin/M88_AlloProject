-- Migration script to add new factory-specific columns to M88-Account_Allocation table
-- Run this script in your Supabase SQL editor or database management tool

-- Add new factory-specific columns
ALTER TABLE "M88-Account_Allocation" 
ADD COLUMN IF NOT EXISTS "wuxi_jump_senior_md" TEXT,
ADD COLUMN IF NOT EXISTS "wuxi_local_md" TEXT,
ADD COLUMN IF NOT EXISTS "wuxi_shipping" TEXT,
ADD COLUMN IF NOT EXISTS "singfore_jump_senior_md" TEXT,
ADD COLUMN IF NOT EXISTS "singfore_local_md" TEXT,
ADD COLUMN IF NOT EXISTS "singfore_shipping" TEXT,
ADD COLUMN IF NOT EXISTS "koreamel_jump_senior_md" TEXT,
ADD COLUMN IF NOT EXISTS "koreamel_local_md" TEXT,
ADD COLUMN IF NOT EXISTS "koreamel_shipping" TEXT,
ADD COLUMN IF NOT EXISTS "headsup_senior_md" TEXT,
ADD COLUMN IF NOT EXISTS "headsup_local_md" TEXT,
ADD COLUMN IF NOT EXISTS "headsup_shipping" TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN "M88-Account_Allocation"."wuxi_jump_senior_md" IS 'Wuxi Jump Senior MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."wuxi_local_md" IS 'Wuxi Local MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."wuxi_shipping" IS 'Wuxi Shipping contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."singfore_jump_senior_md" IS 'Singfore Jump Senior MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."singfore_local_md" IS 'Singfore Local MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."singfore_shipping" IS 'Singfore Shipping contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."koreamel_jump_senior_md" IS 'KoreaMel Jump Senior MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."koreamel_local_md" IS 'KoreaMel Local MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."koreamel_shipping" IS 'KoreaMel Shipping contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."headsup_senior_md" IS 'HeadsUp Senior MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."headsup_local_md" IS 'HeadsUp Local MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."headsup_shipping" IS 'HeadsUp Shipping contact information';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'M88-Account_Allocation' 
AND column_name IN (
    'wuxi_jump_senior_md',
    'wuxi_local_md', 
    'wuxi_shipping',
    'singfore_jump_senior_md',
    'singfore_local_md',
    'singfore_shipping',
    'koreamel_jump_senior_md',
    'koreamel_local_md',
    'koreamel_shipping',
    'headsup_senior_md',
    'headsup_local_md',
    'headsup_shipping'
)
ORDER BY column_name;
