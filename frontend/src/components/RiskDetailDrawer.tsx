import React, { useState } from 'react';
import { Risk, CreateMitigationPayload } from '../types/risk';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { RiskScoreMatrix } from './RiskScoreMatrix';
import {
  X,
  ShieldCheck,
  Plus,
  Trash2,
  Clock,
  TrendingDown,
  AlertTriangle,
  Calendar,
  User,
  Tag
} from 'lucide-react';

interface RiskDetailDrawerProps {
  risk: Risk | null;
  isOpen: boolean;
  onClose: () => void;
  onAddMitigation: (riskId: number, payload: CreateMitigationPayload) => Promise<void>;
  onDeleteMitigation: (riskId: number, mitigationId: number) => Promise<void>;
  onEditRisk: (risk: Risk) => void;
}

const effectivenessLabels: Record<number, { title: string; reduction: string }> = {
  1: { title: '1 - Minimal / Weak Control', reduction: '15% reduction' },
  2: { title: '2 - Basic Policy / Manual', reduction: '30% reduction' },
  3: { title: '3 - Standard Operating Procedure', reduction: '45% reduction' },
  4: { title: '4 - Strong Validated Control', reduction: '60% reduction' },
  5: { title: '5 - Automated & Continuously Monitored', reduction: '75% reduction' },
};

export const RiskDetailDrawer: React.FC<RiskDetailDrawerProps> = ({
  risk,
  isOpen,
  onClose,
  onAddMitigation,
  onDeleteMitigation,
  onEditRisk,
}) => {
  const [mitigationDesc, setMitigationDesc] = useState('');
  const [effectiveness, setEffectiveness] = useState<number>(4);
  const [submittingMitigation, setSubmittingMitigation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !risk) return null;

  const handleCreateMitigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mitigationDesc.trim()) return;

    setSubmittingMitigation(true);
    setErrorMessage(null);
    try {
      await onAddMitigation(risk.id, {
        description: mitigationDesc.trim(),
        effectiveness,
      });
      setMitigationDesc('');
      setEffectiveness(4);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setErrorMessage(apiErr.message || 'Failed to add mitigation.');
    } finally {
      setSubmittingMitigation(false);
    }
  };

  const handleDeleteMitigation = async (mitigationId: number) => {
    setErrorMessage(null);
    try {
      await onDeleteMitigation(risk.id, mitigationId);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setErrorMessage(apiErr.message || 'Failed to remove mitigation.');
    }
  };

  const hasMitigations = risk.mitigations && risk.mitigations.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div className="space-y-1.5 max-w-[85%]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {risk.category}
              </span>
              <StatusBadge status={risk.status} />
              {risk.overdue && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> REVIEW OVERDUE
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{risk.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Action Blocked</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Inherent vs Residual Scorecard */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Risk Quantification Scorecard
              </span>
              {risk.mitigationPercentage > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  <TrendingDown className="w-3.5 h-3.5" />
                  -{risk.mitigationPercentage}% Residual Risk Reduction
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Inherent Card */}
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-xs text-slate-300 font-medium">Inherent Risk (Unmitigated)</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold">{risk.inherentScore}</span>
                  <span className="text-xs text-slate-300">/ 25</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <SeverityBadge severity={risk.inherentSeverity} showScore={false} size="sm" />
                  <span className="text-[11px] text-slate-300">
                    Likelihood {risk.likelihood} × Impact {risk.impact}
                  </span>
                </div>
              </div>

              {/* Residual Card */}
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-xs text-slate-300 font-medium">Residual Risk (After Controls)</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-indigo-300">{risk.residualScore}</span>
                  <span className="text-xs text-slate-300">
                    (Exact: {risk.exactResidualScore})
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <SeverityBadge severity={risk.residualSeverity} showScore={false} size="sm" />
                  <span className="text-[11px] text-slate-300">
                    {risk.mitigationCount} mitigating control{risk.mitigationCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5x5 Matrix Visual */}
          <RiskScoreMatrix
            likelihood={risk.likelihood}
            impact={risk.impact}
            residualScore={risk.residualScore}
          />

          {/* Metadata Grid */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-500 block">Owner</span>
                <span className="font-semibold text-slate-800">{risk.owner || 'Unassigned'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-500 block">Next Review Date</span>
                <span className={`font-semibold ${risk.overdue ? 'text-rose-600' : 'text-slate-800'}`}>
                  {risk.nextReviewDate || 'None scheduled'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {risk.description && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Threat Scenario & Description
              </h4>
              <p className="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                {risk.description}
              </p>
            </div>
          )}

          {/* Compliance Frameworks Mapping (Stretch Goal) */}
          {risk.complianceFrameworks && risk.complianceFrameworks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Compliance Framework Controls
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {risk.complianceFrameworks.map((fw) => (
                  <span
                    key={fw}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mitigating Controls Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Mitigating Controls ({risk.mitigations?.length || 0})
                </h3>
                <p className="text-xs text-slate-500">
                  Controls directly reduce inherent risk via compounding multiplicative retention.
                </p>
              </div>
            </div>

            {/* List of Existing Mitigations */}
            {!hasMitigations ? (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Zero Mitigating Controls Applied</p>
                  <p className="mt-0.5 text-amber-700">
                    Residual risk equals inherent risk ({risk.inherentScore}). Add controls below to reduce residual exposure and enable risk closure.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {risk.mitigations.map((m) => {
                  const effInfo = effectivenessLabels[m.effectiveness] || {
                    title: `Effectiveness ${m.effectiveness}`,
                    reduction: '',
                  };
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1">
                        <p className="text-sm font-medium text-slate-900 leading-snug">{m.description}</p>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {effInfo.title}
                          </span>
                          <span className="text-[11px] text-emerald-600 font-medium">
                            {effInfo.reduction}
                          </span>
                          {m.createdAt && (
                            <span className="text-[11px] text-slate-400">
                              Added {new Date(m.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteMitigation(m.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                        title="Delete mitigation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Mitigation Inline Form */}
            <form
              onSubmit={handleCreateMitigation}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                Add New Mitigating Control
              </h4>

              <div>
                <textarea
                  rows={2}
                  required
                  value={mitigationDesc}
                  onChange={(e) => setMitigationDesc(e.target.value)}
                  placeholder="Describe the control (e.g., Mandatory MFA, automated vulnerability scanning, daily backups)..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Control Effectiveness:</span>
                  <span className="text-indigo-600 font-bold">
                    {effectivenessLabels[effectiveness]?.title}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setEffectiveness(val)}
                      className={`py-1 text-xs font-bold rounded-lg border transition ${
                        effectiveness === val
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="submit"
                  disabled={submittingMitigation || !mitigationDesc.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {submittingMitigation ? 'Adding Control...' : 'Apply Mitigation'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => onEditRisk(risk)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm transition"
          >
            Edit Risk Details
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm transition"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};
