/**
 * PureFlow AI — 문헌 기반 세정 성능 surrogate model + 규칙 기반 최적화 엔진
 *
 * 품질 판단은 0~100 점수가 아니라
 * "예상 잔류 오염 <= 공정별 허용 잔류 오염 기준"으로 판정한다.
 * 품질 기준을 통과한 후보 중에서만 최소 UPW 조건을 추천한다.
 */

export type ContaminationBand = "low" | "medium" | "high" | "very_high";

export interface Recipe {
  /** 세정 시간 (min) */
  cleaningTime: number;
  /** 린스 시간 (min) */
  rinseTime: number;
  /** UPW 유량 (L/min) */
  flowRate: number;
  /** 린스 횟수 */
  cycles: number;
}

export interface ModelParameters {
  /** 모델상의 최소 잔류값 [atoms/cm²] */
  R_floor: number;
  /** 제거 속도 보정계수 */
  K: number;
  /** 유량 민감도 */
  alpha: number;
  /** cycle 효과 */
  beta: number;
  /** 기준 유량 (L/min) */
  Q_ref: number;
}

export interface ProcessDefinition {
  id: string;
  name: string;
  description: string;
  /** 0~100 시뮬레이션 오염도 지표 */
  contaminationScore: number;
  contaminationBand: ContaminationBand;
  baselineRecipe: Recipe;
  /** 허용 최적화 하한 (고오염 시 세정시간 하한은 기준 조건으로 고정된다) */
  minRecipe: Recipe;
  /** 초기 Cu 오염 [atoms/cm²] */
  initialCuAtomsCm2: number;
  /** 공정별 허용 잔류 Cu 기준 [atoms/cm²] */
  allowableCuAtomsCm2: number;
  modelParameters: ModelParameters;
  /** 데이터 출처 표시 */
  dataSource: string;
  reference?: string;
}

export interface Candidate {
  recipe: Recipe;
  upw: number;
  predictedResidualCu: number;
  qualityPass: boolean;
  isBaseline: boolean;
}

export interface OptimizationResult {
  process: ProcessDefinition;
  baselineUpw: number;
  candidates: Candidate[];
  validCandidates: Candidate[];
  /** 추천 후보. null이면 품질 기준을 유지하면서 줄일 수 없어 기준 조건을 유지한다. */
  recommendation: Candidate | null;
  recommendedUpw: number;
  predictedResidualCu: number;
  qualityPass: boolean;
  savings: number;
  savingsRate: number;
  /** true: 통과 후보가 없어 기준 조건 유지 */
  fallback: boolean;
}

/**
 * MVP surrogate model:
 * R_pred = R_floor + (R_initial - R_floor) × exp(-K × t × (Q/Q_ref)^α × N^β)
 */
export function predictResidualCu(
  params: ModelParameters,
  initialCu: number,
  recipe: Recipe,
): number {
  const t = recipe.cleaningTime + recipe.rinseTime;
  const exponent =
    -params.K *
    t *
    Math.pow(recipe.flowRate / params.Q_ref, params.alpha) *
    Math.pow(recipe.cycles, params.beta);
  return params.R_floor + (initialCu - params.R_floor) * Math.exp(exponent);
}

/** UPW 사용량(L) = 유량 × (세정시간 + 린스시간) × 횟수 (단계별 합산) */
export function calculateUPW(recipe: Recipe): number {
  return recipe.flowRate * (recipe.cleaningTime + recipe.rinseTime) * recipe.cycles;
}

export function contaminationBand(score: number): ContaminationBand {
  if (score >= 90) return "very_high";
  if (score >= 61) return "high";
  if (score >= 31) return "medium";
  return "low";
}

export const BAND_LABEL: Record<ContaminationBand, string> = {
  low: "낮은 오염",
  medium: "중간 오염",
  high: "높은 오염",
  very_high: "매우 높은 오염",
};

function recipeKey(r: Recipe): string {
  return `${r.cleaningTime}|${r.rinseTime}|${r.flowRate}|${r.cycles}`;
}

/**
 * 기준 조건과 공정별 허용 범위 안에서 후보 조건을 생성한다.
 * 오염도 90 이상이면 최소 세정시간을 줄이지 않는다.
 */
export function generateCandidates(process: ProcessDefinition): Candidate[] {
  const { baselineRecipe, minRecipe, contaminationScore } = process;
  // 고오염 공정: 세정시간 하한을 기준 조건으로 고정
  const minCleaningTime =
    contaminationScore >= 90 ? baselineRecipe.cleaningTime : minRecipe.cleaningTime;

  const seen = new Set<string>();
  const candidates: Candidate[] = [];

  for (let cleaning = baselineRecipe.cleaningTime; cleaning >= minCleaningTime; cleaning--) {
    for (let rinse = baselineRecipe.rinseTime; rinse >= minRecipe.rinseTime; rinse--) {
      for (let flow = baselineRecipe.flowRate; flow >= minRecipe.flowRate; flow--) {
        for (let cycles = baselineRecipe.cycles; cycles >= minRecipe.cycles; cycles--) {
          const recipe: Recipe = {
            cleaningTime: cleaning,
            rinseTime: rinse,
            flowRate: flow,
            cycles,
          };
          const key = recipeKey(recipe);
          if (seen.has(key)) continue;
          seen.add(key);

          const predictedResidualCu = predictResidualCu(
            process.modelParameters,
            process.initialCuAtomsCm2,
            recipe,
          );
          candidates.push({
            recipe,
            upw: calculateUPW(recipe),
            predictedResidualCu,
            qualityPass: predictedResidualCu <= process.allowableCuAtomsCm2,
            isBaseline: key === recipeKey(baselineRecipe),
          });
        }
      }
    }
  }

  return candidates.sort((a, b) => a.upw - b.upw);
}

/**
 * 추천 로직:
 * 후보 생성 → 잔류 Cu 계산 → 품질 기준 통과 후보만 유지 → UPW 오름차순 → 최소 UPW 선택.
 * 통과 후보가 없으면 기준 조건을 유지한다 (품질을 희생하는 추천은 하지 않는다).
 */
export function optimizeProcess(process: ProcessDefinition): OptimizationResult {
  const candidates = generateCandidates(process);
  const baseline = candidates.find((c) => c.isBaseline)!;
  const baselineUpw = baseline.upw;

  const validCandidates = candidates
    .filter((c) => c.qualityPass && !c.isBaseline)
    .sort((a, b) => a.upw - b.upw);

  const recommendation = validCandidates[0] ?? null;
  const chosen = recommendation ?? baseline;

  const recommendedUpw = chosen.upw;
  const savings = baselineUpw - recommendedUpw;
  const savingsRate = baselineUpw > 0 ? (savings / baselineUpw) * 100 : 0;

  return {
    process,
    baselineUpw,
    candidates,
    validCandidates,
    recommendation,
    recommendedUpw,
    predictedResidualCu: chosen.predictedResidualCu,
    qualityPass: chosen.qualityPass,
    savings,
    savingsRate,
    fallback: recommendation === null,
  };
}

const SUPERSCRIPTS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
};

/** 8.4e9 → "8.4 × 10⁹" */
export function formatAtoms(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  const exp = Math.floor(Math.log10(n));
  const mantissa = n / Math.pow(10, exp);
  const sup = String(exp)
    .split("")
    .map((c) => SUPERSCRIPTS[c] ?? c)
    .join("");
  return `${mantissa.toFixed(1)} × 10${sup}`;
}

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString("ko-KR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
