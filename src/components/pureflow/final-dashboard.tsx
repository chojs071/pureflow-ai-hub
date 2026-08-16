import { CheckCircle, Droplets, Factory, Leaf, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { fmt, formatAtoms, type OptimizationResult } from "@/lib/model";

// 시뮬레이션 환산 계수 (실제 측정값 아님)
const KWH_PER_L_UPW = 0.012;
const KG_CO2_PER_KWH = 0.4594;

export function FinalDashboard({
  waferDiameter,
  results,
  onRestart,
}: {
  waferDiameter: 200 | 300;
  results: OptimizationResult[];
  onRestart: () => void;
}) {
  const totalBaseline = results.reduce((sum, r) => sum + r.baselineUpw, 0);
  const totalRecommended = results.reduce((sum, r) => sum + r.recommendedUpw, 0);
  const totalSavings = totalBaseline - totalRecommended;
  const totalSavingsRate = totalBaseline > 0 ? (totalSavings / totalBaseline) * 100 : 0;
  const passCount = results.filter((r) => r.qualityPass).length;

  const kwhSaved = totalSavings * KWH_PER_L_UPW;
  const co2Saved = kwhSaved * KG_CO2_PER_KWH;

  const chartData = results.map((r) => ({
    name: r.process.name,
    기존: r.baselineUpw,
    AI: r.recommendedUpw,
    절감: r.savings,
  }));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">AI 최적화 완료</h2>
        <p className="mt-2 text-muted-foreground">
          품질을 희생하지 않고, 줄일 수 있는 UPW를 찾아냈습니다.
        </p>
      </div>

      {/* 핵심 숫자 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface p-5">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">기존 UPW</p>
          <p className="mt-2 font-display text-3xl font-bold">
            {fmt(totalBaseline)}
            <span className="ml-1 text-sm font-medium text-muted-foreground">L</span>
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs tracking-wide text-primary uppercase">AI 최적화</p>
          <p className="mt-2 font-display text-3xl font-bold text-flow">
            {fmt(totalRecommended)}
            <span className="ml-1 text-sm font-medium text-muted-foreground">L</span>
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs tracking-wide text-accent uppercase">총 절감</p>
          <p className="mt-2 font-display text-3xl font-bold text-accent">
            {fmt(totalSavings)}
            <span className="ml-1 text-sm font-medium text-muted-foreground">L</span>
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs tracking-wide text-accent uppercase">절감률</p>
          <p className="mt-2 font-display text-3xl font-bold text-accent">
            {fmt(totalSavingsRate, 1)}
            <span className="ml-1 text-sm font-medium text-muted-foreground">%</span>
          </p>
        </div>
      </div>

      {/* 품질 검증 요약 */}
      <div className="surface flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-6 text-accent" aria-hidden />
          <div>
            <p className="font-semibold">
              품질 기준 충족 {passCount} / {results.length} 공정
            </p>
            <p className="text-sm text-muted-foreground">
              모든 추천 조건은 허용 잔류 오염 기준을 충족합니다. 기준 미충족 조건은 자동
              제외되었습니다.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/15 px-3 py-1.5 text-sm font-semibold text-accent">
          <CheckCircle className="size-4" aria-hidden /> 품질 비희생 원칙 적용
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* 공정별 비교 그래프 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">공정별 UPW 비교</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    label={{
                      value: "UPW (L)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "var(--muted-foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--foreground)",
                    }}
                    formatter={(value) => `${fmt(Number(value))} L`}
                  />
                  <Legend />
                  <Bar dataKey="기존" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="AI" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="절감" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ESG 카드 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Leaf className="size-4 text-accent" aria-hidden /> ESG 효과
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border p-3 text-center">
                <Droplets className="mx-auto size-5 text-primary" aria-hidden />
                <p className="mt-2 font-display text-xl font-bold">{fmt(totalSavings)}</p>
                <p className="text-[11px] text-muted-foreground">UPW 절감 (L)</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <Zap className="mx-auto size-5 text-primary" aria-hidden />
                <p className="mt-2 font-display text-xl font-bold">{fmt(kwhSaved, 1)}</p>
                <p className="text-[11px] text-muted-foreground">전력 절감 (kWh)</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <Factory className="mx-auto size-5 text-primary" aria-hidden />
                <p className="mt-2 font-display text-xl font-bold">{fmt(co2Saved, 2)}</p>
                <p className="text-[11px] text-muted-foreground">탄소 절감 (kgCO₂e)</p>
              </div>
            </CardContent>
          </Card>
          <p className="text-[11px] text-muted-foreground">
            ※ 전력·탄소 절감량은 시뮬레이션 환산 계수(UPW 1L당 0.012 kWh, 전력 배출계수 0.4594
            kgCO₂e/kWh)를 적용한 추정치입니다.
          </p>
        </div>
      </div>

      {/* 공정별 결과 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">공정별 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>공정</TableHead>
                <TableHead className="text-right">기존 UPW</TableHead>
                <TableHead className="text-right">AI UPW</TableHead>
                <TableHead className="text-right">예상 잔류 Cu</TableHead>
                <TableHead className="text-right">허용 기준</TableHead>
                <TableHead className="text-center">품질 판정</TableHead>
                <TableHead className="text-right">절감량</TableHead>
                <TableHead className="text-right">절감률</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.process.id}>
                  <TableCell className="font-medium">{r.process.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {fmt(r.baselineUpw)} L
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {fmt(r.recommendedUpw)} L
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatAtoms(r.predictedResidualCu)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ≤ {formatAtoms(r.process.allowableCuAtomsCm2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.qualityPass ? (
                      <span className="inline-flex items-center gap-1 text-accent">
                        <CheckCircle className="size-3.5" aria-hidden /> 충족
                      </span>
                    ) : (
                      <span className="text-red-300">초과</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-accent">{fmt(r.savings)} L</TableCell>
                  <TableCell className="text-right text-accent">{fmt(r.savingsRate, 1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button size="lg" variant="outline" onClick={onRestart}>
          <RotateCcw className="size-4" aria-hidden /> 처음으로
        </Button>
      </div>
    </div>
  );
}
