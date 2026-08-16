import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Waves,
  Disc,
  Flame,
  Sun,
  Zap,
  Layers,
  Cpu,
  ShieldAlert,
  Package,
  AlertTriangle,
  Sliders,
} from "lucide-react";
import {
  CleaningMode,
  WaferConfig,
  WaferDiameterInch,
  WaferType,
  ProcessCategoryId,
} from "../types";
import { PROCESS_CATEGORIES } from "../data/processes";
import { validateBatchSize, getBatchSizeErrorMessage } from "../utils/validation";
import { BatchSizeSelector } from "./BatchSizeSelector";
import { WaferDiameterSelector } from "./WaferDiameterSelector";
import { WaferTypeSelector } from "./WaferTypeSelector";

interface StartScreenProps {
  cleaningMode: CleaningMode;
  onSelectCleaningMode: (mode: CleaningMode) => void;
  batchSize?: number;
  onSelectBatchSize: (batchSize: number | undefined) => void;
  wafer: WaferConfig;
  onSelectWaferDiameter: (diameterInch: WaferDiameterInch, diameterMm: number) => void;
  onSelectWaferType: (waferType: WaferType) => void;
  selectedCategoryId: ProcessCategoryId;
  onSelectCategoryId: (id: ProcessCategoryId) => void;
  selectedStepId: string;
  onSelectStepId: (stepId: string) => void;
  onStart: () => void;
  onOpenFormula: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  cleaningMode,
  onSelectCleaningMode,
  batchSize = 50,
  onSelectBatchSize,
  wafer,
  onSelectWaferDiameter,
  onSelectWaferType,
  selectedCategoryId,
  onSelectCategoryId,
  selectedStepId,
  onSelectStepId,
  onStart,
  onOpenFormula,
}) => {
  const currentCategory =
    PROCESS_CATEGORIES.find((c) => c.id === selectedCategoryId) || PROCESS_CATEGORIES[0];

  // Find currently selected cleaning step inside this category
  const currentStep =
    currentCategory.cleaningSteps.find((s) => s.id === selectedStepId) ||
    currentCategory.cleaningSteps[0] ||
    null;

  const isBatchMode = cleaningMode === "batch";
  const isBatchValid = !isBatchMode || validateBatchSize(batchSize);
  const isStartDisabled = !isBatchValid;
  const batchErrorMessage =
    isBatchMode && !isBatchValid ? getBatchSizeErrorMessage(batchSize) : null;

  const getProcessIcon = (id: ProcessCategoryId, isSelected: boolean) => {
    const className = `h-5 w-5 ${isSelected ? "text-[#00C2FF]" : "text-[#64748B]"}`;
    switch (id) {
      case "wafer-mfg":
        return <Disc className={className} />;
      case "oxidation":
        return <Flame className={className} />;
      case "photo":
        return <Sun className={className} />;
      case "etching":
        return <Zap className={className} />;
      case "deposition":
        return <Layers className={className} />;
      case "metal":
        return <Cpu className={className} />;
      case "eds":
        return <ShieldAlert className={className} />;
      case "packaging":
        return <Package className={className} />;
      default:
        return <Disc className={className} />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="my-auto space-y-8">
        {/* Main Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-10 lg:p-12 shadow-md text-center relative overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[#00C2FF]/12 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#071A2E]/5 blur-3xl pointer-events-none" />

          {/* System Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#00C2FF]/40 bg-[#00C2FF]/10 px-5 py-1.5 text-xs sm:text-sm font-bold text-[#071A2E] mb-5">
            <Sparkles className="h-4 w-4 text-[#00C2FF]" />
            <span>반도체 8대 공정 초순수(UPW) 품질 보존 최적화 시스템</span>
          </div>

          <h1 className="text-3xl sm:5xl lg:text-6xl font-black tracking-tight text-[#071A2E] mb-2">
            PureFlow AI
          </h1>

          <p className="text-base sm:text-lg font-semibold text-[#64748B] mb-8">
            세정 방식 · 8대 공정 세정 단계 · 웨이퍼 직경 및 종류 기반 초순수 최적화 surrogate 모델
          </p>

          {/* Main Selection Workflow */}
          <div className="max-w-4xl mx-auto space-y-7 text-left">
            {/* Step ①: 세정 방식 (Cleaning Mode) */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#071A2E] flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00C2FF] text-white text-[11px] font-bold">
                    1
                  </span>
                  <span>세정 방식 선택 (Cleaning Mode)</span>
                </label>
                <span className="text-[11px] font-semibold text-[#64748B]">
                  {cleaningMode === "single" ? "매엽식 단일 웨이퍼 모델" : "배치식 침적 수조 모델"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Single Wafer */}
                <button
                  type="button"
                  id="mode-single"
                  onClick={() => onSelectCleaningMode("single")}
                  className={`relative flex items-start gap-3.5 rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer text-left focus:outline-none ${
                    cleaningMode === "single"
                      ? "border-[#00C2FF] bg-[#00C2FF]/10 text-[#071A2E] shadow-xs ring-1 ring-[#00C2FF]"
                      : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${
                      cleaningMode === "single"
                        ? "border-[#00C2FF] bg-white text-[#00C2FF]"
                        : "border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B]"
                    }`}
                  >
                    <Disc className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-[#071A2E]">매엽식</span>
                      <span className="font-mono text-xs font-semibold text-[#64748B]">
                        Single Wafer
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                      한 장의 웨이퍼를 개별 챔버에서 고속 회전 및 직접 노즐 린스 세정
                    </p>
                  </div>
                  {cleaningMode === "single" && (
                    <span className="absolute top-3.5 right-3.5 flex h-2.5 w-2.5 rounded-full bg-[#00C2FF]" />
                  )}
                </button>

                {/* Batch */}
                <button
                  type="button"
                  id="mode-batch"
                  onClick={() => onSelectCleaningMode("batch")}
                  className={`relative flex items-start gap-3.5 rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer text-left focus:outline-none ${
                    cleaningMode === "batch"
                      ? "border-[#00C2FF] bg-[#00C2FF]/10 text-[#071A2E] shadow-xs ring-1 ring-[#00C2FF]"
                      : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${
                      cleaningMode === "batch"
                        ? "border-[#00C2FF] bg-white text-[#00C2FF]"
                        : "border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B]"
                    }`}
                  >
                    <Waves className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-[#071A2E]">배치식</span>
                      <span className="font-mono text-xs font-semibold text-[#64748B]">
                        Batch Immersion
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                      다수의 웨이퍼를 대용량 Bath 및 오버플로우 수조에서 동시 침적 세정
                    </p>
                  </div>
                  {cleaningMode === "batch" && (
                    <span className="absolute top-3.5 right-3.5 flex h-2.5 w-2.5 rounded-full bg-[#00C2FF]" />
                  )}
                </button>
              </div>

              {/* Batch Size Selector (Condition: Only shown when Batch mode is selected) */}
              <AnimatePresence>
                {isBatchMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden pt-2"
                  >
                    <BatchSizeSelector
                      value={batchSize}
                      onChange={onSelectBatchSize}
                      min={1}
                      max={currentCategory.batchCapacity || 100}
                      presets={[25, 50, 100]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step ②: 반도체 8대 공정 선택 (Semiconductor 8 Major Processes Grid) */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3.5">
                <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#071A2E] flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00C2FF] text-white text-[11px] font-bold">
                    2
                  </span>
                  <span>반도체 8대 공정 선택 (SEMICONDUCTOR 8 MAJOR PROCESSES)</span>
                </label>
                <span className="text-[11px] font-semibold text-[#64748B]">
                  {currentCategory.stepNumber}. {currentCategory.name}
                </span>
              </div>

              {/* 8-Process Equal Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PROCESS_CATEGORIES.map((cat) => {
                  const isSelected = cat.id === selectedCategoryId;
                  const isExcluded = !cat.optimizationEnabled;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      id={`process-category-${cat.id}`}
                      onClick={() => {
                        onSelectCategoryId(cat.id);
                        if (cat.cleaningSteps.length > 0) {
                          onSelectStepId(cat.cleaningSteps[0].id);
                        }
                      }}
                      className={`relative flex flex-col items-start p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left focus:outline-none ${
                        isSelected
                          ? "border-[#00C2FF] bg-[#00C2FF]/10 text-[#071A2E] ring-1 ring-[#00C2FF] shadow-xs"
                          : isExcluded
                            ? "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]"
                            : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#071A2E]">
                          {cat.stepNumber}
                        </span>
                        {getProcessIcon(cat.id, isSelected)}
                      </div>

                      <div className="w-full">
                        <span className="text-sm font-black text-[#071A2E] truncate block">
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-[#64748B] block truncate font-mono mt-0.5">
                          {cat.nameEn}
                        </span>
                      </div>

                      {/* Equal Functional Status Badge */}
                      <div className="mt-3 w-full">
                        {isExcluded ? (
                          <span className="inline-block rounded-md bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1] px-2 py-0.5 text-[10px] font-bold">
                            UPW 최적화 제외
                          </span>
                        ) : (
                          <span className="inline-block rounded-md bg-[#00C2FF]/15 text-[#071A2E] border border-[#00C2FF]/30 px-2 py-0.5 text-[10px] font-bold">
                            UPW 세정 최적화
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <span className="absolute top-3.5 right-3.5 flex h-2 w-2 rounded-full bg-[#00C2FF]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Step Selection & Process Detail Panel */}
              <div className="mt-5 rounded-2xl bg-white border border-[#E2E8F0] p-5 text-xs space-y-4">
                {currentCategory.optimizationEnabled && currentStep ? (
                  <>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#071A2E] text-[#00C2FF] text-xs font-bold">
                          {currentCategory.stepNumber}
                        </span>
                        <div>
                          <span className="text-sm font-black text-[#071A2E]">
                            현재 선택 공정: {currentCategory.name} ({currentCategory.nameEn})
                          </span>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            {currentCategory.shortDesc}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] bg-[#059669]/10 px-2.5 py-1 rounded-full border border-[#059669]/20 self-start sm:self-auto">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>UPW 세정 최적화 대상</span>
                      </span>
                    </div>

                    {/* Step Sub-Selection: 세정·린스 단계 선택 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#071A2E] text-xs flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-[#00C2FF]" />
                          <span>
                            적용 가능한 세정·린스 단계 선택 ({currentCategory.cleaningSteps.length}
                            개)
                          </span>
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          클릭하여 최적화할 세정 단계를 변경할 수 있습니다
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {currentCategory.cleaningSteps.map((step) => {
                          const isStepSelected = step.id === currentStep.id;
                          return (
                            <button
                              key={step.id}
                              type="button"
                              onClick={() => onSelectStepId(step.id)}
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                isStepSelected
                                  ? "bg-[#071A2E] text-[#00C2FF] border-[#071A2E] shadow-xs"
                                  : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#071A2E] hover:border-[#CBD5E1]"
                              }`}
                            >
                              <span>{step.name}</span>
                              {isStepSelected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#00C2FF]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step Details Grid (Contaminants, Quality Gate, Literature Basis) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                      {/* 1. Contaminants */}
                      <div className="rounded-xl bg-[#F8FAFC] p-3.5 border border-[#E2E8F0] space-y-2">
                        <span className="font-bold text-[#071A2E] block text-[11px]">
                          주요 관리 대상 오염물
                        </span>
                        <ul className="space-y-1 text-[11px] text-[#64748B]">
                          {currentStep.contaminants.map((c, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#00C2FF] font-bold">•</span>
                              <span className="text-[#071A2E] font-medium">{c.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 2. Quality Metric & Gate Limit */}
                      <div className="rounded-xl bg-[#F8FAFC] p-3.5 border border-[#E2E8F0] space-y-2">
                        <span className="font-bold text-[#071A2E] block text-[11px]">
                          품질 측정 지표 및 허용 기준
                        </span>
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-[#071A2E]">
                            {currentStep.qualityMetric.name}
                          </div>
                          <div className="inline-block px-2 py-0.5 rounded-md bg-[#22C55E]/15 text-[#166534] font-mono text-[11px] font-bold border border-[#22C55E]/30">
                            허용 기준: {currentStep.qualityMetric.allowableLimit}{" "}
                            {currentStep.qualityMetric.unit} 이하
                          </div>
                          <p className="text-[10px] text-[#64748B] leading-tight pt-1">
                            {currentStep.qualityMetric.description}
                          </p>
                        </div>
                      </div>

                      {/* 3. Literature Basis vs Simulation Parameters */}
                      <div className="rounded-xl bg-[#F8FAFC] p-3.5 border border-[#E2E8F0] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#071A2E] block text-[11px]">
                            문헌 근거 & 변수 구분
                          </span>
                          <span className="font-mono text-[10px] text-[#00C2FF] font-bold">
                            {currentStep.references[0]?.id || "Literature"}
                          </span>
                        </div>
                        <div className="text-[10px] space-y-1.5">
                          <div>
                            <span className="text-[#071A2E] font-bold">✓ 문헌 기반 변수:</span>
                            <p className="text-[#64748B]">
                              {currentStep.literatureVariables.join(", ")}
                            </p>
                          </div>
                          <div>
                            <span className="text-[#64748B] font-bold">⚙ 시뮬레이션 계수:</span>
                            <p className="text-[#94A3B8] font-mono">K, α, β, γ, R_floor</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* EDS Exclusion Notice */
                  <div className="p-4 space-y-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                      <span>7. EDS (Electrical Die Sorting) — UPW 최적화 제외 안내</span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      EDS는 웨이퍼 상태에서 완성된 개별 칩의 전기적 특성 및 수율을 프로빙하는{" "}
                      <strong>전기적 특성 검사 중심 공정</strong>입니다. 습식 세정 및 초순수(UPW)를
                      사용하지 않으므로 <strong>PureFlow AI의 UPW 세정 최적화 대상에서 제외</strong>
                      됩니다.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-amber-200 text-xs">
                      <span className="text-amber-800 font-medium">
                        ※ EDS에는 임의의 가상 세정 단계나 UPW 절감량을 생성하지 않습니다.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategoryId("etching");
                          onSelectStepId("post-etch-clean");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-200 text-amber-950 font-bold hover:bg-amber-300 cursor-pointer self-start sm:self-auto"
                      >
                        다른 세정 공정 선택하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step ③: 웨이퍼 직경 선택 (Wafer Diameter Selector: 2" ~ 12") */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6">
              <WaferDiameterSelector value={wafer.diameterInch} onChange={onSelectWaferDiameter} />
            </div>

            {/* Step ④: 웨이퍼 종류 선택 (Wafer Type Selector: Polished, Epitaxial, SOI) */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6">
              <WaferTypeSelector value={wafer.waferType} onChange={onSelectWaferType} />
            </div>
          </div>

          {/* Strict Core Principle Value Box */}
          <div className="max-w-3xl mx-auto rounded-2xl bg-[#071A2E] text-white p-6 sm:p-7 mt-8 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[#00C2FF]/10 blur-xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00C2FF] mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>품질 우선 최적화 원칙 (Quality Gate First)</span>
              </div>
              <p className="text-xl sm:text-2xl font-black leading-snug">
                품질을 먼저 검증하고,
                <br />
                <span className="text-[#00C2FF]">합격한 조건 중에서만 UPW를 최소화합니다.</span>
              </p>
              <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto pt-1 leading-relaxed">
                공정별 물리적 허용 잔류 오염 기준을 통과하지 못한 조건은 추천 대상에서 즉시
                제외됩니다.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="max-w-xl mx-auto mt-8">
            <button
              type="button"
              id="start-optimization-btn"
              disabled={isStartDisabled}
              onClick={onStart}
              className={`w-full flex items-center justify-center gap-3 rounded-2xl py-5 px-8 text-lg font-black transition-all shadow-md ${
                !isStartDisabled
                  ? "bg-[#00C2FF] text-white hover:bg-[#00B0E8] hover:shadow-xl active:scale-[0.99] cursor-pointer"
                  : "bg-[#CBD5E1] text-[#64748B] cursor-not-allowed shadow-none"
              }`}
            >
              <span>AI 최적화 시작 (8대 공정 분석)</span>
              <ArrowRight className="h-6 w-6" />
            </button>
            {isBatchMode && !isBatchValid && (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-bold text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>
                  {batchErrorMessage ||
                    "유효한 1회 처리 웨이퍼 수(1~100매 정수)를 입력해야 AI 최적화를 시작할 수 있습니다."}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <footer className="mt-8 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
          <span>반도체 8대 공정 세정 학술 논문 및 산업 물리 수식 모델 탑재</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenFormula}
            className="hover:text-[#071A2E] underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>수식 및 문헌 근거 상세 보기</span>
          </button>
          <span>PureFlow AI v3.0 (8-Process Multi-Engine)</span>
        </div>
      </footer>
    </div>
  );
};
