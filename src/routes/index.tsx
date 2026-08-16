import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Droplets, Zap, Leaf, Timer, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PROCESSES, recommend, fmt, type Inputs, type ProcessKey } from "@/lib/pureflow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PureFlow AI — 반도체 초순수 세정 최적화" },
      {
        name: "description",
        content:
          "PureFlow AI는 공정별 오염 특성을 분석해 필요한 만큼만 초순수를 사용하도록 세정 시간을 추천하는 ESG 웹앱입니다.",
      },
      { property: "og:title", content: "PureFlow AI — 반도체 초순수 세정 최적화" },
      {
        property: "og:description",
        content: "필요한 만큼만 세정하고, 필요한 만큼만 초순수를 사용한다.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Stat({
  icon: Icon,
  label,
  value,
  unit,
  sub,
}: {
  icon: typeof Droplets;
  label: string;
  value: string;
  unit: string;
  sub: string;
}) {
  return (
    <div className="surface p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-primary" />
        <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="mt-3 font-display text-3xl leading-none font-bold">
        {value}
        <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Index() {
  const [input, setInput] = useState<Inputs>({
    process: "SC-1",
    diameter: 300,
    contamination: 4,
    batchesPerDay: 60,
  });
  const r = useMemo(() => recommend(input), [input]);
  const spec = PROCESSES.find((p) => p.key === input.process)!;
  const reduction = r.base ? (r.savedMinutes / r.base) * 100 : 0;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="hero-bg border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            AI x ESG Innovation Challenge
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.1] font-bold md:text-6xl">
            가장 깨끗한 물을
            <br />
            <span className="text-flow">가장 똑똑하게</span> 씁니다.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            PureFlow AI는 반도체 RCA 세정 공정의 오염 특성을 분석해, 품질은 유지하면서 필요한
            만큼만 초순수(UPW)를 사용하도록 세정 시간을 추천합니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <a href="#simulator">
                세정 시간 추천 받기 <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#why">문제 정의 보기</a>
            </Button>
          </div>
          <p className="mt-10 border-l-2 border-primary pl-4 text-sm text-muted-foreground italic">
            “필요한 만큼만 세정하고, 필요한 만큼만 초순수를 사용한다.”
          </p>
        </div>
      </section>

      {/* Problem */}
      <section id="why" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-bold md:text-3xl">왜 초순수가 낭비될까?</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          RCA 세정은 공정별로 정해진 고정 레시피를 사용합니다. 웨이퍼마다 오염 특성이 달라도 같은
          시간, 같은 유량으로 세정하기 때문에 필요 이상의 초순수가 흘러갑니다.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { t: "물 사용량 증가", d: "고정 레시피 기반 과잉 린스" },
            { t: "전력 소비 증가", d: "초순수 정제 설비 부하 상승" },
            { t: "탄소배출 증가", d: "전력 사용에 비례한 CO₂ 발생" },
            { t: "폐수 처리 부담", d: "배출 수량 증가에 따른 비용" },
          ].map((c) => (
            <div key={c.t} className="surface p-5">
              <p className="font-display font-semibold">{c.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simulator */}
      <section id="simulator" className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-bold md:text-3xl">AI 세정 시간 추천</h2>
          <p className="mt-3 text-muted-foreground">
            공정 정보를 입력하면 권장 세정 시간과 ESG 절감 효과를 계산합니다.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[380px_1fr]">
            {/* Inputs */}
            <div className="surface space-y-7 p-6">
              <div>
                <Label className="text-xs tracking-wide uppercase">공정 종류</Label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {PROCESSES.map((p) => {
                    const active = p.key === input.process;
                    return (
                      <button
                        key={p.key}
                        onClick={() => setInput((s) => ({ ...s, process: p.key as ProcessKey }))}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-secondary"
                        }`}
                      >
                        <span className="block text-sm font-semibold">{p.label}</span>
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {p.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-xs tracking-wide uppercase">웨이퍼 직경</Label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {([200, 300] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setInput((s) => ({ ...s, diameter: d }))}
                      className={`rounded-lg border p-3 text-sm font-semibold transition-colors ${
                        input.diameter === d
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {d}mm
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs tracking-wide uppercase">오염도 지수</Label>
                  <span className="font-display text-sm font-semibold text-primary">
                    {input.contamination} / 10
                  </span>
                </div>
                <Slider
                  className="mt-4"
                  min={1}
                  max={10}
                  step={1}
                  value={[input.contamination]}
                  onValueChange={([v]) => setInput((s) => ({ ...s, contamination: v }))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs tracking-wide uppercase">일일 배치 수</Label>
                  <span className="font-display text-sm font-semibold text-primary">
                    {input.batchesPerDay} 배치
                  </span>
                </div>
                <Slider
                  className="mt-4"
                  min={10}
                  max={200}
                  step={5}
                  value={[input.batchesPerDay]}
                  onValueChange={([v]) => setInput((s) => ({ ...s, batchesPerDay: v }))}
                />
              </div>
            </div>

            {/* Output */}
            <div className="space-y-6">
              <div className="surface glow p-6">
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                      {spec.label} 권장 세정 시간
                    </p>
                    <p className="mt-2 font-display text-6xl leading-none font-bold text-flow">
                      {fmt(r.recommended, 1)}
                      <span className="ml-2 text-2xl text-muted-foreground">분</span>
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      기존 레시피 {r.base}분 → <span className="text-accent">{fmt(reduction)}%</span>{" "}
                      단축 ({fmt(r.savedMinutes, 1)}분 절감)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                      예상 세정 품질
                    </p>
                    <p className="mt-2 font-display text-3xl font-bold text-accent">
                      {fmt(r.qualityScore, 1)}%
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">기준 스펙 충족</p>
                  </div>
                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="bg-flow h-full transition-[width] duration-500"
                    style={{ width: `${(r.recommended / r.base) * 100}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                  <span>AI 권장 구간</span>
                  <span>기존 레시피 {r.base}분</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Stat
                  icon={Droplets}
                  label="초순수 절감"
                  value={fmt(r.waterPerYear / 1000, 1)}
                  unit="톤/년"
                  sub={`하루 ${fmt(r.waterPerDay)} L 절감`}
                />
                <Stat
                  icon={Zap}
                  label="전력 절감"
                  value={fmt(r.kwhPerYear)}
                  unit="kWh/년"
                  sub="정제·이송 전력 기준(추정)"
                />
                <Stat
                  icon={Leaf}
                  label="CO₂ 절감"
                  value={fmt(r.co2PerYear / 1000, 2)}
                  unit="tCO₂/년"
                  sub="전력 배출계수 0.4594 적용"
                />
              </div>

              <div className="surface p-6">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Timer className="size-4 text-primary" /> 공정별 권장 비교
                </div>
                <div className="mt-4 overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/60 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">공정</th>
                        <th className="px-4 py-2 text-right font-medium">기존</th>
                        <th className="px-4 py-2 text-right font-medium">AI 권장</th>
                        <th className="px-4 py-2 text-right font-medium">절감</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PROCESSES.map((p) => {
                        const row = recommend({ ...input, process: p.key });
                        return (
                          <tr key={p.key} className="border-t border-border">
                            <td className="px-4 py-2.5">{p.label}</td>
                            <td className="px-4 py-2.5 text-right text-muted-foreground">
                              {row.base}분
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-primary">
                              {fmt(row.recommended, 1)}분
                            </td>
                            <td className="px-4 py-2.5 text-right text-accent">
                              {fmt((row.savedMinutes / row.base) * 100)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  * 해커톤 MVP 기준의 추정 모델이며, 실제 적용 시 공정 데이터 학습이 필요합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-2xl font-bold md:text-3xl">프로젝트 핵심 가치</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { t: "초순수 사용량 절감", d: "오염 특성 기반 세정 시간 최적화로 과잉 린스 제거" },
            { t: "물·에너지·탄소 절감", d: "절감 효과를 정량 지표로 즉시 시각화" },
            { t: "품질 유지", d: "스펙 충족 구간 내에서만 시간 단축을 제안" },
          ].map((c) => (
            <div key={c.t} className="surface p-6">
              <p className="font-display text-lg font-semibold">{c.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 border-l-2 border-accent pl-4 text-lg font-medium">
          PureFlow AI는 공정별 오염 특성을 AI가 분석하여 필요한 만큼만 초순수를 사용하는 반도체 세정
          최적화 웹앱입니다.
        </p>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        PureFlow AI · AI x ESG Innovation Challenge 해커톤 MVP
      </footer>
    </main>
  );
}
