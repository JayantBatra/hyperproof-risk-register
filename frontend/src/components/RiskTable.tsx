import React from 'react';
import { Risk } from '../types/risk';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { Shield, ChevronRight, AlertCircle, Clock, Trash2, Edit3, ArrowDownRight } from 'lucide-react';

interface RiskTableProps {
  risks: Risk[];
  loading: boolean;
  onSelectRisk: (risk: Risk) => void;
  onEditRisk: (risk: Risk, e: React.MouseEvent) => void;
  onDeleteRisk: (risk: Risk, e: React.MouseEvent) => void;
}

export const RiskTable: React.FC<RiskTableProps> = ({
  risks,
  loading,
  onSelectRisk,
  onEditRisk,
  onDeleteRisk,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
        <p className="text-slate-500 text-sm">Loading Risk Register...</p>
      </div>
    );
  }

  if (risks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No risks found</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
          No risks matched your current category, status, or search filters. Try clearing filters or create a new risk.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Risk Title & Details</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Inherent Score</th>
              <th className="py-3 px-3">Residual Score</th>
              <th className="py-3 px-3">Mitigations</th>
              <th className="py-3 px-3">Review</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {risks.map((risk) => {
              const hasReduction = risk.residualScore < risk.inherentScore;
              return (
                <tr
                  key={risk.id}
                  onClick={() => onSelectRisk(risk)}
                  className="hover:bg-slate-50/80 cursor-pointer transition group"
                >
                  {/* Title & Description */}
                  <td className="py-3.5 px-4 max-w-xs md:max-w-sm">
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                      <span>{risk.title}</span>
                    </div>
                    {risk.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {risk.description}
                      </p>
                    )}
                    {risk.owner && (
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Owner: <span className="text-slate-600 font-medium">{risk.owner}</span>
                      </span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {risk.category}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <StatusBadge status={risk.status} />
                  </td>

                  {/* Inherent Score */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-0.5">
                      <SeverityBadge
                        severity={risk.inherentSeverity}
                        score={risk.inherentScore}
                        size="sm"
                      />
                      <span className="text-[10px] text-slate-400">
                        L: {risk.likelihood} × I: {risk.impact}
                      </span>
                    </div>
                  </td>

                  {/* Residual Score */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-0.5">
                      <SeverityBadge
                        severity={risk.residualSeverity}
                        score={risk.residualScore}
                        size="sm"
                      />
                      {hasReduction ? (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                          <ArrowDownRight className="w-2.5 h-2.5" />
                          -{risk.mitigationPercentage}% mitigated
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">No reduction</span>
                      )}
                    </div>
                  </td>

                  {/* Mitigation Count */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {risk.mitigationCount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {risk.mitigationCount} control{risk.mitigationCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-500 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        0 controls
                      </span>
                    )}
                  </td>

                  {/* Next Review & Overdue Indicator */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {risk.nextReviewDate ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-600 font-medium">
                          {risk.nextReviewDate}
                        </span>
                        {risk.overdue && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 mt-0.5">
                            <Clock className="w-2.5 h-2.5" /> OVERDUE
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => onEditRisk(risk, e)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition"
                        title="Edit Risk"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => onDeleteRisk(risk, e)}
                        className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                        title="Delete Risk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectRisk(risk)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition"
                        title="View Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
