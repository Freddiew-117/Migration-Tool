import { useQuery } from '@tanstack/react-query';
import { db, COLLECTIONS } from '@/integrations/db';
import { useWeb3 } from '@/contexts/Web3Context';

export const useMigrationHistory = () => {
  const { account } = useWeb3();

  return useQuery({
    queryKey: ['migration-history', account],
    queryFn: async () => {
      if (!account) return [];

      const { data, error } = await db
        .from(COLLECTIONS.MIGRATION_EVENTS)
        .select('*')
        .eq('wallet_address', account)
        .order('created_at', 'desc')
        .execute();
      
      // Fetch acknowledgements separately
      if (data && data.length > 0) {
        const ackIds = data.map((d: any) => d.acknowledgement_id).filter(Boolean);
        if (ackIds.length > 0) {
          const { data: acks } = await db
            .from(COLLECTIONS.MIGRATION_ACKNOWLEDGEMENTS)
            .select('$id, email, created_at')
            .in('$id', ackIds)
            .execute();
          
          const acksMap = new Map(acks?.map((a: any) => [a.$id, a]) || []);
          return data.map((event: any) => ({
            ...event,
            migration_acknowledgements: acksMap.get(event.acknowledgement_id) || null
          }));
        }
      }

      if (error) throw error;
      return data || [];
    },
    enabled: !!account,
  });
};