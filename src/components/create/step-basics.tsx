'use client';

import { useCallback, useState, type KeyboardEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreateTopicInput } from '@/lib/validators/topic';

const CATEGORIES = [
  'Gesundheit',
  'Wirtschaft',
  'Umwelt',
  'Bildung',
  'Digitalisierung',
  'Sicherheit',
  'Soziales',
  'Verkehr',
  'Kultur',
  'Außenpolitik',
] as const;

export function StepBasics() {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<CreateTopicInput>();

  const [tagInput, setTagInput] = useState('');
  const tags = watch('tags') || [];
  const description = watch('description') || '';
  const category = watch('category') || '';

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      if (tags.length >= 5) return;
      if (tags.includes(tag)) return;
      setValue('tags', [...tags, tag], { shouldValidate: true });
      setTagInput('');
    },
    [tags, setValue]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      setValue(
        'tags',
        tags.filter((t) => t !== tagToRemove),
        { shouldValidate: true }
      );
    },
    [tags, setValue]
  );

  const handleTagKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(tagInput);
      }
      // Remove last tag on backspace when input is empty
      if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
        const lastTag = tags[tags.length - 1];
        if (lastTag) removeTag(lastTag);
      }
    },
    [tagInput, tags, addTag, removeTag]
  );

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          placeholder="z.B. Tempolimit auf Autobahnen einführen"
          {...register('title')}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          placeholder="Beschreibe dein Thema ausführlich..."
          rows={6}
          {...register('description')}
          aria-invalid={!!errors.description}
        />
        <div className="flex items-center justify-between">
          {errors.description ? (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {description.length} / 5.000
          </span>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Kategorie</Label>
        <Select
          value={category}
          onValueChange={(val) =>
            setValue('category', val ?? '', { shouldValidate: true })
          }
        >
          <SelectTrigger className="w-full" aria-invalid={!!errors.category}>
            <SelectValue placeholder="Kategorie wählen" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label htmlFor="tag-input">
          Tags <span className="text-muted-foreground">(max. 5)</span>
        </Label>
        <Input
          id="tag-input"
          placeholder="Tag eingeben und Enter drücken"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={() => addTag(tagInput)}
          disabled={tags.length >= 5}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {errors.tags && (
          <p className="text-xs text-destructive">{errors.tags.message}</p>
        )}
      </div>
    </div>
  );
}
