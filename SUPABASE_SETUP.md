# Supabase Setup Guide

Complete guide to set up a new Supabase project for the Migration Portal.

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with:
   - GitHub (recommended)
   - Google
   - Email
4. Verify your email if required

## Step 2: Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the project details:
   - **Name**: `Circularity Finance Migration Portal` (or your preferred name)
   - **Database Password**: Create a strong password (save this securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to initialize

## Step 3: Get Your API Keys

1. In your project dashboard, go to **Settings** (gear icon) → **API**
2. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGci...` (this is your publishable key)
   - **service_role key**: `eyJhbGci...` (keep this secret!)

3. Copy these values - you'll need them in the next step

## Step 4: Configure Your App

1. In your project root, create a `.env` file (if it doesn't exist)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Replace `xxxxx` with your actual project reference ID.

## Step 5: Set Up the Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy and paste the contents of `supabase/migrations/000_initial_schema.sql` (we'll create this)
4. Click **"Run"** to execute the migration
5. You should see "Success. No rows returned"

## Step 6: Create Your First Admin User

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: Your email address
   - **Password**: Create a secure password
   - **Auto Confirm User**: ✅ Check this box
4. Click **"Create user"**

5. Now assign super_admin role:
   - Go to **SQL Editor** → **New query**
   - Run this SQL (replace `your-email@example.com` with your email):

```sql
-- Get your user ID first
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then assign super_admin role (replace USER_ID_HERE with the ID from above)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

Or if you want to make it automatic for your email, update the trigger function:

```sql
-- Update the handle_new_user function to assign super_admin to your email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign super_admin role to your email, regular user role to others
  IF NEW.email = 'your-email@example.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

## Step 7: Add XDC Network and Contracts

1. Go to **SQL Editor** → **New query**
2. Run this to add XDC Network (replace `YOUR_USER_ID` with your user ID from auth.users):

```sql
-- First, get your user ID
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert XDC Network (replace YOUR_USER_ID)
INSERT INTO public.web3_networks (
  name,
  chain_id,
  rpc_url,
  explorer_url,
  is_active,
  created_by
) VALUES (
  'XDC Network',
  50,
  'https://rpc.xinfin.network',
  'https://explorer.xinfin.network/',
  true,
  'YOUR_USER_ID'
) ON CONFLICT (chain_id) DO NOTHING;
```

3. Add your smart contracts (get the network ID first):

```sql
-- Get the XDC network ID
SELECT id FROM web3_networks WHERE chain_id = 50;

-- Insert contracts (replace NETWORK_ID and YOUR_USER_ID)
INSERT INTO public.smart_contracts (
  name,
  address,
  network_id,
  is_active,
  created_by
) VALUES
  ('CIFI Token V1', '0xe5F9AE9D32D93d3934007568B30B7A7cA489C486', 'NETWORK_ID', true, 'YOUR_USER_ID'),
  ('CIFI Token V2', '0x1932192f2D3145083a37ebBf1065f457621F0647', 'NETWORK_ID', true, 'YOUR_USER_ID'),
  ('CIFI Migration Contract', '0xda95cC3368452958666643Dc6ebB6b15aebF497e', 'NETWORK_ID', true, 'YOUR_USER_ID'),
  ('REFI Token V1', '0xbc24F5f3f09ced3C12322DB67EffB55297816Ef6', 'NETWORK_ID', true, 'YOUR_USER_ID'),
  ('REFI Token V2', '0x2D010d707da973E194e41D7eA52617f8F969BD23', 'NETWORK_ID', true, 'YOUR_USER_ID'),
  ('REFI Migration Contract', '0x213cc41336Fe4Da4132C9e59082241fE6d5E8453', 'NETWORK_ID', true, 'YOUR_USER_ID');
```

## Step 8: Update Your Code

1. Update `src/integrations/supabase/client.ts` to use environment variables (already done if you follow the guide)
2. Restart your dev server: `npm run dev`
3. Test by logging in at `/auth`

## Step 9: Verify Setup

1. Log in at `/auth` with your admin email
2. Go to `/admin` - you should see the admin dashboard
3. Check the "Cross-Chain" tab - it should load without errors

## Troubleshooting

### "Invalid API key" error
- Check your `.env` file has the correct keys
- Make sure keys start with `VITE_` prefix
- Restart your dev server after changing `.env`

### "Permission denied" error
- Make sure you assigned yourself the `super_admin` role
- Check RLS policies are set up correctly

### Can't see admin dashboard
- Verify your user has `super_admin` role in `user_roles` table
- Check browser console for errors

### Database connection issues
- Verify your Supabase project is active (not paused)
- Check your Project URL is correct
- Make sure you're using the `anon` key, not `service_role` key in the frontend

## Security Notes

- Never commit `.env` file to git
- The `anon` key is safe for frontend use (it's public)
- The `service_role` key should NEVER be used in frontend code
- Keep your database password secure

## Next Steps

- Set up email templates in Authentication → Email Templates
- Configure custom SMTP if needed
- Set up database backups (available in paid plans)
- Monitor usage in the dashboard

