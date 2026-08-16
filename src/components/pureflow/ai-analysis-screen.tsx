import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "웨이퍼 상태 분석",
  "오염도 분석",
  "세정 조건 분석",
  "후보 조건 생성",
  "예상 잔류 오염 계산",
  "품질 기준 검증",
  "최소 UPW 조건 선택",
];

const STEP_MS = 420;

/**
 * AI 분석 진행 애니메이션 (Simulation Analysis).
 * 실제 AI 서버 추론이 아닌 시뮬레이션 분석임을 유지한다.
 */
export function AIAnalysisScreen({
  waferDiameter,
  onComplete,
}: {
  waferDiameter: 200 | 300;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length) {
      const done = setTimeout(onComplete, 500);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [step, onComplete]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="surface glow w-full max-w-md p-8">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15">
            <BrainCircuit className="size-6 text-primary" />
          </div>
          <div>
            <p className="font-display text-lg font-bold">AI ANALYSIS</p>
            <p className="text-xs text-muted-foreground">
              Simulation Analysis · {waferDiameter}mm wafer
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          현재 공정의 오염도와 세정 조건을 분석하고, 품질 기준을 유지할 수 있는 절감 조건을
          탐색합니다.
        </p>

        <ul className="mt-6 space-y-3" aria-live="polite">
          {STEPS.map((label, i) => {
            const state = i < step ? "complete" : i === step ? "active" : "pending";
            return (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                  state === "complete" && "border-primary/30 bg-primary/5",
                  state === "active" && "animate-pulse border-primary bg-primary/10",
                  state === "pending" && "border-border opacity-50",
                )}
              >
                {state === "complete" ? (
                  <CheckCircle className="size-4 shrink-0 text-primary" aria-hidden />
                ) : state === "active" ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <span
                  className={cn(
                    state === "complete" && "text-foreground",
                    state === "active" && "font-semibold text-primary",
                    state === "pending" && "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
