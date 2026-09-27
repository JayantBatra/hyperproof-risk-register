import React, { useState, useEffect } from 'react';
import { Risk, CreateRiskPayload, UpdateRiskPayload, RiskCategory, RiskStatus, SeverityBand } from '../types/risk';
import { SeverityBadge } from './SeverityBadge';
import { X, AlertCircle } from 'lucide-react';

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRiskPayload | UpdateRiskPayload) => Promise<void>;
  initialRisk?: Risk | null;
}

const categories: RiskCategory[] = ['Operational', 'Financial', 'Compliance', 'Security', 'Strategic'];
const statuses: RiskStatus[] = ['Open', 'Mitigating', 'Closed'];

const likelihoodLabels: Record<number, string> = {
  1: '1 - Rare',
  2: '2 - Unlikely',
  3: '3 - Possible',
  4: '4 - Likely',
  5: '5 - Almost Certain',
};

const impactLabels: Record<number, string> = {
  1: '1 - Negligible',
  2: '2 - Minor',
  3: '3 - Moderate',
  4: '4 - Major',
  5: '5 - Catastrophic',
};

const availableFrameworks = [
  'SOC 2 CC6.1 (Access Control)',
  'SOC 2 A1.2 (Availability)',
  'NIST CSF PR.AC-1 (Identity)',
  'NIST CSF PR.IP-4 (Data Backup)',
  'NIST CSF DE.CM-4 (Network Anomaly)',
  'ISO 27001 A.12 (Operations)',
];

export const RiskModal: React.FC<RiskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRisk,
}) => {
  const isEditing = Boolean(initialRisk);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RiskCategory>('Security');
  const [owner, setOwner] = useState('');
  const [likelihood, setLikelihood] = useState<number>(3);
  const [impact, setImpact] = useState<number>(3);
  const [status, setStatus] = useState<RiskStatus>('Open');
  const [nextReviewDate, setNextReviewDate] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialRisk) {
      setTitle(initialRisk.title || '');
      setDescription(initialRisk.description || '');
      setCategory(initialRisk.category || 'Security');
      setOwner(initialRisk.owner || '');
      setLikelihood(initialRisk.likelihood || 3);
      setImpact(initialRisk.impact || 3);
      setStatus(initialRisk.status || 'Open');
      setNextReviewDate(initialRisk.nextReviewDate || '');
      setSelectedFrameworks(initialRisk.complianceFrameworks || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Security');
      setOwner('');
      setLikelihood(3);
      setImpact(3);
      setStatus('Open');
      setNextReviewDate('');
      setSelectedFrameworks([]);
    }
    setErrorMessage(null);
  }, [initialRisk, isOpen]);

  if (!isOpen) return null;

  // Live computed inherent score
  const computedInherentScore = likelihood * impact;
  const computedSeverityBand: SeverityBand =
    computedInherentScore <= 5
      ? 'Low'
      : computedInherentScore <= 12
      ? 'Medium'
      : computedInherentScore <= 19
      ? 'High'
      : 'Critical';

  const toggleFramework = (framework: string) => {
    if (selectedFrameworks.includes(framework)) {
      setSelectedFrameworks(selectedFrameworks.filter((f) => f !== framework));
    } else {
      setSelectedFrameworks([...selectedFrameworks, framework]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Risk Title is required.');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateRiskPayload | UpdateRiskPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        owner: owner.trim() || undefined,
        likelihood,
        impact,
        status,
        nextReviewDate: nextReviewDate || undefined,
        complianceFrameworks: selectedFrameworks,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { message?: string; validationErrors?: Record<string, string> };
      if (apiErr.validationErrors) {
        const firstField = Object.values(apiErr.validationErrors)[0];
        setErrorMessage(firstField || 'Validation failed.');
      } else {
        setErrorMessage(apiErr.message || 'Failed to save risk.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Risk' : 'Create New Risk'}
            </h2>
            <p className="text-xs text-slate-500">
              Configure risk attributes, initial assessment, and compliance alignment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="px-6 py-3 bg-rose-50 border-b border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Risk Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Unauthorized Access to Production Database"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RiskCategory)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RiskStatus)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {status === 'Closed' && (!initialRisk || initialRisk.mitigationCount === 0) && (
                <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> A risk cannot be marked Closed without at least 1 mitigation.
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the threat scenario, vulnerabilities involved, and potential organizational consequences..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Owner & Next Review Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Risk Owner
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g., Security Operations / Alice Smith"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Next Review Date
              </label>
              <input
                type="date"
                value={nextReviewDate}
                onChange={(e) => setNextReviewDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Scoring Sliders & Live Computed Inherent Score */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Inherent Risk Scoring
                </span>
                <p className="text-[11px] text-slate-500">Likelihood (1–5) × Impact (1–5)</p>
              </div>

              {/* Live Inherent Score Badge */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Inherent Score:</span>
                <span className="text-base font-extrabold text-slate-900">{computedInherentScore}</span>
                <SeverityBadge severity={computedSeverityBand} showScore={false} size="sm" />
              </div>
            </div>

            {/* Likelihood Selector */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Likelihood:</span>
                <span className="text-indigo-600 font-bold">{likelihoodLabels[likelihood]}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLikelihood(val)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      likelihood === val
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Impact Selector */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Impact:</span>
                <span className="text-indigo-600 font-bold">{impactLabels[impact]}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setImpact(val)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      impact === val
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance Frameworks Mapping (Stretch Goal) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Compliance Framework Mapping
            </label>
            <div className="flex flex-wrap gap-2">
              {availableFrameworks.map((fw) => {
                const selected = selectedFrameworks.includes(fw);
                return (
                  <button
                    key={fw}
                    type="button"
                    onClick={() => toggleFramework(fw)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      selected
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 font-semibold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {fw}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Risk' : 'Create Risk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
