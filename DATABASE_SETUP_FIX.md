# Database Setup Fix

## Problem

When logging in as admin, you were redirected back to the migration portal with 404 errors:
- `Database not found (404)`
- This happened because the Appwrite database and collections hadn't been created yet

## Solution

The app now shows a **helpful setup screen** instead of just blocking access.

### What Changed

1. **Error Handling** (`src/contexts/AuthContext.tsx`):
   - When database doesn't exist (404 error), `fetchUserRole` now returns `null` gracefully
   - Better error detection for database missing scenarios

2. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`):
   - Detects when database isn't configured (user logged in but `userRole` is `null`)
   - Shows a helpful setup screen with step-by-step instructions
   - Displays your user ID so you can easily add yourself as admin

### What You'll See Now

Instead of being redirected, you'll see a screen with:
- Clear error message
- Step-by-step setup instructions
- Your user ID ready to copy/paste
- Links to detailed setup guides

## Next Steps

Follow the on-screen instructions or see:
- **`MINIMAL_SETUP.md`** - Quickest way to get it working
- **`SETUP_DATABASE_NOW.md`** - Detailed setup guide

### Minimal Setup (3 steps):

1. **Create Database** in Appwrite:
   - ID: `migration-portal`

2. **Create Collection** `user_roles`:
   - Attributes: `user_id` (String), `role` (String), `created_at` (DateTime)

3. **Add Your Admin Role**:
   - Create document in `user_roles`:
     - `user_id`: [Your User ID from the screen]
     - `role`: `super_admin`

Then refresh the page! ✅

