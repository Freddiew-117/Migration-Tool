# Files Still Need Manual Updates

The following files still reference Supabase and need to be updated:

1. `src/components/feature-request/FeatureRequestModal.tsx`
2. `src/components/incubator/IncubatorApplicationModal.tsx`
3. `src/components/admin/SupportManagement.tsx`
4. `src/components/admin/NetworkManagement.tsx`
5. `src/components/admin/FeatureRequestsManagement.tsx`
6. `src/components/admin/ContractManagement.tsx`
7. `src/components/admin/ChainlistImporter.tsx`
8. `src/components/admin/ApplicationsManagement.tsx`
9. `src/components/SupportModal.tsx`
10. `src/components/SecretAdminModal.tsx`

## Replacement Pattern

Replace:
```typescript
import { supabase } from '@/integrations/supabase/client';
```

With:
```typescript
import { db, COLLECTIONS } from '@/integrations/db';
```

Replace:
```typescript
supabase.from('collection_name')
```

With:
```typescript
db.from(COLLECTIONS.COLLECTION_NAME)
```

Replace:
```typescript
.order('created_at', { ascending: false })
```

With:
```typescript
.order('created_at', 'desc')
```

Replace:
```typescript
.insert(data)
```

With:
```typescript
db.insert(COLLECTIONS.COLLECTION_NAME, data)
```

Replace:
```typescript
.update(data).eq('id', id)
```

With:
```typescript
db.update(COLLECTIONS.COLLECTION_NAME, id, data)
```

