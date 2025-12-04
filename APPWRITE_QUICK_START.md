# Quick Start - Appwrite Setup

## 🚀 Fast Setup (10 minutes)

### 1. Create Appwrite Account & Project
- Go to [cloud.appwrite.io](https://cloud.appwrite.io) → Sign up
- Click **"Create Project"**
- Name it: `Migration Portal`
- Copy your **Project ID**

### 2. Get API Key
- Go to **Settings** → **API Keys**
- Click **"Create API Key"**
- Name: `Web Client`
- Scopes: Select `users.read`, `users.write`, `databases.read`, `databases.write`
- **Copy the key immediately!** (you won't see it again)

### 3. Configure App
Create/update `.env` file:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_API_KEY=your-api-key
```

### 4. Enable Auth
- Go to **Auth** → **Settings**
- Enable **Email/Password** → Save

### 5. Create Database
- Go to **Databases** (left sidebar) → **Create Database** or **"+ Add Database"**
- Name: `migration-portal`
- Database ID: `migration-portal` (or auto-generated)
- Click **"Create"**

### 6. Create Collections
**Important:** Collections are created INSIDE the database (they're called "Tables" in the UI)!

1. Click on your `migration-portal` database (it should be listed)
2. You'll see the database details page
3. Click **"Create Table"** button (this creates a collection)
4. Follow `APPWRITE_MIGRATION.md` to create all collections
5. Or create them manually one by one

### 7. Create Admin User
- Go to **Auth** → **Users** → **Create User**
- Enter your email and password
- Copy your **User ID**

### 8. Assign Admin Role
- Go to **Databases** → Click on `migration-portal` → Click on `user_roles` collection → **Create Document** (or **"+ Add Document"**)
- Add:
  - `user_id`: Your User ID
  - `role`: `super_admin`
- Click **"Create"**

### 9. Install Dependencies
```bash
npm install appwrite
```

### 10. Restart Dev Server
```bash
npm run dev
```

### 11. Test
- Go to `/auth` → Sign in
- Go to `/admin` → Should work ✅

## ✅ Done!

For detailed instructions, see `APPWRITE_SETUP.md`

