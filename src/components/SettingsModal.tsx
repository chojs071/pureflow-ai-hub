import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  X,
  RotateCcw,
  Check,
  Disc,
  Waves,
  Lock,
  Thermometer,
  Gauge,
  Clock,
  RotateCw,
  Repeat,
  Users,
  Info,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  CleaningMode,
  SimulationSettings,
  SingleWaferSettings,
  BatchSettings,
  DEFAULT_SINGLE_SETTINGS,
  DEFAULT_BATCH_SETTINGS,
} from "../types";
import {
  validateNumericSetting,
  validateBatchSize,
  MVP_SIMULATION_RANGES,
} from "../utils/validation";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cleaningMode: CleaningMode;
  currentSettings: SimulationSettings;
  onApplySettings: (newSettings: SimulationSettings, newMode: CleaningMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  cleaningMode,
  currentSettings,
  onApplySettings,
}) => {
  const [selectedMode, setSelectedMode] = useState<CleaningMode>(cleaningMode);

  // Single Wafer Draft
  const [draftSingle, setDraftSingle] = useState<{
    temperatureC: string;
    flowRateLpm: string;
    cleaningTimeMin: string;
    rinseTimeMin: string;
    spinRpm: string;
    rinseCycles: string;
  }>({
    temperatureC: String(currentSettings.single.temperatureC),
    flowRateLpm: String(currentSettings.single.flowRateLpm),
    cleaningTimeMin: String(currentSettings.single.cleaningTimeMin),
    rinseTimeMin: String(currentSettings.single.rinseTimeMin),
    spinRpm: String(currentSettings.single.spinRpm),
    rinseCycles: String(currentSettings.single.rinseCycles),
  });

  // Batch Draft
  const [draftBatch, setDraftBatch] = useState<{
    temperatureC: string;
    batchSize: string;
    processTimeMin: string;
    rinseTimeMin: string;
    rinseCycles: string;
  }>({
    temperatureC: String(currentSettings.batch.temperatureC),
    batchSize: String(currentSettings.batch.batchSize),
    processTimeMin: String(currentSettings.batch.processTimeMin),
    rinseTimeMin: String(currentSettings.batch.rinseTimeMin),
    rinseCycles: String(currentSettings.batch.rinseCycles),
  });

  // Sync draft whenever modal opens or current props change
  useEffect(() => {
    if (isOpen) {
      setSelectedMode(cleaningMode);
      setDraftSingle({
        temperatureC: String(currentSettings.single.temperatureC),
        flowRateLpm: String(currentSettings.single.flowRateLpm),
        cleaningTimeMin: String(currentSettings.single.cleaningTimeMin),
        rinseTimeMin: String(currentSettings.single.rinseTimeMin),
        spinRpm: String(currentSettings.single.spinRpm),
        rinseCycles: String(currentSettings.single.rinseCycles),
      });
      setDraftBatch({
        temperatureC: String(currentSettings.batch.temperatureC),
        batchSize: String(currentSettings.batch.batchSize),
        processTimeMin: String(currentSettings.batch.processTimeMin),
        rinseTimeMin: String(currentSettings.batch.rinseTimeMin),
        rinseCycles: String(currentSettings.batch.rinseCycles),
      });
    }
  }, [isOpen, cleaningMode, currentSettings]);

  if (!isOpen) return null;

  // Real-time Validations for Single Wafer
  const singleErrors: Record<string, string> = {};
  {
    const r = MVP_SIMULATION_RANGES.single;
    const tCheck = validateNumericSetting(
      draftSingle.temperatureC,
      r.temperatureC.min,
      r.temperatureC.max,
      r.temperatureC.label,
      r.temperatureC.unit,
    );
    if (!tCheck.valid) singleErrors.temperatureC = tCheck.message;

    const fCheck = validateNumericSetting(
      draftSingle.flowRateLpm,
      r.flowRateLpm.min,
      r.flowRateLpm.max,
      r.flowRateLpm.label,
      r.flowRateLpm.unit,
    );
    if (!fCheck.valid) singleErrors.flowRateLpm = fCheck.message;

    const cCheck = validateNumericSetting(
      draftSingle.cleaningTimeMin,
      r.cleaningTimeMin.min,
      r.cleaningTimeMin.max,
      r.cleaningTimeMin.label,
      r.cleaningTimeMin.unit,
    );
    if (!cCheck.valid) singleErrors.cleaningTimeMin = cCheck.message;

    const rCheck = validateNumericSetting(
      draftSingle.rinseTimeMin,
      r.rinseTimeMin.min,
      r.rinseTimeMin.max,
      r.rinseTimeMin.label,
      r.rinseTimeMin.unit,
    );
    if (!rCheck.valid) singleErrors.rinseTimeMin = rCheck.message;

    const sCheck = validateNumericSetting(
      draftSingle.spinRpm,
      r.spinRpm.min,
      r.spinRpm.max,
      r.spinRpm.label,
      r.spinRpm.unit,
    );
    if (!sCheck.valid) singleErrors.spinRpm = sCheck.message;

    const cyCheck = validateNumericSetting(
      draftSingle.rinseCycles,
      r.rinseCycles.min,
      r.rinseCycles.max,
      r.rinseCycles.label,
      r.rinseCycles.unit,
    );
    if (!cyCheck.valid) singleErrors.rinseCycles = cyCheck.message;
  }

  // Real-time Validations for Batch
  const batchErrors: Record<string, string> = {};
  {
    const r = MVP_SIMULATION_RANGES.batch;
    const tCheck = validateNumericSetting(
      draftBatch.temperatureC,
      r.temperatureC.min,
      r.temperatureC.max,
      r.temperatureC.label,
      r.temperatureC.unit,
    );
    if (!tCheck.valid) batchErrors.temperatureC = tCheck.message;

    const bCheck = validateBatchSize(draftBatch.batchSize);
    if (!bCheck.valid) batchErrors.batchSize = bCheck.message;

    const pCheck = validateNumericSetting(
      draftBatch.processTimeMin,
      r.processTimeMin.min,
      r.processTimeMin.max,
      r.processTimeMin.label,
      r.processTimeMin.unit,
    );
    if (!pCheck.valid) batchErrors.processTimeMin = pCheck.message;

    const rCheck = validateNumericSetting(
      draftBatch.rinseTimeMin,
      r.rinseTimeMin.min,
      r.rinseTimeMin.max,
      r.rinseTimeMin.label,
      r.rinseTimeMin.unit,
    );
    if (!rCheck.valid) batchErrors.rinseTimeMin = rCheck.message;

    const cyCheck = validateNumericSetting(
      draftBatch.rinseCycles,
      r.rinseCycles.min,
      r.rinseCycles.max,
      r.rinseCycles.label,
      r.rinseCycles.unit,
    );
    if (!cyCheck.valid) batchErrors.rinseCycles = cyCheck.message;
  }

  const isCurrentModeValid =
    selectedMode === "single"
      ? Object.keys(singleErrors).length === 0
      : Object.keys(batchErrors).length === 0;

  const handleRestoreDefaults = () => {
    if (selectedMode === "single") {
      setDraftSingle({
        temperatureC: String(DEFAULT_SINGLE_SETTINGS.temperatureC),
        flowRateLpm: String(DEFAULT_SINGLE_SETTINGS.flowRateLpm),
        cleaningTimeMin: String(DEFAULT_SINGLE_SETTINGS.cleaningTimeMin),
        rinseTimeMin: String(DEFAULT_SINGLE_SETTINGS.rinseTimeMin),
        spinRpm: String(DEFAULT_SINGLE_SETTINGS.spinRpm),
        rinseCycles: String(DEFAULT_SINGLE_SETTINGS.rinseCycles),
      });
    } else {
      setDraftBatch({
        temperatureC: String(DEFAULT_BATCH_SETTINGS.temperatureC),
        batchSize: String(DEFAULT_BATCH_SETTINGS.batchSize),
        processTimeMin: String(DEFAULT_BATCH_SETTINGS.processTimeMin),
        rinseTimeMin: String(DEFAULT_BATCH_SETTINGS.rinseTimeMin),
        rinseCycles: String(DEFAULT_BATCH_SETTINGS.rinseCycles),
      });
    }
  };

  const handleApply = () => {
    if (!isCurrentModeValid) return;

    const finalSingle: SingleWaferSettings = {
      temperatureC: Number(draftSingle.temperatureC) || DEFAULT_SINGLE_SETTINGS.temperatureC,
      flowRateLpm: Number(draftSingle.flowRateLpm) || DEFAULT_SINGLE_SETTINGS.flowRateLpm,
      cleaningTimeMin:
        Number(draftSingle.cleaningTimeMin) || DEFAULT_SINGLE_SETTINGS.cleaningTimeMin,
      rinseTimeMin: Number(draftSingle.rinseTimeMin) || DEFAULT_SINGLE_SETTINGS.rinseTimeMin,
      spinRpm: Number(draftSingle.spinRpm) || DEFAULT_SINGLE_SETTINGS.spinRpm,
      rinseCycles: Number(draftSingle.rinseCycles) || DEFAULT_SINGLE_SETTINGS.rinseCycles,
    };

    const finalBatch: BatchSettings = {
      temperatureC: Number(draftBatch.temperatureC) || DEFAULT_BATCH_SETTINGS.temperatureC,
      batchSize: Number(draftBatch.batchSize) || DEFAULT_BATCH_SETTINGS.batchSize,
      processTimeMin: Number(draftBatch.processTimeMin) || DEFAULT_BATCH_SETTINGS.processTimeMin,
      rinseTimeMin: Number(draftBatch.rinseTimeMin) || DEFAULT_BATCH_SETTINGS.rinseTimeMin,
      rinseCycles: Number(draftBatch.rinseCycles) || DEFAULT_BATCH_SETTINGS.rinseCycles,
    };

    onApplySettings(
      {
        single: finalSingle,
        batch: finalBatch,
      },
      selectedMode,
    );
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl rounded-3xl bg-white border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071A2E] text-[#00C2FF]">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-[#071A2E]">
                    환경 설정 (Simulation Settings)
                  </h2>
                  <span className="inline-block rounded-md bg-[#00C2FF]/10 text-[#071A2E] border border-[#00C2FF]/30 px-2 py-0.5 text-[10px] font-bold">
                    MVP Simulation Default
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  세정 방식(매엽식 / 배치식)을 선택하고 시뮬레이션 환경 조건을 설정합니다.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#071A2E] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Section 1: Cleaning Mode Selection Cards with Detailed Definitions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-[#071A2E] flex items-center gap-1.5">
                  <span>1. 세정 방식 선택 (Cleaning Mode)</span>
                  <span className="text-[#00C2FF] font-bold">*필수</span>
                </label>
                <span className="text-[11px] text-[#64748B]">
                  선택한 방식에 따라 하단 환경 변수 폼이 전환됩니다.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Single Wafer Card */}
                <button
                  type="button"
                  onClick={() => setSelectedMode("single")}
                  className={`text-left p-4.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedMode === "single"
                      ? "border-[#00C2FF] bg-sky-50/70 shadow-sm"
                      : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            selectedMode === "single"
                              ? "bg-[#00C2FF] text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Disc className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-black text-[#071A2E] block">
                            매엽식 (Single Wafer)
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            Single Wafer Spin Cleaning
                          </span>
                        </div>
                      </div>
                      {selectedMode === "single" && (
                        <span className="flex items-center gap-1 rounded-full bg-[#00C2FF] text-white px-2 py-0.5 text-[10px] font-bold">
                          <Check className="h-3 w-3" />
                          <span>선택됨</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#334155] leading-relaxed mb-3">
                      <strong>한 장의 웨이퍼를 개별적으로 처리</strong>하는 세정 방식입니다. 고속
                      회전 및 정밀 노즐 토출을 통해 웨이퍼 표면의 교차오염을 최소화합니다.
                    </p>
                  </div>

                  <div className="border-t border-[#E2E8F0]/80 pt-2.5">
                    <span className="text-[10px] font-bold text-[#64748B] block mb-1">
                      주요 제어 조건:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {["UPW 유량", "세정 시간", "린스 시간", "회전 속도", "린스 횟수"].map(
                        (item) => (
                          <span
                            key={item}
                            className="rounded bg-white/90 border border-[#E2E8F0] text-[10px] font-semibold text-[#071A2E] px-1.5 py-0.5"
                          >
                            {item}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </button>

                {/* Batch Immersion Card */}
                <button
                  type="button"
                  onClick={() => setSelectedMode("batch")}
                  className={`text-left p-4.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedMode === "batch"
                      ? "border-[#00C2FF] bg-sky-50/70 shadow-sm"
                      : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            selectedMode === "batch"
                              ? "bg-[#00C2FF] text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Waves className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-black text-[#071A2E] block">
                            배치식 (Batch)
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            Batch Immersion Tank Cleaning
                          </span>
                        </div>
                      </div>
                      {selectedMode === "batch" && (
                        <span className="flex items-center gap-1 rounded-full bg-[#00C2FF] text-white px-2 py-0.5 text-[10px] font-bold">
                          <Check className="h-3 w-3" />
                          <span>선택됨</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#334155] leading-relaxed mb-3">
                      <strong>여러 장의 웨이퍼를 하나의 세정조(Bath)에서 동시에 처리</strong>하는
                      방식입니다. 대량 처리 효율이 우수하며 린스조 오버플로우 조건을 최적화합니다.
                    </p>
                  </div>

                  <div className="border-t border-[#E2E8F0]/80 pt-2.5">
                    <span className="text-[10px] font-bold text-[#64748B] block mb-1">
                      주요 제어 조건:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "1회 처리 웨이퍼 수",
                        "공정 시간",
                        "린스 시간",
                        "린스 횟수",
                        "Bath 조건",
                      ].map((item) => (
                        <span
                          key={item}
                          className="rounded bg-white/90 border border-[#E2E8F0] text-[10px] font-semibold text-[#071A2E] px-1.5 py-0.5"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Section 2: Dynamic Form for Selected Mode */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-[#071A2E] flex items-center gap-1.5">
                  <span>
                    2. {selectedMode === "single" ? "매엽식 (Single Wafer)" : "배치식 (Batch)"} 환경
                    조건 설정
                  </span>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                    MVP Simulation Range 적용
                  </span>
                </label>
              </div>

              {/* Single Wafer Form */}
              {selectedMode === "single" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Temperature */}
                  <div
                    className={`rounded-2xl border p-3.5 transition-all ${
                      singleErrors.temperatureC
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
                        <Thermometer className="h-3.5 w-3.5 text-[#00C2FF]" />
                        <span>세정수 온도 (Temperature)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">기본: 20℃</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={10}
                        max={60}
                        step={1}
                        value={draftSingle.temperatureC}
                        onChange={(e) =>
                          setDraftSingle({ ...draftSingle, temperatureC: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-mono font-bold text-[#071A2E] focus:border-[#00C2FF] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#64748B] shrink-0">℃</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">범위: 10 ~ 60 ℃ (MVP Simulation Range)</span>
                    </div>
                    {singleErrors.temperatureC && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{singleErrors.temperatureC}</span>
                      </p>
                    )}
                  </div>

                  {/* Flow Rate */}
                  <div
                    className={`rounded-2xl border p-3.5 transition-all ${
                      singleErrors.flowRateLpm
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
                        <Gauge className="h-3.5 w-3.5 text-[#00C2FF]" />
                        <span>UPW 유량 (Flow Rate)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">기본: 10 L/min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        step={0.5}
                        value={draftSingle.flowRateLpm}
                        onChange={(e) =>
                          setDraftSingle({ ...draftSingle, flowRateLpm: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-mono font-bold text-[#071A2E] focus:border-[#00C2FF] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#64748B] shrink-0">L/min</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">
                        범위: 1 ~ 20 L/min (MVP Simulation Range)
                      </span>
                    </div>
                    {singleErrors.flowRateLpm && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{singleErrors.flowRateLpm}</span>
                      </p>
                    )}
                  </div>

                  {/* Cleaning Time */}
                  <div
                    className={`rounded-2xl border p-3.5 transition-all ${
                      singleErrors.cleaningTimeMin
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#00C2FF]" />
                        <span>세정 시간 (Cleaning Time)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">기본: 10 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        step={0.5}
                        value={draftSingle.cleaningTimeMin}
                        onChange={(e) =>
                          setDraftSingle({ ...draftSingle, cleaningTimeMin: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-mono font-bold text-[#071A2E] focus:border-[#00C2FF] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#64748B] shrink-0">min</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">
                        범위: 1 ~ 30 min (MVP Simulation Range)
                      </span>
                    </div>
                    {singleErrors.cleaningTimeMin && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{singleErrors.cleaningTimeMin}</span>
                      </p>
                    )}
                  </div>

                  {/* Rinse Time */}
                  <div
                    className={`rounded-2xl border p-3.5 transition-all ${
                      singleErrors.rinseTimeMin
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#00C2FF]" />
                        <span>린스 시간 (Rinse Time)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">기본: 5 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        step={0.5}
                        value={draftSingle.rinseTimeMin}
                        onChange={(e) =>
                          setDraftSingle({ ...draftSingle, rinseTimeMin: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-mono font-bold text-[#071A2E] focus:border-[#00C2FF] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#64748B] shrink-0">min</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">
                        범위: 1 ~ 20 min (MVP Simulation Range)
                      </span>
                    </div>
                    {singleErrors.rinseTimeMin && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{singleErrors.rinseTimeMin}</span>
                      </p>
                    )}
                  </div>

                  {/* Spin RPM */}
                  <div
                    className={`rounded-2xl border p-3.5 transition-all ${
                      singleErrors.spinRpm
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
                        <RotateCw className="h-3.5 w-3.5 text-[#00C2FF]" />
                        <span>회전 속도 (Spin RPM)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">기본: 1000 rpm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={100}
                        max={3000}
                        step={100}
                        value={draftSingle.spinRpm}
                        onChange={(e) =>
                          setDraftSingle({ ...draftSingle, spinRpm: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-mono font-bold text-[#071A2E] focus:border-[#00C2FF] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#64748B] shrink-0">rpm</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">
                        범위: 100 ~ 3000 rpm (MVP Simulation Range)
                      </span>
                    </div>
                    {singleErrors.spinRpm && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{singleErrors.spinRpm}</span>
                      </p>
                    )}
                  </div>

                  {/* Rinse Cycles */}
                  <div
                    className={`rounded-2xl border p-3.5 transition-all ${
                      singleErrors.rinseCycles
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
                        <Repeat className="h-3.5 w-3.5 text-[#00C2FF]" />
                        <span>린스 횟수 (Rinse Cycles)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">기본: 2회</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        step={1}
                        value={draftSingle.rinseCycles}
                        onChange={(e) =>
                          setDraftSingle({ ...draftSingle, rinseCycles: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-mono font-bold text-[#071A2E] focus:border-[#00C2FF] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#64748B] shrink-0">회</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">범위: 1 ~ 5 회 (MVP Simulation Range)</span>
                    </div>
                    {singleErrors.rinseCycles && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{singleErrors.rinseCycles}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Batch Form */}
              {selectedMode === "batch" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Temperature */}
                  <div
                    className={`rounded-2xl border p-3.5 transition-all ${
                      batchErrors.temperatureC
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
                        <Thermometer className="h-3.5 w-3.5 text-[#00C2FF]" />
                        <span>세정수 온도 (Temperature)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">기본: 20℃</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={10}
                        max={60}
                        step={1}
                        value={draftBatch.temperatureC}
                        onChange={(e) =>
                          setDraftBatch({ ...draftBatch, temperatureC: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-mono font-bold text-[#071A2E] focus:border-[#00C2FF] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#64748B] shrink-0">℃</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">범위: 10 ~ 60 ℃ (MVP Simulation Range)</span>
                    </div>
                    {batchErrors.temperatureC && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{batchErrors.temperatureC}</span>
                      </p>
                    )}
                  </div>

                  {/* Batch Size with Presets (25, 50, 100) + Custom */}
                  <div
                    className={`rounded-2xl border p-3.5 transition-all sm:col-span-2 ${
                      batchErrors.batchSize
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#00C2FF]" />
                        <span>1회 처리 웨이퍼 수 (Batch Size)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">기본: 50 wafers</span>
                    </div>

                    {/* Preset Buttons */}
                    <div className="flex items-center gap-2 mb-2">
                      {[25, 50, 100].map((preset) => {
                        const isSelected = draftBatch.batchSize === String(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              setDraftBatch({ ...draftBatch, batchSize: String(preset) })
                            }
                            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#00C2FF] text-white border-[#00C2FF]"
                                : "bg-white text-[#071A2E] border-[#CBD5E1] hover:bg-slate-100"
                            }`}
                          >
                            {preset} wafers
                          </button>
                        );
                      })}
                      <span className="text-[11px] text-[#64748B] ml-1">또는 직접 입력:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        step={1}
                        value={draftBatch.batchSize}
                        onChange={(e) =>
                          setDraftBatch({ ...draftBatch, batchSize: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-mono font-bold text-[#071A2E] focus:border-[#00C2FF] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#64748B] shrink-0">wafers</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">
                        범위: 1 ~ 100 wafers (MVP Simulation Range, 정수)
                      </span>
                    </div>
                    {batchErrors.batchSize && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{batchErrors.batchSize}</span>
                      </p>
                    )}
                  </div>

                  {/* Process Time */}
                  <div
                    className={`rounded-2xl border p-3.5 transition-all ${
                      batchErrors.processTimeMin
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#00C2FF]" />
                        <span>공정 시간 (Process Time)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">기본: 10 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={60}
                        step={1}
                        value={draftBatch.processTimeMin}
                        onChange={(e) =>
                          setDraftBatch({ ...draftBatch, processTimeMin: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-mono font-bold text-[#071A2E] focus:border-[#00C2FF] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#64748B] shrink-0">min</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">
                        범위: 1 ~ 60 min (MVP Simulation Range)
                      </span>
                    </div>
                    {batchErrors.processTimeMin && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{batchErrors.processTimeMin}</span>
                      </p>
                    )}
                  </div>

                  {/* Rinse Time */}
                  <div
                    className={`rounded-2xl border p-3.5 transition-all ${
                      batchErrors.rinseTimeMin
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#00C2FF]" />
                        <span>린스 시간 (Rinse Time)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">기본: 5 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        step={1}
                        value={draftBatch.rinseTimeMin}
                        onChange={(e) =>
                          setDraftBatch({ ...draftBatch, rinseTimeMin: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-mono font-bold text-[#071A2E] focus:border-[#00C2FF] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#64748B] shrink-0">min</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">
                        범위: 1 ~ 30 min (MVP Simulation Range)
                      </span>
                    </div>
                    {batchErrors.rinseTimeMin && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{batchErrors.rinseTimeMin}</span>
                      </p>
                    )}
                  </div>

                  {/* Rinse Cycles */}
                  <div
                    className={`rounded-2xl border p-3.5 transition-all ${
                      batchErrors.rinseCycles
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#071A2E] flex items-center gap-1.5">
                        <Repeat className="h-3.5 w-3.5 text-[#00C2FF]" />
                        <span>린스 횟수 (Rinse Cycles)</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#64748B]">기본: 2회</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        step={1}
                        value={draftBatch.rinseCycles}
                        onChange={(e) =>
                          setDraftBatch({ ...draftBatch, rinseCycles: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm font-mono font-bold text-[#071A2E] focus:border-[#00C2FF] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#64748B] shrink-0">회</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-[#64748B]">범위: 1 ~ 5 회 (MVP Simulation Range)</span>
                    </div>
                    {batchErrors.rinseCycles && (
                      <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{batchErrors.rinseCycles}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Protected Parameters Box (Locked) */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-slate-50 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#071A2E]">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <span>보호된 물리 모델 & 품질 게이트 지표 (시스템 보호값)</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                  수정 불가
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                반도체 세정 품질의 신뢰도를 유지하기 위해{" "}
                <strong>허용 잔류 오염 기준(Quality Limit)</strong>,{" "}
                <strong>Quality Gate 판정 수식</strong>, <strong>학술 문헌 근거 모델</strong>은
                사용자가 임의 변경할 수 없도록 엄격히 보호됩니다.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                <div className="bg-white rounded-lg p-2 border border-[#E2E8F0] text-[11px]">
                  <span className="text-[#64748B] block">품질 게이트 판정</span>
                  <span className="font-bold text-[#071A2E]">R_pred ≤ Limit</span>
                </div>
                <div className="bg-white rounded-lg p-2 border border-[#E2E8F0] text-[11px]">
                  <span className="text-[#64748B] block">문헌 근거 모델</span>
                  <span className="font-bold text-[#071A2E]">IEEE/ECS Peer-reviewed</span>
                </div>
                <div className="bg-white rounded-lg p-2 border border-[#E2E8F0] text-[11px] col-span-2 sm:col-span-1">
                  <span className="text-[#64748B] block">최적화 목적함수</span>
                  <span className="font-bold text-[#059669]">Min(UPW Usage)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions: [ 기본값 복원 ] [ 취소 ] [ 적용 ] */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#64748B] hover:text-[#071A2E] hover:border-[#94A3B8] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>기본값 복원</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-2.5 text-xs font-bold text-[#64748B] hover:bg-slate-100 hover:text-[#071A2E] transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!isCurrentModeValid}
                className="flex items-center gap-1.5 rounded-xl bg-[#00C2FF] px-6 py-2.5 text-xs font-black text-white hover:bg-[#00B0E8] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>적용</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
