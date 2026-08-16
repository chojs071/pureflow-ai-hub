import { ContaminationBand, ProcessDefinition, WaferDiameter } from "../types";
import { PROCESS_DATASETS } from "../data/processes";

/**
 * 시드 기반 난수 생성기 (mulberry32).
 * 한 번의 실행 안에서는 결정적이고, 실행(최적화 시작)마다 다른 시드를 사용한다.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bandFor(score: number): ContaminationBand {
  if (score >= 90) return "very-high";
  if (score >= 61) return "high";
  if (score >= 31) return "medium";
  return "low";
}

const round1 = (n: number) => Number(n.toFixed(1));

/**
 * 기준(문헌 기반) 데이터셋을 토대로 랜덤화된 공정 데이터셋을 생성한다.
 *
 * - 오염도 점수: 기준값 ±12 변동 (5~98로 클램프, 밴드는 점수에 따라 재계산)
 * - 초기 Cu 오염: ±25% 변동
 * - 기준 세정 레시피(시간/유량): ±10% 변동 (0.1 단위 반올림)
 * - 모델 파라미터 K/α/β: ±10% 변동
 * - 허용 잔류 오염 기준·R_floor·Q_ref: 문헌 기반 고정값 유지
 *
 * 호출할 때마다 새로운 시드를 사용하므로 실행마다 수치가 달라진다.
 * SSR 하이드레이션 문제를 피하기 위해 클라이언트 이벤트(최적화 시작)에서만 호출한다.
 */
export function generateRandomizedDataset(wafer: WaferDiameter): ProcessDefinition[] {
  const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  const rand = mulberry32(seed);
  const jitter = (base: number, pct: number) => base * (1 + (rand() * 2 - 1) * pct);

  return PROCESS_DATASETS[wafer].map((proc) => {
    const score = Math.max(
      5,
      Math.min(98, Math.round(proc.contaminationScore + (rand() * 2 - 1) * 12)),
    );

    const cleaning = round1(Math.max(2, jitter(proc.baselineRecipe.cleaningTimeMin, 0.1)));
    const rinse = round1(Math.max(1.5, jitter(proc.baselineRecipe.rinseTimeMin, 0.1)));
    const flow = round1(Math.max(3, jitter(proc.baselineRecipe.flowRateLpm, 0.1)));

    // 최적화 하한이 랜덤화된 기준 조건을 넘지 않도록 보정
    const minCleaning = round1(
      Math.max(1, Math.min(proc.optimizationRange.minCleaningTime, cleaning - 0.5)),
    );
    const minRinse = round1(
      Math.max(1, Math.min(proc.optimizationRange.minRinseTime, rinse - 0.5)),
    );
    const minFlow = round1(Math.max(2, Math.min(proc.optimizationRange.minFlowRate, flow - 0.5)));

    return {
      ...proc,
      contaminationScore: score,
      contaminationBand: bandFor(score),
      initialCuAtomsCm2: jitter(proc.initialCuAtomsCm2, 0.25),
      baselineRecipe: {
        cleaningTimeMin: cleaning,
        rinseTimeMin: rinse,
        flowRateLpm: flow,
        cycles: proc.baselineRecipe.cycles,
      },
      optimizationRange: {
        minCleaningTime: minCleaning,
        minRinseTime: minRinse,
        minFlowRate: minFlow,
        minCycles: proc.optimizationRange.minCycles,
      },
      modelParameters: {
        R_floor: proc.modelParameters.R_floor,
        K: Number(jitter(proc.modelParameters.K, 0.1).toFixed(3)),
        alpha: Number(jitter(proc.modelParameters.alpha, 0.1).toFixed(3)),
        beta: Number(jitter(proc.modelParameters.beta, 0.1).toFixed(3)),
        Q_ref: proc.modelParameters.Q_ref,
      },
    };
  });
}
