# Migration System - Complete Guide

## Overview

The migration system allows users to **lock CIFI tokens on XDC Network** and receive **EPS tokens on BASE Network** at a 1:1 ratio. This is a cross-chain migration where tokens are locked on one chain and new tokens are distributed on another.

---

## Migration Flow

### Step 1: User Acknowledgement (Database)
1. User connects wallet to XDC Network
2. User fills out Migration Acknowledgement form
3. System saves acknowledgement to database (`migration_acknowledgements` table)
4. User can now proceed with migration

### Step 2: Token Approval (On-Chain)
1. User approves CIFI V1 token contract to spend their tokens
2. Approval is given to the Migration Contract address
3. This is a standard ERC20 `approve()` call

### Step 3: Token Migration (On-Chain)
1. User calls `migrate(amount)` on the Migration Contract
2. Migration Contract:
   - Transfers CIFI V1 tokens from user to itself (locks them)
   - Records the migration event
   - Emits events for tracking
3. Transaction is confirmed on XDC Network
4. System saves migration event to database (`migration_events` table)

### Step 4: Cross-Chain Distribution (Manual Admin Action)
1. Admin goes to `/admin` → "Cross-Chain" tab
2. Admin sees list of confirmed migrations (status = "confirmed")
3. Admin connects wallet to BASE Network
4. Admin enters EPS token contract address
5. Admin clicks "Send All Pending" to batch-send EPS tokens
6. Admin's wallet sends EPS tokens to each user's wallet address on BASE
7. Database is updated with BASE transaction hash and status

---

## Required Smart Contracts

### 1. CIFI V1 Token Contract (XDC Network)

**Purpose:** The old token that users will migrate from

**Type:** Standard ERC20 Token

**Required Functions:**
- `approve(spender, amount)` - User approves migration contract to spend tokens
- `transfer(to, amount)` - Migration contract transfers tokens from user
- `balanceOf(owner)` - Check user's token balance
- `allowance(owner, spender)` - Check approval amount

**Deployment:**
- Must be deployed on **XDC Network** (Chain ID: 50)
- Contract address must be added to database via Admin Dashboard

**Example:**
```solidity
// Standard ERC20 token
contract CIFIV1 is ERC20 {
    constructor() ERC20("CIFI V1", "CIFI") {
        _mint(msg.sender, 1000000 * 10**18); // Initial supply
    }
}
```

---

### 2. Migration Contract (XDC Network)

**Purpose:** Locks CIFI V1 tokens and records migration events

**Type:** Custom Migration Contract

**Required Functions:**
- `migrate(uint256 amount)` - Main migration function
- `getUserStats(address user)` - Get user's migration stats
- `getGlobalStats()` - Get global migration statistics
- `canMigrate(address user, uint256 amount)` - Check if user can migrate

**What It Does:**
1. Receives approved CIFI V1 tokens from users
2. Locks tokens (transfers to contract or burns them)
3. Records migration events (wallet address, amount, timestamp)
4. Emits events for off-chain tracking

**Deployment:**
- Must be deployed on **XDC Network** (Chain ID: 50)
- Must have access to CIFI V1 token contract
- Contract address must be added to database via Admin Dashboard

**Example Structure:**
```solidity
contract CIFIMigration {
    IERC20 public cifiV1;
    uint256 public totalMigrated;
    mapping(address => uint256) public userMigrated;
    
    event Migration(address indexed user, uint256 amount, uint256 timestamp);
    
    constructor(address _cifiV1) {
        cifiV1 = IERC20(_cifiV1);
    }
    
    function migrate(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(cifiV1.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        // Transfer tokens from user to contract (lock them)
        cifiV1.transferFrom(msg.sender, address(this), amount);
        
        // Update stats
        totalMigrated += amount;
        userMigrated[msg.sender] += amount;
        
        // Emit event
        emit Migration(msg.sender, amount, block.timestamp);
    }
    
    function getUserStats(address user) external view returns (
        uint256 total,
        uint256 dailyMigrated,
        uint256 remainingDaily,
        bool isWhitelisted
    ) {
        // Return user's migration stats
        // (Daily limits can be removed if not needed)
        return (
            userMigrated[user],
            0, // Daily migrated (not needed)
            type(uint256).max, // No daily limit
            false // Whitelist status
        );
    }
    
    function getGlobalStats() external view returns (
        uint256 migrated,
        uint256 remaining,
        uint256 v2Balance,
        uint256 v1Balance
    ) {
        return (
            totalMigrated,
            type(uint256).max, // No limit
            cifiV1.balanceOf(address(this)), // Locked tokens
            cifiV1.totalSupply() // Total supply
        );
    }
}
```

---

### 3. EPS Token Contract (BASE Network)

**Purpose:** The new token that users receive on BASE Network

**Type:** Standard ERC20 Token

**Required Functions:**
- `transfer(to, amount)` - Admin sends tokens to users
- `balanceOf(owner)` - Check balances
- `mint(to, amount)` - (Optional) If using mintable token

**Deployment:**
- Must be deployed on **BASE Network** (Chain ID: 8453)
- Can be standard ERC20 or mintable token
- Contract address is entered by admin in Cross-Chain Management panel

**Distribution:**
- Admin manually sends EPS tokens to users' wallet addresses
- Same wallet address on BASE receives the tokens
- 1:1 ratio (if user locked 1000 CIFI, they receive 1000 EPS)

**Example:**
```solidity
// Standard ERC20 token on BASE
contract EPS is ERC20 {
    constructor() ERC20("EPS Token", "EPS") {
        // Initial supply or mintable
    }
    
    // If mintable, admin can mint tokens as needed
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

---

## Contract Deployment Checklist

### XDC Network Contracts

- [ ] **CIFI V1 Token Contract**
  - Deploy on XDC Network (Chain ID: 50)
  - Verify contract on XDC Explorer
  - Add contract address to Admin Dashboard → Contracts
  - Name: "CIFI V1" or "CIFI Token V1"

- [ ] **Migration Contract**
  - Deploy on XDC Network (Chain ID: 50)
  - Set CIFI V1 token address in constructor
  - Verify contract on XDC Explorer
  - Add contract address to Admin Dashboard → Contracts
  - Name: "CIFI Migration" or "CIFI Migrator"

### BASE Network Contracts

- [ ] **EPS Token Contract**
  - Deploy on BASE Network (Chain ID: 8453)
  - Verify contract on BaseScan
  - Admin will enter address in Cross-Chain Management panel
  - Ensure admin wallet has tokens to distribute

---

## Database Configuration

After deploying contracts, configure them in the database:

1. **Add XDC Network:**
   - Admin Dashboard → Networks → Add Network
   - Name: "XDC Network"
   - Chain ID: 50
   - RPC URL: Your XDC RPC endpoint

2. **Add BASE Network:**
   - Admin Dashboard → Networks → Add Network
   - Name: "Base"
   - Chain ID: 8453
   - RPC URL: `https://mainnet.base.org`

3. **Add Contracts:**
   - Admin Dashboard → Contracts → Add Contract
   - Add CIFI V1 contract (XDC Network)
   - Add Migration contract (XDC Network)
   - Mark both as "Active"

---

## Migration Process Details

### User Side (XDC Network)

1. **Connect Wallet** → XDC Network
2. **View Balance** → See CIFI V1 tokens
3. **Fill Acknowledgement** → Accept terms
4. **Approve Tokens** → Approve migration contract
5. **Migrate** → Call `migrate(amount)`
6. **Tokens Locked** → CIFI V1 tokens are locked on XDC

### Admin Side (BASE Network)

1. **View Migrations** → See all confirmed migrations
2. **Connect BASE Wallet** → Connect to BASE Network
3. **Enter EPS Address** → Enter EPS token contract address
4. **Send Tokens** → Batch send EPS tokens to all pending migrations
5. **Update Status** → Database tracks which users received tokens

---

## Security Considerations

### Migration Contract Security

1. **Token Locking:**
   - Tokens should be locked permanently (not just transferred)
   - Consider burning tokens or sending to a burn address
   - Or transfer to a secure multi-sig wallet

2. **Access Control:**
   - Migration function should be public (users call it)
   - No admin functions needed (tokens are locked, not minted)

3. **Reentrancy Protection:**
   - Use OpenZeppelin's `ReentrancyGuard`
   - Follow checks-effects-interactions pattern

### EPS Token Distribution Security

1. **Admin Wallet:**
   - Use a secure wallet (hardware wallet recommended)
   - Keep sufficient EPS tokens for distribution
   - Monitor balance regularly

2. **Verification:**
   - Verify each transaction on BaseScan
   - Double-check wallet addresses before sending
   - Keep records of all distributions

---

## Testing Checklist

### Before Launch

- [ ] CIFI V1 token deployed and verified on XDC
- [ ] Migration contract deployed and verified on XDC
- [ ] Migration contract can receive CIFI V1 tokens
- [ ] EPS token deployed and verified on BASE
- [ ] Admin wallet has EPS tokens on BASE
- [ ] XDC Network configured in database
- [ ] BASE Network configured in database
- [ ] Contracts added to database via Admin Dashboard
- [ ] Test migration with small amount
- [ ] Verify tokens are locked on XDC
- [ ] Test admin distribution on BASE
- [ ] Verify EPS tokens received on BASE

---

## Summary

**Contracts Needed:**
1. **CIFI V1 Token** (XDC) - Old token users migrate from
2. **Migration Contract** (XDC) - Locks CIFI tokens
3. **EPS Token** (BASE) - New token users receive

**Process:**
1. User locks CIFI on XDC → Migration contract
2. Admin sends EPS on BASE → User's wallet address
3. Database tracks everything → Audit trail

**Key Points:**
- Migration is **one-way** (CIFI locked permanently)
- Distribution is **manual** (admin sends EPS tokens)
- Same wallet address on both chains
- 1:1 ratio (1000 CIFI = 1000 EPS)

