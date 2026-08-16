import {
  ProcessCategory,
  CleaningStepDefinition,
  ProcessDefinition,
  CleaningMode,
  WaferConfig,
  ProcessCategoryId,
  SingleWaferRecipe,
  SingleWaferModelParameters,
  BatchRecipe,
  BatchModelParameters,
  ContaminantInfo,
  QualityMetricInfo,
  ContaminationBand,
  ProcessContaminationProfile,
} from "../types";
import { LITERATURE_REFERENCES } from "./literature";

/**
 * 8 Major Semiconductor Process Categories Definition
 */
export const PROCESS_CATEGORIES: ProcessCategory[] = [
  // 1. 웨이퍼 제조 (Wafer Manufacturing)
  {
    id: "wafer-mfg",
    stepNumber: 1,
    name: "웨이퍼 제조 공정",
    nameEn: "Wafer Manufacturing",
    shortDesc: "고순도 잉곳 절단 및 표면 연마 후 슬러리/금속 불순물 제거 세정",
    optimizationEnabled: true,
    /** 해당 공정의 전체 세정 시퀀스 (세정 → 린스 → 건조 흐름, 건조는 UPW 계산 제외) */
    sequence: [
      {
        id: "seq-wm-clean",
        name: "Wafer Cleaning",
        type: "clean",
        description: "웨이퍼 표면의 잔류 오염과 세정 대상 물질을 제거하는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "wafer-cleaning",
      },
      {
        id: "seq-wm-rinse",
        name: "Rinse",
        type: "rinse",
        description:
          "세정 후 웨이퍼 표면에 남아 있는 화학물질과 잔류물을 UPW/DIW로 씻어내는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "rinse-dry",
      },
      {
        id: "seq-wm-dry",
        name: "Dry",
        type: "dry",
        description: "린스 후 웨이퍼 표면의 물을 제거하는 단계입니다.",
        upwRelevant: false,
        optimizationEnabled: false,
      },
    ],
    cleaningSteps: [
      {
        id: "wafer-cleaning",
        name: "Wafer Cleaning (웨이퍼 세정)",
        nameEn: "Wafer Surface & Chemical Clean",
        description:
          "실리콘 슬라이싱 및 래핑 후 표면 유기물과 슬러리 미세 입자를 제거하는 기초 세정 단계",
        contaminationScore: 65,
        contaminationBand: "medium",
        contaminants: [
          {
            name: "Slurry particles (연마 슬러리)",
            category: "particle",
            description: "0.1μm 미세 연마 입자",
          },
          {
            name: "Organic residue (유기 잔여물)",
            category: "organic",
            description: "표면 유기 피막",
          },
          {
            name: "Trace metallic ions (미량 금속 불순물)",
            category: "metal",
            description: "Fe, Al, Zn 잔류 금속",
          },
        ],
        qualityMetric: {
          name: "파티클 표면 밀도 (Particle Density)",
          unit: "particles/cm²",
          allowableLimit: 0.05,
          description: "문헌[Ref-S-WAFER-1] 기반 표면 파티클 밀도 관리 기준 (≤ 0.05 ea/cm²)",
        },
        initialContamination: 2.8,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 1.2,
            rinseTimeMin: 1.5,
            flowRateLpm: 2.2,
            spinRpm: 1200,
            rinseCycles: 2,
          },
          "300mm": {
            cleaningTimeMin: 1.5,
            rinseTimeMin: 1.8,
            flowRateLpm: 3.5,
            spinRpm: 1400,
            rinseCycles: 2,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 0.005,
            K: 1.45,
            alpha: 0.82,
            beta: 0.7,
            gamma: 0.65,
            Q_ref: 2.0,
            RPM_ref: 1200,
          },
          "300mm": {
            R_floor: 0.005,
            K: 1.4,
            alpha: 0.85,
            beta: 0.72,
            gamma: 0.68,
            Q_ref: 3.2,
            RPM_ref: 1400,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 35,
            bathChanges: 2,
            processTimeMin: 8.0,
            rinseTimeMin: 4.5,
            rinseFlowRateLpm: 20.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 50,
            bathChanges: 2,
            processTimeMin: 9.0,
            rinseTimeMin: 5.0,
            rinseFlowRateLpm: 28.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 0.005,
            K_batch: 0.65,
            bathVolumeRefPerWafer: 0.7,
            rinseFlowRefLpm: 20.0,
            alpha_bath: 0.75,
            alpha_rinse: 0.8,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 0.005,
            K_batch: 0.62,
            bathVolumeRefPerWafer: 2.0,
            rinseFlowRefLpm: 28.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_WAFER_1],
        literatureVariables: [
          "UPW Flow Rate (Q)",
          "Rinse Time (t)",
          "Wafer Spin RPM",
          "Wafer Diameter",
        ],
      },
      {
        id: "rinse-dry",
        name: "Rinse / Dry (린스 및 건조)",
        nameEn: "Final UPW Rinse & Marangoni Dry",
        description:
          "약액 세정 후 잔류 화학물질의 완벽한 희석 및 워터마크 방지를 위한 초순수 린스/건조 단계",
        contaminationScore: 45,
        contaminationBand: "low",
        contaminants: [
          {
            name: "Chemical carryover (약액 잔류물)",
            category: "chemical",
            description: "SC-1 약액 이온 성분",
          },
          {
            name: "Micro droplets (미세 액적)",
            category: "particle",
            description: "워터마크 유발 잔류액",
          },
        ],
        qualityMetric: {
          name: "잔류 화학 이온 농도 (Residual Chemical Ion)",
          unit: "ng/cm²",
          allowableLimit: 0.02,
          description: "문헌[Ref-S-WAFER-1] 기반 표면 잔류 화학 이온 기준 (≤ 0.02 ng/cm²)",
        },
        initialContamination: 1.2,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 0.8,
            rinseTimeMin: 1.2,
            flowRateLpm: 1.8,
            spinRpm: 1500,
            rinseCycles: 1,
          },
          "300mm": {
            cleaningTimeMin: 1.0,
            rinseTimeMin: 1.5,
            flowRateLpm: 2.8,
            spinRpm: 1800,
            rinseCycles: 1,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 0.001,
            K: 1.6,
            alpha: 0.88,
            beta: 0.75,
            gamma: 0.72,
            Q_ref: 1.8,
            RPM_ref: 1500,
          },
          "300mm": {
            R_floor: 0.001,
            K: 1.55,
            alpha: 0.9,
            beta: 0.78,
            gamma: 0.75,
            Q_ref: 2.8,
            RPM_ref: 1800,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 30,
            bathChanges: 1,
            processTimeMin: 5.0,
            rinseTimeMin: 4.0,
            rinseFlowRateLpm: 18.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 45,
            bathChanges: 1,
            processTimeMin: 6.0,
            rinseTimeMin: 4.5,
            rinseFlowRateLpm: 25.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 0.001,
            K_batch: 0.72,
            bathVolumeRefPerWafer: 0.6,
            rinseFlowRefLpm: 18.0,
            alpha_bath: 0.8,
            alpha_rinse: 0.85,
            beta_cycle: 0.75,
          },
          "300mm": {
            R_floor: 0.001,
            K_batch: 0.7,
            bathVolumeRefPerWafer: 1.8,
            rinseFlowRefLpm: 25.0,
            alpha_bath: 0.82,
            alpha_rinse: 0.88,
            beta_cycle: 0.78,
          },
        },
        references: [LITERATURE_REFERENCES.S_WAFER_1],
        literatureVariables: ["Rinse Time (t)", "UPW Flow Rate (Q)", "Spin RPM"],
      },
    ],
  },

  // 2. 산화 (Oxidation)
  {
    id: "oxidation",
    stepNumber: 2,
    name: "산화 공정",
    nameEn: "Oxidation",
    shortDesc: "고온 산화막 형성 전/후 표면 금속 불순물 및 자연산화막 제어 세정",
    optimizationEnabled: true,
    /** 해당 공정의 전체 세정 시퀀스 (세정 → 린스 → 건조 흐름, 건조는 UPW 계산 제외) */
    sequence: [
      {
        id: "seq-ox-clean",
        name: "Pre-Oxidation Clean",
        type: "clean",
        description: "웨이퍼 표면의 잔류 오염과 세정 대상 물질을 제거하는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "pre-ox-clean",
      },
      {
        id: "seq-ox-rinse",
        name: "Post-Oxidation Rinse",
        type: "rinse",
        description:
          "세정 후 웨이퍼 표면에 남아 있는 화학물질과 잔류물을 UPW/DIW로 씻어내는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "post-ox-rinse",
      },
    ],
    cleaningSteps: [
      {
        id: "pre-ox-clean",
        name: "Pre-Oxidation Clean (산화 전 세정)",
        nameEn: "Pre-Oxidation RCA & Ultra-pure Rinse",
        description:
          "게이트 산화막(GOI) 절연 파괴를 유발하는 표면 전이금속(Fe, Cu) 및 유기 오염을 제거하는 세정",
        contaminationScore: 80,
        contaminationBand: "high",
        contaminants: [
          {
            name: "Fe/Cu trace metal (전이 금속)",
            category: "metal",
            description: "게이트 절연막 파괴 금속",
          },
          {
            name: "Native oxide residue (자연산화막 잔여물)",
            category: "chemical",
            description: "비균일 자연산화막",
          },
          {
            name: "Organic contaminants (유기물)",
            category: "organic",
            description: "표면 유기 흡착 분자",
          },
        ],
        qualityMetric: {
          name: "표면 잔류 금속 오염도 (Surface Metal Contamination)",
          unit: "atoms/cm²",
          allowableLimit: 5.0e9,
          description: "문헌[Ref-S-OX-1] 기반 게이트 산화막 품질 확보 기준 (≤ 5.0 × 10⁹ atoms/cm²)",
        },
        initialContamination: 1.8e11,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 1.5,
            rinseTimeMin: 2.0,
            flowRateLpm: 2.4,
            spinRpm: 1300,
            rinseCycles: 2,
          },
          "300mm": {
            cleaningTimeMin: 1.8,
            rinseTimeMin: 2.5,
            flowRateLpm: 3.8,
            spinRpm: 1500,
            rinseCycles: 2,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 1.0e9,
            K: 1.35,
            alpha: 0.85,
            beta: 0.75,
            gamma: 0.65,
            Q_ref: 2.2,
            RPM_ref: 1300,
          },
          "300mm": {
            R_floor: 1.0e9,
            K: 1.3,
            alpha: 0.88,
            beta: 0.78,
            gamma: 0.68,
            Q_ref: 3.5,
            RPM_ref: 1500,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 40,
            bathChanges: 2,
            processTimeMin: 10.0,
            rinseTimeMin: 5.0,
            rinseFlowRateLpm: 22.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 55,
            bathChanges: 2,
            processTimeMin: 11.0,
            rinseTimeMin: 6.0,
            rinseFlowRateLpm: 30.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 1.0e9,
            K_batch: 0.58,
            bathVolumeRefPerWafer: 0.8,
            rinseFlowRefLpm: 22.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
          "300mm": {
            R_floor: 1.0e9,
            K_batch: 0.55,
            bathVolumeRefPerWafer: 2.2,
            rinseFlowRefLpm: 30.0,
            alpha_bath: 0.8,
            alpha_rinse: 0.85,
            beta_cycle: 0.75,
          },
        },
        references: [LITERATURE_REFERENCES.S_OX_1],
        literatureVariables: ["Rinse Time (t)", "UPW Flow Rate (Q)", "Spin RPM", "Wafer Diameter"],
      },
      {
        id: "post-ox-rinse",
        name: "Post-Oxidation Rinse (산화 후 린스)",
        nameEn: "Post-Oxidation Surface Conditioning",
        description: "산화 공정 후 표면 전하 안정화 및 잔여 입자 재부착 방지를 위한 린스 단계",
        contaminationScore: 40,
        contaminationBand: "low",
        contaminants: [
          {
            name: "Airborne molecular contamination (대기 오염물)",
            category: "organic",
            description: "공정간 흡착 유기물",
          },
          {
            name: "Floating nano particles (부유 파티클)",
            category: "particle",
            description: "0.05μm 이하 미세입자",
          },
        ],
        qualityMetric: {
          name: "표면 결함 밀도 (Defect Density)",
          unit: "defects/wafer",
          allowableLimit: 10.0,
          description: "문헌[Ref-S-OX-1] 기반 산화막 표면 결함 허용 기준 (≤ 10 ea/wafer)",
        },
        initialContamination: 85.0,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 0.6,
            rinseTimeMin: 1.0,
            flowRateLpm: 1.6,
            spinRpm: 1200,
            rinseCycles: 1,
          },
          "300mm": {
            cleaningTimeMin: 0.8,
            rinseTimeMin: 1.2,
            flowRateLpm: 2.5,
            spinRpm: 1400,
            rinseCycles: 1,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 1.5,
            K: 1.7,
            alpha: 0.82,
            beta: 0.7,
            gamma: 0.65,
            Q_ref: 1.6,
            RPM_ref: 1200,
          },
          "300mm": {
            R_floor: 1.5,
            K: 1.65,
            alpha: 0.85,
            beta: 0.72,
            gamma: 0.68,
            Q_ref: 2.5,
            RPM_ref: 1400,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 30,
            bathChanges: 1,
            processTimeMin: 4.0,
            rinseTimeMin: 3.5,
            rinseFlowRateLpm: 16.0,
            rinseCycles: 1,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 45,
            bathChanges: 1,
            processTimeMin: 5.0,
            rinseTimeMin: 4.0,
            rinseFlowRateLpm: 24.0,
            rinseCycles: 1,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 1.5,
            K_batch: 0.75,
            bathVolumeRefPerWafer: 0.6,
            rinseFlowRefLpm: 16.0,
            alpha_bath: 0.75,
            alpha_rinse: 0.8,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 1.5,
            K_batch: 0.72,
            bathVolumeRefPerWafer: 1.8,
            rinseFlowRefLpm: 24.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_OX_1],
        literatureVariables: ["Rinse Time (t)", "UPW Flow Rate (Q)"],
      },
    ],
  },

  // 3. 포토 (Photolithography)
  {
    id: "photo",
    stepNumber: 3,
    name: "포토 공정",
    nameEn: "Photolithography",
    shortDesc: "노광 후 현상(Develop) 약액 제거 및 패턴 쓰러짐 방지 초순수 린스",
    optimizationEnabled: true,
    /** 해당 공정의 전체 세정 시퀀스 (세정 → 린스 → 건조 흐름, 건조는 UPW 계산 제외) */
    sequence: [
      {
        id: "seq-ph-dev-rinse",
        name: "Developer Rinse",
        type: "rinse",
        description:
          "세정 후 웨이퍼 표면에 남아 있는 화학물질과 잔류물을 UPW/DIW로 씻어내는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "developer-rinse",
      },
      {
        id: "seq-ph-clean",
        name: "Post-Develop Clean",
        type: "clean",
        description: "웨이퍼 표면의 잔류 오염과 세정 대상 물질을 제거하는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "post-develop-rinse",
      },
    ],
    cleaningSteps: [
      {
        id: "developer-rinse",
        name: "Developer Rinse (현상액 린스)",
        nameEn: "Post-Exposure Develop & UPW Quench",
        description:
          "TMAH 현상액을 순간 치환(Quench)하여 미세 패턴의 과현상을 방지하는 고속 회전 린스",
        contaminationScore: 70,
        contaminationBand: "medium",
        contaminants: [
          {
            name: "TMAH developer residue (현상액 잔류물)",
            category: "chemical",
            description: "테트라메틸암모늄 이온",
          },
          {
            name: "Dissolved photoresist polymer (용해 감광액)",
            category: "organic",
            description: "PR 고분자 찌꺼기",
          },
          {
            name: "Micro-bubble defect (미세 기포)",
            category: "particle",
            description: "현상 반응 기포",
          },
        ],
        qualityMetric: {
          name: "PR 잔여물 결함수 (PR Residue Defect Count)",
          unit: "defects/wafer",
          allowableLimit: 12.0,
          description: "문헌[Ref-S-PHOTO-1] 기반 패턴 결함 허용 기준 (≤ 12 ea/wafer)",
        },
        initialContamination: 180.0,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 0.8,
            rinseTimeMin: 1.2,
            flowRateLpm: 2.0,
            spinRpm: 1800,
            rinseCycles: 1,
          },
          "300mm": {
            cleaningTimeMin: 1.0,
            rinseTimeMin: 1.5,
            flowRateLpm: 3.2,
            spinRpm: 2200,
            rinseCycles: 1,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 2.0,
            K: 1.5,
            alpha: 0.85,
            beta: 0.7,
            gamma: 0.8,
            Q_ref: 2.0,
            RPM_ref: 1800,
          },
          "300mm": {
            R_floor: 2.0,
            K: 1.45,
            alpha: 0.88,
            beta: 0.72,
            gamma: 0.82,
            Q_ref: 3.2,
            RPM_ref: 2200,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 35,
            bathChanges: 2,
            processTimeMin: 6.0,
            rinseTimeMin: 4.0,
            rinseFlowRateLpm: 20.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 50,
            bathChanges: 2,
            processTimeMin: 7.0,
            rinseTimeMin: 4.5,
            rinseFlowRateLpm: 28.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 2.0,
            K_batch: 0.68,
            bathVolumeRefPerWafer: 0.7,
            rinseFlowRefLpm: 20.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 2.0,
            K_batch: 0.65,
            bathVolumeRefPerWafer: 2.0,
            rinseFlowRefLpm: 28.0,
            alpha_bath: 0.8,
            alpha_rinse: 0.85,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_PHOTO_1],
        literatureVariables: ["Puddle Rinse Time (t)", "Spin RPM", "UPW Flow Rate (Q)"],
      },
      {
        id: "post-develop-rinse",
        name: "Post-Develop Clean / Rinse (현상 후 세정)",
        nameEn: "Pattern Collapse Prevention Rinse",
        description:
          "계면활성제 함유 린스액 및 초순수를 통해 미세 패턴 붕괴(Pattern Collapse)를 억제하는 세정",
        contaminationScore: 50,
        contaminationBand: "medium",
        contaminants: [
          {
            name: "Surfactant chemical residue (계면활성제 잔여물)",
            category: "chemical",
            description: "표면장력 조절제 잔류",
          },
          {
            name: "Particle redeposition (재흡착 파티클)",
            category: "particle",
            description: "탈착 후 재부착 입자",
          },
        ],
        qualityMetric: {
          name: "선폭 거칠기 (Line-Width Roughness, LWR)",
          unit: "nm",
          allowableLimit: 2.5,
          description: "문헌[Ref-S-PHOTO-1] 기반 포토 패턴 선폭 거칠기 허용 기준 (≤ 2.5 nm)",
        },
        initialContamination: 8.5,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 0.6,
            rinseTimeMin: 1.0,
            flowRateLpm: 1.8,
            spinRpm: 1500,
            rinseCycles: 1,
          },
          "300mm": {
            cleaningTimeMin: 0.8,
            rinseTimeMin: 1.2,
            flowRateLpm: 2.8,
            spinRpm: 1800,
            rinseCycles: 1,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 0.8,
            K: 1.65,
            alpha: 0.82,
            beta: 0.7,
            gamma: 0.75,
            Q_ref: 1.8,
            RPM_ref: 1500,
          },
          "300mm": {
            R_floor: 0.8,
            K: 1.6,
            alpha: 0.85,
            beta: 0.72,
            gamma: 0.78,
            Q_ref: 2.8,
            RPM_ref: 1800,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 30,
            bathChanges: 1,
            processTimeMin: 5.0,
            rinseTimeMin: 3.5,
            rinseFlowRateLpm: 18.0,
            rinseCycles: 1,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 45,
            bathChanges: 1,
            processTimeMin: 6.0,
            rinseTimeMin: 4.0,
            rinseFlowRateLpm: 25.0,
            rinseCycles: 1,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 0.8,
            K_batch: 0.7,
            bathVolumeRefPerWafer: 0.6,
            rinseFlowRefLpm: 18.0,
            alpha_bath: 0.75,
            alpha_rinse: 0.8,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 0.8,
            K_batch: 0.68,
            bathVolumeRefPerWafer: 1.8,
            rinseFlowRefLpm: 25.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_PHOTO_1],
        literatureVariables: ["Rinse Time (t)", "UPW Flow Rate (Q)", "Spin RPM"],
      },
    ],
  },

  // 4. 식각 (Etching)
  {
    id: "etching",
    stepNumber: 4,
    name: "식각 공정",
    nameEn: "Etching",
    shortDesc: "플라즈마 식각 후 잔류 폴리머, 불소화물 및 금속 부산물 제거 세정",
    optimizationEnabled: true,
    /** 해당 공정의 전체 세정 시퀀스 (세정 → 린스 → 건조 흐름, 건조는 UPW 계산 제외) */
    sequence: [
      {
        id: "seq-et-clean",
        name: "Post-Etch Clean",
        type: "clean",
        description: "웨이퍼 표면의 잔류 오염과 세정 대상 물질을 제거하는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "post-etch-clean",
      },
      {
        id: "seq-et-rinse",
        name: "UPW Rinse",
        type: "rinse",
        description:
          "세정 후 웨이퍼 표면에 남아 있는 화학물질과 잔류물을 UPW/DIW로 씻어내는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "upw-rinse",
      },
    ],
    cleaningSteps: [
      {
        id: "post-etch-clean",
        name: "Post-Etch Clean (식각 후 세정)",
        nameEn: "Post-Etch Polymer Strip & Cu Clean",
        description:
          "식각 반응 후 측벽 폴리머 및 노출된 Cu 전이금속 이온을 완벽히 세정하여 접촉 저항을 안정화",
        contaminationScore: 85,
        contaminationBand: "high",
        contaminants: [
          {
            name: "Etch polymer residue (식각 폴리머)",
            category: "chemical",
            description: "플루오로카본 복합 폴리머",
          },
          {
            name: "Cu metal ions (구리 금속 이온)",
            category: "metal",
            description: "노출 Cu 잔류 이온",
          },
          {
            name: "Fluoride byproducts (불소 부산물)",
            category: "chemical",
            description: "식각 가스 반응 잔여물",
          },
        ],
        qualityMetric: {
          name: "잔류 구리 오염도 (Residual Cu Concentration)",
          unit: "atoms/cm²",
          allowableLimit: 1.0e10,
          description:
            "문헌[Ref-S-ETCH-1, Ref-S-METAL-1] 기반 물리 모델 게이트 기준 (≤ 1.0 × 10¹⁰ atoms/cm²)",
        },
        initialContamination: 8.5e11,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 1.5,
            rinseTimeMin: 2.0,
            flowRateLpm: 2.5,
            spinRpm: 1200,
            rinseCycles: 2,
          },
          "300mm": {
            cleaningTimeMin: 2.0,
            rinseTimeMin: 2.5,
            flowRateLpm: 4.2,
            spinRpm: 1500,
            rinseCycles: 2,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 2.0e9,
            K: 1.3,
            alpha: 0.85,
            beta: 0.75,
            gamma: 0.65,
            Q_ref: 2.2,
            RPM_ref: 1200,
          },
          "300mm": {
            R_floor: 2.0e9,
            K: 1.25,
            alpha: 0.88,
            beta: 0.78,
            gamma: 0.68,
            Q_ref: 3.8,
            RPM_ref: 1500,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 45,
            bathChanges: 2,
            processTimeMin: 10.0,
            rinseTimeMin: 6.0,
            rinseFlowRateLpm: 24.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 60,
            bathChanges: 2,
            processTimeMin: 12.0,
            rinseTimeMin: 7.0,
            rinseFlowRateLpm: 32.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 2.0e9,
            K_batch: 0.55,
            bathVolumeRefPerWafer: 0.9,
            rinseFlowRefLpm: 24.0,
            alpha_bath: 0.75,
            alpha_rinse: 0.8,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 2.0e9,
            K_batch: 0.52,
            bathVolumeRefPerWafer: 2.4,
            rinseFlowRefLpm: 32.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_ETCH_1, LITERATURE_REFERENCES.S_METAL_1],
        literatureVariables: [
          "UPW Flow Rate (Q)",
          "Rinse Time (t)",
          "Spin RPM",
          "Wafer Diameter",
          "Rinse Cycle (N)",
        ],
      },
      {
        id: "upw-rinse",
        name: "UPW Rinse (초순수 린스)",
        nameEn: "Post-Etch Cascade DIW Rinse",
        description: "식각 약액 및 잔여 이온의 최종 희석 배출을 위한 고순도 초순수 회전 린스",
        contaminationScore: 60,
        contaminationBand: "medium",
        contaminants: [
          {
            name: "Trace acid residue (미량 산성 약액)",
            category: "chemical",
            description: "HF, H2SO4 잔류성분",
          },
          {
            name: "Sub-micron particles (미세 파티클)",
            category: "particle",
            description: "0.08μm 식각 부유물",
          },
        ],
        qualityMetric: {
          name: "화학 약액 잔류 농도 (Chemical Residue Concentration)",
          unit: "ng/cm²",
          allowableLimit: 0.05,
          description: "문헌[Ref-S-ETCH-1] 기반 식각 약액 잔류 농도 기준 (≤ 0.05 ng/cm²)",
        },
        initialContamination: 2.5,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 1.0,
            rinseTimeMin: 1.5,
            flowRateLpm: 2.0,
            spinRpm: 1400,
            rinseCycles: 1,
          },
          "300mm": {
            cleaningTimeMin: 1.2,
            rinseTimeMin: 1.8,
            flowRateLpm: 3.2,
            spinRpm: 1600,
            rinseCycles: 1,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 0.005,
            K: 1.55,
            alpha: 0.85,
            beta: 0.72,
            gamma: 0.7,
            Q_ref: 2.0,
            RPM_ref: 1400,
          },
          "300mm": {
            R_floor: 0.005,
            K: 1.5,
            alpha: 0.88,
            beta: 0.75,
            gamma: 0.72,
            Q_ref: 3.2,
            RPM_ref: 1600,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 35,
            bathChanges: 1,
            processTimeMin: 6.0,
            rinseTimeMin: 4.5,
            rinseFlowRateLpm: 20.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 50,
            bathChanges: 1,
            processTimeMin: 7.0,
            rinseTimeMin: 5.0,
            rinseFlowRateLpm: 28.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 0.005,
            K_batch: 0.65,
            bathVolumeRefPerWafer: 0.7,
            rinseFlowRefLpm: 20.0,
            alpha_bath: 0.75,
            alpha_rinse: 0.8,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 0.005,
            K_batch: 0.62,
            bathVolumeRefPerWafer: 2.0,
            rinseFlowRefLpm: 28.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_ETCH_1],
        literatureVariables: ["UPW Flow Rate (Q)", "Rinse Time (t)", "Spin RPM"],
      },
    ],
  },

  // 5. 증착·이온주입 (Deposition / Ion Implantation)
  {
    id: "deposition",
    stepNumber: 5,
    name: "증착·이온주입 공정",
    nameEn: "Deposition / Ion Implantation",
    shortDesc: "박막 형성 전 계면 세정 및 고농도 이온주입 표면 경화층(Crust) 제거",
    optimizationEnabled: true,
    /** 해당 공정의 전체 세정 시퀀스 (세정 → 린스 → 건조 흐름, 건조는 UPW 계산 제외) */
    sequence: [
      {
        id: "seq-dep-pre",
        name: "Pre-Dep Clean",
        type: "clean",
        description: "웨이퍼 표면의 잔류 오염과 세정 대상 물질을 제거하는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "pre-dep-clean",
      },
      {
        id: "seq-dep-post",
        name: "Post-Implant Clean",
        type: "clean",
        description: "웨이퍼 표면의 잔류 오염과 세정 대상 물질을 제거하는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "post-implant-clean",
      },
      {
        id: "seq-dep-rinse",
        name: "Cascade Rinse",
        type: "rinse",
        description:
          "세정 후 웨이퍼 표면에 남아 있는 화학물질과 잔류물을 UPW/DIW로 씻어내는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "cascade-rinse",
      },
    ],
    cleaningSteps: [
      {
        id: "pre-dep-clean",
        name: "Pre-Dep Clean (증착 전 세정)",
        nameEn: "Pre-ALD/CVD Native Oxide & Carbon Clean",
        description:
          "박막 증착 전 표면 자연산화막 및 탄소 흡착물을 제거하여 박막 접합력과 계면 신뢰성을 극대화",
        contaminationScore: 75,
        contaminationBand: "high",
        contaminants: [
          {
            name: "Carbon contaminant (탄소 흡착물)",
            category: "organic",
            description: "대기 흡착 탄화수소",
          },
          {
            name: "Interface native oxide (계면 산화막)",
            category: "chemical",
            description: "비제어 산화막",
          },
          {
            name: "Metallic particles (금속 파티클)",
            category: "metal",
            description: "미세 금속 불순물",
          },
        ],
        qualityMetric: {
          name: "표면 탄소 불순물 농도 (Surface Carbon Concentration)",
          unit: "atoms/cm²",
          allowableLimit: 2.0e11,
          description: "문헌[Ref-S-DEP-1] 기반 박막 계면 접합 허용 기준 (≤ 2.0 × 10¹¹ atoms/cm²)",
        },
        initialContamination: 4.5e12,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 1.2,
            rinseTimeMin: 1.8,
            flowRateLpm: 2.2,
            spinRpm: 1250,
            rinseCycles: 2,
          },
          "300mm": {
            cleaningTimeMin: 1.5,
            rinseTimeMin: 2.2,
            flowRateLpm: 3.6,
            spinRpm: 1450,
            rinseCycles: 2,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 5.0e10,
            K: 1.4,
            alpha: 0.85,
            beta: 0.72,
            gamma: 0.68,
            Q_ref: 2.0,
            RPM_ref: 1250,
          },
          "300mm": {
            R_floor: 5.0e10,
            K: 1.35,
            alpha: 0.88,
            beta: 0.75,
            gamma: 0.7,
            Q_ref: 3.4,
            RPM_ref: 1450,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 38,
            bathChanges: 2,
            processTimeMin: 9.0,
            rinseTimeMin: 5.0,
            rinseFlowRateLpm: 22.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 52,
            bathChanges: 2,
            processTimeMin: 10.0,
            rinseTimeMin: 5.5,
            rinseFlowRateLpm: 30.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 5.0e10,
            K_batch: 0.6,
            bathVolumeRefPerWafer: 0.76,
            rinseFlowRefLpm: 22.0,
            alpha_bath: 0.76,
            alpha_rinse: 0.8,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 5.0e10,
            K_batch: 0.58,
            bathVolumeRefPerWafer: 2.08,
            rinseFlowRefLpm: 30.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_DEP_1],
        literatureVariables: ["Rinse Time (t)", "UPW Flow Rate (Q)", "Spin RPM"],
      },
      {
        id: "post-implant-clean",
        name: "Post-Implant Clean (이온주입 후 세정)",
        nameEn: "High-Dose Implant Strip & Dopant Rinse",
        description:
          "고에너지 이온주입 후 손상된 표면 경화층(Hard Crust)과 잔류 도펀트(B, P, As)를 제거하는 세정",
        contaminationScore: 80,
        contaminationBand: "high",
        contaminants: [
          {
            name: "Hardened polymer crust (경화 탄화층)",
            category: "chemical",
            description: "탄화된 레지스트 피막",
          },
          {
            name: "Dopant cross-residue (도펀트 잔여물)",
            category: "metal",
            description: "B, P, As 이온 잔류",
          },
        ],
        qualityMetric: {
          name: "표면 도펀트 잔류 농도 (Surface Dopant Residue)",
          unit: "atoms/cm²",
          allowableLimit: 1.0e11,
          description: "문헌[Ref-S-DEP-1] 기반 도펀트 오염 허용 기준 (≤ 1.0 × 10¹¹ atoms/cm²)",
        },
        initialContamination: 3.2e12,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 1.5,
            rinseTimeMin: 2.0,
            flowRateLpm: 2.4,
            spinRpm: 1300,
            rinseCycles: 2,
          },
          "300mm": {
            cleaningTimeMin: 1.8,
            rinseTimeMin: 2.4,
            flowRateLpm: 3.8,
            spinRpm: 1500,
            rinseCycles: 2,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 2.0e10,
            K: 1.35,
            alpha: 0.85,
            beta: 0.75,
            gamma: 0.65,
            Q_ref: 2.2,
            RPM_ref: 1300,
          },
          "300mm": {
            R_floor: 2.0e10,
            K: 1.3,
            alpha: 0.88,
            beta: 0.78,
            gamma: 0.68,
            Q_ref: 3.5,
            RPM_ref: 1500,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 40,
            bathChanges: 2,
            processTimeMin: 10.0,
            rinseTimeMin: 5.5,
            rinseFlowRateLpm: 24.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 55,
            bathChanges: 2,
            processTimeMin: 11.0,
            rinseTimeMin: 6.0,
            rinseFlowRateLpm: 32.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 2.0e10,
            K_batch: 0.58,
            bathVolumeRefPerWafer: 0.8,
            rinseFlowRefLpm: 24.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
          "300mm": {
            R_floor: 2.0e10,
            K_batch: 0.55,
            bathVolumeRefPerWafer: 2.2,
            rinseFlowRefLpm: 32.0,
            alpha_bath: 0.8,
            alpha_rinse: 0.85,
            beta_cycle: 0.75,
          },
        },
        references: [LITERATURE_REFERENCES.S_DEP_1],
        literatureVariables: ["Rinse Time (t)", "UPW Flow Rate (Q)", "Spin RPM"],
      },
      {
        id: "cascade-rinse",
        name: "Cascade Rinse (다단계 린스)",
        nameEn: "Cascade Multi-stage DIW Rinse",
        description: "약액 및 박리 찌꺼기의 역오염 방지를 위한 다단계 오버플로우 초순수 린스",
        contaminationScore: 55,
        contaminationBand: "medium",
        contaminants: [
          {
            name: "Sulfuric acid carryover (황산 약액 잔여)",
            category: "chemical",
            description: "SPM 세정액 잔류성분",
          },
          {
            name: "Floating particle clusters (부유 파티클 클러스터)",
            category: "particle",
            description: "0.1μm 미세 입자",
          },
        ],
        qualityMetric: {
          name: "용출 이온 전도도 (Effluent Ionic Conductivity)",
          unit: "µS/cm",
          allowableLimit: 0.08,
          description: "문헌[Ref-S-DEP-1] 기반 세정액 용출 이온 전도도 기준 (≤ 0.08 µS/cm)",
        },
        initialContamination: 1.8,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 0.8,
            rinseTimeMin: 1.2,
            flowRateLpm: 1.8,
            spinRpm: 1400,
            rinseCycles: 2,
          },
          "300mm": {
            cleaningTimeMin: 1.0,
            rinseTimeMin: 1.5,
            flowRateLpm: 2.8,
            spinRpm: 1600,
            rinseCycles: 2,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 0.01,
            K: 1.55,
            alpha: 0.85,
            beta: 0.75,
            gamma: 0.7,
            Q_ref: 1.8,
            RPM_ref: 1400,
          },
          "300mm": {
            R_floor: 0.01,
            K: 1.5,
            alpha: 0.88,
            beta: 0.78,
            gamma: 0.72,
            Q_ref: 2.8,
            RPM_ref: 1600,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 35,
            bathChanges: 1,
            processTimeMin: 6.0,
            rinseTimeMin: 4.5,
            rinseFlowRateLpm: 20.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 48,
            bathChanges: 1,
            processTimeMin: 7.0,
            rinseTimeMin: 5.0,
            rinseFlowRateLpm: 26.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 0.01,
            K_batch: 0.65,
            bathVolumeRefPerWafer: 0.7,
            rinseFlowRefLpm: 20.0,
            alpha_bath: 0.76,
            alpha_rinse: 0.8,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 0.01,
            K_batch: 0.62,
            bathVolumeRefPerWafer: 1.92,
            rinseFlowRefLpm: 26.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_DEP_1],
        literatureVariables: ["Rinse Time (t)", "UPW Flow Rate (Q)"],
      },
    ],
  },

  // 6. 금속배선 (Metal Interconnect)
  {
    id: "metal",
    stepNumber: 6,
    name: "금속배선 공정",
    nameEn: "Metal Interconnect",
    shortDesc: "Cu/Al 다층 배선 형성 및 CMP(화학기계적연마) 후 슬러리·방청제 세정",
    optimizationEnabled: true,
    /** 해당 공정의 전체 세정 시퀀스 (세정 → 린스 → 건조 흐름, 건조는 UPW 계산 제외) */
    sequence: [
      {
        id: "seq-me-cmp",
        name: "Post-CMP Clean",
        type: "clean",
        description: "웨이퍼 표면의 잔류 오염과 세정 대상 물질을 제거하는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "post-cmp-clean",
      },
      {
        id: "seq-me-cu",
        name: "Cu Clean",
        type: "clean",
        description: "웨이퍼 표면의 잔류 오염과 세정 대상 물질을 제거하는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "cu-clean",
      },
      {
        id: "seq-me-final",
        name: "Final Rinse",
        type: "rinse",
        description:
          "세정 후 웨이퍼 표면에 남아 있는 화학물질과 잔류물을 UPW/DIW로 씻어내는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "final-rinse",
      },
    ],
    cleaningSteps: [
      {
        id: "post-cmp-clean",
        name: "Post-CMP Clean (CMP 후 세정)",
        nameEn: "Post-CMP Megasonic & Brush Clean",
        description:
          "CMP 평탄화 후 웨이퍼 표면에 고착된 실리카/세리아 슬러리 입자 및 금속 찌꺼기를 메가소닉 브러시로 제거",
        contaminationScore: 90,
        contaminationBand: "very_high",
        contaminants: [
          {
            name: "CMP Slurry particles (실리카/세리아 입자)",
            category: "particle",
            description: "0.05~0.2μm 슬러리 입자",
          },
          {
            name: "BTA corrosion inhibitor (방청제 잔류물)",
            category: "organic",
            description: "벤조트리아졸 유기피막",
          },
          {
            name: "Cu debris / ions (구리 금속 파티클)",
            category: "metal",
            description: "CMP 연마 금속 잔여물",
          },
        ],
        qualityMetric: {
          name: "잔류 구리 오염도 (Residual Cu Concentration)",
          unit: "atoms/cm²",
          allowableLimit: 1.0e10,
          description: "문헌[Ref-S-METAL-1] 기반 배선 간 쇼트 방지 기준 (≤ 1.0 × 10¹⁰ atoms/cm²)",
        },
        initialContamination: 1.2e12,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 1.5,
            rinseTimeMin: 2.2,
            flowRateLpm: 2.6,
            spinRpm: 1200,
            rinseCycles: 2,
          },
          "300mm": {
            cleaningTimeMin: 2.0,
            rinseTimeMin: 2.8,
            flowRateLpm: 4.5,
            spinRpm: 1500,
            rinseCycles: 2,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 2.0e9,
            K: 1.28,
            alpha: 0.85,
            beta: 0.75,
            gamma: 0.65,
            Q_ref: 2.4,
            RPM_ref: 1200,
          },
          "300mm": {
            R_floor: 2.0e9,
            K: 1.22,
            alpha: 0.88,
            beta: 0.78,
            gamma: 0.68,
            Q_ref: 4.0,
            RPM_ref: 1500,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 45,
            bathChanges: 2,
            processTimeMin: 11.0,
            rinseTimeMin: 6.5,
            rinseFlowRateLpm: 25.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 60,
            bathChanges: 2,
            processTimeMin: 12.5,
            rinseTimeMin: 7.5,
            rinseFlowRateLpm: 35.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 2.0e9,
            K_batch: 0.52,
            bathVolumeRefPerWafer: 0.9,
            rinseFlowRefLpm: 25.0,
            alpha_bath: 0.75,
            alpha_rinse: 0.8,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 2.0e9,
            K_batch: 0.48,
            bathVolumeRefPerWafer: 2.4,
            rinseFlowRefLpm: 35.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_METAL_1],
        literatureVariables: ["UPW Flow Rate (Q)", "Rinse Time (t)", "Spin RPM", "Wafer Diameter"],
      },
      {
        id: "cu-clean",
        name: "Cu Clean (Cu 표면 세정)",
        nameEn: "Copper Surface Oxide Removal & DIW Rinse",
        description:
          "구리 배선 표면의 산화막을 유기산으로 환원 세정하고 초순수로 린스하여 배선 저항을 제어",
        contaminationScore: 75,
        contaminationBand: "high",
        contaminants: [
          {
            name: "Cu surface oxide (구리 산화막 CuO/Cu2O)",
            category: "chemical",
            description: "표면 자연 산화물",
          },
          {
            name: "Organic acid complex (유기산 착체 잔여물)",
            category: "chemical",
            description: "시트르산/옥살산 착체",
          },
        ],
        qualityMetric: {
          name: "표면 산화물 잔류 두께 (Surface Oxide Thickness)",
          unit: "Å",
          allowableLimit: 15.0,
          description: "문헌[Ref-S-METAL-1] 기반 Cu 배선 접촉 저항 허용 기준 (≤ 15.0 Å)",
        },
        initialContamination: 65.0,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 1.0,
            rinseTimeMin: 1.5,
            flowRateLpm: 2.0,
            spinRpm: 1300,
            rinseCycles: 1,
          },
          "300mm": {
            cleaningTimeMin: 1.2,
            rinseTimeMin: 1.8,
            flowRateLpm: 3.2,
            spinRpm: 1500,
            rinseCycles: 1,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 5.0,
            K: 1.45,
            alpha: 0.82,
            beta: 0.7,
            gamma: 0.65,
            Q_ref: 2.0,
            RPM_ref: 1300,
          },
          "300mm": {
            R_floor: 5.0,
            K: 1.4,
            alpha: 0.85,
            beta: 0.72,
            gamma: 0.68,
            Q_ref: 3.2,
            RPM_ref: 1500,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 35,
            bathChanges: 1,
            processTimeMin: 7.0,
            rinseTimeMin: 4.5,
            rinseFlowRateLpm: 20.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 50,
            bathChanges: 1,
            processTimeMin: 8.0,
            rinseTimeMin: 5.0,
            rinseFlowRateLpm: 28.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 5.0,
            K_batch: 0.62,
            bathVolumeRefPerWafer: 0.7,
            rinseFlowRefLpm: 20.0,
            alpha_bath: 0.76,
            alpha_rinse: 0.8,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 5.0,
            K_batch: 0.6,
            bathVolumeRefPerWafer: 2.0,
            rinseFlowRefLpm: 28.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_METAL_1],
        literatureVariables: ["UPW Flow Rate (Q)", "Rinse Time (t)", "Spin RPM"],
      },
      {
        id: "final-rinse",
        name: "Final Rinse (최종 린스)",
        nameEn: "BEOL Final UPW Spin Rinse & Dry",
        description:
          "금속 배선 공정 완료 후 미세 오염물 재흡착을 차단하는 고순도 탈기 초순수 최종 린스",
        contaminationScore: 50,
        contaminationBand: "medium",
        contaminants: [
          {
            name: "Residual ionic species (잔류 이온)",
            category: "chemical",
            description: "Cl, F, SO4 잔류 이온",
          },
          {
            name: "Nano particles (부유 미세 입자)",
            category: "particle",
            description: "0.05μm 이하 입자",
          },
        ],
        qualityMetric: {
          name: "표면 이온 잔류 농도 (Surface Ionic Residue)",
          unit: "ng/cm²",
          allowableLimit: 0.03,
          description: "문헌[Ref-S-METAL-1] 기반 표면 이온 농도 기준 (≤ 0.03 ng/cm²)",
        },
        initialContamination: 1.5,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 0.8,
            rinseTimeMin: 1.2,
            flowRateLpm: 1.8,
            spinRpm: 1500,
            rinseCycles: 1,
          },
          "300mm": {
            cleaningTimeMin: 1.0,
            rinseTimeMin: 1.5,
            flowRateLpm: 2.8,
            spinRpm: 1800,
            rinseCycles: 1,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 0.002,
            K: 1.6,
            alpha: 0.85,
            beta: 0.72,
            gamma: 0.72,
            Q_ref: 1.8,
            RPM_ref: 1500,
          },
          "300mm": {
            R_floor: 0.002,
            K: 1.55,
            alpha: 0.88,
            beta: 0.75,
            gamma: 0.75,
            Q_ref: 2.8,
            RPM_ref: 1800,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 30,
            bathChanges: 1,
            processTimeMin: 5.0,
            rinseTimeMin: 4.0,
            rinseFlowRateLpm: 18.0,
            rinseCycles: 1,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 45,
            bathChanges: 1,
            processTimeMin: 6.0,
            rinseTimeMin: 4.5,
            rinseFlowRateLpm: 25.0,
            rinseCycles: 1,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 0.002,
            K_batch: 0.7,
            bathVolumeRefPerWafer: 0.6,
            rinseFlowRefLpm: 18.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
          "300mm": {
            R_floor: 0.002,
            K_batch: 0.68,
            bathVolumeRefPerWafer: 1.8,
            rinseFlowRefLpm: 25.0,
            alpha_bath: 0.8,
            alpha_rinse: 0.85,
            beta_cycle: 0.75,
          },
        },
        references: [LITERATURE_REFERENCES.S_METAL_1],
        literatureVariables: ["Rinse Time (t)", "UPW Flow Rate (Q)", "Spin RPM"],
      },
    ],
  },

  // 7. EDS (Electrical Die Sorting) - Non-wet inspection process
  {
    id: "eds",
    stepNumber: 7,
    name: "EDS 공정",
    nameEn: "Electrical Die Sorting",
    shortDesc: "웨이퍼 완성 후 개별 칩 전기적 특성/수율 검사 (건식 검사 단계)",
    optimizationEnabled: false,
    nonOptimizationReason:
      "EDS는 전기적 특성 검사 중심 공정으로 PureFlow AI의 UPW 세정 최적화 대상이 아닙니다.",
    /** 해당 공정의 전체 세정 시퀀스 (세정 → 린스 → 건조 흐름, 건조는 UPW 계산 제외) */
    sequence: [],
    cleaningSteps: [],
  },

  // 8. 패키징 (Packaging)
  {
    id: "packaging",
    stepNumber: 8,
    name: "패키징 공정",
    nameEn: "Packaging",
    shortDesc: "웨이퍼 후면 연삭(Backgrinding), 다이싱, 하이브리드 본딩 전/후 세정",
    optimizationEnabled: true,
    /** 해당 공정의 전체 세정 시퀀스 (세정 → 린스 → 건조 흐름, 건조는 UPW 계산 제외) */
    sequence: [
      {
        id: "seq-pk-cmp",
        name: "CMP 후 세정",
        type: "clean",
        description: "웨이퍼 표면의 잔류 오염과 세정 대상 물질을 제거하는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "packaging-cmp",
      },
      {
        id: "seq-pk-bond",
        name: "Bonding 전 표면 세정",
        type: "clean",
        description: "웨이퍼 표면의 잔류 오염과 세정 대상 물질을 제거하는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "bonding-surface-clean",
      },
      {
        id: "seq-pk-rinse",
        name: "Surface Rinse",
        type: "rinse",
        description:
          "세정 후 웨이퍼 표면에 남아 있는 화학물질과 잔류물을 UPW/DIW로 씻어내는 단계입니다.",
        upwRelevant: true,
        optimizationEnabled: true,
        cleaningStepId: "surface-rinse",
      },
    ],
    cleaningSteps: [
      {
        id: "packaging-cmp",
        name: "CMP 후 세정 (Post-CMP Clean)",
        nameEn: "Packaging CMP & Backgrinding Slurry Clean",
        description:
          "웨이퍼 후면 박막 연마(Backgrinding/CMP) 후 실리콘 미세 찌꺼기 및 슬러리 입자를 제거하는 브러시/초순수 세정",
        contaminationScore: 75,
        contaminationBand: "high",
        contaminants: [
          {
            name: "Silicon grinding debris (실리콘 연삭 파편)",
            category: "particle",
            description: "0.1~0.5μm Si 미세입자",
          },
          {
            name: "Polishing slurry residue (연마 슬러리 잔여물)",
            category: "particle",
            description: "콜로이달 실리카 잔류물",
          },
          {
            name: "Metallic grinding trace (연삭 금속 불순물)",
            category: "metal",
            description: "연삭 휠 접촉 잔류물",
          },
        ],
        qualityMetric: {
          name: "잔류 슬러리 파티클 수 (Slurry Particle Count)",
          unit: "particles/wafer",
          allowableLimit: 15.0,
          description: "문헌[Ref-S-PKG-1] 기반 패키징 기판 슬러리 허용 기준 (≤ 15 ea/wafer)",
        },
        initialContamination: 180.0,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 1.2,
            rinseTimeMin: 1.5,
            flowRateLpm: 2.2,
            spinRpm: 1200,
            rinseCycles: 2,
          },
          "300mm": {
            cleaningTimeMin: 1.5,
            rinseTimeMin: 2.0,
            flowRateLpm: 3.5,
            spinRpm: 1400,
            rinseCycles: 2,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 2.0,
            K: 1.4,
            alpha: 0.85,
            beta: 0.72,
            gamma: 0.68,
            Q_ref: 2.0,
            RPM_ref: 1200,
          },
          "300mm": {
            R_floor: 2.0,
            K: 1.35,
            alpha: 0.88,
            beta: 0.75,
            gamma: 0.7,
            Q_ref: 3.2,
            RPM_ref: 1400,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 38,
            bathChanges: 2,
            processTimeMin: 8.0,
            rinseTimeMin: 4.5,
            rinseFlowRateLpm: 20.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 50,
            bathChanges: 2,
            processTimeMin: 9.0,
            rinseTimeMin: 5.0,
            rinseFlowRateLpm: 28.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 2.0,
            K_batch: 0.65,
            bathVolumeRefPerWafer: 0.76,
            rinseFlowRefLpm: 20.0,
            alpha_bath: 0.75,
            alpha_rinse: 0.8,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 2.0,
            K_batch: 0.62,
            bathVolumeRefPerWafer: 2.0,
            rinseFlowRefLpm: 28.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_PKG_1],
        literatureVariables: ["UPW Jet Flow (Q)", "Rinse Time (t)", "Spin RPM", "Wafer Diameter"],
      },
      {
        id: "bonding-surface-clean",
        name: "Bonding 전 표면 세정 (Pre-Bonding Clean)",
        nameEn: "Hybrid Direct Bonding Surface Clean",
        description:
          "다이 간 하이브리드 본딩(Cu-Cu & SiO2 직접 접합) 전 보이드(Void) 발생을 방지하기 위한 초친수성 표면 세정",
        contaminationScore: 85,
        contaminationBand: "high",
        contaminants: [
          {
            name: "Sub-micron bonding particles (본딩 방해 파티클)",
            category: "particle",
            description: "0.03μm 이상 보이드 유발 입자",
          },
          {
            name: "Organic carbon film (유기 탄소 피막)",
            category: "organic",
            description: "표면 에너지 저하 유기물",
          },
          {
            name: "Ionic contamination (이온성 불순물)",
            category: "chemical",
            description: "접합면 누설전류 유발 이온",
          },
        ],
        qualityMetric: {
          name: "표면 유기 탄소 잔류량 (Surface Organic Carbon)",
          unit: "ng/cm²",
          allowableLimit: 0.05,
          description: "문헌[Ref-S-PKG-1] 기반 하이브리드 직접 본딩 신뢰성 기준 (≤ 0.05 ng/cm²)",
        },
        initialContamination: 1.8,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 1.4,
            rinseTimeMin: 1.8,
            flowRateLpm: 2.4,
            spinRpm: 1350,
            rinseCycles: 2,
          },
          "300mm": {
            cleaningTimeMin: 1.8,
            rinseTimeMin: 2.4,
            flowRateLpm: 3.8,
            spinRpm: 1550,
            rinseCycles: 2,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 0.005,
            K: 1.48,
            alpha: 0.86,
            beta: 0.75,
            gamma: 0.7,
            Q_ref: 2.2,
            RPM_ref: 1350,
          },
          "300mm": {
            R_floor: 0.005,
            K: 1.42,
            alpha: 0.88,
            beta: 0.78,
            gamma: 0.72,
            Q_ref: 3.5,
            RPM_ref: 1550,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 40,
            bathChanges: 2,
            processTimeMin: 9.0,
            rinseTimeMin: 5.0,
            rinseFlowRateLpm: 22.0,
            rinseCycles: 2,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 55,
            bathChanges: 2,
            processTimeMin: 10.0,
            rinseTimeMin: 6.0,
            rinseFlowRateLpm: 30.0,
            rinseCycles: 2,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 0.005,
            K_batch: 0.62,
            bathVolumeRefPerWafer: 0.8,
            rinseFlowRefLpm: 22.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
          "300mm": {
            R_floor: 0.005,
            K_batch: 0.58,
            bathVolumeRefPerWafer: 2.2,
            rinseFlowRefLpm: 30.0,
            alpha_bath: 0.8,
            alpha_rinse: 0.85,
            beta_cycle: 0.75,
          },
        },
        references: [LITERATURE_REFERENCES.S_PKG_1],
        literatureVariables: ["Megasonic Power", "UPW Flow Rate (Q)", "Rinse Time (t)"],
      },
      {
        id: "surface-rinse",
        name: "Surface Rinse (표면 린스)",
        nameEn: "Substrate Sawing & Final UPW Rinse",
        description:
          "웨이퍼 절단(Dicing/Sawing) 후 기판 표면의 미세 잔여물 배출을 위한 고압 초순수 린스",
        contaminationScore: 60,
        contaminationBand: "medium",
        contaminants: [
          {
            name: "Dicing silicon slurry (다이싱 실리콘 찌꺼기)",
            category: "particle",
            description: "블레이드 톱질 부산물",
          },
          {
            name: "Surfactant wetting residue (습윤제 잔여물)",
            category: "chemical",
            description: "다이싱 냉각수 첨가제",
          },
        ],
        qualityMetric: {
          name: "표면 잔류 파티클 결함수 (Particle Defect Count)",
          unit: "defects/wafer",
          allowableLimit: 20.0,
          description: "문헌[Ref-S-PKG-1] 기반 패키징 소잉 린스 결함 허용 기준 (≤ 20 ea/wafer)",
        },
        initialContamination: 150.0,
        singleRecipes: {
          "200mm": {
            cleaningTimeMin: 0.8,
            rinseTimeMin: 1.2,
            flowRateLpm: 2.0,
            spinRpm: 1400,
            rinseCycles: 1,
          },
          "300mm": {
            cleaningTimeMin: 1.0,
            rinseTimeMin: 1.5,
            flowRateLpm: 3.0,
            spinRpm: 1600,
            rinseCycles: 1,
          },
        },
        singleModelParams: {
          "200mm": {
            R_floor: 3.0,
            K: 1.55,
            alpha: 0.82,
            beta: 0.7,
            gamma: 0.68,
            Q_ref: 2.0,
            RPM_ref: 1400,
          },
          "300mm": {
            R_floor: 3.0,
            K: 1.5,
            alpha: 0.85,
            beta: 0.72,
            gamma: 0.7,
            Q_ref: 3.0,
            RPM_ref: 1600,
          },
        },
        batchRecipes: {
          "200mm": {
            batchSize: 50,
            bathVolumeL: 35,
            bathChanges: 1,
            processTimeMin: 6.0,
            rinseTimeMin: 4.0,
            rinseFlowRateLpm: 18.0,
            rinseCycles: 1,
          },
          "300mm": {
            batchSize: 25,
            bathVolumeL: 48,
            bathChanges: 1,
            processTimeMin: 7.0,
            rinseTimeMin: 4.5,
            rinseFlowRateLpm: 25.0,
            rinseCycles: 1,
          },
        },
        batchModelParams: {
          "200mm": {
            R_floor: 3.0,
            K_batch: 0.68,
            bathVolumeRefPerWafer: 0.7,
            rinseFlowRefLpm: 18.0,
            alpha_bath: 0.76,
            alpha_rinse: 0.8,
            beta_cycle: 0.7,
          },
          "300mm": {
            R_floor: 3.0,
            K_batch: 0.65,
            bathVolumeRefPerWafer: 1.92,
            rinseFlowRefLpm: 25.0,
            alpha_bath: 0.78,
            alpha_rinse: 0.82,
            beta_cycle: 0.72,
          },
        },
        references: [LITERATURE_REFERENCES.S_PKG_1],
        literatureVariables: ["DIW Jet Pressure", "Rinse Time (t)", "UPW Flow Rate (Q)"],
      },
    ],
  },
];

/* ============================================================
 * 공통 대표 오염물(Cu) 기반 MVP 오염도 모델
 *
 * MVP에서는 공정 간 비교와 시뮬레이션 로직을 단순화하기 위해
 * Cu surface contamination [atoms/cm²]을 공통 대표 오염물로 채택한다.
 * (실제 산업에서는 공정에 따라 particle/organic/etch residue 등
 *  다양한 오염물이 존재하며, 향후 공정별 오염물 모델로 확장 가능)
 * ============================================================ */

/** 공통 대표 오염물 정보 */
export const COMMON_CONTAMINANTS: ContaminantInfo[] = [
  {
    name: "Cu surface contamination",
    category: "metal",
    description:
      "MVP 공통 대표 오염물. 공정 간 비교를 단순화하기 위해 Cu 표면 오염을 대표 지표로 사용합니다.",
  },
];

/** 공통 MVP 품질 지표 — 모든 활성 공정에 동일 적용되는 simulation quality gate */
export const COMMON_CU_QUALITY_METRIC: QualityMetricInfo = {
  name: "Cu surface contamination",
  unit: "atoms/cm²",
  allowableLimit: 1.0e10,
  description:
    "Cu ≤ 1.0 × 10¹⁰ atoms/cm²는 PureFlow AI MVP의 공통 simulation quality gate이며, 모든 반도체 공정에 적용되는 공식 산업 규격이 아닙니다.",
};

/**
 * 공정별 초기 Cu 오염 프로파일.
 * 문헌값이 확인된 공정은 literature, 그 외에는 mvp_simulation으로 명확히 구분한다.
 */
export const CONTAMINATION_PROFILES: Record<ProcessCategoryId, ProcessContaminationProfile> = {
  "wafer-mfg": {
    processId: "wafer-mfg",
    processName: "웨이퍼 제조 공정",
    contaminant: "Cu",
    initialCuAtomsCm2: 8.0e9,
    sourceType: "mvp_simulation",
    literatureReferences: [],
  },
  oxidation: {
    processId: "oxidation",
    processName: "산화 공정",
    contaminant: "Cu",
    initialCuAtomsCm2: 1.0e10,
    sourceType: "mvp_simulation",
    literatureReferences: [],
  },
  photo: {
    processId: "photo",
    processName: "포토 공정",
    contaminant: "Cu",
    initialCuAtomsCm2: 1.2e10,
    sourceType: "mvp_simulation",
    literatureReferences: [],
  },
  etching: {
    processId: "etching",
    processName: "식각 공정",
    contaminant: "Cu",
    initialCuAtomsCm2: 1.8e10,
    sourceType: "literature",
    literatureReferences: ["Tsang C.F. et al. (2005)", "Tsutano K. et al. (2025)"],
  },
  deposition: {
    processId: "deposition",
    processName: "증착·이온주입 공정",
    contaminant: "Cu",
    initialCuAtomsCm2: 1.5e10,
    sourceType: "mvp_simulation",
    literatureReferences: [],
  },
  metal: {
    processId: "metal",
    processName: "금속배선 공정",
    contaminant: "Cu",
    initialCuAtomsCm2: 2.0e10,
    sourceType: "mvp_simulation",
    literatureReferences: [],
  },
  eds: {
    processId: "eds",
    processName: "EDS 공정",
    contaminant: "Cu",
    initialCuAtomsCm2: 0,
    sourceType: "mvp_simulation",
    literatureReferences: [],
  },
  packaging: {
    processId: "packaging",
    processName: "패키징 공정",
    contaminant: "Cu",
    initialCuAtomsCm2: 1.3e10,
    sourceType: "mvp_simulation",
    literatureReferences: [],
  },
};

/** 활성 공정(EDS 제외)의 초기 Cu 최소/최대값 — 오염도 정규화 기준 */
const ACTIVE_CU_VALUES = Object.values(CONTAMINATION_PROFILES)
  .filter((p) => p.processId !== "eds")
  .map((p) => p.initialCuAtomsCm2);
const GLOBAL_MIN_CU = Math.min(...ACTIVE_CU_VALUES);
const GLOBAL_MAX_CU = Math.max(...ACTIVE_CU_VALUES);

/**
 * 공정별 초기 Cu 오염값을 0~100으로 정규화한 MVP simulation score.
 * 실제 Cu 농도의 단위가 아니라 공정 간 상대적인 초기 오염 수준 표시용이다.
 * 품질 판정에는 사용하지 않는다 (품질은 predictedCu ≤ allowableCu로 판정).
 */
export function getNormalizedContaminationScore(initialCu: number): number {
  if (GLOBAL_MAX_CU === GLOBAL_MIN_CU) return 0;
  return Math.max(
    0,
    Math.min(100, (100 * (initialCu - GLOBAL_MIN_CU)) / (GLOBAL_MAX_CU - GLOBAL_MIN_CU)),
  );
}

/** 정규화 점수 → 오염 밴드 (MVP 시각화 구간) */
export function contaminationBandFor(score: number): ContaminationBand {
  if (score >= 90) return "very_high";
  if (score >= 61) return "high";
  if (score >= 31) return "medium";
  return "low";
}

/**
 * Scales single wafer recipe and model parameters based on diameter in mm
 * Reference anchors: 200mm (203.2 mm) and 300mm (304.8 mm)
 */
function interpolateSingleWaferConfig(
  step: CleaningStepDefinition,
  diameterMm: number,
): { recipe: SingleWaferRecipe; params: SingleWaferModelParameters } {
  const r200 = step.singleRecipes["200mm"];
  const r300 = step.singleRecipes["300mm"];
  const p300 = step.singleModelParams["300mm"];

  // Normalized interpolation factor (203.2mm -> 0, 304.8mm -> 1)
  const normFactor = (diameterMm - 203.2) / (304.8 - 203.2);

  const flowRateLpm = Number(
    Math.max(
      0.8,
      Math.min(4.5, r200.flowRateLpm + (r300.flowRateLpm - r200.flowRateLpm) * normFactor),
    ).toFixed(1),
  );

  const cleaningTimeMin = Number(
    Math.max(
      0.4,
      r200.cleaningTimeMin + (r300.cleaningTimeMin - r200.cleaningTimeMin) * normFactor,
    ).toFixed(1),
  );

  const rinseTimeMin = Number(
    Math.max(0.5, r200.rinseTimeMin + (r300.rinseTimeMin - r200.rinseTimeMin) * normFactor).toFixed(
      1,
    ),
  );

  const spinRpm =
    Math.round(Math.max(800, r200.spinRpm + (r300.spinRpm - r200.spinRpm) * normFactor) / 50) * 50;

  const recipe: SingleWaferRecipe = {
    cleaningTimeMin,
    rinseTimeMin,
    flowRateLpm,
    spinRpm,
    rinseCycles: r300.rinseCycles,
  };

  const params: SingleWaferModelParameters = {
    R_floor: p300.R_floor,
    K: p300.K,
    alpha: p300.alpha,
    beta: p300.beta,
    gamma: p300.gamma,
    Q_ref: flowRateLpm,
    RPM_ref: spinRpm,
  };

  return { recipe, params };
}

/**
 * Scales batch recipe and model parameters based on diameter in mm and user batch size
 */
function interpolateBatchConfig(
  step: CleaningStepDefinition,
  diameterMm: number,
  batchSize: number,
): { recipe: BatchRecipe; params: BatchModelParameters } {
  const r200 = step.batchRecipes["200mm"];
  const r300 = step.batchRecipes["300mm"];
  const p300 = step.batchModelParams["300mm"];

  const normFactor = (diameterMm - 203.2) / (304.8 - 203.2);

  // Surface area scaling factor relative to 200mm
  const areaRatio = Math.pow(diameterMm / 203.2, 1.4);
  const safeCalcSize =
    typeof batchSize === "number" && Number.isFinite(batchSize) && batchSize > 0 ? batchSize : 50;
  const sizeRatio = Math.pow(safeCalcSize / 50, 0.75);

  const baseBathVol = r200.bathVolumeL * areaRatio * sizeRatio;
  const bathVolumeL = Math.max(10, Math.round(baseBathVol));

  const rinseFlowRateLpm = Number(
    Math.max(
      8.0,
      Math.min(
        40.0,
        r200.rinseFlowRateLpm + (r300.rinseFlowRateLpm - r200.rinseFlowRateLpm) * normFactor,
      ),
    ).toFixed(1),
  );

  const processTimeMin = Number(
    Math.max(
      3.0,
      r200.processTimeMin + (r300.processTimeMin - r200.processTimeMin) * normFactor,
    ).toFixed(1),
  );

  const rinseTimeMin = Number(
    Math.max(2.0, r200.rinseTimeMin + (r300.rinseTimeMin - r200.rinseTimeMin) * normFactor).toFixed(
      1,
    ),
  );

  const recipe: BatchRecipe = {
    batchSize,
    bathVolumeL,
    bathChanges: r300.bathChanges,
    processTimeMin,
    rinseTimeMin,
    rinseFlowRateLpm,
    rinseCycles: r300.rinseCycles,
  };

  const params: BatchModelParameters = {
    R_floor: p300.R_floor,
    K_batch: p300.K_batch,
    bathVolumeRefPerWafer: Number((bathVolumeL / safeCalcSize).toFixed(2)),
    rinseFlowRefLpm: rinseFlowRateLpm,
    alpha_bath: p300.alpha_bath,
    alpha_rinse: p300.alpha_rinse,
    beta_cycle: p300.beta_cycle,
  };

  return { recipe, params };
}

/**
 * Creates an instantiated ProcessDefinition for a specific (Category, Step, Mode, WaferConfig, BatchSize)
 */
export function createProcessDefinition(
  category: ProcessCategory,
  step: CleaningStepDefinition | null,
  cleaningMode: CleaningMode,
  wafer: WaferConfig,
  userBatchSize?: number,
): ProcessDefinition {
  if (!category.optimizationEnabled || !step) {
    return {
      id: `${category.id}-non-opt`,
      categoryId: category.id,
      stepId: "none",
      stepNumber: category.stepNumber,
      categoryName: category.name,
      categoryNameEn: category.nameEn,
      cleaningStepName: "전기적 특성 검사 (Non-Wet Inspection)",
      cleaningStepSubName: "UPW 최적화 대상 제외",
      description:
        category.nonOptimizationReason || "비세정 공정으로 초순수 최적화 대상에서 제외됩니다.",
      sequence: category.sequence,
      optimizationEnabled: false,
      nonOptimizationReason: category.nonOptimizationReason,
      cleaningMode,
      wafer,
      batchSize: undefined,
      batchCapacity: 100,
      contaminants: [],
      qualityMetric: {
        name: "검사 공정 (해당 없음)",
        unit: "-",
        allowableLimit: 0,
        description: "EDS는 전기적 특성 검사이므로 화학적 잔류 오염 기준이 적용되지 않습니다.",
      },
      contaminationScore: 0,
      contaminationBand: "low",
      initialContamination: 0,
      contaminationSourceType: "mvp_simulation",
      contaminationReferences: [],
      references: [],
      literatureVariables: [],
    };
  }

  const appliedBatchSize = cleaningMode === "batch" ? userBatchSize : undefined;

  // 공정별 공통 대표 오염물(Cu) 프로파일 → 정규화 오염도
  const profile = CONTAMINATION_PROFILES[category.id];
  const contaminationScore = Math.round(getNormalizedContaminationScore(profile.initialCuAtomsCm2));

  const { recipe: singleRecipe, params: singleModelParams } = interpolateSingleWaferConfig(
    step,
    wafer.diameterMm,
  );

  const { recipe: batchRecipe, params: batchModelParams } = interpolateBatchConfig(
    step,
    wafer.diameterMm,
    appliedBatchSize ?? 50,
  );

  // 공통 대표 오염물(Cu) 스케일로 R_floor 재보정 (MVP calibration).
  // 기존 스텝별 R_floor는 공정마다 단위가 달라 공통 Cu 게이트와 호환되지 않으므로,
  // 초기 Cu 값의 5%로 통일한다. 세정 동역학(K/α/β/γ)은 스텝 원본값을 유지한다.
  const cuFloor = profile.initialCuAtomsCm2 * 0.05;
  singleModelParams.R_floor = cuFloor;
  batchModelParams.R_floor = cuFloor;

  return {
    id: `${category.id}-${step.id}-${cleaningMode}-${wafer.diameterInch}in-${wafer.waferType}${appliedBatchSize !== undefined ? `-${appliedBatchSize}w` : ""}`,
    categoryId: category.id,
    stepId: step.id,
    stepNumber: category.stepNumber,
    categoryName: category.name,
    categoryNameEn: category.nameEn,
    cleaningStepName: step.name,
    cleaningStepSubName: step.nameEn,
    description: step.description,
    sequence: category.sequence,
    optimizationEnabled: true,
    cleaningMode,
    wafer,
    batchSize: appliedBatchSize,
    batchCapacity: step.batchCapacity || category.batchCapacity || 100,
    // 공통 대표 오염물(Cu) 기반 값으로 오버라이드 — 공정별 초기 Cu → 0~100 정규화
    contaminants: COMMON_CONTAMINANTS,
    qualityMetric: COMMON_CU_QUALITY_METRIC,
    contaminationScore: contaminationScore,
    contaminationBand: contaminationBandFor(contaminationScore),
    initialContamination: profile.initialCuAtomsCm2,
    contaminationSourceType: profile.sourceType,
    contaminationReferences: profile.literatureReferences,
    singleRecipe: cleaningMode === "single" ? singleRecipe : undefined,
    singleModelParams: cleaningMode === "single" ? singleModelParams : undefined,
    batchRecipe: cleaningMode === "batch" ? batchRecipe : undefined,
    batchModelParams: cleaningMode === "batch" ? batchModelParams : undefined,
    references: step.references,
    literatureVariables: step.literatureVariables,
  };
}

/**
 * Builds the default 8-step simulation dataset (1 step per category)
 * If selectedStepId is specified for the active category, it uses that step.
 */
export function buildProcessPipeline(
  cleaningMode: CleaningMode,
  wafer: WaferConfig,
  customSteps?: Record<ProcessCategoryId, string>,
  batchSize?: number,
): ProcessDefinition[] {
  return PROCESS_CATEGORIES.map((cat) => {
    if (!cat.optimizationEnabled || cat.cleaningSteps.length === 0) {
      return createProcessDefinition(cat, null, cleaningMode, wafer, batchSize);
    }
    const chosenStepId = customSteps?.[cat.id];
    const step = chosenStepId
      ? cat.cleaningSteps.find((s) => s.id === chosenStepId) || cat.cleaningSteps[0]
      : cat.cleaningSteps[0];
    return createProcessDefinition(cat, step, cleaningMode, wafer, batchSize);
  });
}
