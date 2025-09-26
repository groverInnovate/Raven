import Badge from '../ui/Badge';

export type StatusType = 'active' | 'pending' | 'completed' | 'disputed' | 'cancelled' | 'funds_locked' | 'in_dispute' | 'delivered';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'; icon: string }> = {
  active: {
    label: 'Active',
    variant: 'success',
    icon: '✅'
  },
  pending: {
    label: 'Pending',
    variant: 'warning',
    icon: '⏳'
  },
  completed: {
    label: 'Completed',
    variant: 'secondary',
    icon: '🎉'
  },
  disputed: {
    label: 'Disputed',
    variant: 'danger',
    icon: '⚠️'
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'default',
    icon: '❌'
  },
  funds_locked: {
    label: 'Funds Locked',
    variant: 'info',
    icon: '🔒'
  },
  in_dispute: {
    label: 'In Dispute',
    variant: 'warning',
    icon: '⚖️'
  },
  delivered: {
    label: 'Delivered',
    variant: 'success',
    icon: '📦'
  }
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={config.icon}
    >
      {config.label}
    </Badge>
  );
}
