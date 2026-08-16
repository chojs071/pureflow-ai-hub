import {
  CandidateCondition,
  CleaningMode,
  ESGSavingsSummary,
  ProcessDefinition,
  ProcessResult,
  SingleWaferModelParameters,
  SingleWaferRecipe,
  BatchModelParameters,
  BatchRecipe,
} from "../types";
import { validateBatchSize, getBatchSizeErrorMessage } from "./validation";

export { validateBatchSize, getBatchSizeErrorMessage };

/**
 * ============================================================================
 * 1. SINGLE WAFER — 순차 세정/린스 엔진 (Sequential Cleaning → Rinse Engines)
 * ============================================================================
 * 계산 순서 (절대 병렐 계산하지 않는다):
 *   C_initial → [Cleaning Engine] → C_clean → [Rinse Engine] → C_final → Quality Gate
 *
 * 각 단계 제거율은 saturation 형태를 가진다:
 *   η = 1 - exp(-exposure),  0 ≤ η ≤ 1
 *
 * Cleaning Engine:
 *   C_clean = R_floor + (C_initial - R_floor) · exp(-K·t_clean·(Q/Q_ref)^α·(RPM/RPM_ref)^γ)
 * Rinse Engine (세정 후 잔류를 입력으로 사용):
 *   C_final = R_floor + (C_clean - R_floor) · exp(-K·t_rinse·(Q/Q_ref)^α·(RPM/RPM_ref)^γ·N^β)
 *
 * UPW (세정/린스 독립 계산):
 *   V_clean = Q · t_clean (세정은 1회 통과)
 *   V_rinse = Q · t_rinse · N
 *   V_total = V_clean + V_rinse
 */

/** 단계별 제거 계산 결과 */
export interface StageRemovalResult {
  cIn: number; // 단계 입력 오염
  cOut: number; // 단계 출력(잔류) 오염
  efficiency: number; // η = 1 - exp(-exposure), 0~1
  exposure: number; // 지수 노출량
}

/**
 * 온도 효과 (Simulation coefficient):
 * Arrhenius 근사 — 기준 20℃ 대비 절대온도 비의 1.5제곱.
 * 계수(exp=1.5)는 MVP 시뮬레이션 계수이며 문헌 직접 측정값이 아니다.
 */
export function temperatureFactor(temperatureC: number): number {
  const T = typeof temperatureC === "number" && Number.isFinite(temperatureC) ? temperatureC : 20;
  return Math.pow((T + 273.15) / 293.15, 1.5);
}

/** Cleaning Engine — 세정 조건(시간·유량·RPM)이 실제 계산에 반영된다 */
export function calculateCleaningStageSingle(
  C_initial: number,
  recipe: SingleWaferRecipe,
  params: SingleWaferModelParameters,
  temperatureC?: number,
): StageRemovalResult {
  const { R_floor, K, alpha, gamma, Q_ref, RPM_ref } = params;
  const flowFactor = Math.pow(Math.max(0.1, recipe.flowRateLpm / Q_ref), alpha);
  const rpmFactor = Math.pow(Math.max(0.1, recipe.spinRpm / RPM_ref), gamma);
  const exposure =
    K * temperatureFactor(temperatureC ?? 20) * recipe.cleaningTimeMin * flowFactor * rpmFactor;
  const delta = Math.max(0, C_initial - R_floor);
  const cOut = R_floor + delta * Math.exp(-exposure);
  return { cIn: C_initial, cOut, efficiency: 1 - Math.exp(-exposure), exposure };
}

/** Rinse Engine — 반드시 세정 후 잔류 오염(C_clean)을 입력으로 사용한다 */
export function calculateRinseStageSingle(
  C_clean: number,
  recipe: SingleWaferRecipe,
  params: SingleWaferModelParameters,
  temperatureC?: number,
): StageRemovalResult {
  const { R_floor, K, alpha, beta, gamma, Q_ref, RPM_ref } = params;
  const flowFactor = Math.pow(Math.max(0.1, recipe.flowRateLpm / Q_ref), alpha);
  const rpmFactor = Math.pow(Math.max(0.1, recipe.spinRpm / RPM_ref), gamma);
  const cycleFactor = Math.pow(Math.max(1, recipe.rinseCycles), beta);
  const exposure =
    K *
    temperatureFactor(temperatureC ?? 20) *
    recipe.rinseTimeMin *
    flowFactor *
    rpmFactor *
    cycleFactor;
  const delta = Math.max(0, C_clean - R_floor);
  const cOut = R_floor + delta * Math.exp(-exposure);
  return { cIn: C_clean, cOut, efficiency: 1 - Math.exp(-exposure), exposure };
}

/** 통합 잔류 계산 — 순차 엔진(세정 → 린스)으로 최종 C_final을 반환한다 */
export function calculateSingleWaferResidual(
  R_initial: number,
  recipe: SingleWaferRecipe,
  params: SingleWaferModelParameters,
  temperatureC?: number,
): number {
  const cleaned = calculateCleaningStageSingle(R_initial, recipe, params, temperatureC);
  return calculateRinseStageSingle(cleaned.cOut, recipe, params, temperatureC).cOut;
}

/** 세정 UPW와 린스 UPW를 독립적으로 계산한다 */
export function calculateSingleWaferUPWBreakdown(recipe: SingleWaferRecipe): {
  cleaningUPW: number;
  rinseUPW: number;
  totalUPW: number;
} {
  const cleaningUPW = Number((recipe.flowRateLpm * recipe.cleaningTimeMin).toFixed(1)); // 1회 통과
  const rinseUPW = Number(
    (recipe.flowRateLpm * recipe.rinseTimeMin * recipe.rinseCycles).toFixed(1),
  );
  return { cleaningUPW, rinseUPW, totalUPW: Number((cleaningUPW + rinseUPW).toFixed(1)) };
}

export function calculateSingleWaferUPW(recipe: SingleWaferRecipe): number {
  return calculateSingleWaferUPWBreakdown(recipe).totalUPW;
}

/**
 * ============================================================================
 * 2. BATCH — 순차 세정/린스 엔진
 * ============================================================================
 * 계산 순서: C_initial → [Cleaning: bath immersion] → C_clean → [Rinse: overflow] → C_final
 *
 * Cleaning Engine (bath chemistry):
 *   C_clean = R_floor + (C_initial - R_floor)·exp(-K_batch·t_process·bathFactor)
 * Rinse Engine (세정 후 잔류를 입력으로 사용):
 *   C_final = R_floor + (C_clean - R_floor)·exp(-K_batch·t_rinse·rinseFactor·cycleFactor)
 *
 * UPW (세정/린스 독립 계산):
 *   cleaningUPW(bath) = bathVolumeL × bathChanges
 *   rinseUPW = rinseFlowRateLpm × rinseTimeMin × rinseCycles
 *   totalBatchUPW = cleaningUPW + rinseUPW,  perWaferUPW = total / batchSize
 */

/** Cleaning Engine (batch) — bath 침적 조건이 세정 단계에 반영된다 */
export function calculateCleaningStageBatch(
  C_initial: number,
  recipe: BatchRecipe,
  params: BatchModelParameters,
  temperatureC?: number,
): StageRemovalResult {
  const { R_floor, K_batch, bathVolumeRefPerWafer, alpha_bath } = params;
  const volPerWafer = recipe.bathVolumeL / recipe.batchSize;
  const bathFactor = Math.pow(Math.max(0.2, volPerWafer / bathVolumeRefPerWafer), alpha_bath);
  const exposure =
    K_batch * temperatureFactor(temperatureC ?? 20) * recipe.processTimeMin * bathFactor;
  const delta = Math.max(0, C_initial - R_floor);
  const cOut = R_floor + delta * Math.exp(-exposure);
  return { cIn: C_initial, cOut, efficiency: 1 - Math.exp(-exposure), exposure };
}

/** Rinse Engine (batch) — 세정 후 잔류 오염을 입력으로 사용한다 */
export function calculateRinseStageBatch(
  C_clean: number,
  recipe: BatchRecipe,
  params: BatchModelParameters,
  temperatureC?: number,
): StageRemovalResult {
  const { R_floor, K_batch, rinseFlowRefLpm, alpha_rinse, beta_cycle } = params;
  const rinseDelivery =
    (recipe.rinseFlowRateLpm * recipe.rinseTimeMin) / Math.max(1, rinseFlowRefLpm * 6.0);
  const rinseFactor = Math.pow(Math.max(0.2, rinseDelivery), alpha_rinse);
  const cycleFactor = Math.pow(Math.max(1, recipe.rinseCycles), beta_cycle);
  const exposure =
    K_batch *
    temperatureFactor(temperatureC ?? 20) *
    recipe.rinseTimeMin *
    rinseFactor *
    cycleFactor;
  const delta = Math.max(0, C_clean - R_floor);
  const cOut = R_floor + delta * Math.exp(-exposure);
  return { cIn: C_clean, cOut, efficiency: 1 - Math.exp(-exposure), exposure };
}

export function calculateBatchResidual(
  R_initial: number,
  recipe: BatchRecipe,
  params: BatchModelParameters,
  temperatureC?: number,
): number {
  const validation = validateBatchSize(recipe.batchSize);
  if (!validation.valid) {
    throw new Error(`[PureFlow Validation Error] ${validation.message || "Invalid Batch Size"}`);
  }

  const cleaned = calculateCleaningStageBatch(R_initial, recipe, params, temperatureC);
  return calculateRinseStageBatch(cleaned.cOut, recipe, params, temperatureC).cOut;
}

export function calculateBatchUPW(recipe: BatchRecipe): {
  totalBatchUPW: number;
  perWaferUPW: number;
} {
  const validation = validateBatchSize(recipe.batchSize);
  if (!validation.valid) {
    throw new Error(`[PureFlow Validation Error] ${validation.message || "Invalid Batch Size"}`);
  }

  const bathUPW = recipe.bathVolumeL * recipe.bathChanges;
  const rinseUPW = recipe.rinseFlowRateLpm * recipe.rinseTimeMin * recipe.rinseCycles;
  const totalBatchUPW = Number((bathUPW + rinseUPW).toFixed(1));
  const perWaferUPW = Number((totalBatchUPW / recipe.batchSize).toFixed(2));
  return { totalBatchUPW, perWaferUPW };
}

/**
 * ============================================================================
 * 3. AI CANDIDATE GENERATION & STRICT QUALITY GATE FIRST EVALUATOR
 * ============================================================================
 * 1) Generate candidate conditions.
 * 2) Calculate predicted residual contamination.
 * 3) Quality Gate: candidate.predictedResidual <= allowableLimit.
 * 4) Calculate UPW usage.
 * 5) Filter validCandidates (passed quality gate only).
 * 6) Sort valid candidates by UPW ASC (least UPW first).
 * 7) Pick validCandidates[0] as recommendation.
 * 8) If no valid candidates, return baseline safely with fallback notice.
 */
export function generateAndEvaluateCandidates(process: ProcessDefinition): ProcessResult {
  // If EDS (optimizationEnabled: false), return non-optimized result safely
  if (!process.optimizationEnabled) {
    const dummyCandidate: CandidateCondition = {
      id: `cand-${process.id}-excluded`,
      cleaningMode: process.cleaningMode,
      upwUsageLiters: 0,
      perWaferUPW: 0,
      predictedResidual: 0,
      allowableLimit: 0,
      qualityPass: true,
      isRecommended: true,
      savingsLiters: 0,
      savingsPercent: 0,
      conditionSummary: "전기적 특성 검사 공정 (UPW 최적화 대상 제외)",
    };

    return {
      process,
      cleaningMode: process.cleaningMode,
      wafer: process.wafer,
      baselineUPW: 0,
      recommendedUPW: 0,
      savingsLiters: 0,
      savingsPercent: 0,
      recommendedCandidate: dummyCandidate,
      allCandidates: [dummyCandidate],
      validCandidatesCount: 0,
      qualityPass: true,
      hasValidCandidates: true,
      noValidMessage:
        process.nonOptimizationReason ||
        "EDS는 전기적 특성 검사 공정으로 UPW 최적화 대상에서 제외됩니다.",
    };
  }

  if (process.cleaningMode === "single" && process.singleRecipe && process.singleModelParams) {
    return evaluateSingleWaferProcess(process);
  } else if (process.cleaningMode === "batch" && process.batchRecipe && process.batchModelParams) {
    return evaluateBatchProcess(process);
  }

  throw new Error(`Invalid process configuration for mode: ${process.cleaningMode}`);
}

/**
 * Single Wafer Evaluation Handler
 *
 * 순차 계산 디버그 객체 (스펙 19절):
 * initialContamination → cleaning → rinse → final → gate → UPW 분리
 */
export interface ConditionEvaluation {
  initialContamination: number;
  cleaningEfficiency: number;
  contaminationAfterCleaning: number;
  rinseEfficiency: number;
  finalContamination: number;
  cleaningUPW: number;
  rinseUPW: number;
  totalUPW: number;
  qualityLimit: number;
  qualityGate: boolean;
}

function evaluateSingleCondition(
  initialContamination: number,
  recipe: SingleWaferRecipe,
  params: SingleWaferModelParameters,
  allowableLimit: number,
  temperatureC?: number,
): ConditionEvaluation {
  const cleaning = calculateCleaningStageSingle(initialContamination, recipe, params, temperatureC);
  const rinse = calculateRinseStageSingle(cleaning.cOut, recipe, params, temperatureC);
  const upw = calculateSingleWaferUPWBreakdown(recipe);
  const finalContamination = rinse.cOut;
  return {
    initialContamination,
    cleaningEfficiency: Number(cleaning.efficiency.toFixed(4)),
    contaminationAfterCleaning: cleaning.cOut,
    rinseEfficiency: Number(rinse.efficiency.toFixed(4)),
    finalContamination,
    cleaningUPW: upw.cleaningUPW,
    rinseUPW: upw.rinseUPW,
    totalUPW: upw.totalUPW,
    qualityLimit: allowableLimit,
    qualityGate: finalContamination <= allowableLimit,
  };
}

function evaluateBatchCondition(
  initialContamination: number,
  recipe: BatchRecipe,
  params: BatchModelParameters,
  allowableLimit: number,
  temperatureC?: number,
): ConditionEvaluation {
  const cleaning = calculateCleaningStageBatch(initialContamination, recipe, params, temperatureC);
  const rinse = calculateRinseStageBatch(cleaning.cOut, recipe, params, temperatureC);
  const { totalBatchUPW, perWaferUPW } = calculateBatchUPW(recipe);
  const bathUPW = Number((recipe.bathVolumeL * recipe.bathChanges).toFixed(1));
  const rinseUPW = Number((totalBatchUPW - bathUPW).toFixed(1));
  const finalContamination = rinse.cOut;
  return {
    initialContamination,
    cleaningEfficiency: Number(cleaning.efficiency.toFixed(4)),
    contaminationAfterCleaning: cleaning.cOut,
    rinseEfficiency: Number(rinse.efficiency.toFixed(4)),
    finalContamination,
    cleaningUPW: bathUPW,
    rinseUPW,
    totalUPW: totalBatchUPW,
    qualityLimit: allowableLimit,
    qualityGate: finalContamination <= allowableLimit,
  };
}

function evaluateSingleWaferProcess(process: ProcessDefinition): ProcessResult {
  const recipe = process.singleRecipe!;
  const params = process.singleModelParams!;
  const { initialContamination, qualityMetric } = process;
  const allowableLimit = qualityMetric.allowableLimit;
  const temperatureC = process.simulationTemperatureC;

  // 고오염(정규화 점수 ≥ 90) 공정은 최소 세정시간을 유지한다 (최적화에서 세정시간 축소 금지)
  const lockCleaningTime = process.contaminationScore >= 90;

  const baselineEval = evaluateSingleCondition(
    initialContamination,
    recipe,
    params,
    allowableLimit,
    temperatureC,
  );
  const baselineUPW = baselineEval.totalUPW;
  const baselineResidual = baselineEval.finalContamination;

  const candidatesMap = new Map<string, CandidateCondition>();

  // 1. Baseline Candidate (사용자 현재 입력 조건 그대로)
  const baselineCandidate: CandidateCondition = {
    id: `cand-${process.id}-baseline`,
    cleaningMode: "single",
    cleaningTimeMin: recipe.cleaningTimeMin,
    rinseTimeMin: recipe.rinseTimeMin,
    flowRateLpm: recipe.flowRateLpm,
    spinRpm: recipe.spinRpm,
    cycles: recipe.rinseCycles,
    upwUsageLiters: baselineEval.totalUPW,
    perWaferUPW: baselineEval.totalUPW,
    predictedResidual: baselineEval.finalContamination,
    allowableLimit,
    qualityPass: baselineEval.qualityGate,
    savingsLiters: 0,
    savingsPercent: 0,
    conditionSummary: `${recipe.flowRateLpm} L/min • 세정 ${recipe.cleaningTimeMin}m • 린스 ${recipe.rinseTimeMin}m × ${recipe.rinseCycles} • ${recipe.spinRpm} RPM`,
    cleaningUPW: baselineEval.cleaningUPW,
    rinseUPW: baselineEval.rinseUPW,
    cleaningEfficiency: baselineEval.cleaningEfficiency,
    rinseEfficiency: baselineEval.rinseEfficiency,
    contaminationAfterCleaning: baselineEval.contaminationAfterCleaning,
  };
  candidatesMap.set(`base`, baselineCandidate);

  // Single Wafer variations — 세정 조건과 린스 조건을 동시에 탐색
  const flowSteps = [
    recipe.flowRateLpm,
    recipe.flowRateLpm * 0.9,
    recipe.flowRateLpm * 0.8,
    recipe.flowRateLpm * 0.7,
    recipe.flowRateLpm * 0.6,
  ];
  const rinseTimeSteps = [
    recipe.rinseTimeMin,
    recipe.rinseTimeMin * 0.9,
    recipe.rinseTimeMin * 0.8,
    recipe.rinseTimeMin * 0.65,
  ];
  const cleaningTimeSteps = lockCleaningTime
    ? [recipe.cleaningTimeMin]
    : [recipe.cleaningTimeMin, recipe.cleaningTimeMin * 0.9, recipe.cleaningTimeMin * 0.8];
  const rpmSteps = [recipe.spinRpm, recipe.spinRpm * 1.1, recipe.spinRpm * 0.9];

  flowSteps.forEach((flow) => {
    const q = Number(flow.toFixed(1));
    cleaningTimeSteps.forEach((cTime) => {
      const tc = Number(cTime.toFixed(1));
      rinseTimeSteps.forEach((time) => {
        const t = Number(time.toFixed(1));
        rpmSteps.forEach((rpm) => {
          const r = Math.round(rpm / 50) * 50;
          const key = `${q}-${tc}-${t}-${r}`;
          if (!candidatesMap.has(key)) {
            const testRecipe: SingleWaferRecipe = {
              cleaningTimeMin: tc,
              rinseTimeMin: t,
              flowRateLpm: q,
              spinRpm: r,
              rinseCycles: recipe.rinseCycles,
            };

            const evaluation = evaluateSingleCondition(
              initialContamination,
              testRecipe,
              params,
              allowableLimit,
              temperatureC,
            );
            const upw = evaluation.totalUPW;
            const predicted = evaluation.finalContamination;
            const pass = evaluation.qualityGate;
            const savingsLiters = Number((baselineUPW - upw).toFixed(1));
            const savingsPercent =
              baselineUPW > 0 ? Number(((savingsLiters / baselineUPW) * 100).toFixed(1)) : 0;

            let rejectionReason: string | undefined;
            if (!pass) {
              rejectionReason = `잔류 오염(${formatContaminationValue(predicted, qualityMetric.unit)})이 허용 기준(${formatThreshold(allowableLimit, qualityMetric.unit)})을 초과하여 탈락`;
            }

            candidatesMap.set(key, {
              id: `cand-${process.id}-${key}`,
              cleaningMode: "single",
              cleaningTimeMin: tc,
              rinseTimeMin: t,
              flowRateLpm: q,
              spinRpm: r,
              cycles: recipe.rinseCycles,
              upwUsageLiters: upw,
              perWaferUPW: upw,
              predictedResidual: predicted,
              allowableLimit,
              qualityPass: pass,
              savingsLiters,
              savingsPercent,
              rejectionReason,
              conditionSummary: `${q} L/min • 세정 ${tc}m • 린스 ${t}m × ${recipe.rinseCycles} • ${r} RPM`,
              cleaningUPW: evaluation.cleaningUPW,
              rinseUPW: evaluation.rinseUPW,
              cleaningEfficiency: evaluation.cleaningEfficiency,
              rinseEfficiency: evaluation.rinseEfficiency,
              contaminationAfterCleaning: evaluation.contaminationAfterCleaning,
            });
          }
        });
      });
    });
  });

  const allList = Array.from(candidatesMap.values());
  const validCandidates = allList.filter((c) => c.qualityPass);

  // Sort valid candidates by UPW ASC (least UPW first)
  validCandidates.sort((a, b) => {
    if (a.upwUsageLiters !== b.upwUsageLiters) {
      return a.upwUsageLiters - b.upwUsageLiters;
    }
    return a.predictedResidual - b.predictedResidual;
  });

  let recommendedCandidate: CandidateCondition;
  const hasValid = validCandidates.length > 0;
  let noValidMessage: string | undefined;

  if (hasValid) {
    recommendedCandidate = { ...validCandidates[0], isRecommended: true };
  } else {
    // Fallback safely to baseline
    noValidMessage =
      "현재 세정 조건에서는 품질 기준을 유지하면서 UPW를 줄일 수 있는 조건을 찾지 못했습니다. 기준 세정 조건을 유지합니다.";
    recommendedCandidate = {
      ...baselineCandidate,
      isRecommended: true,
      rejectionReason: noValidMessage,
    };
  }

  // Curate 4 comparison candidates for clear UI demonstration
  const rejected = allList
    .filter((c) => !c.qualityPass)
    .sort((a, b) => a.upwUsageLiters - b.upwUsageLiters);
  const curated: CandidateCondition[] = [];

  curated.push({
    ...baselineCandidate,
    isRecommended: baselineCandidate.id === recommendedCandidate.id,
  });

  if (hasValid) {
    const midCandidate =
      validCandidates.find(
        (c) =>
          c.id !== baselineCandidate.id &&
          c.id !== recommendedCandidate.id &&
          Math.abs(c.upwUsageLiters - (baselineUPW + recommendedCandidate.upwUsageLiters) / 2) < 8,
      ) || validCandidates[Math.floor(validCandidates.length / 2)];

    if (
      midCandidate &&
      midCandidate.id !== baselineCandidate.id &&
      midCandidate.id !== recommendedCandidate.id
    ) {
      curated.push(midCandidate);
    }

    if (recommendedCandidate.id !== baselineCandidate.id) {
      curated.push(recommendedCandidate);
    }
  }

  if (rejected.length > 0) {
    curated.push(rejected[0]);
  }

  curated.sort((a, b) => b.upwUsageLiters - a.upwUsageLiters);

  const recommendedUPW = recommendedCandidate.upwUsageLiters;
  const savingsLiters = Number((baselineUPW - recommendedUPW).toFixed(1));
  const savingsPercent =
    baselineUPW > 0 ? Number(((savingsLiters / baselineUPW) * 100).toFixed(1)) : 0;

  return {
    process,
    cleaningMode: "single",
    wafer: process.wafer,
    baselineUPW,
    recommendedUPW,
    savingsLiters,
    savingsPercent,
    recommendedCandidate,
    allCandidates: curated,
    validCandidatesCount: validCandidates.length,
    qualityPass: recommendedCandidate.qualityPass,
    hasValidCandidates: hasValid,
    noValidMessage,
  };
}

/**
 * Batch Evaluation Handler
 */
function evaluateBatchProcess(process: ProcessDefinition): ProcessResult {
  const { initialContamination, qualityMetric } = process;
  const allowableLimit = qualityMetric.allowableLimit;
  const rawBatchSize =
    process.batchSize !== undefined ? process.batchSize : process.batchRecipe?.batchSize;

  // STRICT VALIDATION GUARD:
  // If batch size is invalid (0, negative, >100, float, NaN, etc.),
  // completely FORBID candidate generation and UPW calculation.
  const validation = validateBatchSize(rawBatchSize);
  if (!validation.valid) {
    const fallbackBatchSize = typeof rawBatchSize === "number" ? rawBatchSize : 0;
    const errorMsg =
      validation.message ||
      "유효하지 않은 Batch Size (1~100 정수만 허용)로 인해 세정 최적화 및 UPW 계산이 차단되었습니다.";

    return {
      process,
      cleaningMode: "batch",
      wafer: process.wafer,
      batchSize: fallbackBatchSize,
      baselineUPW: 0,
      recommendedUPW: 0,
      savingsLiters: 0,
      savingsPercent: 0,
      recommendedCandidate: {
        id: `cand-${process.id}-invalid-batch`,
        cleaningMode: "batch",
        batchSize: fallbackBatchSize,
        bathVolumeL: 0,
        bathChanges: 0,
        processTimeMin: 0,
        rinseTimeMin: 0,
        rinseFlowRateLpm: 0,
        cycles: 0,
        upwUsageLiters: 0,
        perWaferUPW: 0,
        predictedResidual: initialContamination,
        allowableLimit,
        qualityPass: false,
        savingsLiters: 0,
        savingsPercent: 0,
        rejectionReason: errorMsg,
        conditionSummary: "Batch Size 검증 실패 (최적화 차단됨)",
      },
      allCandidates: [],
      validCandidatesCount: 0,
      qualityPass: false,
      hasValidCandidates: false,
      noValidMessage:
        validation.message ||
        "Batch Size는 1~100 사이의 정수여야 합니다. AI 최적화 및 UPW 계산이 차단되었습니다.",
    };
  }

  const fixedBatchSize = rawBatchSize as number;
  const recipe = process.batchRecipe!;
  const params = process.batchModelParams!;
  const temperatureC = process.simulationTemperatureC;

  // 고오염(정규화 점수 ≥ 90) 공정은 최소 세정시간(침적시간)을 유지한다
  const lockCleaningTime = process.contaminationScore >= 90;

  // Baseline with user fixed batchSize
  const baselineRecipe: BatchRecipe = {
    ...recipe,
    batchSize: fixedBatchSize,
  };

  const baselineEval = evaluateBatchCondition(
    initialContamination,
    baselineRecipe,
    params,
    allowableLimit,
    temperatureC,
  );
  const baselineUPW = baselineEval.totalUPW;
  const baselinePerWafer = baselineUPW / fixedBatchSize;
  const baselineResidual = baselineEval.finalContamination;

  const candidatesMap = new Map<string, CandidateCondition>();

  // 1. Baseline Candidate (사용자 현재 입력 조건 그대로, Fixed user Batch Size)
  const baselineCandidate: CandidateCondition = {
    id: `cand-${process.id}-baseline`,
    cleaningMode: "batch",
    batchSize: fixedBatchSize,
    bathVolumeL: baselineRecipe.bathVolumeL,
    bathChanges: baselineRecipe.bathChanges,
    processTimeMin: baselineRecipe.processTimeMin,
    rinseTimeMin: baselineRecipe.rinseTimeMin,
    rinseFlowRateLpm: baselineRecipe.rinseFlowRateLpm,
    cycles: baselineRecipe.rinseCycles,
    upwUsageLiters: baselineEval.totalUPW,
    perWaferUPW: baselinePerWafer,
    predictedResidual: baselineEval.finalContamination,
    allowableLimit,
    qualityPass: baselineEval.qualityGate,
    savingsLiters: 0,
    savingsPercent: 0,
    conditionSummary: `배치 ${fixedBatchSize}매 • Bath ${baselineRecipe.bathVolumeL}L • 침적 ${baselineRecipe.processTimeMin}m • 린스 ${baselineRecipe.rinseFlowRateLpm}Lpm (${baselineRecipe.rinseTimeMin}m × ${baselineRecipe.rinseCycles})`,
    cleaningUPW: baselineEval.cleaningUPW,
    rinseUPW: baselineEval.rinseUPW,
    cleaningEfficiency: baselineEval.cleaningEfficiency,
    rinseEfficiency: baselineEval.rinseEfficiency,
    contaminationAfterCleaning: baselineEval.contaminationAfterCleaning,
  };
  candidatesMap.set("base", baselineCandidate);

  // Batch exploration variations — 세정(침적) 조건과 린스 조건을 동시에 탐색, batchSize FIXED
  const bathVolumes = [
    baselineRecipe.bathVolumeL,
    Math.round(baselineRecipe.bathVolumeL * 0.9),
    Math.round(baselineRecipe.bathVolumeL * 0.8),
  ];
  const processTimes = lockCleaningTime
    ? [baselineRecipe.processTimeMin]
    : [
        baselineRecipe.processTimeMin,
        Number((baselineRecipe.processTimeMin * 0.9).toFixed(1)),
        Number((baselineRecipe.processTimeMin * 0.8).toFixed(1)),
      ];
  const rinseFlows = [
    baselineRecipe.rinseFlowRateLpm,
    baselineRecipe.rinseFlowRateLpm * 0.9,
    baselineRecipe.rinseFlowRateLpm * 0.8,
    baselineRecipe.rinseFlowRateLpm * 0.7,
    baselineRecipe.rinseFlowRateLpm * 0.6,
  ];
  const rinseTimes = [
    baselineRecipe.rinseTimeMin,
    baselineRecipe.rinseTimeMin * 0.9,
    baselineRecipe.rinseTimeMin * 0.8,
    baselineRecipe.rinseTimeMin * 0.65,
  ];

  bathVolumes.forEach((bathVol) => {
    processTimes.forEach((pTime) => {
      const tProc = Number(pTime.toFixed(1));
      rinseFlows.forEach((rFlow) => {
        const qRinse = Number(rFlow.toFixed(1));
        rinseTimes.forEach((rTime) => {
          const tRinse = Number(rTime.toFixed(1));
          const key = `${fixedBatchSize}-${bathVol}-${tProc}-${qRinse}-${tRinse}`;
          if (!candidatesMap.has(key)) {
            const testRecipe: BatchRecipe = {
              batchSize: fixedBatchSize,
              bathVolumeL: bathVol,
              bathChanges: baselineRecipe.bathChanges,
              processTimeMin: tProc,
              rinseTimeMin: tRinse,
              rinseFlowRateLpm: qRinse,
              rinseCycles: baselineRecipe.rinseCycles,
            };

            const evaluation = evaluateBatchCondition(
              initialContamination,
              testRecipe,
              params,
              allowableLimit,
              temperatureC,
            );
            const upw = evaluation.totalUPW;
            const predicted = evaluation.finalContamination;
            const pass = evaluation.qualityGate;
            const savingsLiters = Number((baselineUPW - upw).toFixed(1));
            const savingsPercent =
              baselineUPW > 0 ? Number(((savingsLiters / baselineUPW) * 100).toFixed(1)) : 0;

            let rejectionReason: string | undefined;
            if (!pass) {
              rejectionReason = `잔류 오염(${formatContaminationValue(predicted, qualityMetric.unit)})이 허용 기준(${formatThreshold(allowableLimit, qualityMetric.unit)})을 초과하여 탈락`;
            }

            candidatesMap.set(key, {
              id: `cand-${process.id}-${key}`,
              cleaningMode: "batch",
              batchSize: fixedBatchSize,
              bathVolumeL: bathVol,
              bathChanges: baselineRecipe.bathChanges,
              processTimeMin: tProc,
              rinseTimeMin: tRinse,
              rinseFlowRateLpm: qRinse,
              cycles: baselineRecipe.rinseCycles,
              upwUsageLiters: upw,
              perWaferUPW: upw / fixedBatchSize,
              predictedResidual: predicted,
              allowableLimit,
              qualityPass: pass,
              savingsLiters,
              savingsPercent,
              rejectionReason,
              conditionSummary: `배치 ${fixedBatchSize}매 • Bath ${bathVol}L • 침적 ${tProc}m • 린스 ${qRinse}Lpm (${tRinse}m × ${baselineRecipe.rinseCycles})`,
              cleaningUPW: evaluation.cleaningUPW,
              rinseUPW: evaluation.rinseUPW,
              cleaningEfficiency: evaluation.cleaningEfficiency,
              rinseEfficiency: evaluation.rinseEfficiency,
              contaminationAfterCleaning: evaluation.contaminationAfterCleaning,
            });
          }
        });
      });
    });
  });

  const allList = Array.from(candidatesMap.values());
  const validCandidates = allList.filter((c) => c.qualityPass);

  // Quality Gate First: Sort valid candidates by UPW ASC (least UPW first)
  validCandidates.sort((a, b) => {
    if (a.upwUsageLiters !== b.upwUsageLiters) {
      return a.upwUsageLiters - b.upwUsageLiters;
    }
    return a.predictedResidual - b.predictedResidual;
  });

  let recommendedCandidate: CandidateCondition;
  const hasValid = validCandidates.length > 0;
  let noValidMessage: string | undefined;

  if (hasValid) {
    recommendedCandidate = { ...validCandidates[0], isRecommended: true };
  } else {
    noValidMessage =
      "현재 Batch Size에서는 품질 기준을 유지하면서 UPW를 줄일 수 있는 조건을 찾지 못했습니다. 기준 세정 조건을 유지합니다.";
    recommendedCandidate = {
      ...baselineCandidate,
      isRecommended: true,
      rejectionReason: noValidMessage,
    };
  }

  const rejected = allList
    .filter((c) => !c.qualityPass)
    .sort((a, b) => a.upwUsageLiters - b.upwUsageLiters);
  const curated: CandidateCondition[] = [];

  curated.push({
    ...baselineCandidate,
    isRecommended: baselineCandidate.id === recommendedCandidate.id,
  });

  if (hasValid) {
    const midCandidate =
      validCandidates.find(
        (c) =>
          c.id !== baselineCandidate.id &&
          c.id !== recommendedCandidate.id &&
          Math.abs(c.upwUsageLiters - (baselineUPW + recommendedCandidate.upwUsageLiters) / 2) < 30,
      ) || validCandidates[Math.floor(validCandidates.length / 2)];

    if (
      midCandidate &&
      midCandidate.id !== baselineCandidate.id &&
      midCandidate.id !== recommendedCandidate.id
    ) {
      curated.push(midCandidate);
    }

    if (recommendedCandidate.id !== baselineCandidate.id) {
      curated.push(recommendedCandidate);
    }
  }

  if (rejected.length > 0) {
    curated.push(rejected[0]);
  }

  curated.sort((a, b) => b.upwUsageLiters - a.upwUsageLiters);

  const recommendedUPW = recommendedCandidate.upwUsageLiters;
  const savingsLiters = Number((baselineUPW - recommendedUPW).toFixed(1));
  const savingsPercent =
    baselineUPW > 0 ? Number(((savingsLiters / baselineUPW) * 100).toFixed(1)) : 0;

  return {
    process,
    cleaningMode: "batch",
    wafer: process.wafer,
    batchSize: fixedBatchSize,
    baselineUPW,
    recommendedUPW,
    savingsLiters,
    savingsPercent,
    recommendedCandidate,
    allCandidates: curated,
    validCandidatesCount: validCandidates.length,
    qualityPass: recommendedCandidate.qualityPass,
    hasValidCandidates: hasValid,
    noValidMessage,
  };
}

/**
 * Aggregates all completed process steps into ESG Summary
 * (Correctly excludes non-optimized EDS from UPW calculations)
 */
export function calculateESGSummary(results: ProcessResult[]): ESGSavingsSummary {
  const enabledResults = results.filter((r) => r.process.optimizationEnabled);
  const excludedResults = results.filter((r) => !r.process.optimizationEnabled);

  const totalBaselineUPW = Number(
    enabledResults.reduce((acc, r) => acc + r.baselineUPW, 0).toFixed(1),
  );
  const totalAIUPW = Number(
    enabledResults.reduce((acc, r) => acc + r.recommendedUPW, 0).toFixed(1),
  );
  const totalSavingsUPW = Number((totalBaselineUPW - totalAIUPW).toFixed(1));
  const totalSavingsPercent =
    totalBaselineUPW > 0 ? Number(((totalSavingsUPW / totalBaselineUPW) * 100).toFixed(1)) : 0;

  // 0.045 kWh per Liter of UPW treatment, reverse osmosis, UV polishing & distribution
  const totalPowerSavedKWh = Number((totalSavingsUPW * 0.045).toFixed(2));

  // 0.021 kg CO2e per Liter of UPW lifecycle emissions
  const totalCarbonSavedKg = Number((totalSavingsUPW * 0.021).toFixed(2));

  const processesPassedCount = enabledResults.filter((r) => r.qualityPass).length;

  return {
    totalBaselineUPW,
    totalAIUPW,
    totalSavingsUPW,
    totalSavingsPercent,
    totalPowerSavedKWh,
    totalCarbonSavedKg,
    processesPassedCount,
    totalProcessesCount: enabledResults.length,
    excludedProcessesCount: excludedResults.length,
  };
}

/**
 * Formats any metric values according to their domain unit (e.g. atoms/cm², particles/cm², defects/wafer)
 */
export function formatContaminationValue(value: number, unit = "atoms/cm²"): string {
  if (value === 0) return `0 ${unit}`;

  if (unit === "atoms/cm²") {
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = (value / Math.pow(10, exponent)).toFixed(1);

    const superscripts: Record<string, string> = {
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

    const expStr = exponent
      .toString()
      .split("")
      .map((char) => superscripts[char] || char)
      .join("");
    return `${mantissa} × 10${expStr} ${unit}`;
  }

  if (unit === "particles/cm²") {
    return `${value.toFixed(3)} ${unit}`;
  }

  if (unit === "defects/wafer" || unit === "particles/wafer") {
    return `${value.toFixed(1)} ${unit}`;
  }

  return `${value.toLocaleString()} ${unit}`;
}

/**
 * Formats threshold with <= symbol
 */
export function formatThreshold(value: number, unit = "atoms/cm²"): string {
  return `≤ ${formatContaminationValue(value, unit)}`;
}

// Backwards compatibility alias
export const formatScientific = formatContaminationValue;
