import React from 'react';
import { RiskStatus } from '../types/risk';
import { ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';

interface StatusBadgeProps {
  status: RiskStatus;
}

const statusConfig: Record<
  RiskStatus,
  { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Open: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: ShieldAlert,
  },
  Mitigating: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: ShieldCheck,
  },
  Closed: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: ShieldOff,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.Open;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3 h-3" />
      <span>{status}</span>
    </span>
  );
};
