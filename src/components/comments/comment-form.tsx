'use client';

import { useState, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Minus, Plus, X, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CommentFormProps {
  topicId: string;
  parentId?: string;
  replyToAuthor?: string;
  editMode?: {
    commentId: string;
    initialContent: string;
    initialPosition: 'pro' | 'contra' | 'neutral';
  };
  onSubmit?: (data: { content: string; position: string; sources: string[] }) => void;
  onCancel?: () => void;
  className?: string;
}

const MAX_CHARS = 2000;
const MAX_SOURCES = 5;

const positionOptions = [
  { value: 'pro' as const, label: 'Dafür', Icon: ThumbsUp, activeClass: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-400 dark:border-green-700' },
  { value: 'contra' as const, label: 'Dagegen', Icon: ThumbsDown, activeClass: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-400 dark:border-red-700' },
  { value: 'neutral' as const, label: 'Neutral', Icon: Minus, activeClass: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600' },
] as const;

export function CommentForm({
  topicId,
  parentId,
  replyToAuthor,
  editMode,
  onSubmit,
  onCancel,
  className,
}: CommentFormProps) {
  const [position, setPosition] = useState<'pro' | 'contra' | 'neutral' | null>(
    editMode?.initialPosition ?? null,
  );
  const [content, setContent] = useState(editMode?.initialContent ?? '');
  const [sources, setSources] = useState<string[]>([]);
  const [showSources, setShowSources] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const charCount = content.length;
  const canSubmit = position !== null && content.trim().length > 0 && !isSubmitting;

  function handleSubmit() {
    if (!canSubmit || !position) return;
    setIsSubmitting(true);
    const validSources = sources.filter((s) => s.trim().length > 0);
    onSubmit?.({ content: content.trim(), position, sources: validSources });
    if (!editMode) {
      setContent('');
      setPosition(null);
      setSources([]);
      setShowSources(false);
    }
    setIsSubmitting(false);
  }

  function addSource() {
    if (sources.length < MAX_SOURCES) {
      setSources((prev) => [...prev, '']);
    }
  }

  function updateSource(index: number, value: string) {
    setSources((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function removeSource(index: number) {
    setSources((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className={cn('flex flex-col gap-3 rounded-lg border bg-card p-4', className)}>
      {/* Reply header */}
      {replyToAuthor && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Antwort auf <span className="font-medium text-foreground">{replyToAuthor}</span>
          </span>
          <Button variant="ghost" size="icon-sm" onClick={onCancel} aria-label="Abbrechen">
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* Position selector */}
      <div className="flex gap-2" role="radiogroup" aria-label="Position wählen">
        {positionOptions.map(({ value, label, Icon, activeClass }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={position === value}
            onClick={() => setPosition(value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              position === value
                ? activeClass
                : 'border-border text-muted-foreground hover:bg-muted',
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
          placeholder={parentId ? 'Deine Antwort...' : 'Dein Kommentar...'}
          rows={4}
          className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          aria-label="Kommentartext"
        />
        <span
          className={cn(
            'absolute bottom-2 right-3 text-xs tabular-nums',
            charCount > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-muted-foreground',
          )}
        >
          {charCount} / {MAX_CHARS}
        </span>
      </div>

      {/* Sources */}
      {showSources && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Quellen</span>
          {sources.map((source, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <LinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                type="url"
                value={source}
                onChange={(e) => updateSource(idx, e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeSource(idx)}
                aria-label="Quelle entfernen"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
          {sources.length < MAX_SOURCES && (
            <Button variant="ghost" size="sm" onClick={addSource} className="w-fit text-xs">
              <Plus className="size-3" />
              Quelle hinzufügen
            </Button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {!showSources && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSources(true)}
              className="text-xs text-muted-foreground"
            >
              <LinkIcon className="size-3.5" />
              Quellen hinzufügen
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {onCancel && !replyToAuthor && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Abbrechen
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? 'Wird gesendet...' : editMode ? 'Bearbeiten' : 'Kommentieren'}
          </Button>
        </div>
      </div>
    </div>
  );
}
