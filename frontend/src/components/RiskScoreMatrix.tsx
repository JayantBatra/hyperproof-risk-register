import React from 'react';

interface RiskScoreMatrixProps {
  likelihood: number; // 1-5
  impact: number;     // 1-5
  residualScore?: number;
}

export const RiskScoreMatrix: React.FC<RiskScoreMatrixProps> = ({
  likelihood,
  impact,
  residualScore,
}) => {
  // Determine severity class for a cell (L * I)
  const getCellColor = (l: number, i: number) => {
    const score = l * i;
    if (score <= 5) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score <= 12) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (score <= 19) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          5×5 Risk Matrix
        </h4>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white"></span>
            <span className="text-slate-600 font-medium">Inherent ({likelihood * impact})</span>
          </span>
          {residualScore !== undefined && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white"></span>
              <span className="text-indigo-600 font-medium">Residual ({residualScore})</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Y Axis Label */}
        <div className="w-6 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider -rotate-90 whitespace-nowrap">
            Likelihood
          </span>
        </div>

        {/* Matrix Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1.5">
            {[5, 4, 3, 2, 1].map((l) =>
              [1, 2, 3, 4, 5].map((i) => {
                const isInherent = l === likelihood && i === impact;
                const score = l * i;
                const isResidualMatch = residualScore !== undefined && score === residualScore;

                return (
                  <div
                    key={`${l}-${i}`}
                    className={`relative h-10 rounded flex flex-col items-center justify-center text-xs font-bold border transition-all ${getCellColor(
                      l,
                      i
                    )} ${isInherent ? 'ring-2 ring-slate-900 ring-offset-1 z-10' : ''}`}
                    title={`Likelihood ${l} × Impact ${i} = Score ${score}`}
                  >
                    <span className="text-[10px] opacity-75">{score}</span>
                    <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                      {isInherent && (
                        <span
                          className="w-4 h-4 bg-slate-900 text-white rounded-full text-[9px] flex items-center justify-center shadow font-bold"
                          title="Inherent Risk Position"
                        >
                          I
                        </span>
                      )}
                      {isResidualMatch && !isInherent && (
                        <span
                          className="w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center shadow font-bold"
                          title="Residual Risk Target"
                        >
                          R
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* X Axis Label */}
          <div className="mt-2 text-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Impact (1 – 5) →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
