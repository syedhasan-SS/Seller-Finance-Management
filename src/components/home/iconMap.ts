import {
  AlertTriangle,
  AlertCircle,
  Bell,
  BookOpen,
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
  Info,
  Lightbulb,
  Package,
  Shield,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  User,
  Wallet,
} from 'lucide-react';
import type { LucideIconName } from '@/types/homeConfig';

type IconComponent = React.ComponentType<{ className?: string }>;

const MAP: Record<LucideIconName, IconComponent> = {
  AlertTriangle,
  AlertCircle,
  Bell,
  BookOpen,
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
  Info,
  Lightbulb,
  Package,
  Shield,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  User,
  Wallet,
};

export function resolveIcon(name: LucideIconName | undefined, fallback: LucideIconName = 'Info'): IconComponent {
  if (!name) return MAP[fallback];
  return MAP[name] ?? MAP[fallback];
}
