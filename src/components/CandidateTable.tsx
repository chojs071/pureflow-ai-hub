import React from "react";
import { CandidateCondition, QualityMetricInfo } from "../types";
import { formatContaminationValue, formatThreshold } from "../utils/model";
import { Check, X, Sparkles, AlertCircle } from "lucide-react";

interface CandidateTableProps {
  candidates: CandidateCondition[];
  qualityMetric: QualityMetricInfo;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({ candidates, qualityMetric }) => {
  return (
    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-[#071A2E] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#00C2FF]" />
            <span>후보 세정 조건 탐색 & 품질 Gate 비교 (Candidate Evaluation)</span>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            품질 기준({formatThreshold(qualityMetric.allowableLimit, qualityMetric.unit)})을 충족한
            후보 중 가장 적은 초순수(UPW) 조건을 자동 추천합니다.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold text-[#64748B]">
              <th className="py-3 px-4">세정 공정 조건 요약</th>
              <th className="py-3 px-4">UPW 사용량</th>
              <th className="py-3 px-4">예상 잔류 오염 ({qualityMetric.unit})</th>
              <th className="py-3 px-4">품질 Gate 판정</th>
              <th className="py-3 px-4 text-right">선택 상태</th>
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
                        : "bg-rose-50/70 text-[#94A3B8]"
                  }`}
                >
                  {/* Condition Summary */}
                  <td className="py-3 px-4">
                    <div className="font-mono text-xs font-semibold text-[#071A2E]">
                      {cand.conditionSummary}
                    </div>
                    {cand.rejectionReason && (
                      <div className="text-[10px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{cand.rejectionReason}</span>
                      </div>
                    )}
                  </td>

                  {/* UPW Liters */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className={`text-sm font-bold ${
                          isRecommended
                            ? "text-[#071A2E]"
                            : isPass
                              ? "text-[#0F172A]"
                              : "text-rose-900 line-through"
                        }`}
                      >
                        {cand.upwUsageLiters} L
                      </span>
                      {cand.savingsPercent > 0 && isPass && (
                        <span className="text-[10px] font-bold text-[#166534] bg-[#22C55E]/15 px-1.5 py-0.5 rounded">
                          -{cand.savingsPercent}%
                        </span>
                      )}
                    </div>
                    {cand.cleaningMode === "batch" && cand.perWaferUPW && (
                      <div className="text-[10px] text-[#64748B] font-mono">
                        장당 {cand.perWaferUPW} L
                      </div>
                    )}
                  </td>

                  {/* Predicted Residual */}
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`text-xs font-bold ${
                        isPass
                          ? isRecommended
                            ? "text-[#071A2E]"
                            : "text-[#0F172A]"
                          : "text-rose-700"
                      }`}
                    >
                      {formatContaminationValue(cand.predictedResidual, qualityMetric.unit)}
                    </span>
                  </td>

                  {/* Quality Gate Status */}
                  <td className="py-3 px-4">
                    {isPass ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[#166534] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2.5 py-1 rounded-full text-[11px]">
                        <Check className="h-3.5 w-3.5" />
                        <span>기준 충족</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-full text-[11px]">
                        <X className="h-3.5 w-3.5" />
                        <span>기준 초과 (탈락)</span>
                      </span>
                    )}
                  </td>

                  {/* Selection Badge */}
                  <td className="py-3 px-4 text-right">
                    {isRecommended ? (
                      <span className="inline-flex items-center gap-1 font-black text-[#071A2E] bg-[#00C2FF] px-3 py-1 rounded-lg text-xs shadow-xs">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI 추천</span>
                      </span>
                    ) : isPass ? (
                      <span className="text-xs text-[#64748B] font-medium">후보 가능</span>
                    ) : (
                      <span className="text-xs text-rose-600 font-semibold">제외 (품질 미달)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-[11px] text-[#64748B] flex items-center justify-between">
        <span>
          ※ 품질 기준({qualityMetric.name})을 초과한 조건은 아무리 UPW 절감률이 높아도 최적화
          대상에서 <strong>원천 제외</strong>됩니다.
        </span>
        <span className="font-semibold text-[#071A2E]">품질 최우선 원칙 적용됨</span>
      </div>
    </div>
  );
};
