# Migration Contracts

## CIFIMigration.sol

The main migration contract for locking CIFI V1 tokens on XDC Network.

### Features

- ✅ **Secure Token Locking**: Uses OpenZeppelin's SafeERC20 for secure token transfers
- ✅ **Reentrancy Protection**: Protected against reentrancy attacks
- ✅ **No Daily Limits**: Users can migrate any amount (as per requirements)
- ✅ **Event Tracking**: Emits events for off-chain tracking
- ✅ **Whitelist Support**: Optional whitelist functionality for special users
- ✅ **Owner Controls**: Owner can manage whitelist and withdraw tokens (emergency)

### Deployment

1. **Install Dependencies:**
   ```bash
   npm install @openzeppelin/contracts
   ```

2. **Compile:**
   ```bash
   npx hardhat compile
   # or
   npx solc --version
   ```

3. **Deploy on XDC Network:**
   ```javascript
   // Deploy script example
   const CIFIMigration = await ethers.getContractFactory("CIFIMigration");
   const cifiV1Address = "0x..."; // Your CIFI V1 token address
   const migration = await CIFIMigration.deploy(cifiV1Address);
   await migration.waitForDeployment();
   console.log("Migration Contract:", await migration.getAddress());
   ```

### Constructor Parameters

- `_cifiV1`: Address of the CIFI V1 token contract

### Key Functions

#### For Users

- `migrate(uint256 amount)` - Lock CIFI V1 tokens
- `canMigrate(address user, uint256 amount)` - Check if migration is possible

#### For Queries

- `getUserStats(address user)` - Get user's migration stats
- `getGlobalStats()` - Get global migration statistics
- `getUserRemainingDailyCapacity(address user)` - Get remaining capacity (always max)
- `getRemainingGlobalCapacity()` - Get global remaining capacity (always max)
- `totalMigratedAmount()` - Get total migrated amount
- `migrationEnabled()` - Check if migration is enabled (always true)
- `isWhitelisted(address user)` - Check whitelist status
- `getLockedBalance()` - Get contract's locked token balance

#### For Owner

- `setWhitelist(address user, bool status)` - Add/remove from whitelist
- `batchSetWhitelist(address[] users, bool status)` - Batch update whitelist
- `withdrawTokens(address to, uint256 amount)` - Emergency token withdrawal

### Events

- `Migration(address indexed user, uint256 amount, uint256 timestamp, uint256 blockNumber)` - Emitted when user migrates
- `WhitelistUpdated(address indexed user, bool status)` - Emitted when whitelist is updated
- `TokensWithdrawn(address indexed to, uint256 amount)` - Emitted when owner withdraws tokens

### Security Features

1. **ReentrancyGuard**: Prevents reentrancy attacks
2. **SafeERC20**: Safe token transfers with proper error handling
3. **Ownable**: Access control for admin functions
4. **Input Validation**: All inputs are validated
5. **Zero Address Checks**: Prevents sending to zero address

### Usage Example

```solidity
// 1. User approves tokens
cifiV1.approve(migrationContractAddress, 1000 * 10**18);

// 2. User migrates
migration.migrate(1000 * 10**18);

// 3. Check stats
(uint256 total, , , bool whitelisted) = migration.getUserStats(userAddress);
```

### Integration with Frontend

The contract matches the ABI expected by the frontend:

```typescript
// Expected ABI functions (from useMigrationContract.ts)
- migrate(uint256 amount)
- canMigrate(address user, uint256 amount)
- getUserStats(address user) → (uint256, uint256, uint256, bool)
- getGlobalStats() → (uint256, uint256, uint256, uint256)
- getUserRemainingDailyCapacity(address user) → uint256
- getRemainingGlobalCapacity() → uint256
- totalMigrated() → uint256
- migrationEnabled() → bool
- whitelist(address user) → bool
```

### Testing Checklist

- [ ] Contract compiles without errors
- [ ] Deploy on XDC testnet first
- [ ] Test `migrate()` with small amount
- [ ] Verify tokens are locked in contract
- [ ] Test `getUserStats()` returns correct values
- [ ] Test `getGlobalStats()` returns correct values
- [ ] Test whitelist functions
- [ ] Test owner withdrawal (emergency)
- [ ] Verify events are emitted correctly
- [ ] Deploy on XDC mainnet
- [ ] Verify contract on XDC Explorer
- [ ] Add contract address to Admin Dashboard

### Notes

- **No Daily Limits**: As per requirements, there are no daily migration limits
- **Token Locking**: Tokens are permanently locked in the contract (not burned)
- **Owner Withdrawal**: Owner can withdraw tokens for emergency situations (use with caution)
- **Whitelist**: Optional feature for special users (not required for basic functionality)

