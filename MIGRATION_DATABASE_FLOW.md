# Migration Database Flow - How It Works

## Overview

The database is **essential** for the migration process. It tracks user acknowledgements, records migration events, and enables cross-chain token distribution. Here's how it works:

## Migration Flow with Database

### Step 1: User Acknowledgement (Before Migration)

**What happens:**
1. User connects wallet and fills out the Migration Acknowledgement form
2. System creates a record in `migration_acknowledgements` table

**Database Table:** `migration_acknowledgements`

**Data Stored:**
- `email`: User's email address
- `wallet_address`: User's wallet address (XDC Network)
- `acknowledgement_hash`: Hash of the acknowledgement data
- `user_id`: (Optional) If user is logged in
- `ip_address`: User's IP (for security)
- `user_agent`: Browser info
- `created_at`: Timestamp

**Purpose:** Legal/compliance tracking - proves user acknowledged terms before migrating

---

### Step 2: Token Migration (On XDC Network)

**What happens:**
1. User approves CIFI tokens
2. User calls `migrate()` function on the migration contract
3. CIFI tokens are **locked** on XDC Network
4. System records the migration event in database

**Database Table:** `migration_events`

**Data Stored:**
- `acknowledgement_id`: Links to the acknowledgement record
- `wallet_address`: User's wallet address
- `token_type`: `"CIFI"` (always CIFI now)
- `amount`: Amount of tokens migrated
- `old_contract_address`: CIFI V1 token address
- `new_contract_address`: (Not used for cross-chain, but stored)
- `transaction_hash`: XDC transaction hash
- `block_number`: Block number on XDC
- `gas_used`: Gas used for transaction
- `gas_price`: Gas price
- `status`: `"pending"` or `"confirmed"`
- `base_distribution_status`: `null` initially (set to `"sent"` when EPS tokens are sent)
- `base_distribution_tx_hash`: BASE transaction hash (set when EPS sent)
- `base_v2_token_address`: EPS token address on BASE (set by admin)
- `created_at`: Timestamp

**Purpose:** 
- Track all migrations
- Link to acknowledgements
- Enable cross-chain distribution tracking

---

### Step 3: Cross-Chain Distribution (Admin Action)

**What happens:**
1. Admin goes to `/admin` → "Cross-Chain" tab
2. Admin sees list of confirmed migrations (status = "confirmed")
3. Admin connects wallet to BASE Network
4. Admin enters EPS token address
5. Admin clicks "Send All Pending" to batch-send EPS tokens
6. System updates `migration_events` records with:
   - `base_distribution_status`: `"sent"`
   - `base_distribution_tx_hash`: BASE transaction hash
   - `base_distribution_sent_at`: Timestamp
   - `base_v2_token_address`: EPS token address

**Database Table:** `migration_events` (updates existing records)

**Purpose:** Track which users have received EPS tokens on BASE

---

## Database Tables Required

### 1. `migration_acknowledgements`
**Purpose:** Store user acknowledgements before migration

**Key Fields:**
- `wallet_address` - User's wallet
- `email` - User's email
- `acknowledgement_hash` - Verification hash

### 2. `migration_events`
**Purpose:** Track all migration transactions and cross-chain distributions

**Key Fields:**
- `wallet_address` - User's wallet
- `amount` - Tokens migrated
- `transaction_hash` - XDC transaction
- `base_distribution_status` - EPS token status
- `base_distribution_tx_hash` - BASE transaction

### 3. `smart_contracts`
**Purpose:** Store contract addresses (CIFI V1, Migration Contract)

**Key Fields:**
- `name` - Contract name (e.g., "CIFI V1", "CIFI Migration")
- `address` - Contract address
- `network_id` - Network (XDC)
- `is_active` - Whether contract is active

### 4. `web3_networks`
**Purpose:** Store network configurations (XDC, BASE)

**Key Fields:**
- `name` - Network name
- `chain_id` - Chain ID (50 for XDC, 8453 for BASE)
- `rpc_url` - RPC endpoint
- `is_active` - Whether network is active

---

## Is Your Database Prepared?

### ✅ Check These:

1. **Collections Created:**
   - [ ] `migration_acknowledgements` table exists
   - [ ] `migration_events` table exists
   - [ ] `smart_contracts` table exists
   - [ ] `web3_networks` table exists

2. **Run Setup Script:**
   ```bash
   npm run setup-appwrite
   ```
   This creates all required tables with correct attributes.

3. **Network Configured:**
   - [ ] XDC Network added in Admin Dashboard → Networks
   - [ ] BASE Network added (for cross-chain management)

4. **Contracts Configured:**
   - [ ] CIFI V1 contract added
   - [ ] CIFI Migration contract added
   - [ ] Both marked as "Active"

---

## How to Verify Database is Ready

1. **Check Collections:**
   - Go to Appwrite Console → Database
   - Verify these tables exist:
     - `migration_acknowledgements`
     - `migration_events`
     - `smart_contracts`
     - `web3_networks`

2. **Test Migration Flow:**
   - Connect wallet on Migration Portal
   - Fill out acknowledgement form
   - Check `migration_acknowledgements` table - should see new record
   - Complete migration
   - Check `migration_events` table - should see new record with status "confirmed"

3. **Test Admin Panel:**
   - Go to `/admin` → "Cross-Chain" tab
   - Should see list of confirmed migrations
   - Should be able to connect BASE wallet and send tokens

---

## What Happens Without Database?

**If database is not set up:**
- ❌ Users cannot submit acknowledgements
- ❌ Migration events are not tracked
- ❌ Admins cannot see who needs EPS tokens
- ❌ No audit trail of migrations
- ✅ Migration contract still works (tokens get locked)
- ❌ But no way to track who migrated or send EPS tokens

**The database is REQUIRED for:**
1. Legal compliance (acknowledgements)
2. Migration tracking
3. Cross-chain distribution management
4. Audit trail

---

## Quick Setup Checklist

1. **Run setup script:**
   ```bash
   npm run setup-appwrite
   ```

2. **Add XDC Network:**
   - Admin Dashboard → Networks → Add Network
   - Name: "XDC Network"
   - Chain ID: 50
   - RPC URL: Your XDC RPC endpoint

3. **Add Contracts:**
   - Admin Dashboard → Contracts → Add Contract
   - Add "CIFI V1" contract
   - Add "CIFI Migration" contract

4. **Test:**
   - Try migrating a small amount
   - Check database tables for records
   - Verify admin panel shows the migration

---

## Summary

**The database is essential because:**
- It tracks who acknowledged terms (legal requirement)
- It records all migrations (audit trail)
- It enables cross-chain distribution (admin can see who needs EPS tokens)
- It links acknowledgements to migrations (compliance)

**Without the database:**
- Migration contract still works (tokens lock on XDC)
- But you have no way to:
  - Track who migrated
  - Send EPS tokens to the right addresses
  - Prove users acknowledged terms
  - Audit migration history

**The migration process REQUIRES the database to function properly.**

