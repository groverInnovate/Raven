interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'disputed' | 'cancelled' | 'funds_locked' | 'in_dispute' | 'delivered';
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✅'
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⏳'
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🎉'
  },
  disputed: {
    label: 'Disputed',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '⚠️'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '❌'
  },
  funds_locked: {
    label: 'Funds Locked',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '🔒'
  },
  in_dispute: {
    label: 'In Dispute',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '⚖️'
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '📦'
  }
};

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.color} ${sizeClass}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
