import { BAND_LABEL, contaminationBand } from "@/lib/model";
import { cn } from "@/lib/utils";

/**
 * 오염도 게이지 (0~100 시뮬레이션 지표)
 * 90 이상이면 "최소 세정시간 유지" 문구를 함께 표시한다.
 */
export function ContaminationGauge({ score }: { score: number }) {
  const band = contaminationBand(score);
  const barColor =
    band === "very_high"
      ? "bg-destructive"
      : band === "high"
        ? "bg-orange-400"
        : band === "medium"
          ? "bg-yellow-400"
          : "bg-accent";

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">오염도</span>
        <span className="font-display font-semibold">
          {score} / 100
          <span className="ml-2 text-xs font-medium text-muted-foreground">{BAND_LABEL[band]}</span>
        </span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label={`오염도 ${score}/100, ${BAND_LABEL[band]}`}
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", barColor)}
          style={{ width: `${score}%` }}
        />
      </div>
      {score >= 90 && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-destructive/15 px-2 py-1 text-xs font-medium text-red-300">
          고오염 공정 — 최소 세정시간 유지
        </p>
      )}
    </div>
  );
}
