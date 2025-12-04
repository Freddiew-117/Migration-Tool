# ✅ Create `user_roles` Table - Step by Step

The error shows the `user_roles` collection doesn't exist. Follow these steps:

## Step 1: Create the Table

1. Go to **Databases** in Appwrite
2. Click on your `migration-portal` database
3. Click **"Create Table"** button
4. **Collection ID**: `user_roles` (must match exactly, lowercase with underscore)
5. **Name**: `User Roles` (can be anything, but ID must be exact)
6. Click **"Create"**

## Step 2: Add Attributes (Fields)

After creating the table, you'll be on the table details page. Add these attributes:

### Attribute 1: `user_id`
- Click **"Create Attribute"**
- Type: **String**
- Size: `255`
- Required: ✅ (check the box)
- Click **"Create"**

### Attribute 2: `role`
- Click **"Create Attribute"** again
- Type: **String**
- Size: `50`
- Required: ✅ (check the box)
- Click **"Create"**

### Attribute 3: `created_at`
- Click **"Create Attribute"** again
- Type: **DateTime**
- Required: ✅ (check the box)
- Click **"Create"**

## Step 3: Add Your Admin Role

1. Go to **Auth** → **Users** in Appwrite
2. Find your user and copy the **User ID** (looks like: `692f6ab60023558bd30f`)

3. Go back to **Databases** → `migration-portal` → Click on `user_roles` table
4. Click **"+ Add Document"** or **"Create Document"**
5. Fill in:
   - `user_id`: Paste your User ID
   - `role`: Type `super_admin`
   - `created_at`: Click calendar icon, select today's date/time
6. Click **"Create"**

## Step 4: Test

1. Refresh your browser
2. Go to `/admin`
3. Should work! ✅

## ⚠️ Important

- **Collection ID must be exactly**: `user_roles` (lowercase, with underscore)
- Don't use spaces or different casing
- Make sure all 3 attributes are created before adding documents

