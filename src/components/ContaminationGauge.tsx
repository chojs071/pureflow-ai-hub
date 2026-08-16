import React from 'react';
import { AlertCircle, Gauge, Lock } from 'lucide-react';
import { ContaminationBand } from '../types';

interface ContaminationGaugeProps {
  score: number;
  band: ContaminationBand;
}

export const ContaminationGauge: React.FC<ContaminationGaugeProps> = ({ score, band }) => {
  const getBandInfo = () => {
    if (score >= 90) {
      return {
        label: '매우 높음 (Very High)',
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        barColor: 'bg-rose-500',
      };
    }
    if (score >= 61) {
      return {
        label: '높음 (High)',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        barColor: 'bg-amber-500',
      };
    }
    if (score >= 31) {
      return {
        label: '보통 (Medium)',
        color: 'text-[#00C2FF]',
        bgColor: 'bg-[#00C2FF]/10',
        borderColor: 'border-[#00C2FF]/30',
        barColor: 'bg-[#00C2FF]',
      };
    }
    return {
      label: '낮음 (Low)',
      color: 'text-[#22C55E]',
      bgColor: 'bg-[#22C55E]/10',
      borderColor: 'border-[#22C55E]/30',
      barColor: 'bg-[#22C55E]',
    };
  };

  const bandInfo = getBandInfo();
  const isHighContaminationLocked = score >= 90;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#071A2E]">
          <Gauge className="h-4 w-4 text-[#64748B]" />
          <span>공정 오염도 (Contamination Index)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-black text-[#071A2E]">
            {score} <span className="text-xs font-normal text-[#64748B]">/ 100</span>
          </span>
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${bandInfo.bgColor} ${bandInfo.color} border ${bandInfo.borderColor}`}>
            {bandInfo.label.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 w-full rounded-full bg-[#E2E8F0] overflow-hidden relative">
        <div
          className={`h-full transition-all duration-500 rounded-full ${bandInfo.barColor}`}
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        />
      </div>

      {/* Threshold Markers */}
      <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono mt-1.5">
        <span>0 (청정)</span>
        <span>30 (낮음)</span>
        <span>60 (보통)</span>
        <span>90 (매우높음)</span>
        <span>100</span>
      </div>

      {/* High Contamination Lock Rule Notice */}
      {isHighContaminationLocked && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800">
          <Lock className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">고오염 공정 예외 규칙 적용:</span>{' '}
            <span className="inline-block font-semibold bg-rose-200/80 px-1.5 py-0.2 rounded text-rose-900 mr-1">
              최소 세정시간 유지
            </span>
            오염도 90 이상 공정은 품질 손실을 방지하기 위해 최소 린스/세정시간 이하로 감축하지 않습니다.
          </div>
        </div>
      )}
    </div>
  );
};
