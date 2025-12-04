# 🚨 Database Not Found - Quick Fix

The error `Database not found (404)` means you need to create the database and collections in Appwrite.

## Quick Steps

### 1. Create Database in Appwrite

1. Go to your Appwrite dashboard: https://cloud.appwrite.io
2. Open your project
3. Go to **Databases** → **Create Database**
4. Database ID: `migration-portal` (must match exactly)
5. Name: `Migration Portal`
6. Click **"Create"**

### 2. Create Collections

**Important:** Collections are created INSIDE the database (they're called "Tables" in the UI)!

1. After creating the database, **click on it** (it should be listed in Databases)
2. You'll see the database details page
3. Click **"Create Table"** button (this creates a collection)
4. For each collection below, use these exact Collection IDs:

#### Collection 1: `user_roles`
- Collection ID: `user_roles`
- Name: "User Roles"

**Attributes:**
- `user_id` - String (255 chars, required)
- `role` - String (50 chars, required)
- `created_at` - DateTime (required)

#### Collection 2: `profiles`
- Collection ID: `profiles`
- Name: "Profiles"

**Attributes:**
- `user_id` - String (255 chars, required)
- `email` - String (255 chars, required)
- `full_name` - String (255 chars, optional)
- `avatar_url` - String (500 chars, optional)
- `created_at` - DateTime (required)
- `updated_at` - DateTime (required)

#### Collection 3: `migration_events`
- Collection ID: `migration_events`
- Name: "Migration Events"

**Attributes:**
- `acknowledgement_id` - String (255 chars, required)
- `wallet_address` - String (100 chars, required)
- `token_type` - String (10 chars, required)
- `amount` - String (100 chars, required)
- `old_contract_address` - String (100 chars, required)
- `new_contract_address` - String (100 chars, required)
- `transaction_hash` - String (100 chars, optional)
- `block_number` - Integer (optional)
- `status` - String (20 chars, required, default: "pending")
- `base_distribution_tx_hash` - String (100 chars, optional)
- `base_distribution_status` - String (20 chars, optional)
- `base_distribution_sent_at` - DateTime (optional)
- `base_v2_token_address` - String (100 chars, optional)
- `created_at` - DateTime (required)
- `updated_at` - DateTime (required)

#### Collection 4: `migration_acknowledgements`
- Collection ID: `migration_acknowledgements`
- Name: "Migration Acknowledgements"

**Attributes:**
- `user_id` - String (255 chars, optional)
- `email` - String (255 chars, required)
- `wallet_address` - String (100 chars, required)
- `acknowledgement_hash` - String (255 chars, required)
- `ip_address` - String (50 chars, optional)
- `user_agent` - String (500 chars, optional)
- `created_at` - DateTime (required)
- `updated_at` - DateTime (required)

### 3. Add User Role After Signing Up

1. Sign up/login to your app
2. In Appwrite dashboard → **Databases** → Click on `migration-portal` → Click on `user_roles` collection → **Create Document** (or **"+ Add Document"**)
3. Add:
   - `user_id`: Your Appwrite user ID (from Auth → Users)
   - `role`: `super_admin`
   - `created_at`: Current date/time
4. Click **"Create"**

## ⚠️ Important Notes

- **Collection IDs must match exactly** (case-sensitive)
- Database ID must be: `migration-portal`
- You can create other collections later as needed
- After creating `user_roles`, add your admin role manually

## Need More Collections?

See `APPWRITE_MIGRATION.md` for the complete schema with all collections.

## Quick Test

After creating at least `user_roles` collection:
1. Refresh your app
2. Login again
3. Should work! ✅

