import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface APIResponse<T = any> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface APIError {
  error: string;
  message: string;
}

export const useAPIClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const makeAPICall = async <T = any>(
    resource: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    id?: string,
    data?: any
  ): Promise<T> => {
    setIsLoading(true);
    
    try {
      let endpoint = `api-gateway/v1/${resource}`;
      if (id) {
        endpoint += `/${id}`;
      }

      const { data: result, error } = await supabase.functions.invoke(endpoint, {
        body: data ? { ...data } : undefined,
        method
      });

      if (error) {
        throw new Error(error.message || 'API call failed');
      }

      const response = result as APIResponse<T> | APIError;
      
      if ('error' in response) {
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`API call failed [${method} ${resource}]:`, error);
      
      toast({
        title: "API Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Convenience methods for common operations
  const get = <T = any>(resource: string, id?: string) => 
    makeAPICall<T>(resource, 'GET', id);

  const create = <T = any>(resource: string, data: any) => 
    makeAPICall<T>(resource, 'POST', undefined, data);

  const update = <T = any>(resource: string, id: string, data: any) => 
    makeAPICall<T>(resource, 'PUT', id, data);

  const remove = (resource: string, id: string) => 
    makeAPICall(resource, 'DELETE', id);

  // Resource-specific methods
  const datacenters = {
    list: () => get('datacenters'),
    get: (id: string) => get('datacenters', id),
    create: (data: any) => create('datacenters', data),
    update: (id: string, data: any) => update('datacenters', id, data),
    delete: (id: string) => remove('datacenters', id),
  };

  const audits = {
    list: () => get('audits'),
    get: (id: string) => get('audits', id),
    create: (data: any) => create('audits', data),
    update: (id: string, data: any) => update('audits', id, data),
    delete: (id: string) => remove('audits', id),
  };

  const incidents = {
    list: () => get('incidents'),
    get: (id: string) => get('incidents', id),
    create: (data: any) => create('incidents', data),
    update: (id: string, data: any) => update('incidents', id, data),
    delete: (id: string) => remove('incidents', id),
  };

  const dataHalls = {
    list: () => get('data_halls'),
    get: (id: string) => get('data_halls', id),
    create: (data: any) => create('data_halls', data),
    update: (id: string, data: any) => update('data_halls', id, data),
    delete: (id: string) => remove('data_halls', id),
  };

  const cabinets = {
    list: () => get('cabinets'),
    get: (id: string) => get('cabinets', id),
    create: (data: any) => create('cabinets', data),
    update: (id: string, data: any) => update('cabinets', id, data),
    delete: (id: string) => remove('cabinets', id),
  };

  return {
    isLoading,
    makeAPICall,
    get,
    create,
    update,
    remove,
    datacenters,
    audits,
    incidents,
    dataHalls,
    cabinets,
  };
};