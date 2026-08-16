import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Droplets, ArrowDownRight, Layers, CheckCircle, Clock, Wind, RefreshCw, AlertTriangle } from 'lucide-react';
import { ProcessResult } from '../types';
import { ContaminationGauge } from './ContaminationGauge';
import { formatScientific, formatThreshold } from '../utils/model';

interface CurrentProcessCardProps {
  result: ProcessResult;
}

export const CurrentProcessCard: React.FC<CurrentProcessCardProps> = ({ result }) => {
  const { process, baselineUPW, recommendedUPW, savingsLiters, savingsPercent, recommendedCandidate, qualityPass } = result;

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <span className="rounded-md bg-[#071A2E]/5 px-2.5 py-0.5 text-xs font-bold text-[#071A2E] ring-1 ring-[#071A2E]/10">
            {process.category} • Step 0{process.stepNumber}
          </span>
          <span className="text-xs font-mono text-[#64748B]">
            Ref: {process.referenceDoc}
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[#071A2E]">
          {process.name}
        </h2>
        <p className="text-sm font-semibold text-[#00C2FF] mt-0.5">
          {process.subName}
        </p>
        <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
          {process.description}
        </p>
      </div>

      {/* Contamination Gauge Component */}
      <ContaminationGauge score={process.contaminationScore} band={process.contaminationBand} />

      {/* Quality Assurance Card (Top priority - Placed prominently) */}
      <div className={`rounded-xl border p-4.5 ${
        qualityPass
          ? 'bg-[#22C55E]/5 border-[#22C55E]/30 ring-1 ring-[#22C55E]/20'
          : 'bg-rose-50 border-rose-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              qualityPass ? 'bg-[#22C55E] text-white' : 'bg-rose-600 text-white'
            }`}>
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#071A2E]">
              세정 후 품질 검증 (Quality Verification Gate)
            </span>
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
            qualityPass ? 'bg-[#22C55E] text-white' : 'bg-rose-600 text-white'
          }`}>
            <CheckCircle className="h-3.5 w-3.5" />
            <span>✓ 품질 기준 충족</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Predicted Residual Contamination */}
          <div className="rounded-lg bg-white p-3 border border-[#E2E8F0]">
            <span className="text-[11px] font-medium text-[#64748B] block mb-0.5">
              예상 잔류 Cu 오염 (R_pred)
            </span>
            <span className="font-mono text-base sm:text-lg font-black text-[#071A2E]">
              {formatScientific(recommendedCandidate.predictedResidualCu)}
            </span>
            <span className="block text-[10px] text-[#22C55E] font-medium mt-0.5">
              초기 {formatScientific(process.initialCuAtomsCm2)} 대비 99%+ 제거
            </span>
          </div>

          {/* Allowable Limit */}
          <div className="rounded-lg bg-white p-3 border border-[#E2E8F0]">
            <span className="text-[11px] font-medium text-[#64748B] block mb-0.5">
              허용 기준 (Gate Limit)
            </span>
            <span className="font-mono text-base sm:text-lg font-black text-[#071A2E]">
              {formatThreshold(process.allowableCuAtomsCm2)}
            </span>
            <span className="block text-[10px] text-[#64748B] font-medium mt-0.5">
              문헌 기반 안전 마진 통과
            </span>
          </div>
        </div>

        <p className="text-[10px] text-[#64748B] mt-2.5 leading-normal">
          ※ 허용 기준은 공정 및 오염물 종류에 따라 달라지며, PureFlow AI는 품질 기준을 충족하지 못하는 후보 조건을 원천 제외합니다.
        </p>
      </div>

      {/* UPW Optimization Metrics Block */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Baseline UPW */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
          <span className="text-[11px] font-medium text-[#64748B] block mb-1">
            기존 UPW 사용량
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#64748B]">
              {baselineUPW}
            </span>
            <span className="text-xs font-semibold text-[#64748B]">L</span>
          </div>
        </div>

        {/* Recommended UPW (Emphasized with Electric Blue / Navy) */}
        <div className="rounded-xl border-2 border-[#00C2FF] bg-[#00C2FF]/5 p-3.5 ring-1 ring-[#00C2FF]/20 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#071A2E]">
              AI 추천 UPW
            </span>
            <span className="flex h-2 w-2 rounded-full bg-[#00C2FF]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl sm:text-2xl font-black text-[#071A2E]">
              {recommendedUPW}
            </span>
            <span className="text-xs font-bold text-[#071A2E]">L</span>
          </div>
        </div>

        {/* Savings Amount (Green) */}
        <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-3.5">
          <span className="text-[11px] font-bold text-[#166534] block mb-1">
            초순수 절감량
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl sm:text-2xl font-black text-[#166534]">
              {savingsLiters}
            </span>
            <span className="text-xs font-bold text-[#166534]">L</span>
          </div>
        </div>

        {/* Savings Percent (Green) */}
        <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-3.5">
          <span className="text-[11px] font-bold text-[#166534] block mb-1">
            절감률 (Efficiency)
          </span>
          <div className="flex items-baseline gap-1 text-[#166534]">
            <span className="font-mono text-xl sm:text-2xl font-black">
              {savingsPercent}
            </span>
            <span className="text-xs font-bold">%</span>
          </div>
        </div>
      </div>

      {/* Recipe Parameter Diff (Baseline vs AI Recommended) */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#071A2E] mb-3 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-[#00C2FF]" />
          <span>공정 제어 파라미터 최적화 비교 (Recipe Parameters)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded-lg bg-white p-2.5 border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block flex items-center gap-1">
              <Clock className="h-3 w-3" /> 세정 시간
            </span>
            <div className="flex items-baseline gap-1 mt-1 font-mono font-bold text-[#071A2E]">
              <span className="text-[#94A3B8] line-through text-[11px]">{process.baselineRecipe.cleaningTimeMin}m</span>
              <span>→</span>
              <span className="text-[#071A2E]">{recommendedCandidate.cleaningTimeMin} min</span>
            </div>
          </div>

          <div className="rounded-lg bg-white p-2.5 border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block flex items-center gap-1">
              <Droplets className="h-3 w-3" /> 린스 시간
            </span>
            <div className="flex items-baseline gap-1 mt-1 font-mono font-bold text-[#071A2E]">
              <span className="text-[#94A3B8] line-through text-[11px]">{process.baselineRecipe.rinseTimeMin}m</span>
              <span>→</span>
              <span className="text-[#071A2E]">{recommendedCandidate.rinseTimeMin} min</span>
            </div>
          </div>

          <div className="rounded-lg bg-white p-2.5 border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block flex items-center gap-1">
              <Wind className="h-3 w-3" /> UPW 유량
            </span>
            <div className="flex items-baseline gap-1 mt-1 font-mono font-bold text-[#071A2E]">
              <span className="text-[#94A3B8] line-through text-[11px]">{process.baselineRecipe.flowRateLpm}</span>
              <span>→</span>
              <span className="text-[#071A2E]">{recommendedCandidate.flowRateLpm} L/min</span>
            </div>
          </div>

          <div className="rounded-lg bg-white p-2.5 border border-[#E2E8F0]">
            <span className="text-[10px] text-[#64748B] block flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> 사이클 수
            </span>
            <div className="flex items-baseline gap-1 mt-1 font-mono font-bold text-[#071A2E]">
              <span className="text-[#071A2E]">{recommendedCandidate.cycles} 회</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
