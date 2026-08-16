export type CleaningMode = "single" | "batch";

export type WaferDiameterInch = 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

export type WaferType = "polished" | "epitaxial" | "soi";

export interface WaferDiameterOption {
  inch: WaferDiameterInch;
  mm: number;
}

export const WAFER_DIAMETER_OPTIONS: WaferDiameterOption[] = [
  { inch: 2, mm: 50.8 },
  { inch: 3, mm: 76.2 },
  { inch: 4, mm: 101.6 },
  { inch: 5, mm: 127.0 },
  { inch: 6, mm: 152.4 },
  { inch: 8, mm: 203.2 },
  { inch: 10, mm: 254.0 },
  { inch: 12, mm: 304.8 },
];

export interface WaferTypeOption {
  value: WaferType;
  label: string;
  subLabel: string;
  shortLabel: string;
}

export const WAFER_TYPE_OPTIONS: WaferTypeOption[] = [
  {
    value: "polished",
    label: "연마 웨이퍼",
    subLabel: "Polished Wafer",
    shortLabel: "연마",
  },
  {
    value: "epitaxial",
    label: "에피 웨이퍼",
    subLabel: "Epitaxial Wafer",
    shortLabel: "에피",
  },
  {
    value: "soi",
    label: "SOI 웨이퍼",
    subLabel: "Silicon-On-Insulator",
    shortLabel: "SOI",
  },
];

export interface WaferConfig {
  diameterInch: WaferDiameterInch;
  diameterMm: number;
  waferType: WaferType;
}

export type ProcessCategoryId =
  "wafer-mfg" | "oxidation" | "photo" | "etching" | "deposition" | "metal" | "eds" | "packaging";

export type ContaminationBand = "low" | "medium" | "high" | "very_high";

/** 세정 시퀀스 단계 유형: 세정 → 린스 → 건조 */
export type SequenceStepType = "clean" | "rinse" | "dry";

/**
 * 공정의 전체 세정 시퀀스를 구성하는 단계.
 * 공정 흐름에는 항상 포함되지만, UPW 최적화는 upwRelevant 단계에만 적용한다.
 */
export interface ProcessSequenceStep {
  id: string;
  name: string;
  type: SequenceStepType;
  description: string;
  /** UPW가 실제 사용되는 단계인지 (건조 등은 false) */
  upwRelevant: boolean;
  optimizationEnabled: boolean;
  /** 이 시퀀스 단계와 연결되는 최적화 대상 세정 스텝 (UPW 관련 단계만) */
  cleaningStepId?: string;
}

export interface ContaminantInfo {
  name: string;
  category: "metal" | "particle" | "organic" | "chemical";
  description: string;
}

export interface QualityMetricInfo {
  name: string;
  unit: string;
  allowableLimit: number;
  description: string;
}

export interface LiteratureReference {
  id: string;
  processCategory: string;
  cleaningMode: CleaningMode | "both";
  cleaningStep: string;
  contaminants: string[];
  variables: string[];
  qualityMetrics: string[];
  keyFinding: string;
  title: string;
  authors?: string;
  journal?: string;
  volume?: string;
  pages?: string;
  year: number;
  doi?: string;
  url?: string;
}

export interface ParameterMetadata {
  name: string;
  key: string;
  type: "literature" | "simulation";
  description: string;
}

export interface SingleWaferSettings {
  temperatureC: number; // e.g. 20 (℃)
  flowRateLpm: number; // e.g. 10 (L/min)
  cleaningTimeMin: number; // e.g. 10 (min)
  rinseTimeMin: number; // e.g. 5 (min)
  spinRpm: number; // e.g. 1000 (rpm)
  rinseCycles: number; // e.g. 2 (회)
}

export interface BatchSettings {
  temperatureC: number; // e.g. 20 (℃)
  batchSize: number; // e.g. 50 (wafers, 1~100)
  processTimeMin: number; // e.g. 10 (min)
  rinseTimeMin: number; // e.g. 5 (min)
  rinseCycles: number; // e.g. 2 (회)
}

export interface SimulationSettings {
  single: SingleWaferSettings;
  batch: BatchSettings;
}

export const DEFAULT_SINGLE_SETTINGS: SingleWaferSettings = {
  temperatureC: 20,
  flowRateLpm: 10,
  cleaningTimeMin: 10,
  rinseTimeMin: 5,
  spinRpm: 1000,
  rinseCycles: 2,
};

export const DEFAULT_BATCH_SETTINGS: BatchSettings = {
  temperatureC: 20,
  batchSize: 50,
  processTimeMin: 10,
  rinseTimeMin: 5,
  rinseCycles: 2,
};

export const DEFAULT_SIMULATION_SETTINGS: SimulationSettings = {
  single: DEFAULT_SINGLE_SETTINGS,
  batch: DEFAULT_BATCH_SETTINGS,
};

export interface SingleWaferRecipe {
  cleaningTimeMin: number; // minutes
  rinseTimeMin: number; // minutes
  flowRateLpm: number; // Liters per minute (L/min)
  spinRpm: number; // Wafer rotation RPM
  rinseCycles: number; // number of rinse/clean cycles
}

export interface BatchConfig {
  batchSize: number; // number of wafers processed simultaneously in 1 batch
  bathVolumeL: number; // Bath tank volume (L)
  bathChanges: number; // Bath chemical/water dumps per batch
  processTimeMin: number; // Chemical/immersion time (min)
  rinseTimeMin: number; // Overflow rinse time (min)
  rinseCycles: number; // Rinse cycles
  rinseFlowRateLpm?: number; // Rinse flow rate (L/min)
}

export interface BatchRecipe {
  batchSize: number; // number of wafers per batch (e.g. 25, 50, 100)
  bathVolumeL: number; // Bath tank volume (L)
  bathChanges: number; // Bath liquid changes / dumps per batch
  processTimeMin: number; // Chemical / immersion time (min)
  rinseTimeMin: number; // Overflow / spray rinse time (min)
  rinseFlowRateLpm: number; // Rinse flow rate (L/min)
  rinseCycles: number; // Rinse cycles
}

export interface SingleWaferModelParameters {
  R_floor: number; // floor contamination in metric units
  K: number; // removal rate coefficient (MVP simulation parameter)
  alpha: number; // flow rate sensitivity exponent
  beta: number; // cycle effect exponent
  gamma: number; // wafer rotation RPM exponent
  Q_ref: number; // reference flow rate in L/min
  RPM_ref: number; // reference rotation in RPM
}

export interface BatchModelParameters {
  R_floor: number; // floor contamination in metric units
  K_batch: number; // batch removal rate coefficient (MVP simulation parameter)
  bathVolumeRefPerWafer: number; // reference bath volume per wafer (L/wafer)
  rinseFlowRefLpm: number; // reference rinse flow rate (L/min)
  alpha_bath: number; // bath volume sensitivity exponent
  alpha_rinse: number; // rinse flow sensitivity exponent
  beta_cycle: number; // rinse cycle sensitivity exponent
}

/**
 * Step definition for a specific cleaning/rinse step inside a major process category
 */
export interface CleaningStepDefinition {
  id: string; // unique step id (e.g. 'post-etch-clean', 'bonding-surface-clean')
  name: string; // Korean display name (e.g. 'Bonding 전 표면 세정')
  nameEn: string; // English display name (e.g. 'Pre-Bonding Surface Clean')
  description: string;

  contaminants: ContaminantInfo[];
  qualityMetric: QualityMetricInfo;
  contaminationScore: number; // 0 ~ 100
  contaminationBand: ContaminationBand;
  initialContamination: number; // R_initial

  batchCapacity?: number; // Max allowable batch capacity (default 100 wafers)

  // Single wafer baseline recipes & parameters for anchor points (200mm / 300mm)
  singleRecipes: { "200mm": SingleWaferRecipe; "300mm": SingleWaferRecipe };
  singleModelParams: { "200mm": SingleWaferModelParameters; "300mm": SingleWaferModelParameters };

  // Batch baseline recipes & parameters for anchor points (200mm / 300mm)
  batchRecipes: { "200mm": BatchRecipe; "300mm": BatchRecipe };
  batchModelParams: { "200mm": BatchModelParameters; "300mm": BatchModelParameters };

  references: LiteratureReference[];
  literatureVariables: string[];
}

/**
 * 8 Major Process Category Definition
 */
export interface ProcessCategory {
  id: ProcessCategoryId;
  stepNumber: number; // 1 to 8
  name: string; // e.g. "웨이퍼 제조", "산화", "포토", "식각", "증착·이온주입", "금속배선", "EDS", "패키징"
  nameEn: string; // e.g. "Wafer Manufacturing"
  shortDesc: string;
  optimizationEnabled: boolean; // false for EDS
  nonOptimizationReason?: string;
  batchCapacity?: number; // Max allowable batch size (e.g. 100)

  /** 해당 공정의 전체 세정 시퀀스 (세정 → 린스 → 건조 흐름) */
  sequence: ProcessSequenceStep[];

  cleaningSteps: CleaningStepDefinition[];
}

/**
 * Active process simulation instance (evaluated for a specific category + step + mode + wafer config + batchSize)
 */
export interface ProcessDefinition {
  id: string;
  categoryId: ProcessCategoryId;
  stepId: string;
  stepNumber: number;
  categoryName: string;
  categoryNameEn: string;
  cleaningStepName: string;
  cleaningStepSubName: string;
  description: string;

  /** 해당 공정의 전체 세정 시퀀스 (항상 표시, 현재 분석 단계 강조용) */
  sequence: ProcessSequenceStep[];

  optimizationEnabled: boolean;
  nonOptimizationReason?: string;

  cleaningMode: CleaningMode;
  wafer: WaferConfig;
  batchSize?: number; // User-selected fixed batch size for batch mode
  batchCapacity?: number; // Max allowable batch size (e.g. 100)

  contaminants: ContaminantInfo[];
  qualityMetric: QualityMetricInfo;
  contaminationScore: number;
  contaminationBand: ContaminationBand;
  initialContamination: number;

  singleRecipe?: SingleWaferRecipe;
  singleModelParams?: SingleWaferModelParameters;

  batchRecipe?: BatchRecipe;
  batchModelParams?: BatchModelParameters;

  references: LiteratureReference[];
  literatureVariables: string[];
}

export interface CandidateCondition {
  id: string;
  cleaningMode: CleaningMode;

  // Single Wafer fields
  cleaningTimeMin?: number;
  rinseTimeMin?: number;
  flowRateLpm?: number;
  spinRpm?: number;
  cycles?: number;

  // Batch fields
  batchSize?: number;
  bathVolumeL?: number;
  bathChanges?: number;
  processTimeMin?: number;
  rinseFlowRateLpm?: number;

  // Calculated metrics
  upwUsageLiters: number; // total UPW (per wafer for single, per batch for batch)
  perWaferUPW?: number; // UPW per single wafer (total UPW / batchSize)
  predictedResidual: number; // R_pred in qualityMetric.unit
  allowableLimit: number;
  qualityPass: boolean;
  isRecommended?: boolean;
  savingsLiters: number;
  savingsPercent: number;
  rejectionReason?: string;
  conditionSummary: string; // human readable summary of recipe
}

export interface ProcessResult {
  process: ProcessDefinition;
  cleaningMode: CleaningMode;
  wafer: WaferConfig;
  batchSize?: number;
  baselineUPW: number;
  recommendedUPW: number;
  savingsLiters: number;
  savingsPercent: number;
  recommendedCandidate: CandidateCondition;
  allCandidates: CandidateCondition[];
  validCandidatesCount: number;
  qualityPass: boolean;
  hasValidCandidates: boolean;
  noValidMessage?: string;
}

export interface ESGSavingsSummary {
  totalBaselineUPW: number; // L
  totalAIUPW: number; // L
  totalSavingsUPW: number; // L
  totalSavingsPercent: number; // %
  totalPowerSavedKWh: number; // kWh
  totalCarbonSavedKg: number; // kg CO2e
  processesPassedCount: number;
  totalProcessesCount: number; // Only optimization-enabled processes (7)
  excludedProcessesCount: number; // 1 (EDS)
}

export interface OptimizationState {
  cleaningMode: CleaningMode;
  batchSize?: number;
  selectedProcess?: string;
  wafer: WaferConfig;
}

export interface BatchSimulationState {
  batchSize: number;
  baseline: {
    bathVolumeL: number;
    bathChanges: number;
    processTimeMin: number;
    rinseTimeMin: number;
    rinseCycles: number;
    rinseFlowRateLMin?: number;
  };
  recommendation?: {
    bathVolumeL: number;
    bathChanges: number;
    processTimeMin: number;
    rinseTimeMin: number;
    rinseCycles: number;
    rinseFlowRateLMin?: number;
  };
  baselineUPW: number;
  recommendedUPW?: number;
  upwPerWafer?: number;
}

export type AppState = "START" | "PROCESS_ACTIVE" | "FINAL_RESULT";
