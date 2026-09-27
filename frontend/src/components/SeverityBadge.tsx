import React from 'react';
import { SeverityBand } from '../types/risk';

interface SeverityBadgeProps {
  severity: SeverityBand;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const severityConfig: Record<
  SeverityBand,
  { bg: string; text: string; border: string; dot: string; range: string }
> = {
  Low: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    range: '1–5',
  },
  Medium: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    range: '6–12',
  },
  High: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    range: '13–19',
  },
  Critical: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    range: '20–25',
  },
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  score,
  showScore = true,
  size = 'md',
}) => {
  const config = severityConfig[severity] || severityConfig.Low;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-sm ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
      title={`Severity: ${severity} (Score Range: ${config.range})`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {showScore && score !== undefined && (
        <span className="font-bold tabular-nums">{score}</span>
      )}
      <span>{severity}</span>
    </span>
  );
};
