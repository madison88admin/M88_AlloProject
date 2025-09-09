-- Add FA (Factory Assignment) columns to M88-NEWDATA table
-- Run this script in your Supabase SQL editor

-- Add FA columns for factory assignments
ALTER TABLE "M88-NEWDATA" 
ADD COLUMN IF NOT EXISTS "fa_wuxi" TEXT,
ADD COLUMN IF NOT EXISTS "fa_hz_u" TEXT,
ADD COLUMN IF NOT EXISTS "fa_pt_uwu" TEXT,
ADD COLUMN IF NOT EXISTS "fa_korea_m" TEXT,
ADD COLUMN IF NOT EXISTS "fa_singfore" TEXT,
ADD COLUMN IF NOT EXISTS "fa_heads_up" TEXT;

-- Add comments to document the FA columns
COMMENT ON COLUMN "M88-NEWDATA"."fa_wuxi" IS 'Factory Assignment - Wuxi';
COMMENT ON COLUMN "M88-NEWDATA"."fa_hz_u" IS 'Factory Assignment - HZ-U';
COMMENT ON COLUMN "M88-NEWDATA"."fa_pt_uwu" IS 'Factory Assignment - PT-UWU';
COMMENT ON COLUMN "M88-NEWDATA"."fa_korea_m" IS 'Factory Assignment - Korea-M';
COMMENT ON COLUMN "M88-NEWDATA"."fa_singfore" IS 'Factory Assignment - Singfore';
COMMENT ON COLUMN "M88-NEWDATA"."fa_heads_up" IS 'Factory Assignment - Heads Up';

-- Initialize FA columns with empty strings for existing records
UPDATE "M88-NEWDATA" 
SET 
    "fa_wuxi" = COALESCE("fa_wuxi", ''),
    "fa_hz_u" = COALESCE("fa_hz_u", ''),
    "fa_pt_uwu" = COALESCE("fa_pt_uwu", ''),
    "fa_korea_m" = COALESCE("fa_korea_m", ''),
    "fa_singfore" = COALESCE("fa_singfore", ''),
    "fa_heads_up" = COALESCE("fa_heads_up", '')
WHERE 
    "fa_wuxi" IS NULL OR
    "fa_hz_u" IS NULL OR
    "fa_pt_uwu" IS NULL OR
    "fa_korea_m" IS NULL OR
    "fa_singfore" IS NULL OR
    "fa_heads_up" IS NULL;

-- Verify the FA columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'M88-NEWDATA' 
AND column_name IN (
    'fa_wuxi',
    'fa_hz_u', 
    'fa_pt_uwu',
    'fa_korea_m',
    'fa_singfore',
    'fa_heads_up'
)
ORDER BY column_name;

-- Test query to see the FA columns in action
SELECT 
    "all_brand",
    "wuxi_moretti",
    "fa_wuxi",
    "hz_u_jump", 
    "fa_hz_u",
    "pt_u_jump",
    "fa_pt_uwu"
FROM "M88-NEWDATA" 
LIMIT 5;
