import React from 'react';
import { RiskCategory, RiskStatus, Risk } from '../types/risk';
import { Search, ArrowUpDown, Filter, ShieldAlert, AlertTriangle, Clock, Layers } from 'lucide-react';

interface RiskFiltersProps {
  risks: Risk[];
  selectedCategory: RiskCategory | '';
  onCategoryChange: (category: RiskCategory | '') => void;
  selectedStatus: RiskStatus | '';
  onStatusChange: (status: RiskStatus | '') => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderToggle: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const categories: (RiskCategory | '')[] = [
  '',
  'Security',
  'Operational',
  'Compliance',
  'Financial',
  'Strategic',
];

const statuses: (RiskStatus | '')[] = [
  '',
  'Open',
  'Mitigating',
  'Closed',
];

export const RiskFilters: React.FC<RiskFiltersProps> = ({
  risks,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  searchQuery,
  onSearchQueryChange,
}) => {
  // Aggregate KPI summary metrics
  const totalCount = risks.length;
  const criticalResidualCount = risks.filter(r => r.residualSeverity === 'Critical' || r.residualSeverity === 'High').length;
  const overdueCount = risks.filter(r => r.overdue).length;
  const avgReduction = totalCount > 0
    ? Math.round(risks.reduce((acc, r) => acc + (r.mitigationPercentage || 0), 0) / totalCount)
    : 0;

  return (
    <div className="space-y-4">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Risks</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">High / Critical</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{criticalResidualCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overdue Review</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{overdueCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Risk Reduction</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{avgReduction}%</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 rotate-180" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search risks by title, owner, description..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as RiskCategory | '')}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.filter(Boolean).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value as RiskStatus | '')}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              {statuses.filter(Boolean).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Select */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-1 py-1">
            <span className="text-xs text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              <option value="residualScore">Residual Score</option>
              <option value="inherentScore">Inherent Score</option>
              <option value="title">Title</option>
              <option value="createdAt">Date Created</option>
            </select>
            <button
              onClick={onSortOrderToggle}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
              title={`Toggle sort order (current: ${sortOrder.toUpperCase()})`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
