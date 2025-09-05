-- Migration script to add new factory-specific columns to M88-Account_Allocation table
-- Run this script in your Supabase SQL editor or database management tool

-- Add new factory-specific columns
ALTER TABLE "M88-Account_Allocation" 
ADD COLUMN IF NOT EXISTS "wuxi_jump_senior_md" TEXT,
ADD COLUMN IF NOT EXISTS "wuxi_shipping" TEXT,
ADD COLUMN IF NOT EXISTS "singfore_jump_senior_md" TEXT,
ADD COLUMN IF NOT EXISTS "singfore_shipping" TEXT,
ADD COLUMN IF NOT EXISTS "koreamel_jump_senior_md" TEXT,
ADD COLUMN IF NOT EXISTS "koreamel_shipping" TEXT,
ADD COLUMN IF NOT EXISTS "headsup_senior_md" TEXT,
ADD COLUMN IF NOT EXISTS "headsup_shipping" TEXT;

-- Add new coordinator columns
ALTER TABLE "M88-Account_Allocation" 
ADD COLUMN IF NOT EXISTS "wuxi_trims_coordinator" TEXT,
ADD COLUMN IF NOT EXISTS "wuxi_label_coordinator" TEXT,
ADD COLUMN IF NOT EXISTS "singfore_trims_coordinator" TEXT,
ADD COLUMN IF NOT EXISTS "singfore_label_coordinator" TEXT,
ADD COLUMN IF NOT EXISTS "headsup_trims_coordinator" TEXT,
ADD COLUMN IF NOT EXISTS "headsup_label_coordinator" TEXT,
ADD COLUMN IF NOT EXISTS "hz_pt_ujump_trims_coordinator" TEXT,
ADD COLUMN IF NOT EXISTS "hz_pt_ujump_label_coordinator" TEXT,
ADD COLUMN IF NOT EXISTS "koreamel_trims_coordinator" TEXT,
ADD COLUMN IF NOT EXISTS "koreamel_label_coordinator" TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN "M88-Account_Allocation"."wuxi_jump_senior_md" IS 'Wuxi Jump Senior MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."wuxi_shipping" IS 'Wuxi Shipping contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."singfore_jump_senior_md" IS 'Singfore Jump Senior MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."singfore_shipping" IS 'Singfore Shipping contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."koreamel_jump_senior_md" IS 'KoreaMel Jump Senior MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."koreamel_shipping" IS 'KoreaMel Shipping contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."headsup_senior_md" IS 'HeadsUp Senior MD contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."headsup_shipping" IS 'HeadsUp Shipping contact information';

-- Add comments for new coordinator columns
COMMENT ON COLUMN "M88-Account_Allocation"."wuxi_trims_coordinator" IS 'Wuxi Trims Coordinator contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."wuxi_label_coordinator" IS 'Wuxi Label Coordinator contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."singfore_trims_coordinator" IS 'Singfore Trims Coordinator contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."singfore_label_coordinator" IS 'Singfore Label Coordinator contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."headsup_trims_coordinator" IS 'HeadsUp Trims Coordinator contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."headsup_label_coordinator" IS 'HeadsUp Label Coordinator contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."hz_pt_ujump_trims_coordinator" IS 'HZ/PT U-JUMP Trims Coordinator contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."hz_pt_ujump_label_coordinator" IS 'HZ/PT U-JUMP Label Coordinator contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."koreamel_trims_coordinator" IS 'KoreaMel Trims Coordinator contact information';
COMMENT ON COLUMN "M88-Account_Allocation"."koreamel_label_coordinator" IS 'KoreaMel Label Coordinator contact information';

-- Update existing records to have empty string instead of NULL for new columns
-- This prevents issues with NULL values in the frontend
UPDATE "M88-Account_Allocation" 
SET 
    "wuxi_trims_coordinator" = COALESCE("wuxi_trims_coordinator", ''),
    "wuxi_label_coordinator" = COALESCE("wuxi_label_coordinator", ''),
    "singfore_trims_coordinator" = COALESCE("singfore_trims_coordinator", ''),
    "singfore_label_coordinator" = COALESCE("singfore_label_coordinator", ''),
    "headsup_trims_coordinator" = COALESCE("headsup_trims_coordinator", ''),
    "headsup_label_coordinator" = COALESCE("headsup_label_coordinator", ''),
    "hz_pt_ujump_trims_coordinator" = COALESCE("hz_pt_ujump_trims_coordinator", ''),
    "hz_pt_ujump_label_coordinator" = COALESCE("hz_pt_ujump_label_coordinator", ''),
    "koreamel_trims_coordinator" = COALESCE("koreamel_trims_coordinator", ''),
    "koreamel_label_coordinator" = COALESCE("koreamel_label_coordinator", '')
WHERE 
    "wuxi_trims_coordinator" IS NULL OR
    "wuxi_label_coordinator" IS NULL OR
    "singfore_trims_coordinator" IS NULL OR
    "singfore_label_coordinator" IS NULL OR
    "headsup_trims_coordinator" IS NULL OR
    "headsup_label_coordinator" IS NULL OR
    "hz_pt_ujump_trims_coordinator" IS NULL OR
    "hz_pt_ujump_label_coordinator" IS NULL OR
    "koreamel_trims_coordinator" IS NULL OR
    "koreamel_label_coordinator" IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'M88-Account_Allocation' 
AND column_name IN (
    'wuxi_jump_senior_md',
    'wuxi_shipping',
    'singfore_jump_senior_md',
    'singfore_shipping',
    'koreamel_jump_senior_md',
    'koreamel_shipping',
    'headsup_senior_md',
    'headsup_shipping',
    'wuxi_trims_coordinator',
    'wuxi_label_coordinator',
    'singfore_trims_coordinator',
    'singfore_label_coordinator',
    'headsup_trims_coordinator',
    'headsup_label_coordinator',
    'hz_pt_ujump_trims_coordinator',
    'hz_pt_ujump_label_coordinator',
    'koreamel_trims_coordinator',
    'koreamel_label_coordinator'
)
ORDER BY column_name;
