# 🔍 Troubleshooting "Database not found" 404 Error

If you're getting a 404 error saying "Database not found" even though the collection exists, check these:

## 1. Check Project ID

The most common issue is a **wrong or missing Project ID**.

### Verify Your Project ID:

1. Go to Appwrite Dashboard → **Settings** → **API Keys**
2. Copy your **Project ID** (it's shown at the top)
3. Check your `.env` file has:
   ```env
   VITE_APPWRITE_PROJECT_ID=your-actual-project-id
   ```
4. **Restart your dev server** after changing `.env`:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Check Console Logs:

Open browser console and look for:
```
✅ Appwrite Config: { endpoint: '...', projectId: '...', databaseId: 'migration-portal' }
```

If you see `❌ VITE_APPWRITE_PROJECT_ID is not set`, your `.env` file isn't being read.

## 2. Verify Database ID

The database ID in your code must **exactly match** the one in Appwrite.

### Check Database ID in Appwrite:

1. Go to **Databases** in Appwrite
2. Click on your database
3. Look at the URL or database settings
4. The **Database ID** should be: `migration-portal`

### If Database ID is Different:

If your database ID in Appwrite is different (e.g., auto-generated like `673abc123def456`), you have two options:

**Option A: Update Code (Recommended)**
1. Open `src/integrations/appwrite/client.ts`
2. Change line 17:
   ```typescript
   export const DATABASE_ID = 'your-actual-database-id';
   ```

**Option B: Recreate Database**
1. Delete the database in Appwrite
2. Create a new one with ID: `migration-portal`

## 3. Verify Collection ID

The collection ID must also match exactly.

1. In Appwrite, go to your database → Click on the `user_roles` table
2. Check the **Collection ID** (not the name)
3. It should be exactly: `user_roles` (lowercase, underscore)
4. If it's different, either:
   - Rename the collection ID in Appwrite, OR
   - Update `COLLECTIONS.USER_ROLES` in `src/integrations/appwrite/client.ts`

## 4. Check You're in the Right Project

Make sure you're looking at the **same project** in Appwrite that matches your `.env` file.

1. In Appwrite dashboard, check the project name at the top
2. Go to **Settings** → **API Keys** to see the Project ID
3. Compare with your `.env` file

## 5. Verify Permissions

Even if everything else is correct, missing permissions can cause 404.

1. Go to **Databases** → `migration-portal` → `user_roles` table
2. Click **Settings** tab
3. Under **Read Access**, make sure `users` role is added
4. Click **Update**

## 6. Check Environment Variables Are Loaded

Vite requires a **server restart** to load new `.env` variables.

1. Stop your dev server (Ctrl+C)
2. Make sure `.env` file exists in project root
3. Restart: `npm run dev`
4. Hard refresh browser: `Ctrl+Shift+R`

## Quick Checklist

- [ ] `.env` file exists in project root
- [ ] `VITE_APPWRITE_PROJECT_ID` is set correctly
- [ ] `VITE_APPWRITE_ENDPOINT` is set (or using default)
- [ ] Dev server was restarted after changing `.env`
- [ ] Database ID in code matches Appwrite
- [ ] Collection ID matches exactly: `user_roles`
- [ ] Permissions are set on the collection
- [ ] You're in the correct project in Appwrite

## Still Not Working?

1. **Check browser console** for the debug log showing your config
2. **Check Network tab** in browser DevTools - look at the actual request URL
3. **Compare IDs**:
   - Project ID in `.env` vs Appwrite Settings
   - Database ID in code vs Appwrite database
   - Collection ID in code vs Appwrite collection

## Common Mistakes

❌ **Wrong:** Project ID has extra spaces or quotes
```env
VITE_APPWRITE_PROJECT_ID="673abc123def456"  # Don't use quotes
```

✅ **Correct:**
```env
VITE_APPWRITE_PROJECT_ID=673abc123def456
```

❌ **Wrong:** Database ID has different casing
```typescript
export const DATABASE_ID = 'Migration-Portal'; // Wrong
```

✅ **Correct:**
```typescript
export const DATABASE_ID = 'migration-portal'; // Correct
```

