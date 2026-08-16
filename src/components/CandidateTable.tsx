import React from "react";
import { CandidateCondition } from "../types";
import { formatScientific, formatThreshold } from "../utils/model";
import { Check, X, Sparkles, HelpCircle } from "lucide-react";

interface CandidateTableProps {
  candidates: CandidateCondition[];
  allowableCu: number;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({ candidates, allowableCu }) => {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#071A2E] flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#00C2FF]" />
            <span>후보 세정 조건 비교 (Candidate Evaluation)</span>
          </h3>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            품질 기준(≤ {formatScientific(allowableCu)})을 충족한 후보 중 가장 적은 UPW를 자동
            선정합니다.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold text-[#64748B]">
              <th className="py-2.5 px-3">UPW 사용량</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">레시피 (시간/유량)</th>
              <th className="py-2.5 px-3">예상 잔류 Cu</th>
              <th className="py-2.5 px-3">품질 판정</th>
              <th className="py-2.5 px-3 text-right">선택 상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {candidates.map((cand) => {
              const isRecommended = cand.isRecommended;
              const isPass = cand.qualityPass;

              return (
                <tr
                  key={cand.id}
                  className={`transition-colors ${
                    isRecommended
                      ? "bg-[#00C2FF]/10 font-medium"
                      : isPass
                        ? "bg-white hover:bg-[#F8FAFC]"
                        : "bg-rose-50/60 text-[#94A3B8]"
                  }`}
                >
                  {/* UPW Liters */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span
                        className={`font-bold ${isRecommended ? "text-[#071A2E] text-sm" : isPass ? "text-[#0F172A]" : "text-rose-900 line-through"}`}
                      >
                        {cand.upwUsageLiters} L
                      </span>
                      {cand.savingsPercent > 0 && isPass && (
                        <span className="text-[10px] font-bold text-[#166534] bg-[#22C55E]/15 px-1 rounded">
                          -{cand.savingsPercent}%
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Recipe Specs */}
                  <td className="py-2.5 px-3 hidden sm:table-cell font-mono text-[11px] text-[#64748B]">
                    {cand.cleaningTimeMin}m / {cand.rinseTimeMin}m / {cand.flowRateLpm}Lpm
                  </td>

                  {/* Predicted Residual Cu */}
                  <td className="py-2.5 px-3 font-mono">
                    <span
                      className={
                        isPass
                          ? isRecommended
                            ? "text-[#071A2E] font-bold"
                            : "text-[#0F172A]"
                          : "text-rose-700 font-bold"
                      }
                    >
                      {formatScientific(cand.predictedResidualCu)}
                    </span>
                  </td>

                  {/* Quality Gate Status */}
                  <td className="py-2.5 px-3">
                    {isPass ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[#166534] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-0.5 rounded-full text-[10px]">
                        <Check className="h-3 w-3" />
                        <span>기준 충족</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full text-[10px]">
                        <X className="h-3 w-3" />
                        <span>기준 초과 (탈락)</span>
                      </span>
                    )}
                  </td>

                  {/* Selection Badge */}
                  <td className="py-2.5 px-3 text-right">
                    {isRecommended ? (
                      <span className="inline-flex items-center gap-1 font-black text-[#071A2E] bg-[#00C2FF] px-2.5 py-0.5 rounded-md text-[11px] shadow-xs">
                        <Sparkles className="h-3 w-3" />
                        <span>AI 추천</span>
                      </span>
                    ) : isPass ? (
                      <span className="text-[11px] text-[#64748B]">후보 가능</span>
                    ) : (
                      <span className="text-[11px] text-rose-600 font-medium">
                        제외 (품질 미달)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-[#64748B]">
        ※ 품질 기준을 초과한 조건(예: 과도한 유량/시간 감축)은 UPW 절감률이 높아도 자동 탈락됩니다.
      </p>
    </div>
  );
};
