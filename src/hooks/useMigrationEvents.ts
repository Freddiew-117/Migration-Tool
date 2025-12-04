import { useState, useCallback } from 'react';
import { db, COLLECTIONS } from '@/integrations/db';
import { useToast } from '@/hooks/use-toast';

interface MigrationEventData {
  acknowledgementId: string;
  walletAddress: string;
  tokenType: 'CIFI';
  amount: string;
  oldContractAddress: string;
  newContractAddress: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
}

export const useMigrationEvents = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const recordMigrationEvent = useCallback(async (eventData: MigrationEventData) => {
    setIsLoading(true);
    
    try {
      const { error } = await db.insert(COLLECTIONS.MIGRATION_EVENTS, {
          acknowledgement_id: eventData.acknowledgementId,
          wallet_address: eventData.walletAddress,
          token_type: eventData.tokenType,
          amount: eventData.amount,
          old_contract_address: eventData.oldContractAddress,
          new_contract_address: eventData.newContractAddress,
          transaction_hash: eventData.transactionHash,
          block_number: eventData.blockNumber,
          gas_used: eventData.gasUsed,
          gas_price: eventData.gasPrice,
          status: eventData.transactionHash ? 'confirmed' : 'pending'
      });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error recording migration event:', error);
      toast({
        title: "Event Recording Failed",
        description: "Migration completed but event tracking failed. Please contact support.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateMigrationEventStatus = useCallback(async (
    transactionHash: string, 
    status: 'confirmed' | 'failed',
    additionalData?: {
      blockNumber?: number;
      gasUsed?: string;
      gasPrice?: string;
    }
  ) => {
    try {
      const updateData: any = { status };
      
      if (additionalData) {
        if (additionalData.blockNumber) updateData.block_number = additionalData.blockNumber;
        if (additionalData.gasUsed) updateData.gas_used = additionalData.gasUsed;
        if (additionalData.gasPrice) updateData.gas_price = additionalData.gasPrice;
      }

      // First find the document by transaction_hash
      const { data: docs } = await db
        .from(COLLECTIONS.MIGRATION_EVENTS)
        .select('$id')
        .eq('transaction_hash', transactionHash)
        .execute();
      
      if (docs && docs.length > 0) {
        const { error } = await db.update(COLLECTIONS.MIGRATION_EVENTS, docs[0].$id, updateData);
        if (error) throw error;
      }

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating migration event status:', error);
      return false;
    }
  }, []);

  const getUserMigrationEvents = useCallback(async (walletAddress: string) => {
    try {
      const { data, error } = await db
        .from(COLLECTIONS.MIGRATION_EVENTS)
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', 'desc')
        .execute();
      
      // Fetch acknowledgements separately and merge
      if (data && data.length > 0) {
        const ackIds = data.map((d: any) => d.acknowledgement_id).filter(Boolean);
        if (ackIds.length > 0) {
          const { data: acks } = await db
            .from(COLLECTIONS.MIGRATION_ACKNOWLEDGEMENTS)
            .select('$id, email, wallet_address')
            .in('$id', ackIds)
            .execute();
          
          // Merge acknowledgement data
          const acksMap = new Map(acks?.map((a: any) => [a.$id, a]) || []);
          return data.map((event: any) => ({
            ...event,
            migration_acknowledgements: acksMap.get(event.acknowledgement_id) || null
          }));
        }
      }

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching migration events:', error);
      return [];
    }
  }, []);

  return {
    recordMigrationEvent,
    updateMigrationEventStatus,
    getUserMigrationEvents,
    isLoading
  };
};