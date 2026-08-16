import React from "react";
import { Cpu, RotateCcw, BookOpen, Disc, Waves } from "lucide-react";
import { WaferConfig, CleaningMode } from "../types";

interface HeaderProps {
  wafer: WaferConfig | null;
  cleaningMode: CleaningMode;
  batchSize?: number;
  onReset: () => void;
  onOpenFormula: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export const Header: React.FC<HeaderProps> = ({
  wafer,
  cleaningMode,
  batchSize,
  onReset,
  onOpenFormula,
  currentStep,
  totalSteps,
}) => {
  const getWaferTypeLabel = (type: string) => {
    switch (type) {
      case "polished":
        return "연마 (Polished)";
      case "epitaxial":
        return "에피 (Epi)";
      case "soi":
        return "SOI";
      default:
        return type;
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071A2E] text-white shadow-sm ring-1 ring-black/5">
            <Cpu className="h-5 w-5 text-[#00C2FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-[#071A2E]">PureFlow AI</span>
              {wafer && (
                <>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#00C2FF]/10 px-2 py-0.5 text-xs font-bold text-[#071A2E] ring-1 ring-[#00C2FF]/30">
                    <span>{wafer.diameterInch}&quot;</span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      ({wafer.diameterMm}mm)
                    </span>
                  </span>
                  <span className="inline-flex items-center rounded-md bg-[#071A2E]/5 px-2 py-0.5 text-xs font-bold text-[#071A2E] border border-[#E2E8F0]">
                    {getWaferTypeLabel(wafer.waferType)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#071A2E]/5 px-2 py-0.5 text-xs font-bold text-[#071A2E] border border-[#E2E8F0]">
                    {cleaningMode === "single" ? (
                      <>
                        <Disc className="h-3 w-3 text-[#00C2FF]" />
                        <span>Single Wafer</span>
                      </>
                    ) : (
                      <>
                        <Waves className="h-3 w-3 text-[#00C2FF]" />
                        <span>Batch</span>
                        {batchSize && (
                          <span className="text-[#00C2FF] font-mono font-bold ml-0.5">
                            ({batchSize}w)
                          </span>
                        )}
                      </>
                    )}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-[#64748B]">반도체 초순수(UPW) 품질 보존 최적화 시스템</p>
          </div>
        </div>

        {/* Center Live Status */}
        {wafer && currentStep && totalSteps && (
          <div className="hidden md:flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-1 text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
            </span>
            <span className="font-bold text-[#071A2E]">
              {`공정 ${currentStep} / ${totalSteps}`}
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFormula}
            className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C2FF] cursor-pointer"
            title="문헌 기반 세정 모델 및 파라미터 확인"
          >
            <BookOpen className="h-4 w-4 text-[#00C2FF]" />
            <span className="hidden sm:inline">세정 모델 및 문헌 근거</span>
          </button>

          {wafer && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C2FF] cursor-pointer"
              title="시뮬레이션 초기화"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">초기화</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
