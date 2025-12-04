/**
 * Appwrite Database Setup Script
 * 
 * This script automatically creates all required collections, attributes, and permissions
 * for the Migration Portal in Appwrite.
 * 
 * Usage:
 *   1. Install dependencies: npm install dotenv
 *   2. Create .env file with:
 *      VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
 *      VITE_APPWRITE_PROJECT_ID=your-project-id
 *      VITE_APPWRITE_API_KEY=your-api-key
 *      VITE_APPWRITE_DATABASE_ID=your-database-id
 *   3. Run: npm run setup-appwrite
 * 
 * Note: Script supports both VITE_ prefixed (for Vite) and non-prefixed (for Node.js) variables
 */

// Use node-appwrite for server-side operations (has setKey method)
import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
// Support both VITE_ prefixed (for consistency) and non-prefixed (for Node.js scripts)
const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.VITE_APPWRITE_API_KEY || process.env.APPWRITE_API_KEY;
// Default to the database ID from client.ts, or use env variable
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID || '692f6911000d9019f069';

if (!PROJECT_ID || !API_KEY) {
  console.error('❌ Missing required environment variables!');
  console.error('Please set VITE_APPWRITE_PROJECT_ID and VITE_APPWRITE_API_KEY in .env file');
  console.error('(Or APPWRITE_PROJECT_ID and APPWRITE_API_KEY for Node.js scripts)');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// Collection schemas
const collections = {
  user_roles: {
    name: 'User Roles',
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'role', type: 'string', size: 50, required: true },
      { key: 'created_at', type: 'datetime', required: true },
    ],
    permissions: {
      read: [Role.users()],
      write: [Role.users()],
    }
  },
  profiles: {
    name: 'Profiles',
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'full_name', type: 'string', size: 255, required: false },
      { key: 'avatar_url', type: 'string', size: 500, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    permissions: {
      read: [Role.users()],
      write: [Role.users()],
    }
  },
  web3_networks: {
    name: 'Web3 Networks',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'chain_id', type: 'integer', required: true },
      { key: 'chain_id_hex', type: 'string', size: 20, required: false },
      { key: 'chainlist_id', type: 'integer', required: false },
      { key: 'rpc_url', type: 'string', size: 500, required: true },
      { key: 'rpc_urls', type: 'string', size: 2000, required: false, array: true },
      { key: 'explorer_url', type: 'string', size: 500, required: false },
      { key: 'block_explorer_name', type: 'string', size: 100, required: false },
      { key: 'native_currency_name', type: 'string', size: 50, required: false },
      { key: 'native_currency_symbol', type: 'string', size: 10, required: false },
      { key: 'native_currency_decimals', type: 'integer', required: false },
      { key: 'icon_url', type: 'string', size: 500, required: false },
      { key: 'faucets', type: 'string', size: 2000, required: false, array: true },
      { key: 'is_active', type: 'boolean', required: true, default: true },
      { key: 'is_testnet', type: 'boolean', required: false },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false },
    ],
    permissions: {
      read: [Role.any()], // Public read for networks
      write: [Role.users()],
    }
  },
  smart_contracts: {
    name: 'Smart Contracts',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'address', type: 'string', size: 100, required: true },
      { key: 'network_id', type: 'string', size: 255, required: true },
      { key: 'abi', type: 'string', size: 10000, required: false },
      { key: 'is_active', type: 'boolean', required: true, default: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      // Note: created_at and updated_at are handled automatically by Appwrite ($createdAt, $updatedAt)
    ],
    permissions: {
      read: [Role.any()], // Public read for contracts
      write: [Role.users()],
    }
  },
  migration_acknowledgements: {
    name: 'Migration Acknowledgements',
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: false },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'wallet_address', type: 'string', size: 100, required: true },
      { key: 'acknowledgement_hash', type: 'string', size: 255, required: true },
      { key: 'ip_address', type: 'string', size: 50, required: false },
      { key: 'user_agent', type: 'string', size: 500, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    permissions: {
      read: [Role.users()],
      write: [Role.users()],
    }
  },
  migration_events: {
    name: 'Migration Events',
    attributes: [
      { key: 'acknowledgement_id', type: 'string', size: 255, required: true },
      { key: 'wallet_address', type: 'string', size: 100, required: true },
      { key: 'token_type', type: 'string', size: 10, required: true },
      { key: 'amount', type: 'string', size: 100, required: true },
      { key: 'old_contract_address', type: 'string', size: 100, required: true },
      { key: 'new_contract_address', type: 'string', size: 100, required: true },
      { key: 'transaction_hash', type: 'string', size: 100, required: false },
      { key: 'block_number', type: 'integer', required: false },
      { key: 'gas_used', type: 'string', size: 50, required: false },
      { key: 'gas_price', type: 'string', size: 50, required: false },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'base_distribution_tx_hash', type: 'string', size: 100, required: false },
      { key: 'base_distribution_status', type: 'string', size: 20, required: false },
      { key: 'base_distribution_sent_at', type: 'datetime', required: false },
      { key: 'base_v2_token_address', type: 'string', size: 100, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    permissions: {
      read: [Role.users()],
      write: [Role.users()],
    }
  },
  incubator_applications: {
    name: 'Incubator Applications',
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: false },
      { key: 'project_name', type: 'string', size: 255, required: true },
      { key: 'project_description', type: 'string', size: 5000, required: true },
      { key: 'team_members', type: 'string', size: 2000, required: false },
      { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    permissions: {
      read: [Role.users()],
      write: [Role.users()],
    }
  },
  feature_requests: {
    name: 'Feature Requests',
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: false },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 5000, required: true },
      { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    permissions: {
      read: [Role.users()],
      write: [Role.users()],
    }
  },
  support_messages: {
    name: 'Support Messages',
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: false },
      { key: 'subject', type: 'string', size: 255, required: true },
      { key: 'message', type: 'string', size: 5000, required: true },
      { key: 'status', type: 'string', size: 50, required: true, default: 'open' },
      { key: 'admin_response', type: 'string', size: 5000, required: false },
      { key: 'user_read', type: 'boolean', required: false, default: false },
      { key: 'created_at', type: 'datetime', required: false },
      { key: 'updated_at', type: 'datetime', required: false },
    ],
    permissions: {
      read: [Role.users()],
      write: [Role.users()],
    }
  },
};

// Helper function to create attribute
async function createAttribute(collectionId, attr) {
  try {
    switch (attr.type) {
      case 'string':
        // Use object-based parameters - Appwrite doesn't support default values for strings
        await databases.createStringAttribute({
          databaseId: DATABASE_ID,
          collectionId: collectionId,
          key: attr.key,
          size: attr.size,
          required: attr.required || false,
          array: attr.array || false,
          // Don't pass default for string attributes
        });
        break;
      case 'integer':
        // Only pass default for integer if it's a number
        const intParams = {
          databaseId: DATABASE_ID,
          collectionId: collectionId,
          key: attr.key,
          required: attr.required || false,
          array: attr.array || false,
        };
        if (typeof attr.default === 'number') {
          intParams.default = attr.default;
        }
        await databases.createIntegerAttribute(intParams);
        break;
      case 'boolean':
        // Only pass default for boolean if it's a boolean
        const boolParams = {
          databaseId: DATABASE_ID,
          collectionId: collectionId,
          key: attr.key,
          required: attr.required || false,
          array: attr.array || false,
        };
        if (typeof attr.default === 'boolean') {
          boolParams.default = attr.default;
        }
        await databases.createBooleanAttribute(boolParams);
        break;
      case 'datetime':
        // Appwrite doesn't support default values for datetime attributes
        await databases.createDatetimeAttribute({
          databaseId: DATABASE_ID,
          collectionId: collectionId,
          key: attr.key,
          required: attr.required || false,
          array: attr.array || false,
          // Don't pass default for datetime attributes
        });
        break;
      default:
        console.warn(`⚠️  Unknown attribute type: ${attr.type} for ${attr.key}`);
    }
    console.log(`   ✅ Created attribute: ${attr.key} (${attr.type})`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`   ⏭️  Attribute ${attr.key} already exists, skipping...`);
    } else if (error.code === 400 && error.type === 'attribute_limit_exceeded') {
      console.warn(`   ⚠️  Attribute limit reached for collection. Skipping remaining attributes.`);
      console.warn(`   💡 Tip: Some attributes may already exist. Check Appwrite dashboard.`);
      // Don't throw - continue with other collections
      return;
    } else {
      throw error;
    }
  }
}

// Helper function to wait for attributes to be ready
async function waitForAttributes(collectionId, count) {
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    try {
      const collection = await databases.getCollection(DATABASE_ID, collectionId);
      if (collection.attributes && collection.attributes.length >= count) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
  }
  return false;
}

// Main setup function
async function setupCollections() {
  console.log('🚀 Starting Appwrite Database Setup...\n');
  console.log(`📦 Database ID: ${DATABASE_ID}`);
  console.log(`🔗 Endpoint: ${ENDPOINT}`);
  console.log(`🆔 Project ID: ${PROJECT_ID}\n`);

  // Verify database exists
  try {
    await databases.get(DATABASE_ID);
    console.log('✅ Database found\n');
  } catch (error) {
    console.error('❌ Database not found!');
    console.error('Please create the database first in Appwrite dashboard.');
    console.error(`Expected Database ID: ${DATABASE_ID}`);
    process.exit(1);
  }

  // Create collections
  for (const [collectionId, config] of Object.entries(collections)) {
    console.log(`\n📋 Setting up collection: ${collectionId}`);
    
    try {
      // Create collection
      try {
        await databases.createCollection(
          DATABASE_ID,
          collectionId,
          config.name,
          [
            ...config.permissions.read.map(p => Permission.read(p)),
            ...config.permissions.write.map(p => Permission.write(p)),
          ]
        );
        console.log(`   ✅ Created collection: ${collectionId}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`   ⏭️  Collection ${collectionId} already exists, skipping creation...`);
        } else {
          throw error;
        }
      }

      // Wait a bit for collection to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get existing attributes first
      let existingAttributes = [];
      try {
        const collection = await databases.getCollection(DATABASE_ID, collectionId);
        existingAttributes = (collection.attributes || []).map((a) => a.key);
        console.log(`   📋 Found ${existingAttributes.length} existing attributes: ${existingAttributes.join(', ')}`);
      } catch (error) {
        console.warn(`   ⚠️  Could not fetch existing attributes: ${error.message}`);
      }

      // Create only missing attributes
      const missingAttributes = config.attributes.filter(attr => !existingAttributes.includes(attr.key));
      console.log(`   📝 Creating ${missingAttributes.length} missing attributes (${config.attributes.length - missingAttributes.length} already exist)...`);
      
      let createdCount = 0;
      for (const attr of missingAttributes) {
        try {
          await createAttribute(collectionId, attr);
          createdCount++;
          // Small delay between attributes
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          // If we hit attribute limit, stop trying to create more
          if (error.code === 400 && error.type === 'attribute_limit_exceeded') {
            console.warn(`   ⚠️  Attribute limit reached. Stopping attribute creation for this collection.`);
            break;
          }
          // Re-throw other errors
          throw error;
        }
      }

      // Wait for all attributes to be ready (only if we created some)
      if (createdCount > 0) {
        console.log(`   ⏳ Waiting for attributes to be ready...`);
        await waitForAttributes(collectionId, existingAttributes.length + createdCount);
      }

      // Update permissions
      try {
        await databases.updateCollection(
          DATABASE_ID,
          collectionId,
          config.name,
          [
            ...config.permissions.read.map(p => Permission.read(p)),
            ...config.permissions.write.map(p => Permission.write(p)),
          ]
        );
        console.log(`   ✅ Updated permissions`);
      } catch (error) {
        console.warn(`   ⚠️  Could not update permissions: ${error.message}`);
      }

    } catch (error) {
      console.error(`   ❌ Error setting up ${collectionId}:`, error.message);
      if (error.code !== 409) {
        throw error;
      }
    }
  }

  console.log('\n✅ Setup complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Verify collections in Appwrite dashboard');
  console.log('   2. Add your admin role in user_roles collection');
  console.log('   3. Add networks and contracts via admin dashboard');
}

// Run setup
setupCollections().catch(error => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
