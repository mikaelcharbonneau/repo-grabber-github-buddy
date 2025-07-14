import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeSubscription {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback: (payload: any) => void;
}

export const useRealtime = (subscriptions: RealtimeSubscription[]) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create a unique channel name based on subscriptions
    const channelName = `realtime-${subscriptions.map(s => `${s.table}-${s.event}`).join('-')}`;
    
    const realtimeChannel = supabase.channel(channelName);

    // Subscribe to each table/event combination
    subscriptions.forEach(({ table, event, callback }) => {
      realtimeChannel.on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table
        },
        callback
      );
    });

    // Handle connection status
    realtimeChannel.subscribe((status) => {
      setIsConnected(status === 'SUBSCRIBED');
    });

    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  return { isConnected, channel };
};

export const useAuditsRealtime = (onUpdate?: (payload: any) => void) => {
  const subscriptions: RealtimeSubscription[] = [
    {
      table: 'audits',
      event: '*',
      callback: (payload) => {
        console.log('Audit realtime update:', payload);
        onUpdate?.(payload);
      }
    },
    {
      table: 'audit_issues',
      event: '*',
      callback: (payload) => {
        console.log('Audit issue realtime update:', payload);
        onUpdate?.(payload);
      }
    }
  ];

  return useRealtime(subscriptions);
};

export const useIncidentsRealtime = (onUpdate?: (payload: any) => void) => {
  const subscriptions: RealtimeSubscription[] = [
    {
      table: 'incidents',
      event: '*',
      callback: (payload) => {
        console.log('Incident realtime update:', payload);
        onUpdate?.(payload);
      }
    }
  ];

  return useRealtime(subscriptions);
};

export const useNotificationsRealtime = (userId: string, onUpdate?: (payload: any) => void) => {
  const subscriptions: RealtimeSubscription[] = [
    {
      table: 'notifications',
      event: 'INSERT',
      callback: (payload) => {
        // Only handle notifications for the current user
        if (payload.new?.user_id === userId) {
          console.log('New notification for user:', payload);
          onUpdate?.(payload);
        }
      }
    },
    {
      table: 'notifications',
      event: 'UPDATE',
      callback: (payload) => {
        // Only handle notifications for the current user
        if (payload.new?.user_id === userId) {
          console.log('Notification updated for user:', payload);
          onUpdate?.(payload);
        }
      }
    }
  ];

  return useRealtime(subscriptions);
};

export const useReportsRealtime = (onUpdate?: (payload: any) => void) => {
  const subscriptions: RealtimeSubscription[] = [
    {
      table: 'reports',
      event: '*',
      callback: (payload) => {
        console.log('Report realtime update:', payload);
        onUpdate?.(payload);
      }
    }
  ];

  return useRealtime(subscriptions);
};