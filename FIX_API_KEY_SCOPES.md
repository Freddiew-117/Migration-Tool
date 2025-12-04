# 🔑 Fix: API Key Missing Scopes

## Error Message

```
missing scopes (["collections.write"])
```

## Solution

Your API key doesn't have the required permissions. You need to create a **new** API key with all the required scopes.

### Step 1: Delete Old API Key (Optional)

1. Go to Appwrite Dashboard → **Settings** → **API Keys**
2. Find your old API key
3. Delete it (optional, but recommended)

### Step 2: Create New API Key

1. Click **"Create API Key"**
2. Name: `Setup Script` (or any name)
3. **Select ALL these scopes** (very important!):
   - ✅ `databases.read`
   - ✅ `databases.write`
   - ✅ `collections.read`
   - ✅ `collections.write` ← **THIS ONE IS MISSING!**
   - ✅ `attributes.read`
   - ✅ `attributes.write`
4. Click **"Create"**
5. **Copy the key immediately!**

### Step 3: Update .env

Replace `VITE_APPWRITE_API_KEY` in your `.env` file with the new key:

```env
VITE_APPWRITE_API_KEY=your-new-api-key-here
```

### Step 4: Run Script Again

```bash
npm run setup-appwrite
```

## Why This Happens

Appwrite API keys are scoped - they only have the permissions you grant them. The script needs `collections.write` to create collections, but your current key doesn't have it.

## Quick Checklist

- [ ] Created new API key
- [ ] Selected ALL 6 scopes (especially `collections.write`)
- [ ] Copied the key
- [ ] Updated `.env` file with new key
- [ ] Ran `npm run setup-appwrite` again

