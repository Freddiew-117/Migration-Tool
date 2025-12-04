# Contract Address Setup Guide

## Required Contract Addresses

The app needs **2 contract addresses** on the **XDC Network**:

1. **CIFI V1 Token Contract** - The old token that users will migrate from
2. **CIFI Migration Contract** - The migration contract that handles locking CIFI tokens

## Where to Set Up Contracts

### Option 1: Admin Dashboard (Recommended)

1. **Log in as Super Admin** at `/admin`
2. **Go to the "Contracts" tab**
3. **Click "Add Contract"** button
4. **Fill in the form:**
   - **Name**: Use one of these patterns (case-insensitive):
     - For CIFI V1: `CIFI V1`, `CIFI Token V1`, `cifi v1`, `cifi`, etc.
     - For Migration: `CIFI Migration`, `CIFI Migrator`, `cifi migration`, etc.
   - **Address**: The contract address on XDC Network (starts with `0x`)
   - **Network**: Select "XDC Network" (Chain ID: 50)
   - **ABI**: (Optional) Paste the contract ABI as JSON
   - **Is Active**: ✅ Check this box
5. **Click "Save"**

### Option 2: Direct Database Entry (Advanced)

If you prefer to add contracts directly to Appwrite:

1. Go to your Appwrite Console
2. Navigate to **Database** → **smart_contracts** table
3. Click **"Create Document"**
4. Add these fields:
   - `name`: `CIFI V1` (or similar pattern)
   - `address`: Your contract address
   - `network_id`: The ID of your XDC Network entry
   - `is_active`: `true`
   - `created_by`: Your user ID

## Contract Name Patterns

The app automatically identifies contracts by matching names. Use any of these patterns:

### For CIFI V1 Token:
- `CIFI V1`
- `CIFI Token V1`
- `cifi v1`
- `cifi_v1`
- `cifi-v1`
- `cifi token v1`
- `cifitoken v1`
- `cifi` (will match if no other contract matches first)

### For CIFI Migration Contract:
- `CIFI Migration`
- `CIFI Migrator`
- `cifi migration`
- `cifi_migration`
- `cifi-migration`
- `cifi migrator`

## Fallback Addresses

If the database lookup fails, the app uses these hardcoded fallback addresses:

```javascript
cifiV1: '0xe5F9AE9D32D93d3934007568B30B7A7cA489C486'
cifiMigration: '0xda95cC3368452958666643Dc6ebB6b15aebF497e'
```

**Note**: These are fallbacks only. You should set up your actual contract addresses in the database.

## Setup Checklist

- [ ] XDC Network is configured in Admin Dashboard → Networks tab
- [ ] CIFI V1 Token contract is added with correct name pattern
- [ ] CIFI Migration contract is added with correct name pattern
- [ ] Both contracts are marked as "Active"
- [ ] Contract addresses are correct (verify on XDC Explorer)

## Verification

After setting up contracts:

1. Check the browser console for contract identification logs:
   - ✅ `Found cifiV1 by name pattern...`
   - ✅ `Found cifiMigration by name pattern...`
2. Visit the Migration Portal - it should show your CIFI balance
3. If you see "Fallback" in the console, the database lookup failed

## Troubleshooting

**Problem**: Contracts not found, using fallback addresses

**Solutions**:
1. Check contract names match the patterns above
2. Ensure contracts are marked as `is_active: true`
3. Verify the network_id matches your XDC Network entry
4. Check browser console for specific error messages

**Problem**: Wrong contract addresses being used

**Solutions**:
1. Update contract addresses in Admin Dashboard
2. Ensure contract names are unique and match patterns
3. Clear browser cache and refresh

## Additional Notes

- The app only needs contracts on **XDC Network** (Chain ID: 50)
- EPS tokens on BASE Network are handled manually by admins (see Cross-Chain Migration tab)
- Contract ABIs are optional but recommended for future features
- All contracts must be on the same network (XDC) for the migration portal to work

