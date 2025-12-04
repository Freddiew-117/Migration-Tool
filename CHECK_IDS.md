# 🔍 Check Your IDs - Step by Step

## Step 1: Check Browser Console

Open browser console (F12) and look for:
```
✅ Appwrite Config: { endpoint: '...', projectId: '...', databaseId: 'migration-portal' }
```

**Copy the `projectId` value** (first 8 characters shown)

## Step 2: Verify Project ID in Appwrite

1. Go to Appwrite Dashboard
2. Click **Settings** → **API Keys**
3. Look at the **Project ID** at the top
4. **Compare** with what's in your `.env` file

**They must match EXACTLY!**

## Step 3: Check Your Database ID in Appwrite

The code uses `migration-portal` as the Database ID, but your database might have a different ID!

1. In Appwrite, go to **Databases**
2. Click on your database
3. Look at the URL - it will show the Database ID
   - Example: `https://cloud.appwrite.io/console/database-673abc123def456/overview`
   - The Database ID is: `673abc123def456`
4. OR go to database **Settings** to see the Database ID

## Step 4: Fix Database ID Mismatch

**If your Database ID is NOT `migration-portal`:**

### Option A: Update the Code (Easiest)

1. Open `src/integrations/appwrite/client.ts`
2. Find line 8:
   ```typescript
   export const DATABASE_ID = 'migration-portal';
   ```
3. Change it to your actual Database ID:
   ```typescript
   export const DATABASE_ID = 'your-actual-database-id';
   ```
4. Save and refresh browser

### Option B: Recreate Database with Correct ID

1. Delete the database in Appwrite
2. Create a new one with ID: `migration-portal`

## Step 5: Verify Collection ID

1. In Appwrite → Databases → Your database
2. Click on the `user_roles` table
3. Check the **Collection ID** (not the name)
4. Must be exactly: `user_roles` (lowercase, underscore)

## Quick Test

After fixing, check console again:
- Should see: `✅ Appwrite Config: ...`
- Should NOT see: `❌ Database/Collection not found`

