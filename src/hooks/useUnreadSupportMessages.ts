import { useState, useEffect } from 'react';
import { db, COLLECTIONS } from '@/integrations/db';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadSupportMessages = () => {
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkUnreadMessages = async () => {
    if (!user?.id) {
      setHasUnread(false);
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await db
        .from(COLLECTIONS.SUPPORT_MESSAGES)
        .select('$id')
        .eq('user_id', user.id)
        .neq('admin_response', null)
        .eq('user_read', false)
        .limit(1)
        .execute();

      if (error) {
        console.error('Error checking unread messages:', error);
        setHasUnread(false);
        return;
      }

      setHasUnread(data && data.length > 0);
    } catch (error) {
      console.error('Error checking unread messages:', error);
      setHasUnread(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUnreadMessages();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    // Poll for changes every 30 seconds (Appwrite doesn't have real-time subscriptions)
    const interval = setInterval(() => {
      checkUnreadMessages();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.id]);

  return { hasUnread, loading };
};