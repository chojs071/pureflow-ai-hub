import React, { useState, useEffect } from "react";
import { Users, AlertCircle, Edit3, Check } from "lucide-react";
import { validateBatchSize, getBatchSizeErrorMessage } from "../utils/validation";

export interface BatchSizeSelectorProps {
  value?: number;
  onChange: (batchSize: number | undefined) => void;
  min?: number;
  max?: number;
  presets?: number[];
  disabled?: boolean;
}

export const BatchSizeSelector: React.FC<BatchSizeSelectorProps> = ({
  value = 50,
  onChange,
  min = 1,
  max = 100,
  presets = [25, 50, 100],
  disabled = false,
}) => {
  const isPreset = value !== undefined && validateBatchSize(value).valid && presets.includes(value);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(!isPreset && value !== undefined);
  const [customInputStr, setCustomInputStr] = useState<string>(
    value !== undefined && validateBatchSize(value).valid
      ? String(value)
      : value !== undefined
        ? String(value)
        : "50",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    value !== undefined ? getBatchSizeErrorMessage(value) : null,
  );

  // Sync if external value changes to a preset
  useEffect(() => {
    if (value !== undefined) {
      if (validateBatchSize(value).valid && presets.includes(value)) {
        if (!isCustomMode) {
          setCustomInputStr(String(value));
          setErrorMessage(null);
        }
      } else {
        setCustomInputStr(String(value));
        const err = getBatchSizeErrorMessage(value);
        setErrorMessage(err);
      }
    } else {
      setErrorMessage(getBatchSizeErrorMessage(undefined));
    }
  }, [value, presets, isCustomMode]);

  const handleSelectPreset = (preset: number) => {
    if (!validateBatchSize(preset).valid) return;
    setIsCustomMode(false);
    setErrorMessage(null);
    setCustomInputStr(String(preset));
    onChange(preset);
  };

  const handleCustomModeToggle = () => {
    setIsCustomMode(true);
    validateAndPropagate(customInputStr);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setCustomInputStr(rawVal);
    validateAndPropagate(rawVal);
  };

  const validateAndPropagate = (strVal: string) => {
    const validation = validateBatchSize(strVal);
    if (!validation.valid) {
      setErrorMessage(validation.message || "1회 처리 웨이퍼 수는 1 ~ 100 사이의 정수여야 합니다.");
      onChange(undefined);
      return;
    }

    const num = Number(strVal.trim());
    setErrorMessage(null);
    onChange(num);
  };

  return (
    <div className="space-y-3 rounded-2xl bg-white border border-[#E2E8F0] p-4 sm:p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs sm:text-sm font-bold text-[#071A2E] flex items-center gap-2">
          <Users className="h-4 w-4 text-[#00C2FF]" />
          <span>1회 처리 웨이퍼 수 (Batch Size) 선택</span>
        </label>
        <span className="text-[11px] text-[#64748B] font-medium">
          MVP 허용 Capacity: {max} wafers / batch
        </span>
      </div>

      <p className="text-xs text-[#64748B] leading-relaxed">
        한 번의 배치 세정 공정에서 동시에 화학 침적 및 초순수 린스를 진행하는 웨이퍼 수량을
        설정합니다.
      </p>

      {/* Preset and Custom Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {presets.map((preset) => {
          const isSelected = !isCustomMode && value === preset;
          return (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => handleSelectPreset(preset)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border font-mono font-bold transition-all cursor-pointer ${
                isSelected
                  ? "border-[#00C2FF] bg-[#00C2FF]/10 text-[#071A2E] ring-1 ring-[#00C2FF]/30 shadow-xs"
                  : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:text-[#071A2E]"
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-lg">{preset}</span>
                <span className="text-xs font-sans font-medium text-[#64748B]">매</span>
              </div>
              <span className="text-[10px] font-sans text-[#94A3B8]">
                {preset === 25 ? "소형 배치" : preset === 50 ? "표준 2-카세트" : "대형 배치"}
              </span>
            </button>
          );
        })}

        {/* Custom Input Toggle Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={handleCustomModeToggle}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border font-bold transition-all cursor-pointer ${
            isCustomMode
              ? "border-[#00C2FF] bg-[#00C2FF]/10 text-[#071A2E] ring-1 ring-[#00C2FF]/30 shadow-xs"
              : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:text-[#071A2E]"
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Edit3 className="h-3.5 w-3.5 text-[#00C2FF]" />
            <span>직접 입력</span>
          </div>
          <span className="text-[10px] font-sans text-[#94A3B8]">1 ~ {max}매 설정</span>
        </button>
      </div>

      {/* Direct Input Field when isCustomMode is true */}
      {isCustomMode && (
        <div className="pt-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <input
                type="number"
                min={min}
                max={max}
                step={1}
                value={customInputStr}
                onChange={handleCustomInputChange}
                placeholder={`1 ~ ${max}`}
                className={`w-full rounded-xl border px-3.5 py-2.5 font-mono text-sm font-bold text-[#071A2E] placeholder-[#94A3B8] focus:outline-none focus:ring-2 ${
                  errorMessage
                    ? "border-rose-300 bg-rose-50/50 focus:ring-rose-400"
                    : "border-[#00C2FF] bg-white focus:ring-[#00C2FF]"
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                wafers
              </span>
            </div>

            {value && !errorMessage && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#166534] bg-[#22C55E]/15 px-2.5 py-1.5 rounded-lg border border-[#22C55E]/30">
                <Check className="h-3.5 w-3.5" />
                <span>{value} wafers 설정됨</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Selection Summary */}
      {value && !errorMessage && (
        <div className="flex items-center justify-between text-xs text-[#64748B] pt-1 border-t border-[#F1F5F9]">
          <span>
            현재 선택: <strong className="text-[#071A2E] font-mono">{value} wafers / batch</strong>
          </span>
          <span className="text-[11px] text-[#94A3B8]">
            ※ 배치 세정 UPW는 1회 총 소모량 ÷ {value}매로 환산됩니다.
          </span>
        </div>
      )}
    </div>
  );
};
