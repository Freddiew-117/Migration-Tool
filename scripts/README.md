# Appwrite Setup Scripts

## Quick Setup Script

Automatically creates all Appwrite collections, attributes, and permissions.

### Prerequisites

1. Install dotenv (if not already installed):
   ```bash
   npm install dotenv
   ```
   
   Note: `appwrite` is already in your dependencies.

2. Create `.env` file in project root (if not exists) or add these variables:
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_API_KEY=your-api-key
   VITE_APPWRITE_DATABASE_ID=your-database-id
   ```
   
   **Note:** 
   - All variables use `VITE_` prefix (required for Vite to expose them)
   - The `VITE_APPWRITE_DATABASE_ID` should match the database ID in your Appwrite dashboard
   - The script also supports non-prefixed versions for Node.js scripts

### Get Your API Key

1. Go to Appwrite Dashboard → **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name: `Setup Script`
4. **CRITICAL - Select ALL these scopes (check every one!):**
   - ✅ `databases.read`
   - ✅ `databases.write`
   - ✅ `collections.read`
   - ✅ `collections.write` ← **REQUIRED!**
   - ✅ `attributes.read`
   - ✅ `attributes.write`
5. Click **"Create"**
6. **Copy the key immediately** (you won't see it again!)
7. Add it to your `.env` file as `VITE_APPWRITE_API_KEY`

**⚠️ Error: "missing scopes (collections.write)"?**
- Your API key doesn't have `collections.write` scope
- Delete the old key and create a NEW one with ALL scopes above
- See `FIX_API_KEY_SCOPES.md` for detailed fix

### Run the Script

```bash
npm run setup-appwrite
```

Or directly:
```bash
node scripts/setup-appwrite.js
```

### What It Does

The script will:
1. ✅ Verify database exists
2. ✅ Create all 8 collections:
   - `user_roles`
   - `profiles`
   - `web3_networks`
   - `smart_contracts`
   - `migration_acknowledgements`
   - `migration_events`
   - `incubator_applications`
   - `feature_requests`
   - `support_messages`
3. ✅ Add all attributes to each collection
4. ✅ Set up permissions (read/write for users)

### Troubleshooting

**Error: "Database not found"**
- Make sure you've created the database in Appwrite first
- Check that `APPWRITE_DATABASE_ID` matches your database ID

**Error: "Collection already exists"**
- The script will skip existing collections
- This is safe - it won't overwrite existing data

**Error: "Attribute already exists"**
- The script will skip existing attributes
- This is safe

**Error: "Insufficient permissions"**
- Make sure your API key has all database scopes
- Regenerate the API key with full permissions

### After Running

1. Go to Appwrite dashboard and verify collections were created
2. Add your admin role manually:
   - Go to `user_roles` collection
   - Create document with your user ID and role `super_admin`
3. Use the admin dashboard to add networks and contracts

