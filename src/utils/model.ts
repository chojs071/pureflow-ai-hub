import {
  BaselineRecipe,
  CandidateCondition,
  ESGSavingsSummary,
  ModelParameters,
  ProcessDefinition,
  ProcessResult,
} from '../types';

/**
 * Literature-based Surrogate Model for Cleaning Performance
 * R_pred = R_floor + (R_initial - R_floor) * exp(-K * t * (Q / Q_ref)^alpha * N^beta)
 */
export function calculatePredictedResidualCu(
  R_initial: number,
  recipe: {
    cleaningTimeMin: number;
    rinseTimeMin: number;
    flowRateLpm: number;
    cycles: number;
  },
  modelParams: ModelParameters
): number {
  const { R_floor, K, alpha, beta, Q_ref } = modelParams;
  const totalEffectiveTime = recipe.cleaningTimeMin + recipe.rinseTimeMin;
  const flowRatio = Math.max(0.1, recipe.flowRateLpm / Q_ref);
  const cycleFactor = Math.pow(Math.max(1, recipe.cycles), beta);
  const flowFactor = Math.pow(flowRatio, alpha);

  const exponent = -K * totalEffectiveTime * flowFactor * cycleFactor;
  const delta = Math.max(0, R_initial - R_floor);

  const R_pred = R_floor + delta * Math.exp(exponent);
  return R_pred;
}

/**
 * Calculates UPW consumption in Liters
 * UPW = flowRate (L/min) * rinseTime (min) * cycles
 */
export function calculateUPWUsage(recipe: {
  rinseTimeMin: number;
  flowRateLpm: number;
  cycles: number;
}): number {
  return Number((recipe.flowRateLpm * recipe.rinseTimeMin * recipe.cycles).toFixed(1));
}

/**
 * Generates candidate recipes within allowable optimization bounds,
 * evaluates surrogate model, applies quality gate, and selects optimal condition.
 */
export function generateAndEvaluateCandidates(process: ProcessDefinition): ProcessResult {
  const { baselineRecipe, optimizationRange, modelParameters, initialCuAtomsCm2, allowableCuAtomsCm2, contaminationScore } = process;

  const baselineUPW = calculateUPWUsage(baselineRecipe);
  const baselineResidual = calculatePredictedResidualCu(initialCuAtomsCm2, baselineRecipe, modelParameters);

  const candidatesMap = new Map<string, CandidateCondition>();

  // Baseline candidate always included
  const baselineCandidate: CandidateCondition = {
    id: `cand-baseline`,
    cleaningTimeMin: baselineRecipe.cleaningTimeMin,
    rinseTimeMin: baselineRecipe.rinseTimeMin,
    flowRateLpm: baselineRecipe.flowRateLpm,
    cycles: baselineRecipe.cycles,
    upwUsageLiters: baselineUPW,
    predictedResidualCu: baselineResidual,
    allowableCu: allowableCuAtomsCm2,
    qualityPass: baselineResidual <= allowableCuAtomsCm2,
    savingsLiters: 0,
    savingsPercent: 0,
  };
  candidatesMap.set(`${baselineRecipe.cleaningTimeMin}-${baselineRecipe.rinseTimeMin}-${baselineRecipe.flowRateLpm}-${baselineRecipe.cycles}`, baselineCandidate);

  // Determine bounds
  const minClean = contaminationScore >= 90
    ? Math.max(baselineRecipe.cleaningTimeMin - 1.0, optimizationRange.minCleaningTime)
    : optimizationRange.minCleaningTime;

  const cleanSteps: number[] = [];
  for (let c = baselineRecipe.cleaningTimeMin; c >= minClean - 0.01; c -= 0.5) {
    cleanSteps.push(Number(c.toFixed(1)));
  }

  const rinseSteps: number[] = [];
  for (let r = baselineRecipe.rinseTimeMin; r >= optimizationRange.minRinseTime - 0.01; r -= 0.5) {
    rinseSteps.push(Number(r.toFixed(1)));
  }

  const flowSteps: number[] = [];
  for (let q = baselineRecipe.flowRateLpm; q >= optimizationRange.minFlowRate - 0.01; q -= 0.5) {
    flowSteps.push(Number(q.toFixed(1)));
  }

  // Generate diverse realistic variations
  cleanSteps.forEach((c) => {
    rinseSteps.forEach((r) => {
      flowSteps.forEach((q) => {
        // Also test with aggressive/nominal/conservative variants
        const key = `${c}-${r}-${q}-${baselineRecipe.cycles}`;
        if (!candidatesMap.has(key)) {
          const upw = calculateUPWUsage({ rinseTimeMin: r, flowRateLpm: q, cycles: baselineRecipe.cycles });
          const predictedCu = calculatePredictedResidualCu(
            initialCuAtomsCm2,
            { cleaningTimeMin: c, rinseTimeMin: r, flowRateLpm: q, cycles: baselineRecipe.cycles },
            modelParameters
          );

          const pass = predictedCu <= allowableCuAtomsCm2;
          const savingsLiters = Number((baselineUPW - upw).toFixed(1));
          const savingsPercent = baselineUPW > 0 ? Number(((savingsLiters / baselineUPW) * 100).toFixed(1)) : 0;

          let rejectionReason: string | undefined;
          if (!pass) {
            rejectionReason = `잔류 오염(${formatScientific(predictedCu)})이 허용 기준(${formatScientific(allowableCuAtomsCm2)})을 초과하여 탈락`;
          }

          candidatesMap.set(key, {
            id: `cand-${key}`,
            cleaningTimeMin: c,
            rinseTimeMin: r,
            flowRateLpm: q,
            cycles: baselineRecipe.cycles,
            upwUsageLiters: upw,
            predictedResidualCu: predictedCu,
            allowableCu: allowableCuAtomsCm2,
            qualityPass: pass,
            savingsLiters,
            savingsPercent,
            rejectionReason,
          });
        }
      });
    });
  });

  const allCandidatesList = Array.from(candidatesMap.values());

  // Filter ONLY quality passed candidates
  const validCandidates = allCandidatesList.filter((cand) => cand.qualityPass);

  // Sort valid candidates by UPW ASC (least UPW first)
  validCandidates.sort((a, b) => {
    if (a.upwUsageLiters !== b.upwUsageLiters) {
      return a.upwUsageLiters - b.upwUsageLiters;
    }
    // If equal UPW, prefer better quality margin (lower residual Cu)
    return a.predictedResidualCu - b.predictedResidualCu;
  });

  let recommendedCandidate: CandidateCondition;
  if (validCandidates.length > 0) {
    recommendedCandidate = {
      ...validCandidates[0],
      isRecommended: true,
    };
  } else {
    // Fallback safely to baseline if no candidate passed quality gate
    recommendedCandidate = {
      ...baselineCandidate,
      isRecommended: true,
      rejectionReason: '품질 기준을 충족하는 추가 절감 후보가 없어 기준 조건을 유지합니다.',
    };
  }

  // Build curated comparison candidate list (e.g. 4 representative conditions for the UI table)
  // 1. Baseline
  // 2. Intermediate pass candidate
  // 3. Recommended optimal pass candidate
  // 4. Over-aggressive rejected candidate (showing why AI stopped at this limit)
  const rejectedCandidates = allCandidatesList
    .filter((cand) => !cand.qualityPass)
    .sort((a, b) => a.upwUsageLiters - b.upwUsageLiters);

  const curatedCandidates: CandidateCondition[] = [];

  // Add baseline
  curatedCandidates.push({ ...baselineCandidate, isRecommended: baselineCandidate.id === recommendedCandidate.id });

  // Add intermediate if different
  const middlePass = validCandidates.find(
    (c) => c.id !== baselineCandidate.id && c.id !== recommendedCandidate.id && Math.abs(c.upwUsageLiters - (baselineUPW + recommendedCandidate.upwUsageLiters) / 2) < 10
  ) || validCandidates[Math.floor(validCandidates.length / 2)];

  if (middlePass && middlePass.id !== baselineCandidate.id && middlePass.id !== recommendedCandidate.id) {
    curatedCandidates.push(middlePass);
  }

  // Add recommended
  if (recommendedCandidate.id !== baselineCandidate.id) {
    curatedCandidates.push(recommendedCandidate);
  }

  // Add rejected candidate to clearly show the Quality Gate in action
  if (rejectedCandidates.length > 0) {
    curatedCandidates.push(rejectedCandidates[0]);
  }

  // Ensure sorted by UPW descending for intuitive comparison table (High UPW -> Low UPW)
  curatedCandidates.sort((a, b) => b.upwUsageLiters - a.upwUsageLiters);

  const recommendedUPW = recommendedCandidate.upwUsageLiters;
  const savingsLiters = Number((baselineUPW - recommendedUPW).toFixed(1));
  const savingsPercent = baselineUPW > 0 ? Number(((savingsLiters / baselineUPW) * 100).toFixed(1)) : 0;

  return {
    process,
    baselineUPW,
    recommendedUPW,
    savingsLiters,
    savingsPercent,
    recommendedCandidate,
    allCandidates: curatedCandidates,
    validCandidatesCount: validCandidates.length,
    qualityPass: recommendedCandidate.qualityPass,
  };
}

/**
 * Aggregates all completed process steps into ESG Summary
 */
export function calculateESGSummary(results: ProcessResult[]): ESGSavingsSummary {
  const totalBaselineUPW = Number(results.reduce((acc, r) => acc + r.baselineUPW, 0).toFixed(1));
  const totalAIUPW = Number(results.reduce((acc, r) => acc + r.recommendedUPW, 0).toFixed(1));
  const totalSavingsUPW = Number((totalBaselineUPW - totalAIUPW).toFixed(1));
  const totalSavingsPercent = totalBaselineUPW > 0 ? Number(((totalSavingsUPW / totalBaselineUPW) * 100).toFixed(1)) : 0;

  // 0.045 kWh per Liter of UPW treatment, reverse osmosis, UV polishing & distribution
  const totalPowerSavedKWh = Number((totalSavingsUPW * 0.045).toFixed(2));

  // 0.021 kg CO2e per Liter of UPW lifecycle emissions
  const totalCarbonSavedKg = Number((totalSavingsUPW * 0.021).toFixed(2));

  const processesPassedCount = results.filter((r) => r.qualityPass).length;

  return {
    totalBaselineUPW,
    totalAIUPW,
    totalSavingsUPW,
    totalSavingsPercent,
    totalPowerSavedKWh,
    totalCarbonSavedKg,
    processesPassedCount,
    totalProcessesCount: results.length,
  };
}

/**
 * Formats numbers into clean scientific notation (e.g., 8.4 × 10⁹ atoms/cm²)
 */
export function formatScientific(value: number, unit = 'atoms/cm²'): string {
  if (value === 0) return `0 ${unit}`;
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = (value / Math.pow(10, exponent)).toFixed(1);

  const superscripts: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '-': '⁻',
  };

  const expStr = exponent.toString().split('').map((char) => superscripts[char] || char).join('');
  return `${mantissa} × 10${expStr} ${unit}`;
}

/**
 * Formats threshold with <= or <= symbol
 */
export function formatThreshold(value: number, unit = 'atoms/cm²'): string {
  return `≤ ${formatScientific(value, unit)}`;
}
