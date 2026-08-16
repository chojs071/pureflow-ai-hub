export type ProcessKey = "SC-1" | "SC-2" | "POST-CMP" | "DHF";

export interface ProcessSpec {
  key: ProcessKey;
  label: string;
  desc: string;
  baseMinutes: number;
  /** L of UPW per minute per 300mm wafer batch */
  flowPerMin: number;
}

export const PROCESSES: ProcessSpec[] = [
  { key: "SC-1", label: "SC-1 (APM)", desc: "파티클·유기물 제거", baseMinutes: 10, flowPerMin: 42 },
  { key: "SC-2", label: "SC-2 (HPM)", desc: "금속 이온 제거", baseMinutes: 10, flowPerMin: 38 },
  { key: "POST-CMP", label: "Post-CMP", desc: "연마 후 슬러리 제거", baseMinutes: 12, flowPerMin: 55 },
  { key: "DHF", label: "DHF", desc: "자연 산화막 제거", baseMinutes: 6, flowPerMin: 30 },
];

export interface Inputs {
  process: ProcessKey;
  diameter: 200 | 300;
  contamination: number; // 1-10
  batchesPerDay: number;
}

export interface Result {
  base: number;
  recommended: number;
  savedMinutes: number;
  waterPerBatch: number;
  waterPerDay: number;
  waterPerYear: number;
  kwhPerYear: number;
  co2PerYear: number;
  qualityScore: number;
}

const KWH_PER_L_UPW = 0.012; // 초순수 정제·이송 전력 원단위(추정)
const KG_CO2_PER_KWH = 0.4594; // 국내 전력 배출계수(추정)

export function recommend(input: Inputs): Result {
  const spec = PROCESSES.find((p) => p.key === input.process)!;
  const diameterFactor = input.diameter === 300 ? 1 : 0.55;
  // 오염도 5.5를 기준으로 ±25% 범위에서 세정 시간을 스케일링
  const ratio = 0.75 + ((input.contamination - 1) / 9) * 0.5;
  const recommended = Math.max(2, Math.round(spec.baseMinutes * ratio * 2) / 2);
  const savedMinutes = Math.max(0, spec.baseMinutes - recommended);

  const waterPerBatch = savedMinutes * spec.flowPerMin * diameterFactor;
  const waterPerDay = waterPerBatch * input.batchesPerDay;
  const waterPerYear = waterPerDay * 330;
  const kwhPerYear = waterPerYear * KWH_PER_L_UPW;
  const co2PerYear = kwhPerYear * KG_CO2_PER_KWH;

  return {
    base: spec.baseMinutes,
    recommended,
    savedMinutes,
    waterPerBatch,
    waterPerDay,
    waterPerYear,
    kwhPerYear,
    co2PerYear,
    qualityScore: Math.min(99.9, 99.2 + input.contamination * 0.05),
  };
}

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString("ko-KR", { maximumFractionDigits: digits, minimumFractionDigits: digits });
