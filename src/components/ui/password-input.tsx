'use client';

import * as React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'type'> {
  dark?: boolean;
}

function PasswordInput({ dark = false, className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className={cn(
          'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
          dark
            ? 'text-white/40 hover:text-white/70'
            : 'text-slate-400 hover:text-slate-600',
        )}
        tabIndex={-1}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
