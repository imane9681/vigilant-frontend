// hooks/useWidgetData.js
import { useState, useEffect, useCallback } from 'react'; 

export const useWidgetData = ({ 
  fetchFunction,
  initialState = null,
  autoFetch = true,
  cacheTime = 5 * 60 * 1000 // 5 دقائق
}) => {
  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cache, setCache] = useState({});

  const fetchData = useCallback(async (params = {}, forceRefresh = false) => {
    const cacheKey = JSON.stringify(params);
    
    // التحقق من وجود بيانات في الكاش
    if (!forceRefresh && cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < cacheTime) {
      setData(cache[cacheKey].data);
      setLastUpdated(cache[cacheKey].timestamp);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(params);
      
      // تخزين في الكاش
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: result,
          timestamp: Date.now()
        }
      }));
      
      setData(result);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, cache, cacheTime]);

  const refresh = useCallback((params = {}) => {
    return fetchData(params, true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
    clearCache,
    fetchData
  };
};