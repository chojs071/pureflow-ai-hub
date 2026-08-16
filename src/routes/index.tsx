import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { BrainCircuit, Cpu, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIAnalysisScreen } from "@/components/pureflow/ai-analysis-screen";
import { FinalDashboard } from "@/components/pureflow/final-dashboard";
import { ProcessProgress, ProcessSimulation } from "@/components/pureflow/process-simulation";
import { optimizeProcess, type OptimizationResult } from "@/lib/model";
import { getProcesses } from "@/lib/processes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PureFlow AI — AI 기반 초순수 최적화 시스템" },
      {
        name: "description",
        content:
          "PureFlow AI는 세정 후 허용 잔류 오염 기준을 유지하면서 기존 초순수 사용량을 어디까지 줄일 수 있는지 판단하는 시뮬레이션 웹앱입니다.",
      },
      { property: "og:title", content: "PureFlow AI — AI 기반 초순수 최적화 시스템" },
      {
        property: "og:description",
        content: "품질은 유지하고, 불필요한 UPW 사용은 줄입니다.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "START" | "ANALYZING" | "PROCESS_ACTIVE" | "FINAL_RESULT";

function StartScreen({
  wafer,
  onSelect,
  onStart,
}: {
  wafer: 200 | 300 | null;
  onSelect: (w: 200 | 300) => void;
  onStart: () => void;
}) {
  return (
    <div className="hero-bg flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/15">
          <Droplets className="size-8 text-primary" aria-hidden />
        </div>
        <h1 className="mt-6 font-display text-5xl font-bold">PureFlow AI</h1>
        <p className="mt-3 text-lg text-muted-foreground">AI 기반 초순수 최적화 시스템</p>
        <p className="mt-6 text-base text-foreground/90">
          품질은 유지하고, 불필요한 UPW 사용은 줄입니다.
        </p>

        <div className="surface mx-auto mt-10 max-w-md p-8 text-left">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">웨이퍼 직경</p>
          <div
            className="mt-3 grid grid-cols-2 gap-3"
            role="radiogroup"
            aria-label="웨이퍼 직경 선택"
          >
            {([200, 300] as const).map((d) => (
              <button
                key={d}
                role="radio"
                aria-checked={wafer === d}
                onClick={() => onSelect(d)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border p-4 font-display text-lg font-semibold transition-colors",
                  wafer === d
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border hover:bg-secondary",
                )}
              >
                <Cpu className="size-5" aria-hidden />
                {d}mm
              </button>
            ))}
          </div>

          <Button size="lg" className="mt-6 w-full" disabled={wafer === null} onClick={onStart}>
            <BrainCircuit className="size-4" aria-hidden />
            AI 최적화 시작
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Literature-based simulation data · 실제 Fab 장비·생산라인과 연결되지 않습니다
        </p>
      </div>
    </div>
  );
}

function Index() {
  const [phase, setPhase] = useState<Phase>("START");
  const [wafer, setWafer] = useState<200 | 300 | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<OptimizationResult[]>([]);

  const processes = useMemo(() => (wafer ? getProcesses(wafer) : []), [wafer]);

  const currentResult = useMemo(
    () => (phase === "PROCESS_ACTIVE" ? optimizeProcess(processes[currentIndex]) : null),
    [phase, processes, currentIndex],
  );

  const handleStart = useCallback(() => {
    if (!wafer) return;
    setResults([]);
    setCurrentIndex(0);
    setPhase("ANALYZING");
  }, [wafer]);

  const handleAnalysisComplete = useCallback(() => setPhase("PROCESS_ACTIVE"), []);

  const handleNext = useCallback(() => {
    if (!currentResult) return;
    const nextResults = [...results, currentResult];
    setResults(nextResults);
    if (currentIndex + 1 >= processes.length) {
      setPhase("FINAL_RESULT");
    } else {
      setCurrentIndex(currentIndex + 1);
      setPhase("ANALYZING");
    }
  }, [currentResult, results, currentIndex, processes.length]);

  const handleRestart = useCallback(() => {
    setPhase("START");
    setWafer(null);
    setCurrentIndex(0);
    setResults([]);
  }, []);

  if (phase === "START") {
    return <StartScreen wafer={wafer} onSelect={setWafer} onStart={handleStart} />;
  }

  if (phase === "ANALYZING" && wafer) {
    return <AIAnalysisScreen waferDiameter={wafer} onComplete={handleAnalysisComplete} />;
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Droplets className="size-5 text-primary" aria-hidden />
            <span className="font-display text-lg font-bold">PureFlow AI</span>
          </div>
          <span className="rounded-md border border-border px-2.5 py-1 text-sm text-muted-foreground">
            {wafer}mm wafer
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {phase === "PROCESS_ACTIVE" && currentResult ? (
          <div className="space-y-8">
            <ProcessProgress processes={processes} currentIndex={currentIndex} />
            <ProcessSimulation
              result={currentResult}
              isLast={currentIndex + 1 >= processes.length}
              onNext={handleNext}
            />
          </div>
        ) : (
          <FinalDashboard
            waferDiameter={wafer ?? 300}
            results={results}
            onRestart={handleRestart}
          />
        )}
      </div>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        PureFlow AI · 문헌 기반 시뮬레이션 데이터 · 실제 생산라인·장비 제어와 무관합니다
      </footer>
    </main>
  );
}
