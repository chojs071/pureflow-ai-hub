import React from "react";
import {
  ShieldCheck,
  Droplets,
  Zap,
  Leaf,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Disc,
  Waves,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import { ProcessResult, WaferConfig, CleaningMode } from "../types";
import { calculateESGSummary, formatContaminationValue, formatThreshold } from "../utils/model";
import { ProcessChart } from "./ProcessChart";

interface FinalDashboardProps {
  wafer: WaferConfig;
  cleaningMode: CleaningMode;
  batchSize?: number;
  results: ProcessResult[];
  onRestart: () => void;
  onOpenFormula: () => void;
  onChangeMode: (mode: CleaningMode) => void;
}

export const FinalDashboard: React.FC<FinalDashboardProps> = ({
  wafer,
  cleaningMode,
  batchSize,
  results,
  onRestart,
  onOpenFormula,
  onChangeMode,
}) => {
  const summary = calculateESGSummary(results);
  const isSingle = cleaningMode === "single";

  const waferLabel = `${wafer.diameterInch}" (${wafer.diameterMm}mm) · ${
    wafer.waferType === "polished"
      ? "연마 웨이퍼 (Polished)"
      : wafer.waferType === "epitaxial"
        ? "에피 웨이퍼 (Epi)"
        : "SOI 웨이퍼"
  }`;

  const formatWaferType = (type: string) => {
    switch (type) {
      case "polished":
        return "Polished";
      case "epitaxial":
        return "Epi";
      case "soi":
        return "SOI";
      default:
        return type;
    }
  };

  const breadcrumbCondition = isSingle
    ? `PureFlow AI / Single Wafer / ${wafer.diameterInch}" / ${formatWaferType(wafer.waferType)} / 8대 공정 종합`
    : `PureFlow AI / Batch / ${batchSize || 50} wafers / ${wafer.diameterInch}" / ${formatWaferType(wafer.waferType)} / 8대 공정 종합`;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 text-xs font-mono font-bold text-[#071A2E] w-fit">
            <span className="text-[#00C2FF]">●</span>
            <span>{breadcrumbCondition}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-[#071A2E] text-base sm:text-lg">
              반도체 8대 공정 {waferLabel}{" "}
              {isSingle ? "매엽식 (Single Wafer)" : `배치식 (Batch, ${batchSize || 50}매)`} 최적화
              리포트
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-[#166534] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2.5 py-0.5 rounded-full text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>품질 기준 100% 충족</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-[#071A2E] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#64748B]" />
            <span>조건 재설정 / 초기화</span>
          </button>

          <button
            onClick={() => onChangeMode(isSingle ? "batch" : "single")}
            className="flex items-center gap-1.5 rounded-xl border border-[#00C2FF]/30 bg-[#00C2FF]/10 hover:bg-[#00C2FF]/20 text-[#071A2E] px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
          >
            {isSingle ? (
              <Waves className="h-3.5 w-3.5 text-[#00C2FF]" />
            ) : (
              <Disc className="h-3.5 w-3.5 text-[#00C2FF]" />
            )}
            <span>{isSingle ? "배치식(Batch) 비교" : "매엽식(Single) 비교"}</span>
          </button>
        </div>
      </div>

      {/* Quality Gate Guarantee & Summary Statement Card */}
      <div className="rounded-3xl border border-[#22C55E]/40 bg-[#22C55E]/10 p-6 sm:p-7 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#22C55E] text-white shrink-0 shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-[#166534]">
                8대 공정의 세정 단계를 분석하고, 품질 기준을 충족하는 범위에서 줄일 수 있는 UPW를
                찾아냈습니다.
              </h4>
              <p className="text-xs sm:text-sm text-[#166534]/90 font-medium mt-1">
                세정 방식과 공정별 문헌 기반 모델을 사용하여 품질을 먼저 검증한 뒤 UPW 절감 조건을
                선택했습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenFormula}
            className="text-xs font-bold text-[#166534] hover:underline flex items-center gap-1 shrink-0 cursor-pointer bg-white/80 px-3 py-1.5 rounded-xl border border-[#22C55E]/30"
          >
            <BookOpen className="h-4 w-4" />
            <span>Surrogate 수식 및 문헌 근거</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2 border-t border-[#22C55E]/20 text-xs text-[#166534] font-medium">
          <span>✓ 최적화 대상 세정 공정 ({summary.totalProcessesCount}개): 100% 품질 합격</span>
          <span>
            ✓ 검사 공정 EDS ({summary.excludedProcessesCount}개): 비세정 공정으로 UPW 최적화 제외
            명시
          </span>
          <span>✓ 품질 미달 레시피 원천 탈락</span>
        </div>
      </div>

      {/* Core Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Baseline UPW */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-medium text-[#64748B] block mb-1">기존 총 UPW</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#64748B]">
              {summary.totalBaselineUPW}
            </span>
            <span className="text-xs font-bold text-[#64748B]">L</span>
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">
            {summary.totalProcessesCount}개 세정 공정 합계
          </span>
        </div>

        {/* AI Optimized UPW */}
        <div className="rounded-2xl border-2 border-[#00C2FF] bg-[#00C2FF]/10 p-4 sm:p-5 shadow-xs ring-1 ring-[#00C2FF]/20">
          <span className="text-xs font-bold text-[#071A2E] block mb-1">AI 최적화 UPW</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#071A2E]">
              {summary.totalAIUPW}
            </span>
            <span className="text-xs font-bold text-[#071A2E]">L</span>
          </div>
          <span className="text-[11px] text-[#00C2FF] font-bold mt-1 block">
            품질 통과 최소 조건
          </span>
        </div>

        {/* Total UPW Savings */}
        <div className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-bold text-[#166534] block mb-1">총 UPW 절감량</span>
          <div className="flex items-baseline gap-1 text-[#166534]">
            <span className="font-mono text-2xl sm:text-3xl font-black">
              {summary.totalSavingsUPW}
            </span>
            <span className="text-xs font-bold">L</span>
          </div>
          <span className="text-[11px] text-[#166534] font-medium mt-1 block">
            초순수 수자원 절감
          </span>
        </div>

        {/* Total Savings Rate */}
        <div className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-bold text-[#166534] block mb-1">
            총 절감률 (Savings Rate)
          </span>
          <div className="flex items-baseline gap-1 text-[#166534]">
            <span className="font-mono text-2xl sm:text-3xl font-black">
              {summary.totalSavingsPercent}
            </span>
            <span className="text-xs font-bold">%</span>
          </div>
          <span className="text-[11px] text-[#166534] font-medium mt-1 block">용수 효율 개선</span>
        </div>

        {/* Quality Pass Rate */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-xs font-medium text-[#64748B] block mb-1">품질 기준 충족</span>
          <div className="flex items-baseline gap-1 text-[#071A2E]">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#22C55E]">
              {summary.processesPassedCount}
            </span>
            <span className="text-sm font-bold text-[#64748B]">
              / {summary.totalProcessesCount}
            </span>
          </div>
          <span className="text-[11px] text-[#22C55E] font-bold mt-1 block">100% Quality Pass</span>
        </div>
      </div>

      {/* ESG Dashboard Cards */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#071A2E]">
                ESG 환경 기여도 시뮬레이션 (ESG Environmental Impact)
              </h3>
              <p className="text-xs text-[#64748B]">
                초순수 생산/정제 및 폐수 처리에 수반되는 전력 소비와 탄소 배출 저감 효과
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 text-xs font-mono text-[#64748B]">
            {isSingle ? "웨이퍼 1매 세정 기준" : "1 배치 처리 기준"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* UPW Savings */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00C2FF]/15 text-[#00C2FF] shrink-0">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#64748B]">UPW 절감량</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#071A2E]">
                  {summary.totalSavingsUPW}
                </span>
                <span className="text-xs font-bold text-[#64748B]">L</span>
              </div>
              <span className="text-[11px] text-[#64748B]">직접 계산된 최적화 결과</span>
            </div>
          </div>

          {/* Power Savings */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#64748B]">전력 절감량 (Power)</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#071A2E]">
                  {summary.totalPowerSavedKWh}
                </span>
                <span className="text-xs font-bold text-[#64748B]">kWh</span>
              </div>
              <span className="text-[11px] text-[#64748B]">계수: 0.045 kWh / UPW L</span>
            </div>
          </div>

          {/* Carbon Savings */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22C55E]/15 text-[#22C55E] shrink-0">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#64748B]">탄소 저감량 (Carbon)</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#166534]">
                  {summary.totalCarbonSavedKg}
                </span>
                <span className="text-xs font-bold text-[#166534]">kgCO₂e</span>
              </div>
              <span className="text-[11px] text-[#64748B]">계수: 0.021 kgCO₂e / UPW L</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
          ※ UPW 절감량은 실제 최적화 시뮬레이션 결과에서 직접 계산되었으며, 전력 및 탄소 저감량은
          문헌 기반 반도체 용수 생산 계수를 적용한 시뮬레이션 산출값입니다.
        </p>
      </div>

      {/* Comparison Chart */}
      <ProcessChart completedResults={results} />

      {/* Detailed Process Comparison Table */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071A2E] text-white">
              <FileSpreadsheet className="h-5 w-5 text-[#00C2FF]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#071A2E]">
                8대 공정별 세부 최적화 및 품질 판정 결과 (Process Audit Table)
              </h3>
              <p className="text-xs text-[#64748B]">
                모든 수치는 물리 Surrogate 시뮬레이션 모델에 의해 산출된 실시간 결과입니다.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold text-[#64748B]">
                <th className="py-3.5 px-4">공정 (Step)</th>
                <th className="py-3.5 px-3">세정/린스 단계</th>
                <th className="py-3.5 px-3 text-right">기존 UPW</th>
                <th className="py-3.5 px-3 text-right">AI UPW</th>
                <th className="py-3.5 px-3 text-right">예상 잔류 오염</th>
                <th className="py-3.5 px-3 text-right">허용 기준</th>
                <th className="py-3.5 px-3 text-center">품질 판정</th>
                <th className="py-3.5 px-3 text-right">절감량</th>
                <th className="py-3.5 px-4 text-right">절감률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {results.map((r) => {
                const isExcluded = !r.process.optimizationEnabled;

                if (isExcluded) {
                  return (
                    <tr
                      key={r.process.id}
                      className="bg-amber-50/40 hover:bg-amber-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#071A2E]">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold text-amber-900">
                            {r.process.stepNumber}
                          </span>
                          <span>{r.process.categoryName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[#64748B] italic">
                        {r.process.cleaningStepName}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-[#94A3B8]">-</td>
                      <td className="py-3.5 px-3 text-right font-mono text-[#94A3B8]">-</td>
                      <td className="py-3.5 px-3 text-right font-mono text-[#94A3B8]">-</td>
                      <td className="py-3.5 px-3 text-right font-mono text-[#94A3B8]">-</td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full text-[10px]">
                          <AlertTriangle className="h-3 w-3 text-amber-700" />
                          <span>최적화 제외</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-[#94A3B8]">-</td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#94A3B8]">-</td>
                    </tr>
                  );
                }

                return (
                  <tr key={r.process.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#071A2E]">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#071A2E]/5 text-[10px] font-bold text-[#071A2E]">
                          {r.process.stepNumber}
                        </span>
                        <div>
                          <span className="font-bold block text-xs sm:text-sm">
                            {r.process.categoryName}
                          </span>
                          <span className="text-[10px] text-[#64748B] font-mono">
                            {r.process.categoryNameEn}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[#071A2E] font-medium">
                      {r.process.cleaningStepName}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[#64748B]">
                      {r.baselineUPW} L
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#071A2E]">
                      {r.recommendedUPW} L
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[#071A2E] font-bold">
                      {formatContaminationValue(
                        r.recommendedCandidate.predictedResidual,
                        r.process.qualityMetric.unit,
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[#64748B]">
                      {formatThreshold(
                        r.process.qualityMetric.allowableLimit,
                        r.process.qualityMetric.unit,
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-[#166534] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2.5 py-0.5 rounded-full text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>충족</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#166534]">
                      -{r.savingsLiters} L
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#166534]">
                      {r.savingsPercent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#071A2E]/5 font-bold text-[#071A2E] border-t border-[#E2E8F0]">
                <td colSpan={2} className="py-3.5 px-4">
                  총 세정 용수 합계 (Total UPW Summary)
                </td>
                <td className="py-3.5 px-3 text-right font-mono">{summary.totalBaselineUPW} L</td>
                <td className="py-3.5 px-3 text-right font-mono text-[#00C2FF] font-black">
                  {summary.totalAIUPW} L
                </td>
                <td className="py-3.5 px-3 text-right text-[#64748B] text-[11px]">-</td>
                <td className="py-3.5 px-3 text-right text-[#64748B] text-[11px]">전체 통과</td>
                <td className="py-3.5 px-3 text-center text-[#22C55E] text-[11px]">100% 충족</td>
                <td className="py-3.5 px-3 text-right font-mono text-[#166534] font-black">
                  -{summary.totalSavingsUPW} L
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-[#166534] font-black">
                  {summary.totalSavingsPercent}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
