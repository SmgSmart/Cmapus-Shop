import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Custom hook for API calls with loading, error states
export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url, options);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Hook for paginated API calls
export function usePaginatedApi(baseUrl, initialParams = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextPage, setNextPage] = useState(1);

  const fetchPage = useCallback(async (page = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { 
        ...initialParams, 
        page,
        page_size: initialParams.page_size || 12 
      };
      
      const response = await api.get(baseUrl, { params });
      
      if (reset) {
        setData(response.data.results);
      } else {
        setData(prev => [...prev, ...response.data.results]);
      }
      
      setHasMore(!!response.data.next);
      setNextPage(page + 1);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, JSON.stringify(initialParams)]);

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPage(nextPage);
    }
  }, [fetchPage, nextPage, loading, hasMore]);

  const refresh = useCallback(() => {
    setNextPage(1);
    fetchPage(1, true);
  }, [fetchPage]);

  return { 
    data, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  };
}

// Hook for search functionality
export function useSearch(searchUrl, debounceMs = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(searchUrl, {
          params: { search: query }
        });
        setResults(response.data.results || response.data);
      } catch (err) {
        setError(err.response?.data || err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, searchUrl, debounceMs]);

  return { query, setQuery, results, loading, error };
}

// Hook for form submissions
export function useApiSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await apiCall();
      setSuccess(true);
      return result;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { submit, loading, error, success, reset };
}