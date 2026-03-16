import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type CompanyLogoSize = 'xs' | 'sm' | 'md' | 'lg';

interface CompanyLogoProps {
  name: string;
  logoUrl: string | null | undefined;
  size?: CompanyLogoSize;
  className?: string;
}

const SIZE_CONFIG = {
  xs: {
    container: 'h-5 w-5 rounded',
    fallbackPadding: 'p-0.5',
    imagePx: 20,
    fallbackIcon: 'h-2.5 w-2.5',
    fallbackText: 'text-[8px] font-bold',
    fallbackType: 'icon' as const,
  },
  sm: {
    container: 'h-10 w-10 sm:h-12 sm:w-12 rounded-lg',
    fallbackPadding: 'p-1.5',
    imagePx: 48,
    fallbackIcon: 'h-4 w-4 sm:h-5 sm:w-5',
    fallbackText: 'text-sm font-bold sm:text-base',
    fallbackType: 'initial' as const,
  },
  md: {
    container: 'h-12 w-12 rounded-lg',
    fallbackPadding: 'p-1.5',
    imagePx: 48,
    fallbackIcon: 'h-6 w-6',
    fallbackText: 'text-base font-bold',
    fallbackType: 'icon' as const,
  },
  lg: {
    container: 'h-20 w-20 rounded-xl',
    fallbackPadding: 'p-2',
    imagePx: 80,
    fallbackIcon: 'h-9 w-9',
    fallbackText: 'text-xl font-bold',
    fallbackType: 'icon' as const,
  },
} satisfies Record<CompanyLogoSize, {
  container: string;
  fallbackPadding: string;
  imagePx: number;
  fallbackIcon: string;
  fallbackText: string;
  fallbackType: 'icon' | 'initial';
}>;

export function CompanyLogo({
  name,
  logoUrl,
  size = 'sm',
  className,
}: CompanyLogoProps) {
  const config = SIZE_CONFIG[size];

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden border border-slate-100 bg-slate-50',
        config.container,
        !logoUrl && config.fallbackPadding,
        className,
      )}
      aria-hidden="true"
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          width={config.imagePx}
          height={config.imagePx}
          className="h-full w-full object-cover"
        />
      ) : config.fallbackType === 'icon' ? (
        <Building2 className={cn('text-slate-400', config.fallbackIcon)} />
      ) : (
        <span className={cn('text-slate-400', config.fallbackText)}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
