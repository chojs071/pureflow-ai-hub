import React from 'react';
import { Cpu, RotateCcw, BookOpen, Activity } from 'lucide-react';
import { WaferDiameter } from '../types';

interface HeaderProps {
  waferDiameter: WaferDiameter | null;
  onReset: () => void;
  onOpenFormula: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export const Header: React.FC<HeaderProps> = ({
  waferDiameter,
  onReset,
  onOpenFormula,
  currentStep,
  totalSteps,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071A2E] text-white shadow-sm ring-1 ring-black/5">
            <Cpu className="h-5 w-5 text-[#00C2FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-[#071A2E]">PureFlow AI</span>
              {waferDiameter && (
                <span className="inline-flex items-center rounded-md bg-[#00C2FF]/10 px-2 py-0.5 text-xs font-semibold text-[#071A2E] ring-1 ring-[#00C2FF]/30">
                  {waferDiameter}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B]">반도체 초순수(UPW) 품질 보존 최적화 시스템</p>
          </div>
        </div>

        {/* Center Live Status */}
        {waferDiameter && currentStep && totalSteps && (
          <div className="hidden md:flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-1 text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
            </span>
            <span className="font-medium text-[#071A2E]">
              {`공정 ${currentStep} / ${totalSteps}`}
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFormula}
            className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
            title="문헌 기반 세정 모델 및 파라미터 확인"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">세정 모델 및 근거</span>
          </button>

          {waferDiameter && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
              title="시뮬레이션 초기화"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">초기화</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
