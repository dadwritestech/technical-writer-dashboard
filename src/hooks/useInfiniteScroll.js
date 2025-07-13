import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (fetchMore, { threshold = 100, limit = 20 } = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newData = await fetchMore(page, limit);
      
      if (newData.length < limit) {
        setHasMore(false);
      }
      
      setData(prev => page === 0 ? newData : [...prev, ...newData]);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err);
      console.error('Error loading more data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, page, limit, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(0);
    setHasMore(true);
    setError(null);
  }, []);

  // Auto-load first batch
  useEffect(() => {
    if (page === 0) {
      loadMore();
    }
  }, []);

  // Scroll event handler
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      loadMore();
    }
  }, [loadMore, threshold]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    handleScroll
  };
};