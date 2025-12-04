-- Add TokenMigration smart contract to the database without created_by constraint
INSERT INTO smart_contracts (
  name, 
  address, 
  network_id,
  abi,
  is_active
) VALUES (
  'CIFI Token Migration',
  '0x1234567890abcdef1234567890abcdef12345678', -- Placeholder address - admin can update through admin interface
  (SELECT id FROM web3_networks WHERE chain_id = 50 LIMIT 1), -- XDC Network
  '[
    {
      "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
      "name": "getUserStats",
      "outputs": [
        {"internalType": "uint256", "name": "totalMigrated", "type": "uint256"},
        {"internalType": "uint256", "name": "dailyMigrated", "type": "uint256"},
        {"internalType": "uint256", "name": "dailyLimit", "type": "uint256"},
        {"internalType": "bool", "name": "isWhitelisted", "type": "bool"},
        {"internalType": "uint256", "name": "lastMigrationTime", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getGlobalStats",
      "outputs": [
        {"internalType": "uint256", "name": "totalMigrated", "type": "uint256"},
        {"internalType": "uint256", "name": "maxMigration", "type": "uint256"},
        {"internalType": "uint256", "name": "remainingCapacity", "type": "uint256"},
        {"internalType": "bool", "name": "migrationEnabled", "type": "bool"},
        {"internalType": "uint256", "name": "v2TokenBalance", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
      "name": "canMigrate",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
      "name": "migrate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]'::jsonb,
  true
);