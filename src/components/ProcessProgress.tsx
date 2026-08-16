import React from "react";
import { Check, ShieldAlert } from "lucide-react";
import { ProcessDefinition } from "../types";

interface ProcessProgressProps {
  processes: ProcessDefinition[];
  currentStepIndex: number;
  onSelectStep?: (index: number) => void;
}

export const ProcessProgress: React.FC<ProcessProgressProps> = ({
  processes,
  currentStepIndex,
  onSelectStep,
}) => {
  return (
    <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between overflow-x-auto pb-1 sm:pb-0 gap-1.5 scrollbar-thin">
        {processes.map((proc, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isClickable = idx <= currentStepIndex;
          const isExcluded = !proc.optimizationEnabled;

          return (
            <React.Fragment key={proc.id}>
              {/* Process Step Node */}
              <button
                type="button"
                disabled={!isClickable || !onSelectStep}
                onClick={() => onSelectStep && onSelectStep(idx)}
                className={`group flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-all text-left shrink-0 ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                } ${
                  isCurrent
                    ? "bg-[#00C2FF]/10 ring-1 ring-[#00C2FF]"
                    : isCompleted
                      ? "hover:bg-[#F8FAFC]"
                      : "opacity-70"
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isExcluded
                      ? "bg-amber-100 border border-amber-300 text-amber-900 font-bold"
                      : isCompleted
                        ? "bg-[#071A2E] text-white shadow-xs"
                        : isCurrent
                          ? "bg-[#00C2FF] text-[#071A2E] font-black ring-4 ring-[#00C2FF]/20 shadow-xs"
                          : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]"
                  }`}
                >
                  {isExcluded ? (
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-700" />
                  ) : isCompleted ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  ) : (
                    proc.stepNumber
                  )}
                </div>

                {/* Step Label */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-bold truncate max-w-[90px] sm:max-w-[110px] ${
                        isCurrent
                          ? "text-[#071A2E]"
                          : isCompleted
                            ? "text-[#071A2E]"
                            : "text-[#94A3B8]"
                      }`}
                    >
                      {proc.categoryName}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748B] block truncate max-w-[90px] sm:max-w-[110px]">
                    {isExcluded
                      ? "최적화 제외"
                      : isCompleted
                        ? "최적화 완료"
                        : isCurrent
                          ? "분석 중"
                          : "대기"}
                  </span>
                </div>
              </button>

              {/* Connecting Line between steps */}
              {idx < processes.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[8px] max-w-[24px] transition-colors shrink-0 ${
                    idx < currentStepIndex ? "bg-[#071A2E]" : "bg-[#E2E8F0]"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
