export type WaferDiameter = '200mm' | '300mm';

export type ContaminationBand = 'low' | 'medium' | 'high' | 'very-high';

export interface BaselineRecipe {
  cleaningTimeMin: number;      // minutes
  rinseTimeMin: number;         // minutes
  flowRateLpm: number;          // Liters per minute (L/min)
  cycles: number;               // number of rinse/clean cycles
}

export interface ModelParameters {
  R_floor: number;              // atoms/cm2 (e.g. 2.0e9)
  K: number;                    // removal rate coefficient (e.g. 0.35)
  alpha: number;                // flow rate sensitivity exponent (e.g. 0.65)
  beta: number;                 // cycle effect exponent (e.g. 0.40)
  Q_ref: number;                // reference flow rate in L/min (e.g. 10.0)
}

export interface OptimizationRange {
  minCleaningTime: number;      // absolute minimum cleaning time
  minRinseTime: number;         // absolute minimum rinse time
  minFlowRate: number;          // minimum flow rate L/min
  minCycles: number;            // minimum cycles
}

export interface ProcessDefinition {
  id: string;
  stepNumber: number;
  name: string;
  subName: string;
  description: string;
  category: string;
  contaminationScore: number;   // 0 ~ 100
  contaminationBand: ContaminationBand;
  initialCuAtomsCm2: number;    // R_initial
  allowableCuAtomsCm2: number;  // allowable threshold (e.g. 1.0e10)
  baselineRecipe: BaselineRecipe;
  optimizationRange: OptimizationRange;
  modelParameters: ModelParameters;
  referenceDoc: string;
}

export interface CandidateCondition {
  id: string;
  cleaningTimeMin: number;
  rinseTimeMin: number;
  flowRateLpm: number;
  cycles: number;
  upwUsageLiters: number;
  predictedResidualCu: number;  // R_pred in atoms/cm2
  allowableCu: number;
  qualityPass: boolean;
  isRecommended?: boolean;
  savingsLiters: number;
  savingsPercent: number;
  rejectionReason?: string;
}

export interface ProcessResult {
  process: ProcessDefinition;
  baselineUPW: number;
  recommendedUPW: number;
  savingsLiters: number;
  savingsPercent: number;
  recommendedCandidate: CandidateCondition;
  allCandidates: CandidateCondition[];
  validCandidatesCount: number;
  qualityPass: boolean;
}

export interface ESGSavingsSummary {
  totalBaselineUPW: number;     // L
  totalAIUPW: number;           // L
  totalSavingsUPW: number;      // L
  totalSavingsPercent: number;  // %
  totalPowerSavedKWh: number;   // kWh (0.045 kWh per L of UPW production)
  totalCarbonSavedKg: number;   // kg CO2e (0.021 kg CO2e per L of UPW)
  processesPassedCount: number;
  totalProcessesCount: number;
}

export type AppState = 'START' | 'ANALYZING' | 'PROCESS_ACTIVE' | 'FINAL_RESULT';
