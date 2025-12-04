# Quick Start - Supabase Setup

## 🚀 Fast Setup (5 minutes)

### 1. Create Supabase Account & Project
- Go to [supabase.com](https://supabase.com) → Sign up
- Click **"New Project"**
- Fill in name, set password, choose region
- Wait 2-3 minutes for setup

### 2. Get Your Keys
- Go to **Settings** → **API**
- Copy:
  - **Project URL** (looks like: `https://xxxxx.supabase.co`)
  - **anon/public key** (long JWT token)

### 3. Configure App
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Run Database Migration
- In Supabase dashboard → **SQL Editor**
- Click **"New query"**
- Copy entire contents of `supabase/migrations/000_initial_schema.sql`
- **IMPORTANT**: Before running, edit line ~280 and replace `'your-email@example.com'` with YOUR email
- Click **"Run"**

### 5. Create Admin User
- Go to **Authentication** → **Users** → **Add user**
- Enter your email and password
- Check **"Auto Confirm User"**
- Click **"Create user"**

### 6. Assign Admin Role
In **SQL Editor**, run:
```sql
-- Get your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Assign super_admin (replace USER_ID with ID from above)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID', 'super_admin');
```

### 7. Add XDC Network
In **SQL Editor**, run (replace YOUR_USER_ID):
```sql
-- Get your user ID first
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Add XDC Network
INSERT INTO public.web3_networks (
  name, chain_id, rpc_url, explorer_url, is_active, created_by
) VALUES (
  'XDC Network', 50, 'https://rpc.xinfin.network', 
  'https://explorer.xinfin.network/', true, 'YOUR_USER_ID'
);
```

### 8. Restart Dev Server
```bash
npm run dev
```

### 9. Test
- Go to `/auth` → Sign in
- Go to `/admin` → Should see admin dashboard ✅

## ✅ Done!

For detailed instructions, see `SUPABASE_SETUP.md`

