import React from 'react';
import { Check } from 'lucide-react';
import { ProcessDefinition } from '../types';

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
    <div className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3.5 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between overflow-x-auto pb-1 sm:pb-0 gap-2">
        {processes.map((proc, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;
          const isClickable = idx <= currentStepIndex;

          return (
            <React.Fragment key={proc.id}>
              {/* Process Step Node */}
              <button
                type="button"
                disabled={!isClickable || !onSelectStep}
                onClick={() => onSelectStep && onSelectStep(idx)}
                className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all text-left ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                } ${isCurrent ? 'bg-[#00C2FF]/10 ring-1 ring-[#00C2FF]' : 'hover:bg-[#F8FAFC]'}`}
              >
                {/* Step Circle */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-[#071A2E] text-white shadow-xs'
                      : isCurrent
                      ? 'bg-[#00C2FF] text-[#071A2E] font-black ring-4 ring-[#00C2FF]/20 shadow-xs'
                      : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]'
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                </div>

                {/* Step Label */}
                <div className="hidden lg:block min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold truncate max-w-[130px] ${
                        isCompleted
                          ? 'text-[#071A2E]'
                          : isCurrent
                          ? 'text-[#071A2E]'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {proc.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#64748B] block truncate max-w-[130px]">
                    {isCompleted ? '최적화 완료' : isCurrent ? '분석 중' : '대기'}
                  </span>
                </div>
              </button>

              {/* Connecting Line between steps */}
              {idx < processes.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[16px] max-w-[40px] transition-colors ${
                    idx < currentStepIndex ? 'bg-[#071A2E]' : 'bg-[#E2E8F0]'
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
