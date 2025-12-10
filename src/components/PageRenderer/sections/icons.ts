/**
 * Icon Mapping Helper
 *
 * Maps icon name strings to lucide-react icon components.
 * Used by section components that need to render icons from string identifiers.
 *
 * Usage:
 * ```tsx
 * const Icon = getIcon('star');
 * <Icon className="icon" />
 * ```
 */
import type { LucideIcon } from 'lucide-react';
import { Check, Globe, Heart, Settings, Shield, Star, Users, Zap } from 'lucide-react';

/**
 * Icon name to component mapping
 * Add new icons here as needed
 */
export const iconMap: Record<string, LucideIcon> = {
  check: Check,
  globe: Globe,
  heart: Heart,
  settings: Settings,
  shield: Shield,
  star: Star,
  users: Users,
  zap: Zap,
};

/**
 * Get icon component by name
 * Falls back to Star icon if name not found
 *
 * @param name - Icon name (case-insensitive)
 * @returns Lucide icon component
 */
export const getIcon = (name: string): LucideIcon => {
  return iconMap[name.toLowerCase()] || Star;
};
