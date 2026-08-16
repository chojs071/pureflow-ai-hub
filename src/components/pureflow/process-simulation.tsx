import { ArrowRight, CheckCircle, Database, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmt, formatAtoms, type OptimizationResult, type ProcessDefinition } from "@/lib/model";
import { cn } from "@/lib/utils";
import { ContaminationGauge } from "./contamination-gauge";

/** 상단 공정 진행 indicator: 완료=Navy, 현재=Electric Blue, 대기=Gray */
export function ProcessProgress({
  processes,
  currentIndex,
}: {
  processes: ProcessDefinition[];
  currentIndex: number;
}) {
  return (
    <ol className="flex items-center justify-center gap-2" aria-label="공정 진행">
      {processes.map((p, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "pending";
        return (
          <li key={p.id} className="flex items-center gap-2">
            {i > 0 && (
              <span
                aria-hidden
                className={cn("h-px w-6 sm:w-10", i <= currentIndex ? "bg-primary" : "bg-border")}
              />
            )}
            <span
              aria-current={state === "current" ? "step" : undefined}
              title={p.name}
              className={cn(
                "flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                state === "done" && "border-primary/40 bg-primary/20 text-primary",
                state === "current" && "border-primary bg-primary text-primary-foreground",
                state === "pending" && "border-border bg-secondary text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function QualityBadge({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/15 px-2.5 py-1 text-sm font-semibold text-accent">
      <ShieldCheck className="size-4" aria-hidden /> 품질 기준 충족
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/15 px-2.5 py-1 text-sm font-semibold text-red-300">
      <XCircle className="size-4" aria-hidden /> 허용 기준 초과
    </span>
  );
}

/**
 * 현재 공정 시뮬레이션 화면.
 * 좌: 현재 공정 카드 / 우: AI 분석 결과 + 후보 비교.
 */
export function ProcessSimulation({
  result,
  isLast,
  onNext,
}: {
  result: OptimizationResult;
  isLast: boolean;
  onNext: () => void;
}) {
  const { process, baselineUpw, recommendedUpw, savings, savingsRate, fallback } = result;
  const recipe = process.baselineRecipe;

  // 후보 비교 테이블: UPW 오름차순으로 기준 조건 주변 후보를 보여준다
  const tableCandidates = result.candidates
    .filter((c) => c.upw <= baselineUpw)
    .sort((a, b) => b.upw - a.upw)
    .slice(0, 8);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      {/* 좌측: 현재 공정 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-wide text-muted-foreground uppercase">현재 공정</p>
              <CardTitle className="mt-1 text-2xl">{process.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{process.description}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground">
              <Database className="size-3" aria-hidden /> {process.dataSource}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ContaminationGauge score={process.contaminationScore} />

          <div>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">기준 세정 조건</p>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              {[
                { label: "세정시간", value: `${recipe.cleaningTime}분` },
                { label: "린스시간", value: `${recipe.rinseTime}분` },
                { label: "유량", value: `${recipe.flowRate}L/min` },
                { label: "린스 횟수", value: `${recipe.cycles}회` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border bg-secondary/40 p-2.5"
                >
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">기존 UPW</p>
              <p className="mt-1 font-display text-3xl font-bold">
                {fmt(baselineUpw)}
                <span className="ml-1 text-sm font-medium text-muted-foreground">L</span>
              </p>
            </div>
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-4">
              <p className="text-xs text-primary">AI 추천 UPW</p>
              <p className="mt-1 font-display text-3xl font-bold text-flow">
                {fmt(recommendedUpw)}
                <span className="ml-1 text-sm font-medium text-muted-foreground">L</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">절감량</p>
              <p className="mt-1 font-display text-2xl font-bold text-accent">
                {fmt(savings)}
                <span className="ml-1 text-sm font-medium text-muted-foreground">L</span>
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">절감률</p>
              <p className="mt-1 font-display text-2xl font-bold text-accent">
                {fmt(savingsRate, 1)}
                <span className="ml-1 text-sm font-medium text-muted-foreground">%</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 우측: AI 분석 결과 */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              세정 후 품질 검증
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">예상 잔류 Cu</p>
                <p className="mt-1 font-display text-lg font-bold">
                  {formatAtoms(result.predictedResidualCu)}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">atoms/cm²</span>
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">허용 기준</p>
                <p className="mt-1 font-display text-lg font-bold">
                  ≤ {formatAtoms(process.allowableCuAtomsCm2)}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">atoms/cm²</span>
                </p>
              </div>
            </div>
            <QualityBadge pass={result.qualityPass} />
            {fallback && (
              <p className="rounded-lg border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
                현재 조건에서는 품질 기준을 유지하면서 UPW를 줄일 수 없습니다. 기존 기준 조건을
                유지합니다.
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              ※ 허용 기준은 공정 및 오염물 종류에 따라 달라질 수 있으며, PureFlow AI에서는 문헌 기반
              시뮬레이션 기준을 사용합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">후보 조건 비교</CardTitle>
            <p className="text-xs text-muted-foreground">
              품질 기준을 충족하는 후보 중 가장 적은 UPW 조건을 AI가 선택합니다.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">UPW</TableHead>
                  <TableHead className="text-right">예상 잔류 Cu</TableHead>
                  <TableHead className="text-center">판정</TableHead>
                  <TableHead className="text-center">선택</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableCandidates.map((c) => {
                  const isRec =
                    result.recommendation !== null &&
                    c.upw === result.recommendation.upw &&
                    c.qualityPass;
                  return (
                    <TableRow
                      key={`${c.recipe.cleaningTime}-${c.recipe.rinseTime}-${c.recipe.flowRate}-${c.recipe.cycles}`}
                      className={cn(isRec && "bg-primary/10", !c.qualityPass && "opacity-60")}
                    >
                      <TableCell className="text-right font-medium">
                        {fmt(c.upw)} L{c.isBaseline ? " (기준)" : ""}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatAtoms(c.predictedResidualCu)}
                      </TableCell>
                      <TableCell className="text-center">
                        {c.qualityPass ? (
                          <span className="inline-flex items-center gap-1 text-accent">
                            <CheckCircle className="size-3.5" aria-hidden /> 통과
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-300">
                            <XCircle className="size-3.5" aria-hidden /> 탈락
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isRec ? (
                          <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                            AI 추천
                          </span>
                        ) : c.isBaseline ? (
                          <span className="text-xs text-muted-foreground">기준</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="lg" onClick={onNext}>
            {isLast ? "최종 결과 보기" : "다음 공정"}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
