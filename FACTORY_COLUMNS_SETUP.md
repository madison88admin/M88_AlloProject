# Factory-Specific Columns Setup

## Overview
This document outlines the new factory-specific columns that have been added to the M88 Account Allocation system.

## New Columns Added

### 1. Wuxi Factory (`factory_Wuxi`)
- `wuxi_jump_senior_md` - Wuxi Jump Senior MD
- `wuxi_local_md` - Wuxi Local MD  
- `wuxi_shipping` - Wuxi Shipping
- `fa_wuxi` - FA Wuxi (existing)

### 2. PT UJUMP Factory (`factory_PTwuuUjump`)
- `hz_pt_u_jump_senior_md` - HZ/PT U-JUMP Senior MD (existing)
- `pt_ujump_local_md` - PT UJUMP Local MD (existing)
- `hz_u_jump_shipping` - HZ U-JUMP Shipping (existing)
- `pt_ujump_shipping` - PT UJUMP Shipping (existing)
- `fa_pt` - FA PT (existing)

### 3. Singfore Factory (`factory_Singfore`)
- `singfore_jump_senior_md` - Singfore Jump Senior MD
- `singfore_local_md` - Singfore Local MD
- `singfore_shipping` - Singfore Shipping
- `fa_singfore` - FA Singfore (existing)

### 4. KoreaMel Factory (`factory_KoreaMel`)
- `koreamel_jump_senior_md` - KoreaMel Jump Senior MD
- `koreamel_local_md` - KoreaMel Local MD
- `koreamel_shipping` - KoreaMel Shipping
- `fa_korea` - FA Korea (existing)

### 5. HeadsUp Factory (`factory_HeadsUp`)
- `headsup_senior_md` - HeadsUp Senior MD
- `headsup_local_md` - HeadsUp Local MD
- `headsup_shipping` - HeadsUp Shipping
- `fa_heads` - FA Heads (existing)

## Database Setup

### Step 1: Run the Migration Script
Execute the `database_migration.sql` script in your Supabase SQL editor:

```sql
-- The script will add all new columns to the M88-Account_Allocation table
-- All columns are TEXT type and nullable
```

### Step 2: Verify Database Changes
After running the migration, verify the columns were added by checking:
- Supabase Table Editor shows the new columns
- The verification query in the migration script returns the new columns

## Access Control

### Factory Users
- **Can View**: Only their specific factory columns + standard columns
- **Can Edit**: Their specific factory columns (FA columns + new factory-specific columns)
- **Cannot Edit**: Brand info, status, terms, flags, other factory columns

### Company Users
- **Can View**: All columns except `all_brand`
- **Can Edit**: All columns except factory-specific columns
- **Cannot Edit**: Factory-specific columns (senior MD, local MD, shipping columns)

### Admin Users
- **Can View**: All columns
- **Can Edit**: All columns
- **Full Access**: Complete system access

## Factory Account Mapping

| Username | Factory | Visible Columns |
|----------|---------|----------------|
| `factory_Wuxi` | Wuxi | fa_wuxi, wuxi_jump_senior_md, wuxi_local_md, wuxi_shipping |
| `factory_PTwuuUjump` | PT UJUMP | fa_pt, hz_pt_u_jump_senior_md, pt_ujump_local_md, hz_u_jump_shipping, pt_ujump_shipping |
| `factory_Singfore` | Singfore | fa_singfore, singfore_jump_senior_md, singfore_local_md, singfore_shipping |
| `factory_KoreaMel` | KoreaMel | fa_korea, koreamel_jump_senior_md, koreamel_local_md, koreamel_shipping |
| `factory_HeadsUp` | HeadsUp | fa_heads, headsup_senior_md, headsup_local_md, headsup_shipping |

## Testing

### Test Factory Access
1. Login as each factory user
2. Verify only their specific columns are visible
3. Test editing their factory-specific columns
4. Verify they cannot see other factory columns

### Test Company/Admin Access
1. Login as company user - should see all columns except factory-specific ones
2. Login as admin user - should see and edit all columns
3. Test that company users cannot edit factory-specific columns

## Notes
- All new columns are TEXT type for flexibility
- Columns are nullable to allow gradual data entry
- Factory-specific columns are grouped under "Factory Assignment" in the UI
- The system maintains proper access control and logging for all operations
