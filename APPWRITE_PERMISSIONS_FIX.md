# 🔐 Appwrite Permissions Fix

The 404 error when the table exists is almost always a **permissions issue**.

## The Problem

Appwrite collections require explicit read/write permissions. If permissions aren't set, you'll get a 404 error even though the table exists.

## Quick Fix: Set Permissions

### For `user_roles` Table:

1. Go to **Databases** → Click on `migration-portal` → Click on `user_roles` table
2. Click on **"Settings"** tab (or look for **"Permissions"**)
3. Under **"Read Access"**, add:
   - **Role**: `users` (this allows any authenticated user to read)
   - OR **User**: Your user ID (for testing)
4. Under **"Write Access"**, add:
   - **Role**: `users` (if you want users to write)
   - OR leave empty if only admins should write
5. Click **"Update"** or **"Save"**

### Permission Options:

- **`users`** - Any authenticated user
- **`any`** - Anyone (including unauthenticated) - **NOT recommended for sensitive data**
- **Specific User ID** - Only that user
- **Custom Role** - If you've created custom roles

## Recommended Permissions for `user_roles`:

- **Read**: `users` (authenticated users can read their own roles)
- **Write**: Leave empty or add admin role (only admins should create roles)

## Test After Setting Permissions:

1. Refresh your browser
2. Try accessing `/admin` again
3. Should work! ✅

## For Other Tables:

You'll need to set permissions for all tables you create:
- `profiles` - Read: `users`, Write: `users`
- `migration_events` - Read: `users`, Write: `users`
- `smart_contracts` - Read: `any` (public), Write: `users` or admin only
- etc.

## Still Getting 404?

1. Double-check the **Collection ID** matches exactly: `user_roles` (lowercase, underscore)
2. Make sure you're in the correct **Project** in Appwrite
3. Check that your `.env` has the correct `VITE_APPWRITE_PROJECT_ID`
4. Verify the database ID is `migration-portal`

