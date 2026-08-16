import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AppState,
  ProcessResult,
  WaferConfig,
  WaferDiameterInch,
  WaferType,
  CleaningMode,
  ProcessCategoryId,
  SimulationSettings,
  DEFAULT_SIMULATION_SETTINGS,
} from "./types";
import { buildProcessPipeline } from "./data/processes";
import { generateAndEvaluateCandidates } from "./utils/model";
import { validateBatchSize } from "./utils/validation";
import { Header } from "./components/Header";
import { StartScreen } from "./components/StartScreen";
import { ProcessProgress } from "./components/ProcessProgress";
import { CurrentProcessCard } from "./components/CurrentProcessCard";
import { CandidateTable } from "./components/CandidateTable";
import { ProcessChart } from "./components/ProcessChart";
import { FinalDashboard } from "./components/FinalDashboard";
import { FormulaModal } from "./components/FormulaModal";
import { SettingsModal } from "./components/SettingsModal";
import { ArrowRight, Sparkles, ChevronRight, Play, Pause, Zap } from "lucide-react";

const AUTO_ADVANCE_DURATION_MS = 3800; // 3.8 seconds per process view

export default function App() {
  const [appState, setAppState] = useState<AppState>("START");
  const [cleaningMode, setCleaningMode] = useState<CleaningMode>("single");
  const [batchSize, setBatchSize] = useState<number | undefined>(50);
  const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>(
    DEFAULT_SIMULATION_SETTINGS,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [wafer, setWafer] = useState<WaferConfig>({
    diameterInch: 12,
    diameterMm: 304.8,
    waferType: "polished",
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<ProcessCategoryId>("etching");
  const [selectedSteps, setSelectedSteps] = useState<Record<ProcessCategoryId, string>>({
    "wafer-mfg": "wafer-pre-clean",
    oxidation: "rca-sc1-rinse",
    photo: "post-dev-rinse",
    etching: "post-etch-clean",
    deposition: "pre-dep-clean",
    metal: "cu-post-cmp",
    eds: "eds-probe-step",
    packaging: "pkg-pre-bonding",
  });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isFormulaOpen, setIsFormulaOpen] = useState<boolean>(false);

  // Auto-advance states
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [autoProgress, setAutoProgress] = useState<number>(0);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Results for each completed/active step
  const activeProcesses = useMemo(() => {
    return buildProcessPipeline(cleaningMode, wafer, selectedSteps, batchSize);
  }, [cleaningMode, wafer, selectedSteps, batchSize]);

  // Precompute evaluated results for all processes
  const evaluatedResults: ProcessResult[] = useMemo(() => {
    if (!activeProcesses || activeProcesses.length === 0) return [];
    return activeProcesses.map((proc) => generateAndEvaluateCandidates(proc));
  }, [activeProcesses]);

  // Current active process result
  const currentResult = evaluatedResults[currentStepIndex] || evaluatedResults[0];

  // Completed results up to current step (for chart and tracking)
  const completedResults = useMemo(() => {
    if (appState === "FINAL_RESULT") {
      return evaluatedResults;
    }
    return evaluatedResults.slice(0, currentStepIndex + 1);
  }, [evaluatedResults, currentStepIndex, appState]);

  // Handler: Move to next process step
  const handleNextStep = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setAutoProgress(0);

    if (currentStepIndex < activeProcesses.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
    } else {
      setAppState("FINAL_RESULT");
    }
  };

  // Handler: Start optimization
  const handleStartOptimization = () => {
    // Strict Guard: If in batch mode, validate batchSize before launching AI optimization
    if (cleaningMode === "batch") {
      const validation = validateBatchSize(batchSize);
      if (!validation.valid) {
        console.warn(
          "[PureFlow Guard] Blocked AI optimization execution due to invalid Batch Size:",
          batchSize,
        );
        return;
      }
    }

    const catIndex = activeProcesses.findIndex((p) => p.id === selectedCategoryId);
    setCurrentStepIndex(catIndex >= 0 ? catIndex : 0);
    setIsAutoPlay(true);
    setAutoProgress(0);
    setAppState("PROCESS_ACTIVE");
  };

  // Handler for applying simulation settings & cleaning mode
  const handleApplySettings = (newSettings: SimulationSettings, newMode: CleaningMode) => {
    setSimulationSettings(newSettings);
    setCleaningMode(newMode);
    if (newMode === "batch") {
      setBatchSize(newSettings.batch.batchSize);
    } else {
      setBatchSize(undefined);
    }
  };

  // Handler for step selection inside a category
  const handleSelectStepId = (stepId: string) => {
    setSelectedSteps((prev) => ({
      ...prev,
      [selectedCategoryId]: stepId,
    }));
  };

  // Handler for Wafer Diameter change
  const handleSelectWaferDiameter = (diameterInch: WaferDiameterInch, diameterMm: number) => {
    setWafer((prev) => ({
      ...prev,
      diameterInch,
      diameterMm,
    }));
  };

  // Handler for Wafer Type change
  const handleSelectWaferType = (waferType: WaferType) => {
    setWafer((prev) => ({
      ...prev,
      waferType,
    }));
  };

  // Auto-advance timer logic while viewing process
  useEffect(() => {
    if (appState === "PROCESS_ACTIVE" && isAutoPlay) {
      setAutoProgress(0);
      const startTime = Date.now();

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, (elapsed / AUTO_ADVANCE_DURATION_MS) * 100);
        setAutoProgress(pct);
      }, 50);

      autoTimerRef.current = setTimeout(() => {
        handleNextStep();
      }, AUTO_ADVANCE_DURATION_MS);

      return () => {
        if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      };
    } else {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (!isAutoPlay) {
        setAutoProgress(0);
      }
    }
  }, [appState, currentStepIndex, isAutoPlay, activeProcesses.length]);

  // Handler: Reset simulation
  const handleReset = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setAppState("START");
    setCurrentStepIndex(0);
    setAutoProgress(0);
  };

  // Handler: Switch cleaning mode and re-run
  const handleSwitchMode = (mode: CleaningMode) => {
    setCleaningMode(mode);
    setCurrentStepIndex(0);
    setIsAutoPlay(true);
    setAutoProgress(0);
    setAppState("PROCESS_ACTIVE");
  };

  const secondsRemaining = Math.max(
    0,
    (AUTO_ADVANCE_DURATION_MS * (1 - autoProgress / 100)) / 1000,
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#00C2FF]/20 selection:text-[#071A2E]">
      {/* Header */}
      <Header
        wafer={appState !== "START" ? wafer : null}
        cleaningMode={cleaningMode}
        batchSize={batchSize}
        onReset={handleReset}
        onOpenFormula={() => setIsFormulaOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentStep={currentStepIndex + 1}
        totalSteps={activeProcesses.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-12">
        <AnimatePresence mode="wait">
          {/* 1. START SCREEN */}
          {appState === "START" && (
            <motion.div
              key="start-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <StartScreen
                cleaningMode={cleaningMode}
                batchSize={batchSize}
                simulationSettings={simulationSettings}
                wafer={wafer}
                onSelectWaferDiameter={handleSelectWaferDiameter}
                onSelectWaferType={handleSelectWaferType}
                selectedCategoryId={selectedCategoryId}
                onSelectCategoryId={(id) => setSelectedCategoryId(id)}
                selectedStepId={selectedSteps[selectedCategoryId] || ""}
                onSelectStepId={handleSelectStepId}
                onStart={handleStartOptimization}
                onOpenFormula={() => setIsFormulaOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </motion.div>
          )}

          {/* 2. PROCESS ACTIVE VIEW */}
          {appState === "PROCESS_ACTIVE" && currentResult && (
            <motion.div
              key={`process-${cleaningMode}-${wafer.diameterInch}-${wafer.waferType}-${currentStepIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6"
            >
              {/* Progress Indicator */}
              <ProcessProgress
                processes={activeProcesses}
                currentStepIndex={currentStepIndex}
                onSelectStep={(idx) => {
                  if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
                  if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                  setCurrentStepIndex(idx);
                }}
              />

              {/* Main 2-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left / Center Column: Current Process Card & Candidates (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <CurrentProcessCard result={currentResult} />
                  {currentResult.process.optimizationEnabled && (
                    <CandidateTable
                      candidates={currentResult.allCandidates}
                      qualityMetric={currentResult.process.qualityMetric}
                    />
                  )}
                </div>

                {/* Right Column: Dynamic Process Comparison Chart & Next Action (5 cols) */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
                  <ProcessChart completedResults={completedResults} />

                  {/* Step Action Card with Auto-Advance Controls */}
                  <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-xs space-y-4">
                    {/* Header with Step indicator */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-[#00C2FF] animate-pulse" />
                        <span className="text-xs font-bold text-[#071A2E]">
                          {cleaningMode === "single" ? "매엽식" : `배치식 (${batchSize || 50}매)`}{" "}
                          공정 최적화 진행 중
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#00C2FF] bg-[#00C2FF]/10 px-2.5 py-1 rounded-md border border-[#00C2FF]/20">
                        Step {currentStepIndex + 1} / {activeProcesses.length}
                      </span>
                    </div>

                    {/* Auto-Advance Progress Bar */}
                    {isAutoPlay && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#64748B] flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5 text-[#00C2FF]" />
                            {currentStepIndex < activeProcesses.length - 1
                              ? "다음 공정 자동 이동"
                              : "최종 결과 대시보드 자동 전환"}
                          </span>
                          <span className="font-mono font-bold text-[#071A2E]">
                            {secondsRemaining}s
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
                          <div
                            className="h-full bg-[#00C2FF] transition-all duration-75 ease-linear rounded-full"
                            style={{ width: `${autoProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 pt-1">
                      {/* Play/Pause Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setIsAutoPlay(!isAutoPlay)}
                        className={`flex items-center justify-center gap-1.5 rounded-2xl py-3.5 px-4 text-xs font-bold border transition-colors cursor-pointer ${
                          isAutoPlay
                            ? "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#071A2E] hover:bg-slate-100"
                            : "bg-[#22C55E]/10 text-[#166534] border-[#22C55E]/30 hover:bg-[#22C55E]/20"
                        }`}
                        title={isAutoPlay ? "자동 진행 일시 정지" : "자동 진행 재개"}
                      >
                        {isAutoPlay ? (
                          <>
                            <Pause className="h-4 w-4" />
                            <span>일시정지</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-current" />
                            <span>자동재개</span>
                          </>
                        )}
                      </button>

                      {/* Manual Advance Immediately Button */}
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-xs sm:text-sm font-bold bg-[#00C2FF] text-white hover:bg-[#00B0E8] shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
                      >
                        {currentStepIndex < activeProcesses.length - 1 ? (
                          <>
                            <span>다음 공정으로</span>
                            <ChevronRight className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>최종 대시보드로 이동</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#94A3B8] text-center leading-normal">
                      {isAutoPlay
                        ? "※ 공정별 결과 확인 후 자동으로 다음 단계가 시뮬레이션됩니다."
                        : "※ 자동 진행이 일시정지되었습니다. 상단의 공정 탭 또는 다음 버튼으로 수동 전환할 수 있습니다."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. FINAL RESULT DASHBOARD */}
          {appState === "FINAL_RESULT" && (
            <motion.div
              key="final-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FinalDashboard
                wafer={wafer}
                cleaningMode={cleaningMode}
                batchSize={batchSize}
                results={evaluatedResults}
                onRestart={handleReset}
                onOpenFormula={() => setIsFormulaOpen(true)}
                onChangeMode={handleSwitchMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Formula & Literature Transparency Modal */}
      <FormulaModal isOpen={isFormulaOpen} onClose={() => setIsFormulaOpen(false)} />

      {/* Simulation & Environment Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        cleaningMode={cleaningMode}
        currentSettings={simulationSettings}
        onApplySettings={handleApplySettings}
      />
    </div>
  );
}
