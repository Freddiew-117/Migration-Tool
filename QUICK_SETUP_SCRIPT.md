# 🚀 Quick Setup Script for Appwrite

Automatically set up all Appwrite collections, attributes, and permissions with one command!

## Step 1: Install dotenv

```bash
npm install dotenv
```

## Step 2: Get Your API Key

1. Go to Appwrite Dashboard → **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name: `Setup Script`
4. **CRITICAL - Select ALL these scopes (don't miss any!):**
   - ✅ `databases.read`
   - ✅ `databases.write`
   - ✅ `collections.read`
   - ✅ `collections.write` ← **MUST HAVE THIS!**
   - ✅ `attributes.read`
   - ✅ `attributes.write`
5. Click **"Create"**
6. **IMPORTANT**: Copy the key immediately - you won't see it again!

**⚠️ If you get "missing scopes" error:**
- Your API key is missing required scopes
- Delete the old key and create a NEW one with ALL scopes above
- Make sure `collections.write` is selected!

## Step 3: Add to .env

Add these to your `.env` file:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_API_KEY=your-api-key-here
VITE_APPWRITE_DATABASE_ID=your-database-id
```

**Important:** 
- All variables use `VITE_` prefix (required for Vite to expose them to frontend)
- `VITE_APPWRITE_DATABASE_ID` should match your actual database ID in Appwrite
- If your database ID is `692f6911000d9019f069` (like in your client.ts), use that
- If it's `migration-portal`, use that
- The script supports both `VITE_` prefixed and non-prefixed versions

## Step 4: Run the Script

```bash
npm run setup-appwrite
```

## What It Creates

The script automatically creates **9 collections** with all attributes:

1. ✅ `user_roles` - User role management
2. ✅ `profiles` - User profiles
3. ✅ `web3_networks` - Blockchain networks
4. ✅ `smart_contracts` - Smart contract addresses
5. ✅ `migration_acknowledgements` - Migration acknowledgements
6. ✅ `migration_events` - Migration event tracking
7. ✅ `incubator_applications` - Incubator applications
8. ✅ `feature_requests` - Feature requests
9. ✅ `support_messages` - Support tickets

Each collection includes:
- ✅ All required attributes (fields)
- ✅ Proper data types (String, Integer, Boolean, DateTime)
- ✅ Required/optional settings
- ✅ Permissions (read/write for users)

## After Running

1. **Verify in Appwrite**: Check that all collections were created
2. **Add your admin role**: 
   - Go to `user_roles` collection
   - Create document: `user_id` = your user ID, `role` = `super_admin`
3. **Start using admin dashboard**: Go to `/admin` and add networks/contracts

## Troubleshooting

**"Database not found"**
- Make sure database exists in Appwrite
- Check `APPWRITE_DATABASE_ID` matches your database ID

**"Collection already exists"**
- Safe to ignore - script skips existing collections

**"Insufficient permissions"**
- Regenerate API key with ALL database scopes

See `scripts/README.md` for more details.

