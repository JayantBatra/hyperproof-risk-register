import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Risk, CreateRiskPayload, UpdateRiskPayload, CreateMitigationPayload, RiskCategory, RiskStatus } from './types/risk';
import { riskApi } from './api/riskApi';
import { Navbar } from './components/Navbar';
import { RiskFilters } from './components/RiskFilters';
import { RiskTable } from './components/RiskTable';
import { RiskModal } from './components/RiskModal';
import { RiskDetailDrawer } from './components/RiskDetailDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ShieldCheck, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const App: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState<RiskCategory | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<RiskStatus | ''>('');
  const [sortBy, setSortBy] = useState<string>('residualScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawer State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  // Informational banner state
  const [showFormulaInfo, setShowFormulaInfo] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning', message: string, title?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch risks
  const loadRisks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await riskApi.getRisks({
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
        sortOrder,
      });
      setRisks(data);

      // If drawer is open, keep selectedRisk updated with fresh data
      if (selectedRisk) {
        const updated = data.find((r) => r.id === selectedRisk.id);
        if (updated) {
          setSelectedRisk(updated);
        }
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      addToast('error', apiErr.message || 'Failed to load risks from backend server.', 'Network Error');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedStatus, sortBy, sortOrder, selectedRisk?.id]);

  useEffect(() => {
    loadRisks();
  }, [selectedCategory, selectedStatus, sortBy, sortOrder]);

  // Client search filter (title, owner, description)
  const filteredRisks = useMemo(() => {
    if (!searchQuery.trim()) return risks;
    const q = searchQuery.toLowerCase();
    return risks.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.owner && r.owner.toLowerCase().includes(q))
    );
  }, [risks, searchQuery]);

  // Create Risk
  const handleCreateRisk = async (payload: CreateRiskPayload | UpdateRiskPayload) => {
    try {
      const created = await riskApi.createRisk(payload as CreateRiskPayload);
      addToast('success', `Risk "${created.title}" successfully added to register.`, 'Risk Created');
      await loadRisks();
    } catch (err: unknown) {
      throw err;
    }
  };

  // Update Risk
  const handleUpdateRisk = async (payload: CreateRiskPayload | UpdateRiskPayload) => {
    if (!editingRisk) return;
    try {
      const updated = await riskApi.updateRisk(editingRisk.id, payload as UpdateRiskPayload);
      addToast('success', `Risk "${updated.title}" successfully updated.`, 'Risk Updated');
      setEditingRisk(null);
      await loadRisks();
      if (selectedRisk && selectedRisk.id === updated.id) {
        setSelectedRisk(updated);
      }
    } catch (err: unknown) {
      throw err;
    }
  };

  // Delete Risk
  const handleDeleteRisk = async (risk: Risk, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete risk "${risk.title}" and all its mitigating controls?`)) {
      return;
    }

    try {
      await riskApi.deleteRisk(risk.id);
      addToast('success', `Risk "${risk.title}" has been deleted.`, 'Risk Removed');
      if (selectedRisk?.id === risk.id) {
        setSelectedRisk(null);
      }
      await loadRisks();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      addToast('error', apiErr.message || 'Failed to delete risk.', 'Deletion Failed');
    }
  };

  // Add Mitigation to Risk
  const handleAddMitigation = async (riskId: number, payload: CreateMitigationPayload) => {
    try {
      await riskApi.createMitigation(riskId, payload);
      // Fetch latest single risk details to reflect updated residual score immediately
      const updatedRisk = await riskApi.getRiskById(riskId);
      setSelectedRisk(updatedRisk);
      addToast(
        'success',
        `Mitigating control applied. Residual score updated to ${updatedRisk.residualScore} (${updatedRisk.residualSeverity}).`,
        'Mitigation Added'
      );
      await loadRisks();
    } catch (err: unknown) {
      throw err;
    }
  };

  // Delete Mitigation
  const handleDeleteMitigation = async (riskId: number, mitigationId: number) => {
    try {
      await riskApi.deleteMitigation(riskId, mitigationId);
      const updatedRisk = await riskApi.getRiskById(riskId);
      setSelectedRisk(updatedRisk);
      addToast('success', 'Mitigating control removed and residual score recalculated.', 'Control Removed');
      await loadRisks();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      addToast('error', apiErr.message || 'Cannot delete mitigation.', 'Action Rejected');
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Intro & Scoring Formula Explainer Toggle */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Organizational Risk Register
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
              Prioritize organizational security, compliance, operational, and financial exposures.
              Evaluate inherent risk before controls and track residual risk remaining after mitigations are applied.
            </p>
          </div>

          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition self-start md:self-center shrink-0"
          >
            <HelpCircle className="w-4 h-4" />
            <span>How Risk Scoring Works</span>
            {showFormulaInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Scoring Formula Details */}
        {showFormulaInfo && (
          <div className="bg-indigo-950 text-indigo-100 p-6 rounded-2xl shadow-lg border border-indigo-900 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Scoring Methodology & Business Logic
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-indigo-200 leading-relaxed">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-white text-sm mb-1.5">1. Inherent Risk</h4>
                <p>
                  <strong>Formula:</strong> Likelihood (1–5) × Impact (1–5) = Range [1, 25].
                </p>
                <p className="mt-1">
                  Quantifies raw vulnerability exposure before any mitigating controls or security safeguards are deployed.
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-white text-sm mb-1.5">2. Residual Risk & Defense-in-Depth</h4>
                <p>
                  <strong>Formula:</strong> Compounding Multiplicative Retention:
                  <br />
                  <code className="text-indigo-300 font-mono text-[11px]">
                    Retention = ∏ (1 - Effectiveness × 0.15)
                  </code>
                </p>
                <p className="mt-1">
                  Effectiveness 5 mitigates 75% of residual exposure. Multiple controls compound with diminishing returns (capped at 90% total mitigation; floor of 1.0).
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-white text-sm mb-1.5">3. Compliance Business Rule</h4>
                <p>
                  <strong>Closure Requirement:</strong> A risk cannot be marked <strong>"Closed"</strong> with zero mitigations.
                </p>
                <p className="mt-1">
                  Auditors require evidence of operating mitigating controls before retirement. The system strictly rejects closing unmitigated risks.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs font-medium text-indigo-300 border-t border-indigo-900">
              <span>Severity Bands:</span>
              <span className="text-emerald-400 font-semibold">Low (1–5)</span>
              <span className="text-amber-400 font-semibold">Medium (6–12)</span>
              <span className="text-orange-400 font-semibold">High (13–19)</span>
              <span className="text-rose-400 font-semibold">Critical (20–25)</span>
            </div>
          </div>
        )}

        {/* Dashboard Filters & Metrics */}
        <RiskFilters
          risks={risks}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />

        {/* Main Risk Table */}
        <RiskTable
          risks={filteredRisks}
          loading={loading}
          onSelectRisk={(risk) => setSelectedRisk(risk)}
          onEditRisk={(risk, e) => {
            e.stopPropagation();
            setEditingRisk(risk);
          }}
          onDeleteRisk={handleDeleteRisk}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        <p>Hyperproof Risk Register &bull; Enterprise Compliance &amp; Continuous Risk Scoring</p>
      </footer>

      {/* Modals & Drawers */}
      <RiskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRisk}
      />

      <RiskModal
        isOpen={Boolean(editingRisk)}
        onClose={() => setEditingRisk(null)}
        onSubmit={handleUpdateRisk}
        initialRisk={editingRisk}
      />

      <RiskDetailDrawer
        isOpen={Boolean(selectedRisk)}
        onClose={() => setSelectedRisk(null)}
        risk={selectedRisk}
        onAddMitigation={handleAddMitigation}
        onDeleteMitigation={handleDeleteMitigation}
        onEditRisk={(risk) => {
          setEditingRisk(risk);
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
export default App;
