# Appwrite Setup Guide

Complete guide to set up Appwrite for the Migration Portal.

## Step 1: Create Appwrite Account

1. Go to [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with:
   - GitHub (recommended)
   - Google
   - Email
4. Verify your email if required

## Step 2: Create a New Project

1. Once logged in, click **"Create Project"**
2. Fill in the project details:
   - **Name**: `Circularity Finance Migration Portal` (or your preferred name)
   - **Project ID**: Auto-generated (or customize it)
3. Click **"Create"**

## Step 3: Get Your API Keys

1. In your project dashboard, go to **Settings** → **API Keys**
2. You'll see:
   - **Project ID**: `xxxxx` (you'll need this)
   - **API Endpoint**: `https://cloud.appwrite.io/v1` (or your self-hosted URL)
3. Create a new API key:
   - Click **"Create API Key"**
   - Name it: `Web Client Key`
   - Scopes: Select `users.read`, `users.write`, `databases.read`, `databases.write`
   - Click **"Create"**
   - **IMPORTANT**: Copy the key immediately - you won't see it again!

## Step 4: Configure Your App

1. In your project root, update your `.env` file:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_API_KEY=your-api-key
```

Replace with your actual values.

## Step 5: Set Up Authentication

1. In Appwrite dashboard, go to **Auth** → **Settings**
2. Enable **Email/Password** authentication:
   - Toggle **"Email/Password"** to ON
   - Save settings

## Step 6: Create Database

1. Go to **Databases** → **Create Database**
2. Name: `migration-portal`
3. Database ID: `migration-portal` (or auto-generated)
4. Click **"Create"**

## Step 7: Create Collections

You'll need to create these collections in your database. See `APPWRITE_MIGRATION.md` for detailed schema setup.

### Quick Setup (via Appwrite Console):

1. **profiles** collection
2. **user_roles** collection
3. **web3_networks** collection
4. **smart_contracts** collection
5. **migration_acknowledgements** collection
6. **migration_events** collection
7. **incubator_applications** collection
8. **support_messages** collection
9. **feature_requests** collection

## Step 8: Create Your First Admin User

1. Go to **Auth** → **Users**
2. Click **"Create User"**
3. Enter:
   - **Email**: Your email address
   - **Password**: Create a secure password
   - **Name**: Your full name
4. Click **"Create"**

5. Now assign super_admin role:
   - Go to **Databases** → `migration-portal` → **user_roles** collection
   - Click **"Create Document"**
   - Add:
     - `user_id`: Your user ID (from Auth → Users)
     - `role`: `super_admin`
   - Click **"Create"**

## Step 9: Set Up Permissions

For each collection, you'll need to set permissions. See `APPWRITE_MIGRATION.md` for detailed permission setup.

## Step 10: Test the Setup

1. Restart your dev server: `npm run dev`
2. Go to `/auth` → Sign in with your admin account
3. Go to `/admin` → Should see admin dashboard ✅

## Troubleshooting

### "Invalid API key" error
- Check your `.env` file has correct keys
- Make sure keys start with `VITE_` prefix
- Restart dev server after changing `.env`

### "Permission denied" error
- Check collection permissions are set correctly
- Verify your user has `super_admin` role in `user_roles` collection

### Can't see admin dashboard
- Verify your user has `super_admin` role
- Check browser console for errors

### Database connection issues
- Verify your Appwrite project is active
- Check your Project ID is correct
- Make sure API endpoint URL is correct

## Security Notes

- Never commit `.env` file to git
- API keys in Appwrite are scoped - use appropriate scopes
- Keep your database passwords secure
- Use environment variables for all sensitive data

## Next Steps

- Set up email templates in Auth → Settings
- Configure custom SMTP if needed
- Set up database backups
- Monitor usage in the dashboard

