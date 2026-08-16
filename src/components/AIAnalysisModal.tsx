import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, Sparkles, Cpu, ShieldCheck, ArrowRight } from "lucide-react";
import { ProcessDefinition } from "../types";

interface AIAnalysisModalProps {
  process: ProcessDefinition;
  onComplete: () => void;
}

interface StepItem {
  id: number;
  title: string;
  description: string;
}

const ANALYSIS_STEPS: StepItem[] = [
  { id: 1, title: "웨이퍼 상태 분석", description: "웨이퍼 직경, 표면 패턴 및 기초 물성치 스캔" },
  { id: 2, title: "오염도 분석", description: "공정별 표면 Cu 오염도 및 오염 밴드 판정" },
  { id: 3, title: "세정 조건 분석", description: "기준 린스 시간, 유량(L/min) 및 사이클 탐색" },
  { id: 4, title: "후보 조건 생성", description: "유효 파라미터 경계 내 단계별 절감 후보 생성" },
  {
    id: 5,
    title: "잔류 오염 계산",
    description: "Surrogate Model 기반 예상 잔류 Cu(atoms/cm²) 연산",
  },
  {
    id: 6,
    title: "품질 기준 검증",
    description: "허용 잔류 기준(≤ Allowable Cu) 초과 후보 자동 탈락",
  },
  { id: 7, title: "최적 조건 선택", description: "품질 통과 후보 중 최소 UPW 사용 조건 확정" },
];

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ process, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 450);
          return prev;
        }
      });
    }, 380);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl border border-[#00C2FF]/30 bg-[#071A2E] text-white p-6 sm:p-8 shadow-2xl overflow-hidden relative"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-[#00C2FF]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#22C55E]/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00C2FF]/20 text-[#00C2FF]">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#00C2FF] uppercase">
                AI SIMULATION ANALYSIS
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                {process.name} 최적화 연산
              </h2>
            </div>
          </div>
          <span className="text-xs font-mono text-white/50">
            {Math.round(((currentStepIndex + 1) / ANALYSIS_STEPS.length) * 100)}%
          </span>
        </div>

        {/* Process Target Subtitle */}
        <div className="rounded-lg bg-white/5 border border-white/10 p-3 mb-6 flex items-center justify-between text-xs">
          <span className="text-white/70">
            타겟 공정: <strong className="text-white">{process.subName}</strong>
          </span>
          <span className="text-[#00C2FF] font-mono font-bold">
            Score {process.contaminationScore}/100
          </span>
        </div>

        {/* 7-Step Sequence List */}
        <div className="space-y-3 mb-6">
          {ANALYSIS_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0.6 }}
                animate={{
                  opacity: isPending ? 0.35 : 1,
                  scale: isActive ? 1.02 : 1,
                }}
                className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 transition-all ${
                  isActive
                    ? "bg-[#00C2FF]/15 border border-[#00C2FF]/40 text-white shadow-sm"
                    : isCompleted
                      ? "bg-white/[0.04] text-white/90"
                      : "bg-transparent text-white/40"
                }`}
              >
                {/* Status Indicator Icon */}
                <div className="shrink-0 flex items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 text-[#00C2FF] animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-white/40">
                      {step.id}
                    </div>
                  )}
                </div>

                {/* Text Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${isActive ? "text-[#00C2FF]" : isCompleted ? "text-white" : "text-white/50"}`}
                    >
                      {step.title}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-mono text-[#00C2FF] animate-pulse">
                        Evaluating...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 truncate">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer info and skip button */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <p className="text-[11px] text-white/40">
            문헌 기반 Surrogate 모델로 품질 Gate를 우선 통과시킵니다.
          </p>
          <button
            onClick={onComplete}
            className="flex items-center gap-1 text-xs font-semibold text-[#00C2FF] hover:text-white transition-colors cursor-pointer"
          >
            <span>즉시 확인</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
