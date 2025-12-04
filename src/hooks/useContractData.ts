import { useState, useEffect } from 'react';
import { db, COLLECTIONS } from '@/integrations/db';

interface TokenContract {
  id: string;
  name: string;
  address: string;
}

interface MigrationContracts {
  cifiV2: TokenContract | null;
  cifiMigration: TokenContract | null;
}

// Hardcoded fallback addresses (used only when database lookup fails)
const FALLBACK_ADDRESSES = {
  cifiV2: '0x1932192f2D3145083a37ebBf1065f457621F0647', // CIFI V2 token address
  cifiMigration: '0xda95cC3368452958666643Dc6ebB6b15aebF497e',
};

// Name variations for flexible contract identification
const CONTRACT_NAME_PATTERNS = {
  cifiV2: ['cifi v2', 'cifi_v2', 'cifi-v2', 'cifi token v2', 'cifitoken v2', 'cifi v2 token'],
  cifiMigration: ['cifi migration', 'cifi_migration', 'cifi-migration', 'cifi migrator'],
};

export const useContractData = () => {
  const [contracts, setContracts] = useState<MigrationContracts>({
    cifiV2: null,
    cifiMigration: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const findContractByName = (allContracts: TokenContract[], contractType: keyof typeof CONTRACT_NAME_PATTERNS): TokenContract | null => {
    const patterns = CONTRACT_NAME_PATTERNS[contractType];
    
    for (const pattern of patterns) {
      const found = allContracts.find(contract => 
        contract.name.toLowerCase().includes(pattern.toLowerCase())
      );
      if (found) {
        console.log(`✅ Found ${contractType} by name pattern "${pattern}":`, found);
        return found;
      }
    }
    
    console.log(`❌ No contract found for ${contractType} by name patterns`);
    return null;
  };

  const findContractByAddress = (allContracts: TokenContract[], address: string): TokenContract | null => {
    const found = allContracts.find(contract => 
      contract.address.toLowerCase() === address.toLowerCase()
    );
    if (found) {
      console.log(`✅ Found contract by address ${address}:`, found);
      return found;
    }
    console.log(`❌ No contract found for address ${address}`);
    return null;
  };

  const createFallbackContract = (contractType: keyof typeof FALLBACK_ADDRESSES): TokenContract => {
    const address = FALLBACK_ADDRESSES[contractType];
    const fallbackContract = {
      id: `fallback-${contractType}`,
      name: `${contractType.toUpperCase()} (Fallback)`,
      address,
    };
    console.log(`🔄 Using fallback for ${contractType}:`, fallbackContract);
    return fallbackContract;
  };

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Fetching ALL active smart contracts from database...');
        
        // Fetch ALL active smart contracts (no hardcoded filtering)
        const { data, error } = await db
          .from(COLLECTIONS.SMART_CONTRACTS)
          .select('id, name, address')
          .eq('is_active', true)
          .execute();

        if (error) throw error;

        console.log(`📦 Fetched ${data?.length || 0} active contracts from database:`, data);

        const allContracts = (data || []).map((c: { $id?: string; id?: string; name: string; address: string }) => ({
          id: c.$id || c.id,
          name: c.name,
          address: c.address
        }));
        const contractMap: MigrationContracts = {
          cifiV2: null,
          cifiMigration: null,
        };

        // Try to identify each contract using multiple methods
        const contractTypes = Object.keys(contractMap) as Array<keyof MigrationContracts>;
        
        for (const contractType of contractTypes) {
          console.log(`\n🔍 Identifying ${contractType}...`);
          
          // Method 1: Name-based identification
          let contract = findContractByName(allContracts, contractType);
          
          // Method 2: Address-based identification (fallback)
          if (!contract) {
            console.log(`🔄 Trying address-based lookup for ${contractType}...`);
            contract = findContractByAddress(allContracts, FALLBACK_ADDRESSES[contractType]);
          }
          
          // Method 3: Create fallback contract (final fallback)
          if (!contract) {
            console.log(`🔄 No contract found in database for ${contractType}, using fallback...`);
            contract = createFallbackContract(contractType);
          }
          
          contractMap[contractType] = contract;
        }

        console.log('\n📋 Final contract mapping:', contractMap);
        console.log('\n✅ Contract identification complete');
        
        setContracts(contractMap);
      } catch (error) {
        console.error('❌ Error fetching contracts:', error);
        
        // If database fetch fails completely, use all fallback contracts
        console.log('🔄 Database fetch failed, using all fallback contracts...');
        const fallbackContracts: MigrationContracts = {
          cifiV2: createFallbackContract('cifiV2'),
          cifiMigration: createFallbackContract('cifiMigration'),
        };
        
        setContracts(fallbackContracts);
        setError('Failed to fetch contracts from database, using fallback addresses');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  return {
    contracts,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Re-trigger the useEffect
      setContracts({
        cifiV2: null,
        cifiMigration: null,
      });
    }
  };
};

export type { TokenContract, MigrationContracts };