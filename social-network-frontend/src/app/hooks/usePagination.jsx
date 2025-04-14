"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function useInfiniteScroll(fetchFn, deps = []) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newData = await fetchFn(page);
      if (!newData || newData.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...newData]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Infinite scroll fetch error:", err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, isLoading, hasMore]);

  useEffect(() => {
    if (page === 0) loadMore(); 
  }, [loadMore, ...deps]);

  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadMore, hasMore, isLoading]
  );

  const reset = () => {
    setData([]);
    setPage(0);
    setHasMore(true);
  };

  return { data, lastElementRef, reset };
}
