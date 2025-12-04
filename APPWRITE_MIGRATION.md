# Appwrite Database Migration Guide

This guide shows how to migrate your Supabase database schema to Appwrite.

## Overview

Appwrite uses **Collections** instead of Supabase's **Tables**, but the data structure is similar. You'll need to:

1. Create Collections in Appwrite
2. Define Attributes (columns) for each collection
3. Set up Permissions (similar to RLS)
4. Migrate your data (if you have existing data)

## Step 1: Create Database

1. Go to **Databases** → **Create Database**
2. Name: `migration-portal`
3. Database ID: `migration-portal`
4. Click **"Create"**

## Step 2: Create Collections

For each collection below, follow these steps:
1. Click **"Create Collection"**
2. Enter the Collection ID (exact name from below)
3. Enter a display name
4. Click **"Create"**
5. Add attributes (see below for each collection)
6. Set permissions (see permissions section)

### Collection: `profiles`

**Attributes:**
- `user_id` - String, Size: 36, Required: Yes, Array: No
- `email` - String, Size: 255, Required: Yes, Array: No
- `full_name` - String, Size: 255, Required: No, Array: No
- `avatar_url` - String, Size: 500, Required: No, Array: No
- `created_at` - DateTime, Required: Yes, Array: No
- `updated_at` - DateTime, Required: Yes, Array: No

**Indexes:**
- `user_id` - Unique index

### Collection: `user_roles`

**Attributes:**
- `user_id` - String, Size: 36, Required: Yes, Array: No
- `role` - String, Size: 50, Required: Yes, Array: No (Values: `super_admin`, `admin`, `user`)
- `created_at` - DateTime, Required: Yes, Array: No

**Indexes:**
- `user_id` + `role` - Unique composite index

### Collection: `web3_networks`

**Attributes:**
- `name` - String, Size: 255, Required: Yes, Array: No
- `chain_id` - Integer, Required: Yes, Array: No
- `chain_id_hex` - String, Size: 20, Required: No, Array: No
- `chainlist_id` - Integer, Required: No, Array: No
- `rpc_url` - String, Size: 500, Required: Yes, Array: No
- `rpc_urls` - String, Size: 2000, Required: No, Array: Yes
- `explorer_url` - String, Size: 500, Required: No, Array: No
- `block_explorer_name` - String, Size: 100, Required: No, Array: No
- `native_currency_name` - String, Size: 50, Required: No, Array: No
- `native_currency_symbol` - String, Size: 10, Required: No, Array: No
- `native_currency_decimals` - Integer, Required: No, Array: No
- `icon_url` - String, Size: 500, Required: No, Array: No
- `faucets` - String, Size: 2000, Required: No, Array: Yes
- `is_active` - Boolean, Required: Yes, Array: No, Default: `true`
- `is_testnet` - Boolean, Required: No, Array: No
- `created_by` - String, Size: 36, Required: Yes, Array: No
- `created_at` - DateTime, Required: Yes, Array: No
- `updated_at` - DateTime, Required: Yes, Array: No

**Indexes:**
- `chain_id` - Unique index

### Collection: `smart_contracts`

**Attributes:**
- `name` - String, Size: 255, Required: Yes, Array: No
- `address` - String, Size: 100, Required: Yes, Array: No
- `network_id` - String, Size: 36, Required: Yes, Array: No
- `abi` - String, Size: 10000, Required: No, Array: No (JSON stored as string)
- `is_active` - Boolean, Required: Yes, Array: No, Default: `true`
- `created_by` - String, Size: 36, Required: Yes, Array: No
- `created_at` - DateTime, Required: Yes, Array: No
- `updated_at` - DateTime, Required: Yes, Array: No

### Collection: `migration_acknowledgements`

**Attributes:**
- `user_id` - String, Size: 36, Required: No, Array: No
- `email` - String, Size: 255, Required: Yes, Array: No
- `wallet_address` - String, Size: 100, Required: Yes, Array: No
- `acknowledgement_hash` - String, Size: 255, Required: Yes, Array: No
- `ip_address` - String, Size: 50, Required: No, Array: No
- `user_agent` - String, Size: 500, Required: No, Array: No
- `created_at` - DateTime, Required: Yes, Array: No
- `updated_at` - DateTime, Required: Yes, Array: No

**Indexes:**
- `user_id`
- `wallet_address`

### Collection: `migration_events`

**Attributes:**
- `acknowledgement_id` - String, Size: 36, Required: Yes, Array: No
- `wallet_address` - String, Size: 100, Required: Yes, Array: No
- `token_type` - String, Size: 10, Required: Yes, Array: No (Values: `CIFI`, `REFI`)
- `amount` - String, Size: 100, Required: Yes, Array: No
- `old_contract_address` - String, Size: 100, Required: Yes, Array: No
- `new_contract_address` - String, Size: 100, Required: Yes, Array: No
- `transaction_hash` - String, Size: 100, Required: No, Array: No
- `block_number` - Integer, Required: No, Array: No
- `gas_used` - String, Size: 50, Required: No, Array: No
- `gas_price` - String, Size: 50, Required: No, Array: No
- `status` - String, Size: 20, Required: Yes, Array: No, Default: `pending` (Values: `pending`, `confirmed`, `failed`)
- `base_distribution_tx_hash` - String, Size: 100, Required: No, Array: No
- `base_distribution_status` - String, Size: 20, Required: No, Array: No, Default: `pending` (Values: `pending`, `sent`, `failed`)
- `base_distribution_sent_at` - DateTime, Required: No, Array: No
- `base_v2_token_address` - String, Size: 100, Required: No, Array: No
- `created_at` - DateTime, Required: Yes, Array: No
- `updated_at` - DateTime, Required: Yes, Array: No

**Indexes:**
- `acknowledgement_id`
- `wallet_address`
- `transaction_hash`
- `base_distribution_status`
- `base_distribution_tx_hash`

### Collection: `incubator_applications`

**Attributes:**
- `user_id` - String, Size: 36, Required: No, Array: No
- `founder_name` - String, Size: 255, Required: Yes, Array: No
- `project_name` - String, Size: 255, Required: Yes, Array: No
- `company_name` - String, Size: 255, Required: No, Array: No
- `business_category` - String, Size: 50, Required: Yes, Array: No
- `website_url` - String, Size: 500, Required: No, Array: No
- `stage` - String, Size: 100, Required: Yes, Array: No
- `description` - String, Size: 5000, Required: Yes, Array: No
- `founder_background` - String, Size: 2000, Required: No, Array: No
- `team_size` - Integer, Required: No, Array: No
- `team_experience` - String, Size: 2000, Required: No, Array: No
- `team_emails` - String, Size: 500, Required: No, Array: No
- `team_linkedin` - String, Size: 500, Required: No, Array: No
- `funding_raised` - Integer, Required: No, Array: No
- `funding_needed` - Integer, Required: No, Array: No
- `use_of_funds` - String, Size: 2000, Required: No, Array: No
- `technology_stack` - String, Size: 2000, Required: No, Array: Yes
- `blockchain_networks` - String, Size: 2000, Required: No, Array: Yes
- `custom_networks` - String, Size: 500, Required: No, Array: No
- `smart_contracts_deployed` - Boolean, Required: No, Array: No, Default: `false`
- `contact_email` - String, Size: 255, Required: Yes, Array: No
- `contact_phone` - String, Size: 50, Required: No, Array: No
- `linkedin_profile` - String, Size: 500, Required: No, Array: No
- `why_join` - String, Size: 2000, Required: Yes, Array: No
- `goals` - String, Size: 2000, Required: No, Array: No
- `timeline` - String, Size: 1000, Required: No, Array: No
- `status` - String, Size: 20, Required: Yes, Array: No, Default: `submitted`
- `admin_notes` - String, Size: 5000, Required: No, Array: No
- `reviewed_by` - String, Size: 36, Required: No, Array: No
- `reviewed_at` - DateTime, Required: No, Array: No
- `pitch_deck_url` - String, Size: 500, Required: No, Array: No
- `business_plan_url` - String, Size: 500, Required: No, Array: No
- `created_at` - DateTime, Required: Yes, Array: No
- `updated_at` - DateTime, Required: Yes, Array: No

### Collection: `support_messages`

**Attributes:**
- `user_id` - String, Size: 36, Required: No, Array: No
- `subject` - String, Size: 255, Required: Yes, Array: No
- `message` - String, Size: 5000, Required: Yes, Array: No
- `priority` - String, Size: 20, Required: Yes, Array: No, Default: `medium` (Values: `low`, `medium`, `high`, `urgent`)
- `status` - String, Size: 20, Required: Yes, Array: No, Default: `open` (Values: `open`, `in_progress`, `resolved`, `closed`)
- `admin_response` - String, Size: 5000, Required: No, Array: No
- `admin_id` - String, Size: 36, Required: No, Array: No
- `user_read` - Boolean, Required: Yes, Array: No, Default: `false`
- `created_at` - DateTime, Required: Yes, Array: No
- `updated_at` - DateTime, Required: Yes, Array: No
- `responded_at` - DateTime, Required: No, Array: No

**Indexes:**
- `user_id`
- `status`
- `priority`
- `created_at` (descending)

### Collection: `feature_requests`

**Attributes:**
- `user_id` - String, Size: 36, Required: No, Array: No
- `title` - String, Size: 255, Required: Yes, Array: No
- `description` - String, Size: 5000, Required: Yes, Array: No
- `category` - String, Size: 100, Required: No, Array: No
- `priority` - String, Size: 20, Required: No, Array: No, Default: `medium`
- `status` - String, Size: 20, Required: Yes, Array: No, Default: `pending` (Values: `pending`, `under_review`, `approved`, `rejected`, `implemented`)
- `admin_notes` - String, Size: 5000, Required: No, Array: No
- `created_at` - DateTime, Required: Yes, Array: No
- `updated_at` - DateTime, Required: Yes, Array: No

## Step 3: Set Up Permissions

For each collection, set permissions in Appwrite:

### General Pattern:
1. Go to collection → **Settings** → **Permissions**
2. Add these rules:

**For `profiles`, `user_roles`:**
- **Read**: Users can read their own documents (`user_id` = `$userId`)
- **Create**: Users can create their own documents
- **Update**: Users can update their own documents
- **Delete**: Super admins only (set via custom role check)

**For `web3_networks`, `smart_contracts`:**
- **Read**: All authenticated users can read active documents
- **Create/Update/Delete**: Super admins only

**For `migration_acknowledgements`, `migration_events`:**
- **Read**: Users can read their own documents
- **Create**: Users can create their own documents
- **Update/Delete**: Super admins only

**For `incubator_applications`, `support_messages`, `feature_requests`:**
- **Read**: Users can read their own documents
- **Create**: Anyone (including anonymous) can create
- **Update**: Users can update their own documents (if status allows)
- **Delete**: Super admins only

## Step 4: Update Environment Variables

Update your `.env` file:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_API_KEY=your-api-key
```

## Step 5: Switch to Appwrite in Code

1. Install Appwrite: `npm install appwrite`
2. Rename `src/contexts/AuthContext.appwrite.tsx` to `src/contexts/AuthContext.tsx` (backup the old one first)
3. Update all imports from `@/integrations/supabase/client` to `@/integrations/appwrite/compat`
4. Change `supabase.from()` to `appwrite.from()`
5. Test the migration

## Notes

- Appwrite uses `$id` instead of `id` for document IDs
- Appwrite automatically adds `$createdAt` and `$updatedAt` (you can still add your own)
- JSON fields in Appwrite are stored as strings (parse/stringify as needed)
- Permissions in Appwrite are set per collection, not per row like RLS

