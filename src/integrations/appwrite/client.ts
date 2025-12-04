import { Client, Account, Databases, ID, Query } from 'appwrite';

// Get Appwrite configuration from environment variables
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';

// Database ID - update this to match your Appwrite database ID
export const DATABASE_ID = '692f6911000d9019f069';

// Debug logging (after DATABASE_ID is declared)
if (!APPWRITE_PROJECT_ID) {
  console.error('❌ VITE_APPWRITE_PROJECT_ID is not set in .env file!');
  console.error('Please add: VITE_APPWRITE_PROJECT_ID=your-project-id');
} else {
  console.log('✅ Appwrite Config:', {
    endpoint: APPWRITE_ENDPOINT,
    projectId: APPWRITE_PROJECT_ID.substring(0, 8) + '...', // Only show first 8 chars for security
    databaseId: DATABASE_ID,
  });
}

// Initialize Appwrite client (client-side - no API key needed for client operations)
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);

// Collection IDs - update these to match your Appwrite collection IDs
export const COLLECTIONS = {
  PROFILES: 'profiles',
  USER_ROLES: 'user_roles',
  WEB3_NETWORKS: 'web3_networks',
  SMART_CONTRACTS: 'smart_contracts',
  MIGRATION_ACKNOWLEDGEMENTS: 'migration_acknowledgements',
  MIGRATION_EVENTS: 'migration_events',
  INCUBATOR_APPLICATIONS: 'incubator_applications',
  SUPPORT_MESSAGES: 'support_messages',
  FEATURE_REQUESTS: 'feature_requests',
} as const;

// Export Query helper for convenience
export { Query, ID };

// Export client for advanced usage
export { client };

