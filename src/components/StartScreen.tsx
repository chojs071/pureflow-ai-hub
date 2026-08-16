import React from 'react';
import { motion } from 'motion/react';
import { Cpu, ShieldCheck, Droplets, ArrowRight, Layers, Sparkles, CheckCircle2, Factory, Database, HelpCircle } from 'lucide-react';
import { WaferDiameter } from '../types';

interface StartScreenProps {
  selectedWafer: WaferDiameter | null;
  onSelectWafer: (diameter: WaferDiameter) => void;
  onStartOptimization: () => void;
  onOpenFormula: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  selectedWafer,
  onSelectWafer,
  onStartOptimization,
  onOpenFormula,
}) => {
  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="my-auto space-y-10">
        {/* Main Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-[#E2E8F0] bg-white p-10 sm:p-14 lg:p-16 shadow-md text-center relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[#00C2FF]/12 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#071A2E]/5 blur-3xl pointer-events-none" />

          {/* System Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#00C2FF]/40 bg-[#00C2FF]/10 px-5 py-1.5 text-xs sm:text-sm font-bold text-[#071A2E] mb-8">
            <Sparkles className="h-4 w-4 text-[#00C2FF]" />
            <span>반도체 세정 공정 AI 최적화 시스템</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#071A2E] mb-4">
            PureFlow AI
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl font-semibold text-[#64748B] mb-8">
            AI 기반 초순수 최적화 시스템
          </p>

          {/* Core Value Proposition */}
          <div className="max-w-2xl sm:max-w-3xl mx-auto rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-6 sm:p-8 mb-12 text-center shadow-xs">
            <p className="text-xl sm:text-2xl font-bold text-[#071A2E] leading-relaxed">
              품질은 유지하고<br />
              <span className="text-[#00C2FF]">불필요한 UPW 사용은 줄입니다.</span>
            </p>
            <p className="text-xs sm:text-sm text-[#64748B] mt-3 leading-relaxed">
              공정별 허용 잔류 오염 기준(Cu atoms/cm²)을 최우선 검증 후 최소 초순수 조건을 도출합니다.
            </p>
          </div>

          {/* Wafer Diameter Selection */}
          <div className="max-w-2xl mx-auto mb-10 text-left">
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4 text-center">
              웨이퍼 직경 선택 (WAFER DIAMETER)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 200mm Wafer */}
              <button
                type="button"
                onClick={() => onSelectWafer('200mm')}
                className={`relative flex flex-col items-center justify-center rounded-2xl p-6 sm:p-8 border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00C2FF] ${
                  selectedWafer === '200mm'
                    ? 'border-[#00C2FF] bg-[#00C2FF]/10 text-[#071A2E] shadow-md ring-2 ring-[#00C2FF]'
                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className={`h-16 w-16 rounded-full border-2 flex items-center justify-center mb-3.5 transition-colors ${
                  selectedWafer === '200mm' ? 'border-[#00C2FF] bg-white text-[#00C2FF]' : 'border-[#CBD5E1] bg-[#F8FAFC]'
                }`}>
                  <span className="font-mono text-lg font-bold">200</span>
                </div>
                <span className="text-xl font-bold text-[#071A2E]">200mm</span>
                <span className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">8-inch Legacy / Power Fab</span>
                {selectedWafer === '200mm' && (
                  <span className="absolute top-4 right-4 flex h-3 w-3 rounded-full bg-[#00C2FF] ring-4 ring-[#00C2FF]/20" />
                )}
              </button>

              {/* 300mm Wafer */}
              <button
                type="button"
                onClick={() => onSelectWafer('300mm')}
                className={`relative flex flex-col items-center justify-center rounded-2xl p-6 sm:p-8 border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00C2FF] ${
                  selectedWafer === '300mm'
                    ? 'border-[#00C2FF] bg-[#00C2FF]/10 text-[#071A2E] shadow-md ring-2 ring-[#00C2FF]'
                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className={`h-16 w-16 rounded-full border-2 flex items-center justify-center mb-3.5 transition-colors ${
                  selectedWafer === '300mm' ? 'border-[#00C2FF] bg-white text-[#00C2FF]' : 'border-[#CBD5E1] bg-[#F8FAFC]'
                }`}>
                  <span className="font-mono text-lg font-bold">300</span>
                </div>
                <span className="text-xl font-bold text-[#071A2E]">300mm</span>
                <span className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">12-inch Advanced Node</span>
                {selectedWafer === '300mm' && (
                  <span className="absolute top-4 right-4 flex h-3 w-3 rounded-full bg-[#00C2FF] ring-4 ring-[#00C2FF]/20" />
                )}
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="max-w-2xl mx-auto">
            <button
              type="button"
              disabled={!selectedWafer}
              onClick={onStartOptimization}
              className={`w-full flex items-center justify-center gap-3 rounded-2xl py-5 px-8 text-lg font-black transition-all shadow-md ${
                selectedWafer
                  ? 'bg-[#00C2FF] text-white hover:bg-[#00B0E8] hover:shadow-xl active:scale-[0.99] cursor-pointer'
                  : 'bg-[#CBD5E1] text-[#64748B] cursor-not-allowed shadow-none'
              }`}
            >
              <span>AI 최적화 시작</span>
              <ArrowRight className="h-6 w-6" />
            </button>
            {!selectedWafer && (
              <p className="text-xs text-[#94A3B8] mt-2">
                최적화를 시작하려면 웨이퍼 직경을 선택해주세요.
              </p>
            )}
          </div>
        </motion.div>

        {/* 3 Pillar Architectural Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#071A2E] text-[#00C2FF]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-[#071A2E]">1. 품질 우선 게이트</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              임의 점수가 아닌 Cu 잔류 오염(atoms/cm²) 허용 기준을 모델링하여, 기준을 초과하는 조건은 즉시 탈락 처리합니다.
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C2FF]/10 text-[#00C2FF]">
                <Droplets className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-[#071A2E]">2. 초순수 사용량 최적화</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              품질 기준을 충족한 후보군 중 유량(L/min)과 린스 시간(min)을 수학적으로 비교하여 최소 UPW 조건을 추천합니다.
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
                <Database className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-[#071A2E]">3. ESG 환경 가치 산출</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              절감된 초순수(L)를 기반으로 고순도 처리 전력(kWh) 및 탄소 배출 저감량(kgCO₂e)을 정량 산출합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Literature Disclaimer */}
      <div className="pt-6 border-t border-[#E2E8F0] text-center text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          ※ 본 시스템은 실제 팹 장비 제어가 아닌, ECS / IEEE 학술 문헌 기반 Surrogate 시뮬레이션 모델을 사용합니다.
        </p>
        <button
          onClick={onOpenFormula}
          className="text-[#00C2FF] hover:underline font-medium flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>모델 세부 수식 보기</span>
        </button>
      </div>
    </div>
  );
};
