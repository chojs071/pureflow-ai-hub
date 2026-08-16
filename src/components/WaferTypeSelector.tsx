import React from "react";
import { Layers, Sparkles, Shield } from "lucide-react";
import { WaferType, WAFER_TYPE_OPTIONS } from "../types";

interface WaferTypeSelectorProps {
  value: WaferType;
  onChange: (type: WaferType) => void;
}

export const WaferTypeSelector: React.FC<WaferTypeSelectorProps> = ({ value, onChange }) => {
  const getIcon = (type: WaferType, isSelected: boolean) => {
    const className = `h-5 w-5 ${isSelected ? "text-[#00C2FF]" : "text-[#64748B]"}`;
    switch (type) {
      case "polished":
        return <Sparkles className={className} />;
      case "epitaxial":
        return <Layers className={className} />;
      case "soi":
        return <Shield className={className} />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <span className="text-xs font-semibold text-[#64748B]">
          {WAFER_TYPE_OPTIONS.find((t) => t.value === value)?.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {WAFER_TYPE_OPTIONS.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              id={`wafer-type-${opt.value}`}
              onClick={() => onChange(opt.value)}
              className={`relative flex items-start gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left focus:outline-none ${
                isSelected
                  ? "border-[#00C2FF] bg-[#00C2FF]/10 text-[#071A2E] shadow-xs ring-1 ring-[#00C2FF]"
                  : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  isSelected
                    ? "border-[#00C2FF] bg-white text-[#00C2FF]"
                    : "border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B]"
                }`}
              >
                {getIcon(opt.value, isSelected)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-black text-[#071A2E] block truncate">
                  {opt.label}
                </span>
                <span className="text-xs font-mono text-[#64748B] block truncate mt-0.5">
                  {opt.subLabel}
                </span>
              </div>
              {isSelected && (
                <span className="absolute top-3.5 right-3.5 flex h-2.5 w-2.5 rounded-full bg-[#00C2FF]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
