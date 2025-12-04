# Migration from Supabase to Appwrite

This guide helps you switch from Supabase to Appwrite.

## Quick Steps

### 1. Install Appwrite
```bash
npm install appwrite
```

### 2. Set Up Appwrite Project
- Follow `APPWRITE_QUICK_START.md` to create your Appwrite project
- Get your API keys and update `.env`

### 3. Create Database Schema
- Follow `APPWRITE_MIGRATION.md` to create all collections
- Set up permissions for each collection

### 4. Switch AuthContext
```bash
# Backup current AuthContext
mv src/contexts/AuthContext.tsx src/contexts/AuthContext.supabase.tsx

# Use Appwrite version
mv src/contexts/AuthContext.appwrite.tsx src/contexts/AuthContext.tsx
```

### 5. Update Imports

Find and replace in your codebase:
- `@/integrations/supabase/client` → `@/integrations/appwrite/compat`
- `supabase.from()` → `appwrite.from()`
- `supabase.auth` → `appwriteAuth` (import from `@/integrations/appwrite/auth`)

### 6. Update Query Syntax

**Before (Supabase):**
```typescript
const { data, error } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .single();
```

**After (Appwrite):**
```typescript
const { data, error } = await appwrite
  .from(COLLECTIONS.USER_ROLES)
  .select('role')
  .eq('user_id', userId)
  .single();
```

### 7. Test Everything
- Sign up / Sign in
- Admin dashboard access
- Database queries
- All features

## Files Created

✅ `src/integrations/appwrite/client.ts` - Appwrite client setup
✅ `src/integrations/appwrite/compat.ts` - Supabase-like compatibility layer
✅ `src/integrations/appwrite/auth.ts` - Auth compatibility layer
✅ `src/contexts/AuthContext.appwrite.tsx` - Appwrite AuthContext
✅ `APPWRITE_SETUP.md` - Detailed setup guide
✅ `APPWRITE_QUICK_START.md` - Quick setup guide
✅ `APPWRITE_MIGRATION.md` - Database schema migration

## Key Differences

1. **Collections vs Tables**: Appwrite uses "Collections" instead of "Tables"
2. **Document IDs**: Appwrite uses `$id` instead of `id`
3. **Timestamps**: Appwrite auto-adds `$createdAt` and `$updatedAt`
4. **JSON Fields**: Stored as strings in Appwrite (parse/stringify as needed)
5. **Permissions**: Set per collection, not per row (like RLS)

## Rollback Plan

If you need to switch back to Supabase:
1. Restore `src/contexts/AuthContext.supabase.tsx` as `AuthContext.tsx`
2. Update `.env` with Supabase credentials
3. Revert import changes
4. Restart dev server

## Need Help?

- Check `APPWRITE_SETUP.md` for detailed setup
- Check `APPWRITE_MIGRATION.md` for database schema
- Check Appwrite docs: https://appwrite.io/docs

