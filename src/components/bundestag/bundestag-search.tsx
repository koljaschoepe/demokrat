'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BundestagSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function BundestagSearch({
  value,
  onChange,
  placeholder = 'Vorgänge durchsuchen...',
}: BundestagSearchProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced onChange handler (300ms)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChange(newValue);
      }, 300);
      // Sofort den Input-Wert setzen für responsive UX
      if (inputRef.current) {
        inputRef.current.value = newValue;
      }
    },
    [onChange],
  );

  // Timer aufräumen
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Input-Wert synchron halten wenn value von außen kommt
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleClear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (inputRef.current) inputRef.current.value = '';
    onChange('');
  }, [onChange]);

  return (
    <div className="relative flex items-center">
      <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-8 pr-8"
      />
      {value.length > 0 && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute right-1.5"
          onClick={handleClear}
        >
          <X className="size-3.5" />
          <span className="sr-only">Suche leeren</span>
        </Button>
      )}
    </div>
  );
}
