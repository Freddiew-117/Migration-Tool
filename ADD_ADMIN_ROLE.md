# ✅ Add Your Admin Role

If you're getting redirected from `/admin`, you need to add your admin role to the `user_roles` table.

## Quick Steps:

1. **Get Your User ID:**
   - Go to Appwrite Dashboard → **Auth** → **Users**
   - Find your user (the email you logged in with)
   - Copy the **User ID** (looks like: `692f6ab60023558bd30f`)

2. **Add Admin Role:**
   - Go to **Databases** → Click on your database → Click on `user_roles` table
   - Click **"+ Add Document"** or **"Create Document"**
   - Add these fields:
     - `user_id`: [Paste your User ID]
     - `role`: `super_admin` (must be exactly this)
     - `created_at`: Click calendar, select today's date/time
   - Click **"Create"**

3. **Refresh Browser:**
   - Go to `/admin` again
   - Should work! ✅

## Verify It Worked:

After adding the role, check browser console - you should see your role being fetched. Then `/admin` should work!

