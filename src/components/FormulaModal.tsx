import React from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, ExternalLink, ShieldCheck, Check, Info } from 'lucide-react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-2xl border border-[#E2E8F0] bg-white text-[#0F172A] p-6 sm:p-8 shadow-2xl space-y-6 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071A2E] text-[#00C2FF]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#071A2E]">
                문헌 기반 세정 성능 모델 (Surrogate Model)
              </h2>
              <p className="text-xs text-[#64748B]">
                반도체 초순수 세정/린스 수식 및 문헌 근거
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#071A2E] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Surrogate Equation Box */}
        <div className="rounded-xl border border-[#00C2FF]/30 bg-[#071A2E] text-white p-5 space-y-3">
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#00C2FF] uppercase block">
            CORE MATHEMATICAL SURROGATE MODEL
          </span>
          <div className="rounded-lg bg-black/40 p-4 font-mono text-sm sm:text-base text-[#00C2FF] overflow-x-auto">
            R_pred = R_floor + (R_initial - R_floor) × exp( -K × t × (Q / Q_ref)^α × N^β )
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            세정/린스 시간(t), 유량 비율(Q/Q_ref), 사이클 수(N)에 따른 지수함수적 표면 구리(Cu) 오염 제거율을 계산합니다.
          </p>
        </div>

        {/* Variables Definition */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs space-y-2">
          <h4 className="font-bold text-[#071A2E] mb-1">변수 및 파라미터 정의</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#64748B]">
            <li><strong className="text-[#071A2E]">R_pred</strong>: 세정 후 예상 잔류 Cu (atoms/cm²)</li>
            <li><strong className="text-[#071A2E]">R_initial</strong>: 공정 시작 전 초기 Cu 오염도</li>
            <li><strong className="text-[#071A2E]">R_floor</strong>: 모델상 물리적 최소 잔류치</li>
            <li><strong className="text-[#071A2E]">t</strong>: 유효 세정/린스 시간 (min)</li>
            <li><strong className="text-[#071A2E]">Q / Q_ref</strong>: 초순수 공급 유량 비율 (L/min)</li>
            <li><strong className="text-[#071A2E]">N</strong>: 세정/린스 사이클 수</li>
            <li><strong className="text-[#071A2E]">K, α, β</strong>: 공정별 속도 보정 계수 및 민감도</li>
          </ul>
        </div>

        {/* Quality Gate Logic */}
        <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-[#166534] font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>품질 Gate 판정 원칙: R_pred ≤ Allowable Cu</span>
          </div>
          <p className="text-[#166534] leading-relaxed">
            PureFlow AI는 점수화(0~100) 방식이 아닌 <strong>물리적 허용 오염 기준(예: ≤ 1.0 × 10¹⁰ atoms/cm²)</strong>을 먼저 통과한 후보군 중에서만 UPW 최소화 조건을 선택합니다.
          </p>
        </div>

        {/* Academic References */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#071A2E]">주요 참고 문헌 (References)</h4>
          <div className="space-y-1.5 text-[11px] text-[#64748B]">
            <p className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              • <strong>Tsutano K. et al. (2025)</strong>, "Wafer-surface metal adsorption in single wafer DIW rinse", <em>ECS J. Solid State Sci. Technol.</em>
            </p>
            <p className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              • <strong>Tsang C.F. et al. (2005)</strong>, "Wet clean impacts on Cu/low-k post-etch residue and reliability", <em>Microelectronics Reliability 45</em>.
            </p>
            <p className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              • <strong>IEEE TSM (2017) & ECS JSST (2020)</strong>, "Spin rinse dynamics, re-adhesion, and water usage minimization in high-aspect-ratio wafer features".
            </p>
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-2 border-t border-[#E2E8F0] flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#071A2E] text-white px-5 py-2 text-xs font-bold hover:bg-[#0F2942] transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </motion.div>
    </div>
  );
};
