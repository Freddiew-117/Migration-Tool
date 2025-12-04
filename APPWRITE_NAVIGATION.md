# 📍 Appwrite Navigation Guide

## Where to Find Collections

**Collections are NOT a separate section!** They're created **inside** each database.

## Step-by-Step Navigation

### 1. Go to Databases
- Left sidebar → Click **"Databases"**

### 2. Create Database (if you haven't)
- Click **"+ Add Database"** or **"Create Database"**
- Name: `migration-portal`
- Click **"Create"**

### 3. Open Your Database
- **Click on the database name** `migration-portal` (it's a clickable link/card)
- You'll now see the database details page

### 4. Create Collection
- On the database details page, you'll see:
  - **"Create Table"** button (this creates a collection - Appwrite uses "Table" in the UI)
- Click it to create a new collection

### 5. Add Attributes
- After creating the collection, you'll be on the collection page
- Click **"Create Attribute"** to add fields

### 6. Add Documents
- Click on a collection name to open it
- Click **"+ Add Document"** or **"Create Document"** to add data

## Visual Flow

```
Appwrite Dashboard
└── Databases (left sidebar)
    └── migration-portal (click on it!)
        └── Create Table (button - this creates a collection!)
            └── user_roles (after creating)
                └── + Add Document (button)
```

## Common Confusion

❌ **Wrong:** Looking for "Collections" as a top-level menu item  
✅ **Correct:** Collections are inside each database (click "Create Table" button)

**Note:** Appwrite calls collections "Tables" in the UI, but they're the same thing!

## Still Can't Find It?

1. Make sure you've **created the database first**
2. **Click on the database name** to open it
3. Look for the **"Create Table"** button (this is what creates collections!)
4. If you still don't see it, check that you have the right permissions

