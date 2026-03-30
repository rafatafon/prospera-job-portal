'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { SKILL_CATEGORIES } from '@/lib/constants/skills';

interface SkillsAutocompleteProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  disabled?: boolean;
}

export function SkillsAutocomplete({
  skills,
  onSkillsChange,
  disabled = false,
}: SkillsAutocompleteProps) {
  const t = useTranslations('candidateProfile');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Track whether the popover close was triggered by clicking an item so we
  // don't race with the blur handler and accidentally re-close before the
  // onSelect callback fires.
  const selectingRef = useRef(false);

  // Build the filtered category list each render (fast — pure derivation).
  const filteredCategories = useMemo(() => {
    const lower = query.toLowerCase();
    return SKILL_CATEGORIES.map((cat) => ({
      key: cat.key,
      skills: (cat.skills as readonly string[]).filter(
        (skill) =>
          !skills.includes(skill) &&
          (lower === '' || skill.toLowerCase().includes(lower)),
      ),
    })).filter((cat) => cat.skills.length > 0);
  }, [query, skills]);

  const addSkill = useCallback(
    (skill: string) => {
      const trimmed = skill.trim();
      if (trimmed && !skills.includes(trimmed)) {
        onSkillsChange([...skills, trimmed]);
      }
      setQuery('');
      setOpen(false);
      inputRef.current?.focus();
    },
    [skills, onSkillsChange],
  );

  const removeSkill = useCallback(
    (skill: string) => {
      onSkillsChange(skills.filter((s) => s !== skill));
    },
    [skills, onSkillsChange],
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    // Open when there's text; keep open even on empty to show all suggestions
    // while focused (open is also set in handleFocus).
    if (!open && value.length > 0) setOpen(true);
  }

  function handleFocus() {
    setOpen(true);
  }

  function handleBlur() {
    // Give click/select events time to fire before closing.
    setTimeout(() => {
      if (!selectingRef.current) {
        setOpen(false);
      }
      selectingRef.current = false;
    }, 150);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      // If any cmdk item is highlighted, let cmdk handle the selection via
      // the CommandItem onSelect prop. We only add a custom skill when nothing
      // in the list matches exactly.
      const highlighted = document.querySelector<HTMLElement>(
        '[data-slot="command-item"][aria-selected="true"]',
      );
      if (!highlighted && query.trim()) {
        addSkill(query.trim());
      }
    }
  }

  // The CommandEmpty message uses the query — render it dynamically.
  const emptyMessage = query
    ? t('skillsNoResults', { query })
    : null;

  return (
    <div className="space-y-2">
      {/* Selected skill pills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                disabled={disabled}
                aria-label={`Remove ${skill}`}
                className="ml-0.5 rounded-full text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Autocomplete */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={t('skillsPlaceholder')}
            disabled={disabled}
            autoComplete="off"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ '--tw-ring-color': '#ff2c02' } as React.CSSProperties}
          />
        </PopoverAnchor>

        <PopoverContent
          className="p-0 w-[--radix-popover-anchor-width] max-h-[200px] overflow-hidden"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          // Prevent the popover from stealing focus from the input
          onInteractOutside={(e) => {
            // If the interaction is on our own input, don't close
            if (inputRef.current && inputRef.current.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
        >
          <Command
            // Pass the query so cmdk applies its own built-in filtering as a
            // fallback, though we do our own pre-filtering above.
            shouldFilter={false}
          >
            <CommandList className="max-h-[200px]">
              {filteredCategories.length === 0 ? (
                <CommandEmpty className="py-4 text-center text-sm text-slate-500">
                  {emptyMessage ?? t('skillsNoResults', { query: query || '…' })}
                </CommandEmpty>
              ) : (
                filteredCategories.map((cat) => (
                  <CommandGroup
                    key={cat.key}
                    heading={t(`skillCategories.${cat.key}` as Parameters<typeof t>[0])}
                  >
                    {cat.skills.map((skill) => (
                      <CommandItem
                        key={skill}
                        value={skill}
                        onMouseDown={() => {
                          // Mark that a selection is in progress so the blur
                          // handler doesn't close before onSelect fires.
                          selectingRef.current = true;
                        }}
                        onSelect={() => {
                          addSkill(skill);
                        }}
                        className="cursor-pointer"
                      >
                        {skill}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
