import React from "react";
import { Disc } from "lucide-react";
import { WaferDiameterInch, WAFER_DIAMETER_OPTIONS } from "../types";

interface WaferDiameterSelectorProps {
  value: WaferDiameterInch;
  onChange: (inch: WaferDiameterInch, mm: number) => void;
}

export const WaferDiameterSelector: React.FC<WaferDiameterSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <span className="font-mono text-xs font-bold text-[#00C2FF]">
          {value}&quot; ({WAFER_DIAMETER_OPTIONS.find((o) => o.inch === value)?.mm.toFixed(1)} mm)
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
        {WAFER_DIAMETER_OPTIONS.map((opt) => {
          const isSelected = opt.inch === value;
          return (
            <button
              key={opt.inch}
              type="button"
              id={`wafer-diameter-${opt.inch}`}
              onClick={() => onChange(opt.inch, opt.mm)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer text-center focus:outline-none ${
                isSelected
                  ? "border-[#00C2FF] bg-[#00C2FF]/10 text-[#071A2E] shadow-xs ring-1 ring-[#00C2FF]"
                  : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border mb-1.5 transition-colors ${
                  isSelected
                    ? "border-[#00C2FF] bg-white text-[#00C2FF]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]"
                }`}
              >
                <Disc className="h-4 w-4" />
              </div>
              <span className="text-sm font-black text-[#071A2E] block">{opt.inch}&quot;</span>
              <span className="text-[10px] font-mono text-[#64748B] block mt-0.5">
                {opt.mm.toFixed(0)}mm
              </span>
              {isSelected && (
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-[#00C2FF]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
