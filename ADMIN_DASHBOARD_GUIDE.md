# 🎛️ Super Admin Dashboard - Complete Guide

## Overview

The Super Admin Dashboard is your control center for managing the entire migration portal. It provides 6 main management sections accessible via tabs.

## Access

- **URL**: `/admin`
- **Required Role**: `super_admin` (set in `user_roles` table)
- **Authentication**: Must be logged in with super admin role

## Dashboard Sections

### 1. 📊 Dashboard Stats

The top of the dashboard shows 4 key metrics:
- **Active Networks**: Number of active Web3 networks configured
- **Smart Contracts**: Number of active smart contracts
- **Your Role**: Your current role (should be `super_admin`)
- **System Status**: Overall system health

### 2. 🌐 Networks Tab

**Purpose**: Manage blockchain networks (XDC, Base, etc.)

**What you can do:**
- Add new networks (XDC, Base, Ethereum, etc.)
- Edit network details (RPC URLs, chain IDs, explorer URLs)
- Activate/deactivate networks
- Import networks from Chainlist

**Required Collection**: `web3_networks`

**Key Fields:**
- `name`: Network name (e.g., "XDC Network")
- `chain_id`: Chain ID (e.g., 50 for XDC)
- `rpc_url`: RPC endpoint URL
- `explorer_url`: Block explorer URL
- `is_active`: Whether network is enabled

**Setup Steps:**
1. Go to **Networks** tab
2. Click **"Add Network"** or **"Import from Chainlist"**
3. Fill in network details
4. Save

### 3. 📜 Smart Contracts Tab

**Purpose**: Manage smart contract addresses for migration

**What you can do:**
- Add contract addresses (V1 tokens, V2 tokens, migration contracts)
- Link contracts to networks
- Activate/deactivate contracts
- Edit contract details

**Required Collection**: `smart_contracts`

**Key Fields:**
- `name`: Contract name (e.g., "CIFI V1", "CIFI Migration")
- `address`: Contract address (0x...)
- `network_id`: ID of the network this contract is on
- `is_active`: Whether contract is enabled

**Setup Steps:**
1. First, add the network (from Networks tab)
2. Go to **Smart Contracts** tab
3. Click **"Add Contract"**
4. Select network, enter name and address
5. Save

**Important Contracts to Add:**
- `CIFI V1` - Old CIFI token address
- `CIFI V2` - New CIFI token address
- `CIFI Migration` - Migration contract address
- `REFI V1` - Old REFI token address
- `REFI V2` - New REFI token address
- `REFI Migration` - Migration contract address

### 4. 🔗 Cross-Chain Tab

**Purpose**: Manage cross-chain migrations (XDC → Base)

**What you can do:**
- Connect to Base network
- View XDC migration events
- Enter V2 token addresses for Base
- Batch-send V2 tokens on Base to migrated wallets

**How it works:**
1. Users migrate V1 tokens on XDC (tokens are locked)
2. Admin views migration events in this tab
3. Admin connects wallet to Base network
4. Admin enters V2 token addresses for Base
5. Admin batch-sends V2 tokens to migrated wallets

**Required Collections**: 
- `migration_events` (for viewing XDC migrations)
- Base network must be added in Networks tab

### 5. 📋 Applications Tab

**Purpose**: Manage incubator applications

**What you can do:**
- View submitted applications
- Approve/reject applications
- View application details

**Required Collection**: `incubator_applications`

### 6. 💡 Feature Requests Tab

**Purpose**: Manage user feature requests

**What you can do:**
- View feature requests
- Mark as implemented/in progress
- Respond to requests

**Required Collection**: `feature_requests`

### 7. 🎧 Support Tab

**Purpose**: Manage support messages

**What you can do:**
- View support tickets
- Respond to messages
- Track response rates

**Required Collection**: `support_messages`

---

## Complete Setup Guide

### Step 1: Create Required Collections

You need these collections in Appwrite (see `APPWRITE_MIGRATION.md` for full schema):

#### Essential Collections:

1. **`user_roles`** ✅ (You already have this)
   - For admin access

2. **`web3_networks`** (Required for Networks tab)
   - Attributes: `name`, `chain_id`, `rpc_url`, `explorer_url`, `is_active`, `created_at`, `updated_at`

3. **`smart_contracts`** (Required for Contracts tab)
   - Attributes: `name`, `address`, `network_id`, `is_active`, `created_at`, `updated_at`

#### Optional Collections (for other tabs):

4. **`migration_events`** (For Cross-Chain tab)
5. **`migration_acknowledgements`** (For tracking migrations)
6. **`incubator_applications`** (For Applications tab)
7. **`feature_requests`** (For Feature Requests tab)
8. **`support_messages`** (For Support tab)

### Step 2: Set Permissions

For each collection, set permissions:
- **Read Access**: Add `users` role (so authenticated users can read)
- **Write Access**: Add `users` role (or leave empty for admin-only writes)

### Step 3: Add XDC Network

1. Go to **Networks** tab
2. Click **"Add Network"**
3. Fill in:
   - **Name**: `XDC Network`
   - **Chain ID**: `50`
   - **RPC URL**: `https://rpc.xinfin.network` (or your preferred RPC)
   - **Explorer URL**: `https://xdcscan.com`
   - **Is Active**: ✅
4. Click **"Save"**

### Step 4: Add Smart Contracts

1. Go to **Smart Contracts** tab
2. For each contract, click **"Add Contract"**:

**CIFI Contracts:**
- **Name**: `CIFI V1`
- **Address**: `0xe5F9AE9D32D93d3934007568B30B7A7cA489C486`
- **Network**: Select "XDC Network"
- **Is Active**: ✅

- **Name**: `CIFI V2`
- **Address**: `0x1932192f2D3145083a37ebBf1065f457621F0647`
- **Network**: Select "XDC Network"
- **Is Active**: ✅

- **Name**: `CIFI Migration`
- **Address**: `0xda95cC3368452958666643Dc6ebB6b15aebF497e`
- **Network**: Select "XDC Network"
- **Is Active**: ✅

**REFI Contracts:**
- **Name**: `REFI V1`
- **Address**: `0xbc24F5f3f09ced3C12322DB67EffB55297816Ef6`
- **Network**: Select "XDC Network"
- **Is Active**: ✅

- **Name**: `REFI V2`
- **Address**: `0x2D010d707da973E194e41D7eA52617f8F969BD23`
- **Network**: Select "XDC Network"
- **Is Active**: ✅

- **Name**: `REFI Migration`
- **Address**: `0x213cc41336Fe4Da4132C9e59082241fE6d5E8453`
- **Network**: Select "XDC Network"
- **Is Active**: ✅

### Step 5: Add Base Network (for Cross-Chain)

1. Go to **Networks** tab
2. Click **"Add Network"** or **"Import from Chainlist"**
3. Search for "Base" and import, or manually add:
   - **Name**: `Base`
   - **Chain ID**: `8453`
   - **RPC URL**: `https://mainnet.base.org`
   - **Explorer URL**: `https://basescan.org`
   - **Is Active**: ✅

### Step 6: Verify Setup

1. Check **Dashboard Stats** - should show:
   - Active Networks: 2 (XDC + Base)
   - Smart Contracts: 6 (all contracts)
2. Go to **Networks** tab - should see XDC and Base
3. Go to **Smart Contracts** tab - should see all 6 contracts
4. Go to migration portal (`/`) - contracts should load (no fallback errors)

---

## How It Works

### Data Flow

1. **Admin adds networks** → Stored in `web3_networks` collection
2. **Admin adds contracts** → Stored in `smart_contracts` collection
3. **Migration portal** → Reads contracts from database
4. **Users migrate** → Events stored in `migration_events`
5. **Admin views events** → Can batch-send tokens on Base

### Fallback System

If database collections don't exist or fail to load:
- The app uses **hardcoded fallback contracts** (you saw these in console)
- These are defined in `src/hooks/useContractData.ts`
- Once you add contracts to the database, they'll be used instead

### Contract Matching

The app automatically matches contracts by name patterns:
- `cifi-v1`, `cifi v1`, `cifiv1` → CIFI V1
- `cifi-v2`, `cifi v2`, `cifiv2` → CIFI V2
- `cifi-migration`, `cifi migrator` → CIFI Migration
- Same for REFI

---

## Quick Start Checklist

- [ ] Create `web3_networks` collection
- [ ] Create `smart_contracts` collection
- [ ] Set permissions on both collections
- [ ] Add XDC Network
- [ ] Add Base Network (for cross-chain)
- [ ] Add all 6 smart contracts (CIFI V1/V2/Migration, REFI V1/V2/Migration)
- [ ] Verify contracts appear in migration portal
- [ ] Test migration flow

---

## Troubleshooting

**Contracts not showing?**
- Check collection permissions (read access for `users`)
- Verify contract addresses are correct
- Check browser console for errors

**Networks not appearing?**
- Verify `web3_networks` collection exists
- Check permissions
- Ensure `is_active` is true

**Can't access admin?**
- Verify your role is `super_admin` in `user_roles` table
- Check user ID matches exactly
- Refresh browser after adding role

---

## Next Steps

Once basic setup is done:
1. Add more networks if needed
2. Set up cross-chain migration (add Base network)
3. Monitor migration events
4. Manage applications and support requests

See `APPWRITE_MIGRATION.md` for complete collection schemas.

