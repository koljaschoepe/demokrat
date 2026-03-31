'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchInput } from '@/components/search/search-input';
import { SearchResults } from '@/components/search/search-results';
import { SearchFilters } from '@/components/search/search-filters';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [source, setSource] = useState('all');
  const [sort, setSort] = useState('relevance');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search query (300ms)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSourceChange = useCallback((newSource: string) => {
    setSource(newSource);
  }, []);

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <SearchInput value={query} onChange={setQuery} />
      <SearchFilters
        source={source}
        sort={sort}
        onSourceChange={handleSourceChange}
        onSortChange={handleSortChange}
        className="mt-4"
      />
      <SearchResults
        query={debouncedQuery}
        source={source}
        sort={sort}
      />
    </div>
  );
}
