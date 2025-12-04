# Fix Missing Attributes in Appwrite Collections

The setup script requires API key permissions, but you can manually add the missing attributes through the Appwrite UI.

## Issue 1: `support_messages` Collection

The code expects these attributes, but the collection might be missing them:

1. **`admin_response`** (String, 5000 chars, Optional)
   - Go to your Appwrite project → Database → `support_messages` table
   - Click "Create Attribute"
   - Type: String
   - Key: `admin_response`
   - Size: 5000
   - Required: No
   - Array: No

2. **`user_read`** (Boolean, Optional, Default: false)
   - Click "Create Attribute"
   - Type: Boolean
   - Key: `user_read`
   - Required: No
   - Default: false
   - Array: No

**Note:** If you have an old `response` attribute, you can either:
- Keep it and update the code to use `response` instead of `admin_response`
- Or delete it and use `admin_response` (recommended)

## Issue 2: `web3_networks` Collection

Make sure `created_at` and `updated_at` are **optional** (not required):

1. Go to `web3_networks` table
2. Find `created_at` attribute
3. If it's marked as "Required", click on it and uncheck "Required"
4. Do the same for `updated_at`

## Alternative: Update API Key Scopes

If you want to use the setup script, update your API key:

1. Go to Appwrite Console → Settings → API Keys
2. Find your API key (or create a new one)
3. Make sure these scopes are enabled:
   - `collections.read`
   - `collections.write`
   - `databases.read`
   - `databases.write`
   - `documents.read`
   - `documents.write`
4. Update your `.env` file with the new API key:
   ```
   VITE_APPWRITE_API_KEY=your-new-api-key-here
   ```
5. Run the setup script again: `npm run setup-appwrite`

## Quick Fix: Update Code Instead

If you prefer not to change the database schema, you can update the code to match the existing schema:

1. Change `admin_response` to `response` in:
   - `src/hooks/useUnreadSupportMessages.ts`
   - `src/components/SupportModal.tsx`
   - `src/components/admin/SupportManagement.tsx`

2. Remove `user_read` checks or add the attribute manually

The timestamps (`created_at`/`updated_at`) are now handled automatically by the code, so making them optional should fix the network creation issue.

