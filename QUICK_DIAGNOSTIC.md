# 🔍 Quick Diagnostic - Check These Now

## Step 1: Check Browser Console

Open browser console (F12) and look for this line:
```
✅ Appwrite Config: { endpoint: '...', projectId: '...', databaseId: 'migration-portal' }
```

**If you DON'T see this log:**
- Your `.env` file isn't being read
- Or `VITE_APPWRITE_PROJECT_ID` is missing

**If you DO see it:**
- Copy the `projectId` value (first 8 chars)
- Compare it with Appwrite

## Step 2: Verify Project ID

1. Go to Appwrite Dashboard
2. Click **Settings** → **API Keys**
3. Look at the **Project ID** shown at the top
4. Compare with your `.env` file

Your `.env` should have:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-actual-project-id-here
```

**Important:** The Project ID must match EXACTLY (no spaces, no quotes)

## Step 3: Verify Database ID

1. In Appwrite, go to **Databases**
2. Click on your database
3. Look at the URL or database settings
4. Check the **Database ID**

**If it's NOT `migration-portal`:**
- Either rename it in Appwrite to `migration-portal`
- OR update `src/integrations/appwrite/client.ts` line 8:
  ```typescript
  export const DATABASE_ID = 'your-actual-database-id';
  ```

## Step 4: Restart Dev Server

After changing `.env` or code:
1. Stop server (Ctrl+C)
2. Run: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R)

## Step 5: Check Collection ID

1. In Appwrite → Databases → Your database
2. Click on `user_roles` table
3. Check the **Collection ID** (not the name)
4. Must be exactly: `user_roles` (lowercase, underscore)

## Most Common Issues:

1. **Project ID wrong/missing** → Check `.env` file
2. **Database ID doesn't match** → Check Appwrite database ID
3. **Dev server not restarted** → Restart after changing `.env`
4. **Wrong project** → Make sure you're in the right Appwrite project

## Still Not Working?

Share:
1. What the console log shows for "Appwrite Config"
2. Your Project ID from Appwrite (first 8 chars only)
3. Your Database ID from Appwrite

