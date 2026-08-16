/**
 * PureFlow AI 시뮬레이션 공정 데이터
 *
 * 실제 생산라인 데이터가 아닌 문헌 기반 시뮬레이션 데이터다.
 * 대표 공정: BEOL Cu/Low-k Post-Etch Clean + UPW Rinse
 * 품질 지표: Cu surface contamination [atoms/cm²]
 * MVP 1차 Gate: Cu ≤ 1.0 × 10¹⁰ atoms/cm² (보수적 Gate, 보편 규격 아님)
 */

import type { ContaminationBand, ProcessDefinition } from "./model";

const DATA_SOURCE = "Literature-based simulation data";
const REFERENCE =
  "Tsutano K. et al., ECS JSST (2025); Tsang C.F. et al., Microelectronics Reliability 45 (2005)";

interface BandSeed {
  band: ContaminationBand;
  score: number;
  initialCu: number;
}

const BAND_SEEDS: BandSeed[] = [
  { band: "low", score: 22, initialCu: 8.0e9 },
  { band: "medium", score: 48, initialCu: 1.2e10 },
  { band: "high", score: 78, initialCu: 2.0e10 },
  { band: "very_high", score: 94, initialCu: 3.0e10 },
];

const ALLOWABLE_CU = 1.0e10;

/**
 * 웨이퍼 크기별 대표 공정 시나리오.
 * 각 웨이퍼는 오염도가 다른 4개 세정 공정을 순차 시뮬레이션한다.
 * 기준 세정 조건은 PureFlow AI 시뮬레이션 기준값이다.
 */
export function getProcesses(waferDiameter: 200 | 300): ProcessDefinition[] {
  // 300mm는 유량·시간이 소폭 큰 기준 조건을 사용한다 (시뮬레이션 값)
  const scale = waferDiameter === 300 ? 1.2 : 1.0;

  const scenarios: Array<{
    id: string;
    name: string;
    description: string;
    baseline: { cleaningTime: number; rinseTime: number; flowRate: number; cycles: number };
    min: { cleaningTime: number; rinseTime: number; flowRate: number; cycles: number };
    K: number;
  }> = [
    {
      id: "P001",
      name: "식각 후 세정",
      description: "BEOL Cu/Low-k Post-Etch Clean + UPW Rinse",
      baseline: { cleaningTime: 10, rinseTime: 8, flowRate: 10, cycles: 2 },
      min: { cleaningTime: 7, rinseTime: 6, flowRate: 8, cycles: 2 },
      K: 0.045,
    },
    {
      id: "P002",
      name: "CMP 후 세정",
      description: "Post-CMP Brush Clean + UPW Rinse",
      baseline: { cleaningTime: 12, rinseTime: 9, flowRate: 12, cycles: 2 },
      min: { cleaningTime: 9, rinseTime: 7, flowRate: 10, cycles: 2 },
      K: 0.05,
    },
    {
      id: "P003",
      name: "확산 전 세정",
      description: "Pre-Diffusion Clean + UPW Rinse",
      baseline: { cleaningTime: 9, rinseTime: 7, flowRate: 9, cycles: 2 },
      min: { cleaningTime: 6, rinseTime: 5, flowRate: 8, cycles: 2 },
      K: 0.05,
    },
    {
      id: "P004",
      name: "금속 증착 후 세정",
      description: "Post-Metal Deposition Clean + UPW Rinse",
      baseline: { cleaningTime: 11, rinseTime: 8, flowRate: 11, cycles: 2 },
      min: { cleaningTime: 8, rinseTime: 6, flowRate: 9, cycles: 2 },
      K: 0.055,
    },
  ];

  return scenarios.map((s, i) => {
    const seed = BAND_SEEDS[i % BAND_SEEDS.length];
    const baseline = {
      cleaningTime: Math.round(s.baseline.cleaningTime * (scale > 1 ? 1 : 1)),
      rinseTime: s.baseline.rinseTime,
      flowRate: Math.round(s.baseline.flowRate * scale),
      cycles: s.baseline.cycles,
    };
    const min = {
      cleaningTime: Math.round(s.min.cleaningTime),
      rinseTime: s.min.rinseTime,
      flowRate: Math.round(s.min.flowRate * scale),
      cycles: s.min.cycles,
    };
    return {
      id: `${s.id}-${waferDiameter}`,
      name: s.name,
      description: s.description,
      contaminationScore: seed.score,
      contaminationBand: seed.band,
      baselineRecipe: baseline,
      minRecipe: min,
      initialCuAtomsCm2: seed.initialCu,
      allowableCuAtomsCm2: ALLOWABLE_CU,
      modelParameters: {
        R_floor: 5.0e8,
        K: s.K,
        alpha: 0.4,
        beta: 0.2,
        Q_ref: baseline.flowRate,
      },
      dataSource: DATA_SOURCE,
      reference: REFERENCE,
    };
  });
}
