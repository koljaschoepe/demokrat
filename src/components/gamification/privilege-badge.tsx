import {
  Eye,
  Hand,
  Wrench,
  Shield,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Tier = 0 | 1 | 2 | 3 | 4;

interface PrivilegeBadgeProps {
  tier: Tier;
  size?: 'sm' | 'md' | 'lg';
}

const TIER_CONFIG: Record<
  Tier,
  {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: 'default' | 'secondary' | 'outline';
    className: string;
  }
> = {
  0: {
    name: 'Beobachter',
    icon: Eye,
    variant: 'outline',
    className: 'border-muted-foreground/30 text-muted-foreground',
  },
  1: {
    name: 'Teilnehmer',
    icon: Hand,
    variant: 'secondary',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  2: {
    name: 'Mitwirkender',
    icon: Wrench,
    variant: 'secondary',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  3: {
    name: 'Moderator',
    icon: Shield,
    variant: 'secondary',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  4: {
    name: 'Vertrauensperson',
    icon: Crown,
    variant: 'secondary',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
};

const SIZE_CLASSES = {
  sm: 'h-5 text-[10px]',
  md: 'h-6 text-xs',
  lg: 'h-7 text-sm px-3',
} as const;

const ICON_SIZE = {
  sm: 'size-3',
  md: 'size-3.5',
  lg: 'size-4',
} as const;

export function PrivilegeBadge({ tier, size = 'md' }: PrivilegeBadgeProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, SIZE_CLASSES[size])}
    >
      <Icon className={ICON_SIZE[size]} />
      {config.name}
    </Badge>
  );
}
