/**
 * PureFlow AI Unified Batch Size Validation Utility
 *
 * MVP Constraint:
 * 1 <= batchSize <= 100 (Integers only)
 *
 * Allowed:
 * 1 ~ 100
 *
 * Blocked:
 * 0, negative numbers, >= 101, floats/decimals, empty values, NaN, Infinity, strings/non-numbers
 */

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
export function validateBatchSize(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  // Handle string input (e.g. from UI input fields)
  if (typeof value === "string") {
    const trimmed = value.trim();
    // Guard against Number("") converting to 0
    if (trimmed === "") {
      return false;
    }
    // Must be positive integer digits only (rejects "10.5", "-1", "1e2", "abc", etc.)
    if (!/^\d+$/.test(trimmed)) {
      return false;
    }
    const parsed = Number(trimmed);
    return (
      typeof parsed === "number" &&
      !Number.isNaN(parsed) &&
      Number.isFinite(parsed) &&
      Number.isInteger(parsed) &&
      parsed >= 1 &&
      parsed <= 100
    );
  }

  // Handle number input
  if (typeof value === "number") {
    return (
      !Number.isNaN(value) &&
      Number.isFinite(value) &&
      Number.isInteger(value) &&
      value >= 1 &&
      value <= 100
    );
  }

  return false;
}

/**
 * Helper to get user-friendly error message for invalid batch sizes
 */
export function getBatchSizeErrorMessage(value: unknown): string | null {
  if (value === null || value === undefined) {
    return "1회 처리 웨이퍼 수를 입력해주세요 (1 ~ 100매).";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return "1회 처리 웨이퍼 수를 입력해주세요 (1 ~ 100매).";
    }
    if (trimmed.includes(".")) {
      return "웨이퍼 수량은 소수점 없는 정수만 입력 가능합니다.";
    }
    if (trimmed.startsWith("-") || Number(trimmed) < 0) {
      return "배치 크기는 음수가 될 수 없습니다. (1 ~ 100매)";
    }
    if (!/^\d+$/.test(trimmed)) {
      return "유효한 정수 숫자를 입력해주세요 (1 ~ 100매).";
    }
    const num = Number(trimmed);
    if (num === 0) {
      return "배치 크기는 0이 될 수 없습니다. (최소 1매 이상)";
    }
    if (num < 1) {
      return "배치 크기는 최소 1매 이상이어야 합니다.";
    }
    if (num > 100) {
      return "배치 크기는 최대 100매 이하이어야 합니다. (100매 초과 불가)";
    }
  }

  if (typeof value === "number") {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      return "유효한 숫자를 입력해주세요.";
    }
    if (!Number.isInteger(value)) {
      return "웨이퍼 수량은 소수점 없는 정수만 허용됩니다.";
    }
    if (value === 0) {
      return "배치 크기는 0이 될 수 없습니다. (최소 1매 이상)";
    }
    if (value < 1) {
      return "배치 크기는 최소 1매 이상이어야 합니다.";
    }
    if (value > 100) {
      return "배치 크기는 최대 100매 이하이어야 합니다. (100매 초과 불가)";
    }
  }

  if (!validateBatchSize(value)) {
    return "1회 처리 웨이퍼 수는 1 ~ 100 사이의 정수여야 합니다.";
  }

  return null;
}
