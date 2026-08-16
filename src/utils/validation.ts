/**
 * PureFlow AI Unified Validation Utilities & Simulation Ranges
 *
 * MVP Simulation Range Definitions & Numeric Validation Guards
 */

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export type BatchValidationResult = ValidationResult;

/**
 * MVP Simulation Ranges (Single Wafer & Batch)
 * Clearly designated as MVP Simulation Ranges (not manufacturer OEM standard specifications)
 */
export const MVP_SIMULATION_RANGES = {
  single: {
    temperatureC: { min: 10, max: 60, unit: "℃", label: "세정수 온도" },
    flowRateLpm: { min: 1, max: 20, unit: "L/min", label: "UPW 유량" },
    cleaningTimeMin: { min: 1, max: 30, unit: "min", label: "세정 시간" },
    rinseTimeMin: { min: 1, max: 20, unit: "min", label: "린스 시간" },
    spinRpm: { min: 100, max: 3000, unit: "rpm", label: "회전 속도" },
    rinseCycles: { min: 1, max: 5, unit: "회", label: "린스 횟수" },
  },
  batch: {
    temperatureC: { min: 10, max: 60, unit: "℃", label: "세정수 온도" },
    batchSize: { min: 1, max: 100, unit: "wafers", label: "1회 처리 웨이퍼 수" },
    processTimeMin: { min: 1, max: 60, unit: "min", label: "공정 시간" },
    rinseTimeMin: { min: 1, max: 30, unit: "min", label: "린스 시간" },
    rinseCycles: { min: 1, max: 5, unit: "회", label: "린스 횟수" },
  },
} as const;

/**
 * Generic numeric setting validator
 */
export function validateNumericSetting(
  value: unknown,
  min: number,
  max: number,
  label = "설정값",
  unit = "",
): ValidationResult {
  if (value === null || value === undefined) {
    return {
      valid: false,
      message: `${label}을(를) 입력해주세요.`,
    };
  }

  let numValue: number;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return {
        valid: false,
        message: `${label}을(를) 입력해주세요.`,
      };
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
      return {
        valid: false,
        message: `${label}은(는) 유효한 숫자여야 합니다.`,
      };
    }
    numValue = parsed;
  } else if (typeof value === "number") {
    if (!Number.isFinite(value) || Number.isNaN(value)) {
      return {
        valid: false,
        message: `${label}은(는) 유효한 숫자여야 합니다.`,
      };
    }
    numValue = value;
  } else {
    return {
      valid: false,
      message: `${label}은(는) 유효한 숫자여야 합니다.`,
    };
  }

  if (numValue < min) {
    return {
      valid: false,
      message: `⚠ 최소값 ${min}${unit ? ` ${unit}` : ""} 이상이어야 합니다.`,
    };
  }

  if (numValue > max) {
    return {
      valid: false,
      message: `⚠ 최대값 ${max}${unit ? ` ${unit}` : ""}을 초과했습니다.`,
    };
  }

  return {
    valid: true,
    message: "",
  };
}

/**
 * Unified batch size validator
 * Checks:
 * - Empty string guard (Number("") converting to 0 is explicitly blocked)
 * - typeof number
 * - Number.isInteger
 * - Number.isFinite
 * - min: 1
 * - max: 100
 */
export function validateBatchSize(value: unknown): BatchValidationResult {
  if (value === null || value === undefined) {
    return {
      valid: false,
      message: "1회 처리 웨이퍼 수를 선택해주세요.",
    };
  }

  // Handle string input (e.g. from UI input fields)
  if (typeof value === "string") {
    const trimmed = value.trim();
    // Guard against Number("") converting to 0
    if (trimmed === "") {
      return {
        valid: false,
        message: "1회 처리 웨이퍼 수를 선택해주세요.",
      };
    }
    if (trimmed.includes(".")) {
      return {
        valid: false,
        message: "배치 처리 웨이퍼 수는 정수만 입력할 수 있습니다.",
      };
    }
    if (trimmed.startsWith("-") || Number(trimmed) < 0) {
      return {
        valid: false,
        message: "⚠ 최소값 1 wafers 이상이어야 합니다.",
      };
    }
    if (!/^\d+$/.test(trimmed)) {
      return {
        valid: false,
        message: "배치 처리 웨이퍼 수는 숫자여야 합니다.",
      };
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
      return {
        valid: false,
        message: "배치 처리 웨이퍼 수는 숫자여야 합니다.",
      };
    }
    if (parsed < 1) {
      return {
        valid: false,
        message: "⚠ 최소값 1 wafers 이상이어야 합니다.",
      };
    }
    if (parsed > 100) {
      return {
        valid: false,
        message: "⚠ 최대값 100 wafers를 초과했습니다.",
      };
    }
    return {
      valid: true,
      message: "",
    };
  }

  // Handle number input
  if (typeof value !== "number" || !Number.isFinite(value) || Number.isNaN(value)) {
    return {
      valid: false,
      message: "배치 처리 웨이퍼 수는 숫자여야 합니다.",
    };
  }

  if (!Number.isInteger(value)) {
    return {
      valid: false,
      message: "배치 처리 웨이퍼 수는 정수만 입력할 수 있습니다.",
    };
  }

  if (value < 1) {
    return {
      valid: false,
      message: "⚠ 최소값 1 wafers 이상이어야 합니다.",
    };
  }

  if (value > 100) {
    return {
      valid: false,
      message: "⚠ 최대값 100 wafers를 초과했습니다.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

/**
 * Helper to get user-friendly error message or null if valid
 */
export function getBatchSizeErrorMessage(value: unknown): string | null {
  const result = validateBatchSize(value);
  return result.valid ? null : result.message;
}

/**
 * Safe Batch Size parser for inputs (guards against Number("") === 0)
 */
export function parseBatchSize(value: string): number | undefined {
  if (!value || value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return parsed;
}
