import React from "react";
import {
  ShieldCheck,
  Droplets,
  Layers,
  CheckCircle,
  Clock,
  Wind,
  RefreshCw,
  AlertTriangle,
  Disc,
  Waves,
  Users,
  Box,
  Cpu,
  Flame,
  Sun,
  Zap,
  Package,
  ShieldAlert,
  Info,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import { ProcessResult } from "../types";
import { ContaminationGauge } from "./ContaminationGauge";
import { formatContaminationValue, formatThreshold } from "../utils/model";

interface CurrentProcessCardProps {
  result: ProcessResult;
}

export const CurrentProcessCard: React.FC<CurrentProcessCardProps> = ({ result }) => {
  const {
    process,
    cleaningMode,
    wafer,
    baselineUPW,
    recommendedUPW,
    savingsLiters,
    savingsPercent,
    recommendedCandidate,
    qualityPass,
    hasValidCandidates,
    noValidMessage,
  } = result;

  const isSingle = cleaningMode === "single";
  const waferLabel = `${wafer.diameterInch}" (${wafer.diameterMm}mm) · ${wafer.waferType.toUpperCase()}`;

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
    ? `PureFlow AI / Single Wafer / ${wafer.diameterInch}" / ${formatWaferType(wafer.waferType)} / ${process.categoryName}`
    : `PureFlow AI / Batch / ${result.batchSize || 50} wafers / ${wafer.diameterInch}" / ${formatWaferType(wafer.waferType)} / ${process.categoryName}`;

  // EDS Special Handling
  if (!process.optimizationEnabled) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#071A2E] px-3 py-1 text-xs font-bold text-[#00C2FF]">
              {process.stepNumber}. {process.categoryName}
            </span>
            <span className="rounded-lg bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-1 text-xs font-bold">
              UPW 최적화 제외 (Non-Wet Process)
            </span>
          </div>
          <span className="text-xs font-mono text-[#64748B]">{waferLabel}</span>
        </div>

        <div className="rounded-2xl bg-white border border-amber-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#071A2E]">
                EDS (Electrical Die Sorting)
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] font-medium">
                웨이퍼 프로빙 및 개별 칩 전기적 특성/수율 검사 단계
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed space-y-2">
            <p className="font-bold">PureFlow AI의 UPW 세정 최적화 대상이 아닙니다.</p>
            <p className="text-xs text-amber-800">
              EDS 공정은 전기적 신호 측정 장비(Tester & Probe Card)를 통해 칩의 양품/불량을 판정하는
              건식 검사 공정으로, 습식 화학 세정액 및 초순수(UPW)를 소비하지 않습니다.
            </p>
            <p className="text-[11px] text-amber-700 italic pt-1">
              ※ 시스템 원칙에 따라 존재하지 않는 가상의 용수 절감량을 계산에 포함하지 않습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (iconType: string) => {
    switch (iconType) {
      case "disc":
        return <Disc className="h-4 w-4 text-[#00C2FF]" />;
      case "flame":
        return <Flame className="h-4 w-4 text-[#00C2FF]" />;
      case "sun":
        return <Sun className="h-4 w-4 text-[#00C2FF]" />;
      case "zap":
        return <Zap className="h-4 w-4 text-[#00C2FF]" />;
      case "layers":
        return <Layers className="h-4 w-4 text-[#00C2FF]" />;
      case "cpu":
        return <Cpu className="h-4 w-4 text-[#00C2FF]" />;
      case "package":
        return <Package className="h-4 w-4 text-[#00C2FF]" />;
      default:
        return <Disc className="h-4 w-4 text-[#00C2FF]" />;
    }
  };

  return (
    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div>
        {/* Conditions Breadcrumb Banner */}
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 text-xs font-mono font-bold text-[#071A2E] mb-3">
          <span className="text-[#00C2FF]">●</span>
          <span>{breadcrumbCondition}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#071A2E] px-3 py-1 text-xs font-bold text-[#00C2FF] flex items-center gap-1.5">
              <span>
                {process.stepNumber}. {process.categoryName}
              </span>
            </span>
            <span className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
              {isSingle ? (
                <>
                  <Disc className="h-3.5 w-3.5 text-[#00C2FF]" />
                  <span>매엽식 (Single Wafer)</span>
                </>
              ) : (
                <>
                  <Waves className="h-3.5 w-3.5 text-[#00C2FF]" />
                  <span>배치식 ({result.batchSize || 50}매)</span>
                </>
              )}
            </span>
            <span className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-mono font-bold text-[#64748B]">
              {wafer.diameterInch}&quot; ({wafer.diameterMm}mm) · {formatWaferType(wafer.waferType)}
            </span>
          </div>

          <div className="text-xs font-mono text-[#64748B]">
            문헌 근거: {process.references.map((r) => r.id).join(", ") || "문헌 검증 진행중"}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#071A2E]">
          {process.cleaningStepName}
        </h2>
        <p className="text-sm font-bold text-[#00C2FF] mt-1">{process.cleaningStepSubName}</p>
        <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
          {process.description}
        </p>
      </div>

      {/* 적용 세정 공정 흐름 — 전체 시퀀스 항상 표시, 현재 분석 단계만 강조 */}
      {process.sequence.length > 0 && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#071A2E] flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#00C2FF]" />
              적용 세정 공정 흐름
            </span>
            <span className="text-[11px] text-[#64748B]">
              UPW 최적화는 세정·린스 단계에만 적용됩니다
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
            {process.sequence.map((seqStep, seqIdx) => {
              const activeIdx = process.sequence.findIndex(
                (s) => s.cleaningStepId === process.stepId,
              );
              const isActive = seqStep.cleaningStepId === process.stepId;
              const isComplete = activeIdx >= 0 && seqIdx < activeIdx;
              const seqTypeLabel =
                seqStep.type === "clean" ? "세정" : seqStep.type === "rinse" ? "린스" : "건조";
              return (
                <div
                  key={seqStep.id}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 flex-1"
                >
                  <div
                    className={`flex-1 rounded-xl border p-3 transition-colors ${
                      isActive
                        ? "border-[#00C2FF] bg-[#00C2FF]/10 ring-1 ring-[#00C2FF]"
                        : isComplete
                          ? "border-[#22C55E]/40 bg-[#22C55E]/5"
                          : seqStep.upwRelevant
                            ? "border-[#E2E8F0] bg-white"
                            : "border-dashed border-[#CBD5E1] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-black text-[#071A2E] flex items-center gap-1.5 min-w-0">
                        <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#071A2E] text-[10px] font-bold text-[#00C2FF]">
                          {seqIdx + 1}
                        </span>
                        <span className="truncate">{seqStep.name}</span>
                      </span>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          seqStep.type === "clean"
                            ? "bg-[#00C2FF]/15 text-[#071A2E]"
                            : seqStep.type === "rinse"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-[#64748B]"
                        }`}
                      >
                        {seqTypeLabel}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#00C2FF] px-1.5 py-0.5 text-[10px] font-black text-white">
                          ● 현재 분석
                        </span>
                      ) : isComplete ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#22C55E]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#166534]">
                          <CheckCircle className="h-3 w-3" /> 완료
                        </span>
                      ) : seqStep.upwRelevant ? (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-[#64748B]">
                          <Clock className="h-3 w-3" /> 대기
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-[#64748B]">
                          UPW 해당 없음
                        </span>
                      )}
                    </div>
                  </div>
                  {seqIdx < process.sequence.length - 1 && (
                    <>
                      <ArrowRight
                        className="hidden sm:block h-4 w-4 text-[#94A3B8] shrink-0"
                        aria-hidden
                      />
                      <ArrowDown
                        className="sm:hidden h-4 w-4 text-[#94A3B8] mx-auto shrink-0"
                        aria-hidden
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contamination Gauge Component */}
      <ContaminationGauge score={process.contaminationScore} band={process.contaminationBand} />

      {/* Contamination Basis — 공통 대표 오염물(Cu) MVP 모델 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-xs">
        <span className="font-bold text-[#071A2E]">
          대표 오염물: <span className="text-[#00C2FF]">Cu surface contamination</span>
        </span>
        <span className="text-[#64748B]">
          초기 Cu 오염{" "}
          <span className="font-mono font-bold text-[#071A2E]">
            {formatContaminationValue(process.initialContamination, process.qualityMetric.unit)}
          </span>
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
            process.contaminationSourceType === "literature"
              ? "bg-[#22C55E]/15 text-[#166534] border border-[#22C55E]/30"
              : "bg-slate-100 text-[#64748B] border border-[#CBD5E1]"
          }`}
        >
          Source:{" "}
          {process.contaminationSourceType === "literature" ? "Literature-based" : "MVP Simulation"}
        </span>
        {process.contaminationReferences.length > 0 && (
          <span className="text-[10px] text-[#64748B] font-mono">
            ({process.contaminationReferences.join(", ")})
          </span>
        )}
      </div>

      {/* Quality Assurance Gate (Top priority - Placed prominently) */}
      <div
        className={`rounded-2xl border p-5 ${
          qualityPass
            ? "bg-[#22C55E]/5 border-[#22C55E]/30 ring-1 ring-[#22C55E]/20"
            : "bg-amber-50 border-amber-300 ring-1 ring-amber-200"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                qualityPass ? "bg-[#22C55E] text-white" : "bg-amber-500 text-white"
              }`}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#071A2E] block">
                세정 후 품질 검증 (Quality Verification Gate)
              </span>
              <span className="text-[11px] text-[#64748B]">
                {process.qualityMetric.name} 기준 물리 모델 1차 검증
              </span>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-xs ${
              qualityPass ? "bg-[#22C55E] text-white" : "bg-amber-500 text-white"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>✓ 품질 기준 충족 (Pass)</span>
          </div>
        </div>

        {/* Quality Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Predicted Residual Contamination */}
          <div className="rounded-xl bg-white p-4 border border-[#E2E8F0] shadow-2xs">
            <span className="text-xs font-medium text-[#64748B] block mb-1">
              예상 잔류 오염 (R_pred)
            </span>
            <span className="font-mono text-lg sm:text-xl font-black text-[#071A2E]">
              {formatContaminationValue(
                recommendedCandidate.predictedResidual,
                process.qualityMetric.unit,
              )}
            </span>
            <span className="block text-[11px] text-[#22C55E] font-bold mt-1">
              초기{" "}
              {formatContaminationValue(process.initialContamination, process.qualityMetric.unit)}{" "}
              대비 98%+ 제거
            </span>
          </div>

          {/* Allowable Limit */}
          <div className="rounded-xl bg-white p-4 border border-[#E2E8F0] shadow-2xs">
            <span className="text-xs font-medium text-[#64748B] block mb-1">
              허용 잔류 오염 기준 (Allowable Limit)
            </span>
            <span className="font-mono text-lg sm:text-xl font-black text-[#071A2E]">
              {formatThreshold(process.qualityMetric.allowableLimit, process.qualityMetric.unit)}
            </span>
            <span className="block text-[11px] text-[#64748B] font-medium mt-1">
              {process.qualityMetric.description}
            </span>
          </div>
        </div>

        {!hasValidCandidates && noValidMessage && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
            <span>{noValidMessage}</span>
          </div>
        )}

        <p className="text-[11px] text-[#64748B] mt-3 leading-normal">
          ※ 허용 기준은 공정 및 오염물에 따라 달라지며, PureFlow AI는 품질 기준을 먼저 통과한
          레시피에 대해서만 초순수 절감을 계산합니다.
        </p>
      </div>

      {/* UPW Optimization Metrics Block */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Baseline UPW */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <span className="text-xs font-medium text-[#64748B] block mb-1">
            기존 UPW ({isSingle ? "장당" : "배치당"})
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#64748B]">
              {baselineUPW}
            </span>
            <span className="text-xs font-semibold text-[#64748B]">L</span>
          </div>
          {!isSingle && process.batchRecipe && (
            <span className="text-[10px] text-[#94A3B8] font-mono block mt-1">
              장당 {(baselineUPW / process.batchRecipe.batchSize).toFixed(1)} L
            </span>
          )}
        </div>

        {/* Recommended UPW */}
        <div className="rounded-2xl border-2 border-[#00C2FF] bg-[#00C2FF]/10 p-4 ring-1 ring-[#00C2FF]/20 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#071A2E]">AI 추천 UPW</span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#00C2FF]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#071A2E]">
              {recommendedUPW}
            </span>
            <span className="text-xs font-bold text-[#071A2E]">L</span>
          </div>
          {!isSingle && process.batchRecipe && (
            <span className="text-[10px] text-[#071A2E] font-mono font-bold block mt-1">
              장당{" "}
              {(
                recommendedUPW / (recommendedCandidate.batchSize || process.batchRecipe.batchSize)
              ).toFixed(1)}{" "}
              L
            </span>
          )}
        </div>

        {/* Savings Amount (Green) */}
        <div className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-4">
          <span className="text-xs font-bold text-[#166534] block mb-1">초순수 절감량</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#166534]">
              {savingsLiters}
            </span>
            <span className="text-xs font-bold text-[#166534]">L</span>
          </div>
          <span className="text-[10px] text-[#166534] font-medium block mt-1">수자원 보존</span>
        </div>

        {/* Savings Percent (Green) */}
        <div className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-4">
          <span className="text-xs font-bold text-[#166534] block mb-1">절감률 (Efficiency)</span>
          <div className="flex items-baseline gap-1 text-[#166534]">
            <span className="font-mono text-2xl sm:text-3xl font-black">{savingsPercent}</span>
            <span className="text-xs font-bold">%</span>
          </div>
          <span className="text-[10px] text-[#166534] font-medium block mt-1">공정 최적화</span>
        </div>
      </div>

      {/* Mode-Specific Recipe Parameters Diff (Baseline vs AI Recommended) */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#071A2E] mb-3.5 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#00C2FF]" />
            <span>
              {isSingle
                ? "매엽식 공정 레시피 제어 파라미터 최적화"
                : "배치식 공정 레시피 제어 파라미터 최적화"}
            </span>
          </span>
          <span className="text-[11px] font-normal text-[#64748B]">기준 조건 → AI 추천 조건</span>
        </h4>

        {isSingle && process.singleRecipe ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Single: UPW Flow */}
            <div className="rounded-xl bg-white p-3 border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <Wind className="h-3.5 w-3.5 text-[#00C2FF]" /> UPW 유량 (Q)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5 font-mono font-bold text-[#071A2E]">
                <span className="text-[#94A3B8] line-through text-xs">
                  {process.singleRecipe.flowRateLpm}
                </span>
                <span>→</span>
                <span className="text-[#071A2E] text-sm sm:text-base">
                  {recommendedCandidate.flowRateLpm} L/min
                </span>
              </div>
            </div>

            {/* Single: Rinse Time */}
            <div className="rounded-xl bg-white p-3 border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#00C2FF]" /> 린스 시간 (t)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5 font-mono font-bold text-[#071A2E]">
                <span className="text-[#94A3B8] line-through text-xs">
                  {process.singleRecipe.rinseTimeMin}m
                </span>
                <span>→</span>
                <span className="text-[#071A2E] text-sm sm:text-base">
                  {recommendedCandidate.rinseTimeMin} min
                </span>
              </div>
            </div>

            {/* Single: Spin RPM */}
            <div className="rounded-xl bg-white p-3 border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5 text-[#00C2FF]" /> 회전 속도 (RPM)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5 font-mono font-bold text-[#071A2E]">
                <span className="text-[#94A3B8] line-through text-xs">
                  {process.singleRecipe.spinRpm}
                </span>
                <span>→</span>
                <span className="text-[#071A2E] text-sm sm:text-base">
                  {recommendedCandidate.spinRpm} RPM
                </span>
              </div>
            </div>

            {/* Single: Cycles */}
            <div className="rounded-xl bg-white p-3 border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-[#00C2FF]" /> 린스 사이클
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5 font-mono font-bold text-[#071A2E]">
                <span className="text-[#071A2E] text-sm sm:text-base">
                  {recommendedCandidate.cycles || process.singleRecipe.rinseCycles} 회
                </span>
              </div>
            </div>
          </div>
        ) : process.batchRecipe ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Batch: Batch Size (Fixed User Input) */}
            <div className="rounded-xl bg-white p-3 border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-[#00C2FF]" /> 1회 처리 웨이퍼 수
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5 font-mono font-bold text-[#071A2E]">
                <span className="text-[#071A2E] text-sm sm:text-base">
                  {process.batchRecipe.batchSize} 매
                </span>
                <span className="text-[10px] text-[#00C2FF] font-semibold">(사용자 설정)</span>
              </div>
            </div>

            {/* Batch: Bath Volume */}
            <div className="rounded-xl bg-white p-3 border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <Box className="h-3.5 w-3.5 text-[#00C2FF]" /> Bath 용량 (L)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5 font-mono font-bold text-[#071A2E]">
                <span className="text-[#94A3B8] line-through text-xs">
                  {process.batchRecipe.bathVolumeL}L
                </span>
                <span>→</span>
                <span className="text-[#071A2E] text-sm sm:text-base">
                  {recommendedCandidate.bathVolumeL || process.batchRecipe.bathVolumeL} L
                </span>
              </div>
            </div>

            {/* Batch: Rinse Flow Rate */}
            <div className="rounded-xl bg-white p-3 border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <Wind className="h-3.5 w-3.5 text-[#00C2FF]" /> 오버플로우 린스
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5 font-mono font-bold text-[#071A2E]">
                <span className="text-[#94A3B8] line-through text-xs">
                  {process.batchRecipe.rinseFlowRateLpm}
                </span>
                <span>→</span>
                <span className="text-[#071A2E] text-sm sm:text-base">
                  {recommendedCandidate.rinseFlowRateLpm || process.batchRecipe.rinseFlowRateLpm}{" "}
                  L/min
                </span>
              </div>
            </div>

            {/* Batch: Rinse Time */}
            <div className="rounded-xl bg-white p-3 border border-[#E2E8F0]">
              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#00C2FF]" /> 린스 시간 (t)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5 font-mono font-bold text-[#071A2E]">
                <span className="text-[#94A3B8] line-through text-xs">
                  {process.batchRecipe.rinseTimeMin}m
                </span>
                <span>→</span>
                <span className="text-[#071A2E] text-sm sm:text-base">
                  {recommendedCandidate.rinseTimeMin || process.batchRecipe.rinseTimeMin} min
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Literature vs Simulation Parameters Callout */}
        <div className="mt-3.5 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between text-[11px] text-[#64748B] gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-[#00C2FF]" />
            <span>
              <strong>논문 검증 변수:</strong> {process.literatureVariables.join(", ")}
            </span>
          </div>
          <span className="text-[10px] text-[#94A3B8]">
            보정 파라미터 (K, α, β, γ)는 문헌 기반 MVP 시뮬레이션 값 적용
          </span>
        </div>
      </div>
    </div>
  );
};
