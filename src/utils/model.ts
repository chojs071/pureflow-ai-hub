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
 * 1. SINGLE WAFER SURROGATE MODEL & UPW CALCULATION
 * ============================================================================
 * Equation:
 * R_pred = R_floor + (R_initial - R_floor) * exp(-K * t_eff * (Q/Q_ref)^alpha * (RPM/RPM_ref)^gamma * N^beta)
 *
 * UPW = Q (L/min) * rinseTime (min) * cycles (N)  [L / wafer]
 */
export function calculateSingleWaferResidual(
  R_initial: number,
  recipe: SingleWaferRecipe,
  params: SingleWaferModelParameters,
): number {
  const { R_floor, K, alpha, beta, gamma, Q_ref, RPM_ref } = params;
  const effectiveTime = recipe.cleaningTimeMin + recipe.rinseTimeMin;
  const flowRatio = Math.max(0.1, recipe.flowRateLpm / Q_ref);
  const rpmRatio = Math.max(0.1, recipe.spinRpm / RPM_ref);
  const cycleFactor = Math.pow(Math.max(1, recipe.rinseCycles), beta);

  const flowFactor = Math.pow(flowRatio, alpha);
  const rpmFactor = Math.pow(rpmRatio, gamma);

  // K, alpha, beta, gamma are MVP simulation parameters
  const exponent = -K * effectiveTime * flowFactor * rpmFactor * cycleFactor;
  const delta = Math.max(0, R_initial - R_floor);

  const R_pred = R_floor + delta * Math.exp(exponent);
  return R_pred;
}

export function calculateSingleWaferUPW(recipe: SingleWaferRecipe): number {
  return Number((recipe.flowRateLpm * recipe.rinseTimeMin * recipe.rinseCycles).toFixed(1));
}

/**
 * ============================================================================
 * 2. BATCH SURROGATE MODEL & UPW CALCULATION
 * ============================================================================
 * Equation:
 * R_pred_batch = R_floor + (R_initial - R_floor) * exp(-K_batch * t_proc * bathFactor * rinseFactor * cycleFactor)
 *
 * where:
 * bathFactor = ((bathVolumeL / batchSize) / bathVolumeRefPerWafer)^alpha_bath
 * rinseFactor = ((rinseFlowRateLpm * rinseTimeMin) / (rinseFlowRefLpm * 6.0))^alpha_rinse
 * cycleFactor = (rinseCycles)^beta_cycle
 *
 * UPW Calculation:
 * bathUPW = bathVolumeL * bathChanges
 * rinseUPW = rinseFlowRateLpm * rinseTimeMin * rinseCycles
 * totalBatchUPW = bathUPW + rinseUPW
 * perWaferUPW = totalBatchUPW / batchSize
 */
export function calculateBatchResidual(
  R_initial: number,
  recipe: BatchRecipe,
  params: BatchModelParameters,
): number {
  if (!validateBatchSize(recipe.batchSize)) {
    throw new Error(
      `[PureFlow Validation Error] Invalid Batch Size (${recipe.batchSize}). Batch Size must be an integer between 1 and 100.`,
    );
  }

  const {
    R_floor,
    K_batch,
    bathVolumeRefPerWafer,
    rinseFlowRefLpm,
    alpha_bath,
    alpha_rinse,
    beta_cycle,
  } = params;

  const effectiveProcessTime = recipe.processTimeMin + recipe.rinseTimeMin;

  // Volume of bath per wafer compared to reference volume
  const volPerWafer = recipe.bathVolumeL / recipe.batchSize;
  const bathFactor = Math.pow(Math.max(0.2, volPerWafer / bathVolumeRefPerWafer), alpha_bath);

  // Rinse water delivery ratio
  const rinseDelivery =
    (recipe.rinseFlowRateLpm * recipe.rinseTimeMin) / Math.max(1, rinseFlowRefLpm * 6.0);
  const rinseFactor = Math.pow(Math.max(0.2, rinseDelivery), alpha_rinse);

  // Cycle factor
  const cycleFactor = Math.pow(Math.max(1, recipe.rinseCycles), beta_cycle);

  // Total exponential decay
  const exponent = -K_batch * effectiveProcessTime * bathFactor * rinseFactor * cycleFactor;
  const delta = Math.max(0, R_initial - R_floor);

  const R_pred = R_floor + delta * Math.exp(exponent);
  return R_pred;
}

export function calculateBatchUPW(recipe: BatchRecipe): {
  totalBatchUPW: number;
  perWaferUPW: number;
} {
  if (!validateBatchSize(recipe.batchSize)) {
    throw new Error(
      `[PureFlow Validation Error] Invalid Batch Size (${recipe.batchSize}). UPW calculation is forbidden for Batch Size outside 1-100 or non-integers.`,
    );
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
 */
function evaluateSingleWaferProcess(process: ProcessDefinition): ProcessResult {
  const recipe = process.singleRecipe!;
  const params = process.singleModelParams!;
  const { initialContamination, qualityMetric } = process;
  const allowableLimit = qualityMetric.allowableLimit;

  const baselineUPW = calculateSingleWaferUPW(recipe);
  const baselineResidual = calculateSingleWaferResidual(initialContamination, recipe, params);

  const candidatesMap = new Map<string, CandidateCondition>();

  // 1. Baseline Candidate
  const baselineCandidate: CandidateCondition = {
    id: `cand-${process.id}-baseline`,
    cleaningMode: "single",
    cleaningTimeMin: recipe.cleaningTimeMin,
    rinseTimeMin: recipe.rinseTimeMin,
    flowRateLpm: recipe.flowRateLpm,
    spinRpm: recipe.spinRpm,
    cycles: recipe.rinseCycles,
    upwUsageLiters: baselineUPW,
    perWaferUPW: baselineUPW,
    predictedResidual: baselineResidual,
    allowableLimit,
    qualityPass: baselineResidual <= allowableLimit,
    savingsLiters: 0,
    savingsPercent: 0,
    conditionSummary: `${recipe.flowRateLpm} L/min • ${recipe.rinseTimeMin}m 린스 • ${recipe.spinRpm} RPM`,
  };
  candidatesMap.set(`base`, baselineCandidate);

  // Single Wafer variations
  const flowSteps = [
    recipe.flowRateLpm,
    recipe.flowRateLpm * 0.9,
    recipe.flowRateLpm * 0.8,
    recipe.flowRateLpm * 0.7,
    recipe.flowRateLpm * 0.6,
  ];
  const timeSteps = [
    recipe.rinseTimeMin,
    recipe.rinseTimeMin * 0.9,
    recipe.rinseTimeMin * 0.8,
    recipe.rinseTimeMin * 0.65,
  ];
  const rpmSteps = [recipe.spinRpm, recipe.spinRpm * 1.1, recipe.spinRpm * 0.9];

  flowSteps.forEach((flow) => {
    const q = Number(flow.toFixed(1));
    timeSteps.forEach((time) => {
      const t = Number(time.toFixed(1));
      rpmSteps.forEach((rpm) => {
        const r = Math.round(rpm / 50) * 50;
        const key = `${q}-${t}-${r}`;
        if (!candidatesMap.has(key)) {
          const testRecipe: SingleWaferRecipe = {
            cleaningTimeMin: recipe.cleaningTimeMin,
            rinseTimeMin: t,
            flowRateLpm: q,
            spinRpm: r,
            rinseCycles: recipe.rinseCycles,
          };

          const upw = calculateSingleWaferUPW(testRecipe);
          const predicted = calculateSingleWaferResidual(initialContamination, testRecipe, params);
          const pass = predicted <= allowableLimit;
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
            cleaningTimeMin: recipe.cleaningTimeMin,
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
            conditionSummary: `${q} L/min • ${t}m 린스 • ${r} RPM`,
          });
        }
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
  if (!validateBatchSize(rawBatchSize)) {
    const fallbackBatchSize = typeof rawBatchSize === "number" ? rawBatchSize : 0;
    const errorMsg =
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
        "Batch Size는 1~100 사이의 정수여야 합니다. AI 최적화 및 UPW 계산이 차단되었습니다.",
    };
  }

  const fixedBatchSize = rawBatchSize as number;
  const recipe = process.batchRecipe!;
  const params = process.batchModelParams!;

  // Baseline with user fixed batchSize
  const baselineRecipe: BatchRecipe = {
    ...recipe,
    batchSize: fixedBatchSize,
  };

  const { totalBatchUPW: baselineUPW, perWaferUPW: baselinePerWafer } =
    calculateBatchUPW(baselineRecipe);
  const baselineResidual = calculateBatchResidual(initialContamination, baselineRecipe, params);

  const candidatesMap = new Map<string, CandidateCondition>();

  // 1. Baseline Candidate (Fixed user Batch Size)
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
    upwUsageLiters: baselineUPW,
    perWaferUPW: baselinePerWafer,
    predictedResidual: baselineResidual,
    allowableLimit,
    qualityPass: baselineResidual <= allowableLimit,
    savingsLiters: 0,
    savingsPercent: 0,
    conditionSummary: `배치 ${fixedBatchSize}매 • Bath ${baselineRecipe.bathVolumeL}L • 린스 ${baselineRecipe.rinseFlowRateLpm}Lpm (${baselineRecipe.rinseTimeMin}m)`,
  };
  candidatesMap.set("base", baselineCandidate);

  // Batch exploration variations - Keeping batchSize FIXED to user input
  const bathVolumes = [
    baselineRecipe.bathVolumeL,
    Math.round(baselineRecipe.bathVolumeL * 0.9),
    Math.round(baselineRecipe.bathVolumeL * 0.8),
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
    rinseFlows.forEach((rFlow) => {
      const qRinse = Number(rFlow.toFixed(1));
      rinseTimes.forEach((rTime) => {
        const tRinse = Number(rTime.toFixed(1));
        const key = `${fixedBatchSize}-${bathVol}-${qRinse}-${tRinse}`;
        if (!candidatesMap.has(key)) {
          const testRecipe: BatchRecipe = {
            batchSize: fixedBatchSize,
            bathVolumeL: bathVol,
            bathChanges: baselineRecipe.bathChanges,
            processTimeMin: baselineRecipe.processTimeMin,
            rinseTimeMin: tRinse,
            rinseFlowRateLpm: qRinse,
            rinseCycles: baselineRecipe.rinseCycles,
          };

          const { totalBatchUPW: upw, perWaferUPW } = calculateBatchUPW(testRecipe);
          const predicted = calculateBatchResidual(initialContamination, testRecipe, params);
          const pass = predicted <= allowableLimit;
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
            processTimeMin: baselineRecipe.processTimeMin,
            rinseTimeMin: tRinse,
            rinseFlowRateLpm: qRinse,
            cycles: baselineRecipe.rinseCycles,
            upwUsageLiters: upw,
            perWaferUPW,
            predictedResidual: predicted,
            allowableLimit,
            qualityPass: pass,
            savingsLiters,
            savingsPercent,
            rejectionReason,
            conditionSummary: `배치 ${fixedBatchSize}매 • Bath ${bathVol}L • 린스 ${qRinse}Lpm (${tRinse}m)`,
          });
        }
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
