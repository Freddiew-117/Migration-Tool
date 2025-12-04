# ⚡ Minimal Setup - Get It Working NOW

## Step 1: Create Database

1. Appwrite Dashboard → **Databases** → **Create Database**
2. Database ID: `migration-portal`
3. Click **"Create"**

## Step 2: Create ONE Collection (to test)

**Collection: `user_roles`**

1. Go to **Databases** in the left sidebar
2. **Click on your database** `migration-portal` (it should be listed there)
3. You should now see the database details page
4. Click the **"Create Table"** button (this creates a collection)
5. Collection ID: `user_roles`
6. Name: "User Roles"
7. Click **"Create"**

**Add Attributes:**
- After creating the collection, you'll be on the collection page
- Click **"Create Attribute"** button
- `user_id` - Type: **String**, Size: 255, Required: ✅, Click **"Create"**
- Click **"Create Attribute"** again
- `role` - Type: **String**, Size: 50, Required: ✅, Click **"Create"**
- Click **"Create Attribute"** again
- `created_at` - Type: **DateTime**, Required: ✅, Click **"Create"**

## Step 3: Add Your Admin Role

1. Sign up/login to your app first
2. Go to Appwrite → **Auth** → **Users**
3. Copy your **User ID** (looks like: `692f6ab60023558bd30f`)

4. Go to **Databases** → Click on `migration-portal` → Click on `user_roles` collection → **Create Document** (or **"+ Add Document"**)
5. Add:
   - `user_id`: `692f6ab60023558bd30f` (your user ID)
   - `role`: `super_admin`
   - `created_at`: Click calendar, select today's date/time

6. Click **"Create"**

## Step 4: Test

1. Refresh your browser
2. Login
3. Go to `/admin` - should work! ✅

## Later: Add More Collections

Once the basic setup works, add the rest:
- `profiles`
- `migration_events`
- `migration_acknowledgements`
- etc.

See `APPWRITE_MIGRATION.md` for full schema.

