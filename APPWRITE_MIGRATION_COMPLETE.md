# Appwrite Migration - Status

## ✅ Completed

### Core Files
- ✅ `src/contexts/AuthContext.tsx` - Updated to use Appwrite
- ✅ `src/integrations/appwrite/client.ts` - Appwrite client setup
- ✅ `src/integrations/appwrite/compat.ts` - Compatibility layer
- ✅ `src/integrations/appwrite/auth.ts` - Auth compatibility
- ✅ `src/integrations/db.ts` - Unified database client

### Pages
- ✅ `src/pages/Auth.tsx` - Updated
- ✅ `src/pages/AdminDashboard.tsx` - Updated

### Hooks
- ✅ `src/hooks/useContractData.ts` - Updated
- ✅ `src/hooks/useMigrationEvents.ts` - Updated
- ✅ `src/hooks/useUserProfile.ts` - Updated
- ✅ `src/hooks/useMigrationHistory.ts` - Updated
- ✅ `src/hooks/useUnreadSupportMessages.ts` - Updated (uses polling instead of real-time)

### Components
- ✅ `src/components/admin/CrossChainMigrationManagement.tsx` - Updated
- ✅ `src/components/migration/MigrationAcknowledgementForm.tsx` - Updated
- ✅ `src/components/feature-request/FeatureRequestModal.tsx` - Updated
- ✅ `src/components/SecretAdminModal.tsx` - Updated
- ✅ `src/components/SupportModal.tsx` - Updated

### Contexts
- ✅ `src/contexts/Web3Context.tsx` - Removed unused Supabase import

## ⚠️ Remaining Files (Need Manual Update)

These 6 admin component files still need updates. They all follow the same pattern:

1. `src/components/admin/SupportManagement.tsx`
2. `src/components/admin/NetworkManagement.tsx`
3. `src/components/admin/FeatureRequestsManagement.tsx`
4. `src/components/admin/ContractManagement.tsx`
5. `src/components/admin/ChainlistImporter.tsx`
6. `src/components/admin/ApplicationsManagement.tsx`
7. `src/components/incubator/IncubatorApplicationModal.tsx`

### Quick Update Pattern:

**Replace:**
```typescript
import { supabase } from '@/integrations/supabase/client';
```

**With:**
```typescript
import { db, COLLECTIONS } from '@/integrations/db';
```

**Replace queries:**
- `supabase.from('collection')` → `db.from(COLLECTIONS.COLLECTION_NAME)`
- `.order('field', { ascending: false })` → `.order('field', 'desc')`
- `.insert(data)` → `db.insert(COLLECTIONS.NAME, data)`
- `.update(data).eq('id', id)` → `db.update(COLLECTIONS.NAME, id, data)`
- `.eq('field', value)` stays the same
- `.select('*')` stays the same

**Note:** Appwrite uses `$id` instead of `id` for document IDs. You may need to map:
```typescript
const item = { ...data, id: data.$id };
```

## Next Steps

1. **Install Appwrite:**
   ```bash
   npm install appwrite
   ```

2. **Set up Appwrite project:**
   - Follow `APPWRITE_QUICK_START.md`

3. **Update remaining files:**
   - Use the pattern above to update the 7 remaining files
   - Or I can update them if you want

4. **Test:**
   - Sign up / Sign in
   - Admin dashboard
   - All features

## Environment Variables Needed

Add to `.env`:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_API_KEY=your-api-key
```

## Important Notes

- Appwrite uses `$id` instead of `id` for document IDs
- Appwrite uses `$createdAt` and `$updatedAt` (auto-added)
- Real-time subscriptions replaced with polling where needed
- JSON fields stored as strings (parse/stringify as needed)
- Permissions set per collection, not per row

