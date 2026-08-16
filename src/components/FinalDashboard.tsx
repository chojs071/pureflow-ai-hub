import React from 'react';
import {
  ShieldCheck,
  Droplets,
  Zap,
  Leaf,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingDown,
  Layers,
  FileSpreadsheet,
  Award,
  Sparkles,
} from 'lucide-react';
import { ProcessResult, WaferDiameter } from '../types';
import { calculateESGSummary, formatScientific, formatThreshold } from '../utils/model';
import { ProcessChart } from './ProcessChart';

interface FinalDashboardProps {
  waferDiameter: WaferDiameter;
  results: ProcessResult[];
  onRestart: () => void;
  onOpenFormula: () => void;
  onChangeWafer: (wafer: WaferDiameter) => void;
}

export const FinalDashboard: React.FC<FinalDashboardProps> = ({
  waferDiameter,
  results,
  onRestart,
  onOpenFormula,
  onChangeWafer,
}) => {
  const summary = calculateESGSummary(results);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#071A2E] text-sm sm:text-base">
            {waferDiameter} 최종 최적화 분석 리포트
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-[#166534] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-0.5 rounded-full text-[11px]">
            <CheckCircle2 className="h-3 w-3" />
            <span>전 공정 품질 기준 통과</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-[#071A2E] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#64748B]" />
            <span>처음부터 재시뮬레이션</span>
          </button>
          <button
            onClick={() => onChangeWafer(waferDiameter === '300mm' ? '200mm' : '300mm')}
            className="flex items-center gap-1.5 rounded-lg bg-[#00C2FF] hover:bg-[#00B0E8] text-[#071A2E] px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span>{waferDiameter === '300mm' ? '200mm 웨이퍼 최적화' : '300mm 웨이퍼 최적화'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Quality Gate Guarantee Card */}
      <div className="rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E] text-white shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#166534]">
              품질 검증 요약: {summary.processesPassedCount} / {summary.totalProcessesCount} 공정 품질 기준 통과 (100%)
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#166534] mt-0.5">
              <span>✓ 전 공정 허용 잔류 오염 기준(R_pred ≤ Gate) 충족</span>
              <span>✓ 품질 기준 미충족 조건 자동 제외</span>
            </div>
          </div>
        </div>
        <button
          onClick={onOpenFormula}
          className="text-xs font-bold text-[#166534] hover:underline flex items-center gap-1 shrink-0"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Surrogate 수식 확인</span>
        </button>
      </div>

      {/* Core Key Metric Cards (Section 17) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Baseline UPW */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-medium text-[#64748B] block mb-1">
            기존 총 UPW
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-[#64748B]">
              {summary.totalBaselineUPW}
            </span>
            <span className="text-xs font-bold text-[#64748B]">L</span>
          </div>
          <span className="text-[10px] text-[#94A3B8] mt-1 block">
            {summary.totalProcessesCount}개 세정 공정 합계
          </span>
        </div>

        {/* AI Optimized UPW */}
        <div className="rounded-xl border-2 border-[#00C2FF] bg-[#00C2FF]/5 p-4 shadow-xs ring-1 ring-[#00C2FF]/20">
          <span className="text-[11px] font-bold text-[#071A2E] block mb-1">
            AI 최적화 UPW
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-[#071A2E]">
              {summary.totalAIUPW}
            </span>
            <span className="text-xs font-bold text-[#071A2E]">L</span>
          </div>
          <span className="text-[10px] text-[#00C2FF] font-semibold mt-1 block">
            품질 통과 최소 조건
          </span>
        </div>

        {/* Total UPW Savings */}
        <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-[#166534] block mb-1">
            총 UPW 절감량
          </span>
          <div className="flex items-baseline gap-1 text-[#166534]">
            <span className="font-mono text-2xl font-black">
              {summary.totalSavingsUPW}
            </span>
            <span className="text-xs font-bold">L</span>
          </div>
          <span className="text-[10px] text-[#166534] font-medium mt-1 block">
            웨이퍼 1매당 절감 수량
          </span>
        </div>

        {/* Total Savings Rate */}
        <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-[#166534] block mb-1">
            총 절감률 (Savings Rate)
          </span>
          <div className="flex items-baseline gap-1 text-[#166534]">
            <span className="font-mono text-2xl font-black">
              {summary.totalSavingsPercent}
            </span>
            <span className="text-xs font-bold">%</span>
          </div>
          <span className="text-[10px] text-[#166534] font-medium mt-1 block">
            전체 UPW 사용 효율 개선
          </span>
        </div>

        {/* Quality Pass Rate */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-medium text-[#64748B] block mb-1">
            품질 기준 충족
          </span>
          <div className="flex items-baseline gap-1 text-[#071A2E]">
            <span className="font-mono text-2xl font-black text-[#22C55E]">
              {summary.processesPassedCount}
            </span>
            <span className="text-sm font-bold text-[#64748B]">/ {summary.totalProcessesCount}</span>
          </div>
          <span className="text-[10px] text-[#22C55E] font-bold mt-1 block">
            100% Quality Pass
          </span>
        </div>
      </div>

      {/* ESG Dashboard Cards (Section 18) */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
              <Leaf className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#071A2E]">
                ESG 환경 기여도 시뮬레이션 (ESG Environmental Impact)
              </h3>
              <p className="text-xs text-[#64748B]">
                초순수 생산/정제 및 폐수 처리에 수반되는 전력 소비와 탄소 배출 저감 효과
              </p>
            </div>
          </div>
          <span className="rounded-md bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 text-[11px] font-mono text-[#64748B]">
            기준: 웨이퍼 1매 세정 기준
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* UPW Savings */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00C2FF]/10 text-[#00C2FF] shrink-0">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#64748B]">UPW 절감량</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-xl font-black text-[#071A2E]">
                  {summary.totalSavingsUPW}
                </span>
                <span className="text-xs font-bold text-[#64748B]">L / wafer</span>
              </div>
              <span className="text-[10px] text-[#64748B]">직접 계산된 최적화 결과</span>
            </div>
          </div>

          {/* Power Savings */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#64748B]">전력 절감량 (Power)</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-xl font-black text-[#071A2E]">
                  {summary.totalPowerSavedKWh}
                </span>
                <span className="text-xs font-bold text-[#64748B]">kWh</span>
              </div>
              <span className="text-[10px] text-[#64748B]">계수: 0.045 kWh / UPW L</span>
            </div>
          </div>

          {/* Carbon Savings */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E] shrink-0">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#64748B]">탄소 저감량 (Carbon)</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono text-xl font-black text-[#166534]">
                  {summary.totalCarbonSavedKg}
                </span>
                <span className="text-xs font-bold text-[#166534]">kgCO₂e</span>
              </div>
              <span className="text-[10px] text-[#64748B]">계수: 0.021 kgCO₂e / UPW L</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[#94A3B8] leading-relaxed">
          ※ UPW 절감량은 실제 최적화 시뮬레이션 결과에서 직접 계산되었으며, 전력 및 탄소 저감량은 문헌 기반 반도체 용수 생산 계수를 적용한 시뮬레이션 산출값입니다.
        </p>
      </div>

      {/* Comparison Chart */}
      <ProcessChart completedResults={results} />

      {/* Detailed Process Comparison Table (Section 19) */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#071A2E] text-white">
              <FileSpreadsheet className="h-4 w-4 text-[#00C2FF]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#071A2E]">
                공정별 세부 최적화 및 품질 판정 결과 (Process Audit Table)
              </h3>
              <p className="text-xs text-[#64748B]">
                모든 수치는 Surrogate 시뮬레이션 모델에 의해 산출된 실시간 결과입니다.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold text-[#64748B]">
                <th className="py-3 px-3.5">공정명 (Step)</th>
                <th className="py-3 px-3 text-right">기존 UPW</th>
                <th className="py-3 px-3 text-right">AI UPW</th>
                <th className="py-3 px-3 text-right">예상 잔류 Cu</th>
                <th className="py-3 px-3 text-right">허용 기준</th>
                <th className="py-3 px-3 text-center">품질 판정</th>
                <th className="py-3 px-3 text-right">절감량</th>
                <th className="py-3 px-3.5 text-right">절감률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {results.map((r, idx) => (
                <tr key={r.process.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-3.5 font-medium text-[#071A2E]">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#071A2E]/5 text-[10px] font-bold text-[#071A2E]">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold block">{r.process.name}</span>
                        <span className="text-[10px] text-[#64748B]">{r.process.subName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#64748B]">
                    {r.baselineUPW} L
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#071A2E]">
                    {r.recommendedUPW} L
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#071A2E]">
                    {formatScientific(r.recommendedCandidate.predictedResidualCu)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#64748B]">
                    {formatThreshold(r.process.allowableCuAtomsCm2)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-[#166534] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-0.5 rounded-full text-[10px]">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>충족</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#166534]">
                    -{r.savingsLiters} L
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-[#166534]">
                    {r.savingsPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#071A2E]/5 font-bold text-[#071A2E] border-t border-[#E2E8F0]">
                <td className="py-3 px-3.5">총 합계 (Total Summary)</td>
                <td className="py-3 px-3 text-right font-mono">{summary.totalBaselineUPW} L</td>
                <td className="py-3 px-3 text-right font-mono text-[#00C2FF]">{summary.totalAIUPW} L</td>
                <td className="py-3 px-3 text-right text-[#64748B] text-[10px]">-</td>
                <td className="py-3 px-3 text-right text-[#64748B] text-[10px]">전체 통과</td>
                <td className="py-3 px-3 text-center text-[#22C55E] text-[10px]">100% 충족</td>
                <td className="py-3 px-3 text-right font-mono text-[#166534]">-{summary.totalSavingsUPW} L</td>
                <td className="py-3 px-3.5 text-right font-mono text-[#166534]">{summary.totalSavingsPercent}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
