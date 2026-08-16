import React, { useState } from "react";
import { motion } from "motion/react";
import { X, BookOpen, ShieldCheck, Disc, Waves, ExternalLink, Info } from "lucide-react";
import { LITERATURE_REFERENCES, PARAMETER_METADATA_LIST } from "../data/literature";

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "params" | "references">(
    "single",
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl rounded-3xl border border-[#E2E8F0] bg-white text-[#0F172A] p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#071A2E] text-[#00C2FF]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#071A2E]">
                세정 방식 및 8대 공정 수식 모델 & 문헌 근거
              </h2>
              <p className="text-xs text-[#64748B]">
                반도체 초순수(UPW) 세정/린스 물리 surrogate 모델 및 학술 문헌
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#071A2E] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-2">
          <button
            onClick={() => setActiveTab("single")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "single"
                ? "bg-[#071A2E] text-[#00C2FF] shadow-xs"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#071A2E]"
            }`}
          >
            <Disc className="h-3.5 w-3.5" />
            <span>매엽식 (Single Wafer) 모델</span>
          </button>

          <button
            onClick={() => setActiveTab("batch")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "batch"
                ? "bg-[#071A2E] text-[#00C2FF] shadow-xs"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#071A2E]"
            }`}
          >
            <Waves className="h-3.5 w-3.5" />
            <span>배치식 (Batch) 모델</span>
          </button>

          <button
            onClick={() => setActiveTab("params")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "params"
                ? "bg-[#071A2E] text-[#00C2FF] shadow-xs"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#071A2E]"
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span>변수 분류표 (Literature vs MVP)</span>
          </button>

          <button
            onClick={() => setActiveTab("references")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "references"
                ? "bg-[#071A2E] text-[#00C2FF] shadow-xs"
                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#071A2E]"
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>8대 공정 참고 문헌 ({Object.keys(LITERATURE_REFERENCES).length}편)</span>
          </button>
        </div>

        {/* Tab Content 1: Single Wafer Model */}
        {activeTab === "single" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#00C2FF]/30 bg-[#071A2E] text-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-[#00C2FF] uppercase">
                  SINGLE WAFER SURROGATE MODEL (매엽식 모델)
                </span>
                <span className="text-[11px] text-white/70">
                  Ref: [Ref-S-ETCH-1, Ref-S-METAL-1]
                </span>
              </div>
              <div className="rounded-xl bg-black/50 p-4 font-mono text-xs sm:text-sm text-[#00C2FF] overflow-x-auto leading-relaxed">
                R_pred = R_floor + (R_initial - R_floor) × exp( -K × t × (Q / Q_ref)^α × (RPM /
                RPM_ref)^γ × N^β )
              </div>
              <div className="rounded-xl bg-black/30 p-3 font-mono text-xs text-white/90">
                UPW_single = Q (L/min) × t_rinse (min) × N_cycles &nbsp; [L / wafer]
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                단일 웨이퍼 회전 린스에서 초순수 유량(Q), 린스 시간(t), 스핀 속도(RPM), 사이클
                수(N)에 따른 경계층 세정 및 오염물(Cu, PR 잔여물, 파티클) 잔류 농도를 계산합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs space-y-2">
              <h4 className="font-bold text-[#071A2E]">매엽식 주요 변수 & 근거</h4>
              <ul className="space-y-1.5 text-[#64748B]">
                <li>
                  • <strong className="text-[#071A2E]">[문헌 기반] UPW 유량(Q)</strong>: 표면
                  전단응력 및 확산 경계층 두께 제어 [Ref-S-ETCH-1]
                </li>
                <li>
                  • <strong className="text-[#071A2E]">[문헌 기반] 린스 시간(t)</strong>: 오염물
                  탈착 및 잔류 농도 평형 도달 시간 [Ref-S-METAL-1]
                </li>
                <li>
                  • <strong className="text-[#071A2E]">[문헌 기반] 회전수(RPM)</strong>: 원심 유동
                  박막 형성 및 균일 세정 [Ref-S-ETCH-1]
                </li>
                <li>
                  • <strong className="text-[#071A2E]">[문헌 기반] 웨이퍼 직경</strong>: 200mm 대비
                  300mm 표면적(2.25배) 비례 유량 보정 [Ref-S-ETCH-1]
                </li>
                <li>
                  • <strong className="text-[#071A2E]">[MVP 파라미터] K, α, β, γ</strong>: 비선형
                  시뮬레이션 지수 (무차원 가중치)
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab Content 2: Batch Model */}
        {activeTab === "batch" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#00C2FF]/30 bg-[#071A2E] text-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-[#00C2FF] uppercase">
                  BATCH IMMERSION SURROGATE MODEL (배치식 모델)
                </span>
                <span className="text-[11px] text-white/70">
                  Ref: [Ref-B-ETCH-1, Ref-B-BATCH-ADV]
                </span>
              </div>
              <div className="rounded-xl bg-black/50 p-4 font-mono text-xs sm:text-sm text-[#00C2FF] overflow-x-auto leading-relaxed">
                R_pred_batch = R_floor + (R_initial - R_floor) × exp( -K_batch × t_proc × bathFactor
                × rinseFactor × cycleFactor )
              </div>
              <div className="rounded-xl bg-black/30 p-3 font-mono text-xs text-white/90 space-y-1">
                <div>
                  Total_UPW_batch = (V_bath × N_bathChanges) + (Q_rinse × t_rinse × N_rinseCycles)
                  &nbsp; [L / batch]
                </div>
                <div className="text-[#00C2FF]">
                  UPW_per_wafer = Total_UPW_batch / Batch_Size &nbsp; [L / wafer]
                </div>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                다수 웨이퍼(25~50매)를 하나의 Bath 탱크 및 캐스케이드 오버플로우 린스조에서 동시
                침적 처리할 때의 희석 및 세정 거동을 모델링합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs space-y-2">
              <h4 className="font-bold text-[#071A2E]">배치식 주요 변수 & 근거</h4>
              <ul className="space-y-1.5 text-[#64748B]">
                <li>
                  • <strong className="text-[#071A2E]">[문헌 기반] Batch Size (웨이퍼 수)</strong>:
                  캐리어당 동시 침적 웨이퍼 매수 (25~50매) [Ref-B-ETCH-1, Ref-B-BATCH-ADV]
                </li>
                <li>
                  • <strong className="text-[#071A2E]">[문헌 기반] Bath Volume (L)</strong>: 침적조
                  용액 체적 및 충진량 [Ref-B-ETCH-1]
                </li>
                <li>
                  • <strong className="text-[#071A2E]">[문헌 기반] Bath 교체/덤프 횟수</strong>:
                  공정 간 약액/초순수 전량 배출 및 재충진 [Ref-B-ETCH-1]
                </li>
                <li>
                  •{" "}
                  <strong className="text-[#071A2E]">[문헌 기반] Overflow 린스 유량 & 시간</strong>:
                  린스 탱크 내 오염물 배출 유속 [Ref-B-ETCH-1]
                </li>
                <li>
                  • <strong className="text-[#071A2E]">[MVP 파라미터] K_batch, bathFactor</strong>:
                  다중 웨이퍼 침적 총괄 확산 계수
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab Content 3: Parameter Metadata Table */}
        {activeTab === "params" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] font-bold text-[#64748B]">
                    <th className="py-3 px-4">변수명</th>
                    <th className="py-3 px-4">구분</th>
                    <th className="py-3 px-4">설명 및 문헌 근거</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {PARAMETER_METADATA_LIST.map((param) => (
                    <tr key={param.key} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-bold text-[#071A2E]">{param.name}</td>
                      <td className="py-3 px-4">
                        {param.type === "literature" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C2FF]/15 text-[#071A2E] border border-[#00C2FF]/30">
                            Literature-supported
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]">
                            MVP simulation
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#64748B] leading-relaxed">
                        {param.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content 4: Academic References */}
        {activeTab === "references" && (
          <div className="space-y-3 text-xs">
            {Object.entries(LITERATURE_REFERENCES).map(([key, ref]) => (
              <div
                key={ref.id}
                className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#071A2E] text-[#00C2FF] font-mono text-[11px] font-bold">
                    {ref.id} | {ref.processCategory}
                  </span>
                  <span className="text-[11px] font-bold text-[#64748B]">{ref.year}</span>
                </div>
                <h4 className="font-bold text-[#071A2E] text-sm">{ref.title}</h4>
                <p className="text-[11px] text-[#64748B]">
                  {ref.journal} {ref.volume && `vol. ${ref.volume}`}{" "}
                  {ref.pages && `pp. ${ref.pages}`}
                </p>
                {ref.doi && <p className="text-[10px] font-mono text-[#00C2FF]">DOI: {ref.doi}</p>}
                <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[11px] text-[#071A2E]">
                  <strong className="text-[#00C2FF] block mb-0.5">
                    적용 세정 단계 및 핵심 결론:
                  </strong>
                  <div className="font-semibold text-xs text-[#071A2E] mb-1">
                    {ref.cleaningStep}
                  </div>
                  <div className="text-[#64748B]">{ref.keyFinding}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quality Gate Guarantee Notice */}
        <div className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-[#166534] font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>품질 최우선 원칙 (Quality Gate First)</span>
          </div>
          <p className="text-[#166534] leading-relaxed">
            PureFlow AI는 점수화(Score) 방식이 아닌{" "}
            <strong>물리적 허용 오염 기준(예: R_pred ≤ Allowable Limit)</strong>을 먼저 통과한 유효
            후보군 중에서만 UPW 최소 조건을 선정합니다. 기준을 초과하는 조건은 절감률이 아무리
            높아도 즉시 탈락됩니다.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[#64748B] text-[11px]">
            ※ 허용 기준은 공정 및 오염물에 따라 달라지며, PureFlow AI는 문헌 기반 물리 시뮬레이션
            기준을 사용합니다.
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-[#071A2E] text-white px-6 py-2.5 text-xs font-bold hover:bg-[#0F2942] transition-colors cursor-pointer shrink-0"
          >
            확인 및 닫기
          </button>
        </div>
      </motion.div>
    </div>
  );
};
