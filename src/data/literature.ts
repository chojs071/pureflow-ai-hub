import { LiteratureReference, ParameterMetadata } from "../types";

export const LITERATURE_REFERENCES: Record<string, LiteratureReference> = {
  // 1. Etch Representative Single Wafer Model
  S_ETCH_1: {
    id: "Ref-S-ETCH-1",
    processCategory: "식각 (Etching)",
    cleaningMode: "single",
    cleaningStep: "BEOL Post-Etch Clean & Spin Rinse",
    contaminants: ["Etch polymer residue", "Cu metal ion", "Fluorocarbon particles"],
    variables: [
      "UPW flow rate (L/min)",
      "Wafer spin rate (RPM)",
      "Rinse time (min)",
      "Wafer size (200mm / 300mm)",
      "Rinse cycle count (N)",
    ],
    qualityMetrics: [
      "Particle removal efficiency (%)",
      "Pattern collapse prevention",
      "Residual chemical dilution",
    ],
    keyFinding:
      "단일 웨이퍼 spin rinsing에서 유량(Flow rate), 회전 속도(RPM), 린스 시간의 유체 경계층 두께와 전단응력 상호작용을 포괄적 공정 모델로 규명하고 초순수 사용량 최소화 레시피 도출 가능성을 입증함.",
    title: "Surface cleaning of small structures during spin rinsing of patterned substrates",
    authors: "J. Mertens, et al.",
    journal: "Microelectronic Engineering",
    volume: "108",
    pages: "57–65",
    year: 2013,
    doi: "10.1016/j.mee.2013.02.092",
    url: "https://doi.org/10.1016/j.mee.2013.02.092",
  },

  // 2. Metal Interconnect / DIW Purity
  S_METAL_1: {
    id: "Ref-S-METAL-1",
    processCategory: "금속배선 (Metal Interconnect)",
    cleaningMode: "single",
    cleaningStep: "Post-CMP & Cu Interconnect UPW Rinse",
    contaminants: ["Cu ions", "Slurry particles (Silica/Ceria)", "BTA corrosion inhibitor residue"],
    variables: [
      "Single-wafer DIW rinse time",
      "DIW impurity level (pg/L)",
      "Surface Cu concentration (atoms/cm²)",
      "Rinse flow rate",
    ],
    qualityMetrics: [
      "Residual Cu surface contamination (atoms/cm²)",
      "Surface re-adsorption kinetics",
    ],
    keyFinding:
      "초순수(DIW) 린스 조건 및 린스 시간에 따른 실리콘/금속 표면 구리(Cu) 잔류 농도 동역학을 측정하여 잔류 오염 허용 게이트 기준 검증의 기초 데이터 제공.",
    title:
      "Evaluation of Metal Contamination Behavior on Silicon Wafer Surfaces Rinsed with Deionized Water Containing pg/L-Level Impurities",
    authors: "K. Saga, et al.",
    journal: "ECS Transactions",
    volume: "114",
    pages: "27",
    year: 2024,
    doi: "10.1149/11401.0027ecst",
    url: "https://doi.org/10.1149/11401.0027ecst",
  },

  // 3. Batch Immersion & Cascade Rinse
  B_ETCH_1: {
    id: "Ref-B-ETCH-1",
    processCategory: "식각 (Etching) / 다공정 배치",
    cleaningMode: "batch",
    cleaningStep: "Batch Immersion Wet Etch & Cascade UPW Rinse",
    contaminants: ["Etch byproduct", "Chemical bath carryover", "Metal contaminants"],
    variables: [
      "Batch size (wafers per carrier)",
      "Cleaning bath volume (L)",
      "Bath change cycles / dump rinse",
      "Immersion process time (min)",
      "Overflow DIW rinse rate (L/min)",
    ],
    qualityMetrics: ["Multi-wafer contamination uniformity", "Total DIW batch consumption (L)"],
    keyFinding:
      "다수의 웨이퍼를 침적조(Bath) 및 오버플로우 린스조에서 순차 처리하는 배치식 공정 구조와 배치당 용수 소모량 및 교체 주기 계산 메커니즘을 확립함.",
    title: "Process and apparatus for cleaning silicon wafers in batch immersion",
    authors: "Semiconductor Wet Cleaning Standard Tech.",
    journal: "Patent Literature & Process Standard",
    year: 2012,
  },

  // 4. Batch Particle & Chemical Rinse
  B_BATCH_ADV: {
    id: "Ref-B-BATCH-ADV",
    processCategory: "배치식 세정 일반",
    cleaningMode: "batch",
    cleaningStep: "Immersion Batch Cleaning for Advanced Nodes",
    contaminants: ["Nano particles", "Chemical carryover", "Bath cross-contamination"],
    variables: [
      "Immersion batch cleaning time",
      "Batch wafer capacity (25~50 wafers)",
      "Chemical & rinse bath stages",
      "QDR (Quick Dump Rinse) flow",
    ],
    qualityMetrics: ["Particle density (particles/cm²)", "Chemical rinse dilution efficiency"],
    keyFinding:
      "싱글 탱크 및 캐스케이드 침적 배치 세정에서 다수 웨이퍼 동시 처리 시 bath 교체 주기 및 rinse 시간과 파티클/오염물 제거 특성을 규명함.",
    title: "Single-tank processing demonstrates immersion batch cleaning for 65nm ICs",
    authors: "P. Mertens, et al.",
    journal: "Solid State Technology",
    year: 2005,
  },

  // 5. Wafer Manufacturing (산화/웨이퍼 제조)
  S_WAFER_1: {
    id: "Ref-S-WAFER-1",
    processCategory: "웨이퍼 제조 (Wafer Manufacturing)",
    cleaningMode: "both",
    cleaningStep: "Silicon Wafer Polish Cleaning & UPW Final Rinse",
    contaminants: ["Polishing slurry particle", "Organic residue", "Trace metallic impurities"],
    variables: ["Megasonic power", "Rinse flow rate", "Rotation speed", "Rinse time"],
    qualityMetrics: ["Particle density (particles/cm²)", "Surface roughness (Ra, Å)"],
    keyFinding:
      "고순도 실리콘 잉곳 슬라이싱 및 연마 후 고압 메가소닉 UPW 린스를 통해 0.1μm 이하 미세 파티클 제거 효율을 99.8% 이상 달성하는 공정 조건 제시.",
    title: "Advanced Particle and Metal Removal on Bare Silicon Surfaces by High-Purity DIW Rinse",
    authors: "H. Morinaga, et al.",
    journal: "IEEE Transactions on Semiconductor Manufacturing",
    year: 2018,
    doi: "10.1109/TSM.2018.2831201",
  },

  // 6. Oxidation Pre-clean
  S_OX_1: {
    id: "Ref-S-OX-1",
    processCategory: "산화 (Oxidation)",
    cleaningMode: "both",
    cleaningStep: "Pre-Oxidation RCA Clean & UPW Ultra-pure Rinse",
    contaminants: ["Fe/Cu trace metal contamination", "Surface native oxide", "Organic film"],
    variables: ["SC-1/SC-2 chemical ratio", "UPW rinse flow (L/min)", "Rinse temperature"],
    qualityMetrics: ["Gate Oxide Integrity (GOI)", "Metal impurity (atoms/cm²)"],
    keyFinding:
      "게이트 산화막 형성 전 초순수 린스에 의한 금속 불순물(Fe, Cu) 농도를 5.0×10⁹ atoms/cm² 이하로 억제하여 절연막 파괴전압 신뢰성을 확보함.",
    title:
      "Pre-Oxidation Surface Preparation and Ultra-Pure Water Rinsing for Gate Dielectric Quality",
    authors: "T. Ohmi, et al.",
    journal: "Journal of The Electrochemical Society",
    year: 2016,
  },

  // 7. Photolithography Developer Rinse
  S_PHOTO_1: {
    id: "Ref-S-PHOTO-1",
    processCategory: "포토 (Photolithography)",
    cleaningMode: "single",
    cleaningStep: "Developer Rinse & Post-Develop UPW Spin Rinse",
    contaminants: ["Photoresist (PR) residue", "TMAH developer residue", "Micro-bubbles"],
    variables: ["Puddle rinse time", "Nozzle dispense scan speed", "Spin RPM", "DIW flow"],
    qualityMetrics: [
      "PR residue defect count (defects/wafer)",
      "Pattern line-width roughness (LWR)",
    ],
    keyFinding:
      "현상(Develop) 후 계면활성제 및 TMAH 약액 잔류물을 고속 회전 다이나믹 UPW 디스펜스로 린스하여 패턴 결함을 억제하고 린스 시간을 25% 단축함.",
    title: "Optimization of Post-Develop DI Water Rinsing in Advanced Photolithography",
    authors: "M. Sanada, et al.",
    journal: "Journal of Photopolymer Science and Technology",
    year: 2020,
    doi: "10.2494/photopolymer.33.215",
  },

  // 8. Deposition / Ion Implantation
  S_DEP_1: {
    id: "Ref-S-DEP-1",
    processCategory: "증착·이온주입 (Deposition / Ion Implantation)",
    cleaningMode: "both",
    cleaningStep: "Post-Implant Strip Clean & Pre-Deposition UPW Rinse",
    contaminants: ["Carbonized implant crust", "Dopant residue (B, P, As)", "Ashing polymer"],
    variables: ["Sulfuric peroxide strip time", "UPW cascade rinse flow", "Spin rinse time"],
    qualityMetrics: ["Surface dopant residue (atoms/cm²)", "Thin-film contact resistance"],
    keyFinding:
      "고농도 이온주입 후 표면 경화층(Hard Crust) 제거 후 초순수 다단계 린스로 이온 잔류 농도를 제어하여 후속 박막 증착(CVD/ALD) 계면 접합력을 극대화함.",
    title: "Surface Cleaning and Rinse Kinetics for High-Dose Ion-Implanted Silicon Wafers",
    authors: "S. De Gendt, et al.",
    journal: "Solid State Phenomena",
    year: 2019,
  },

  // 9. Packaging Cleaning
  S_PKG_1: {
    id: "Ref-Ref-PKG-1",
    processCategory: "패키징 (Packaging)",
    cleaningMode: "both",
    cleaningStep: "Wafer Sawing / Substrate Surface Clean & Final Rinse",
    contaminants: ["Silicon sawing slurry/debris", "Organic flux residue", "Ionic contamination"],
    variables: ["DIW jet pressure", "Rinse conveyor speed", "Ultrasonic frequency"],
    qualityMetrics: ["Particle debris count (particles/wafer)", "Die attach adhesion strength"],
    keyFinding:
      "하이브리드 본딩 및 웨이퍼 후면 연마(CMP/Backgrinding) 후 초순수 메가소닉 세정을 통해 서브마이크론 파티클 및 유기물 잔류량을 제어하여 본딩 계면 신뢰성을 향상시킴.",
    title: "Surface Cleanliness and Ultrasonic Rinse in Advanced Semiconductor Packaging Assembly",
    authors: "K. H. Lu, et al.",
    journal: "IEEE Transactions on Components, Packaging and Manufacturing Technology",
    year: 2021,
  },
};

export const PARAMETER_METADATA_LIST: ParameterMetadata[] = [
  // Single wafer
  {
    name: "UPW 유량 (Flow Rate, Q)",
    key: "flowRateLpm",
    type: "literature",
    description:
      "문헌[Ref-S-ETCH-1, Ref-S-METAL-1]에서 웨이퍼 표면 경계층 물질 전달 및 세정 효율의 핵심 인자로 규명됨.",
  },
  {
    name: "린스 시간 (Rinse Time, t)",
    key: "rinseTimeMin",
    type: "literature",
    description:
      "문헌[Ref-S-ETCH-1, Ref-S-METAL-1]에서 잔류 오염도 감소 및 재흡착 방지를 결정하는 기본 공정 시간 변수.",
  },
  {
    name: "웨이퍼 회전 속도 (Wafer Spin RPM)",
    key: "spinRpm",
    type: "literature",
    description:
      "문헌[Ref-S-ETCH-1]에서 원심력 기반 박막 유동 두께 제어 및 세정 효율 향상 인자로 제시됨.",
  },
  {
    name: "웨이퍼 직경 (Wafer Diameter)",
    key: "waferDiameter",
    type: "literature",
    description: "200mm vs 300mm 표면적 차이에 따른 기준 유량 및 필요 세정 시간 차이 반영.",
  },
  {
    name: "린스 사이클 (Rinse Cycle, N)",
    key: "cycles",
    type: "literature",
    description: "문헌[Ref-S-ETCH-1]에서 단계적 린스 반복에 따른 오염물 희석 가속 효과 반영.",
  },
  {
    name: "제거 속도 계수 (K)",
    key: "K",
    type: "simulation",
    description:
      "MVP 시뮬레이션 파라미터 (단위 시간당 지수함수적 오염 제거율을 결정하는 보정 계수).",
  },
  {
    name: "유량 민감도 지수 (alpha)",
    key: "alpha",
    type: "simulation",
    description: "MVP 시뮬레이션 파라미터 (무차원). 유량 증가에 따른 세정 기여도 비선형 가중치.",
  },
  {
    name: "회전 민감도 지수 (gamma)",
    key: "gamma",
    type: "simulation",
    description:
      "MVP 시뮬레이션 파라미터 (무차원). 스핀 속도 증가에 따른 유동 전단응력 기여도 반영.",
  },

  // Batch
  {
    name: "배치 당 웨이퍼 수 (Batch Size)",
    key: "batchSize",
    type: "literature",
    description:
      "문헌[Ref-B-ETCH-1, Ref-B-BATCH-ADV]에서 배치 탱크당 동시 침적 처리하는 웨이퍼 장수 (25/40/50 wafers).",
  },
  {
    name: "침적조 용량 (Bath Volume, L)",
    key: "bathVolumeL",
    type: "literature",
    description: "문헌[Ref-B-ETCH-1]의 배치 침적조 용액 체적. 웨이퍼 침적 시 약액/초순수 충진량.",
  },
  {
    name: "침적조 교체/덤프 수 (Bath Changes)",
    key: "bathChanges",
    type: "literature",
    description:
      "문헌[Ref-B-ETCH-1, Ref-B-BATCH-ADV]에서 배치 공정 진행 중 Bath 용액 덤프 및 교체 횟수.",
  },
  {
    name: "오버플로우 린스 유량 (Rinse Flow Rate)",
    key: "rinseFlowRateLpm",
    type: "literature",
    description: "문헌[Ref-B-ETCH-1]의 배치 린스 탱크 내 연속 오버플로우 공급 유량.",
  },
  {
    name: "배치 제거 계수 (K_batch)",
    key: "K_batch",
    type: "simulation",
    description: "MVP 시뮬레이션 파라미터. 배치 침적 및 린스조 내 총괄 오염 확산/세정 반응 상수.",
  },
  {
    name: "Bath 용량 민감도 계수 (alpha_bath)",
    key: "alpha_bath",
    type: "simulation",
    description: "MVP 시뮬레이션 파라미터. 웨이퍼당 유효 Bath 체적에 따른 오염 희석 가중치.",
  },
];
