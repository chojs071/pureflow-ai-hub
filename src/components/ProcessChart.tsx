import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { BarChart3, TrendingDown } from "lucide-react";
import { ProcessResult } from "../types";

interface ProcessChartProps {
  completedResults: ProcessResult[];
}

export const ProcessChart: React.FC<ProcessChartProps> = ({ completedResults }) => {
  if (completedResults.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 text-center text-xs text-[#64748B]">
        공정이 진행되면 공정별 UPW 비교 그래프가 생성됩니다.
      </div>
    );
  }

  const chartData = completedResults.map((r, index) => ({
    name: `Step ${index + 1}`,
    fullName: r.process.name,
    baselineUPW: r.baselineUPW,
    recommendedUPW: r.recommendedUPW,
    savingsLiters: r.savingsLiters,
  }));

  const totalBaseline = completedResults.reduce((acc, r) => acc + r.baselineUPW, 0);
  const totalAI = completedResults.reduce((acc, r) => acc + r.recommendedUPW, 0);
  const totalSavings = totalBaseline - totalAI;
  const savingsRate = totalBaseline > 0 ? ((totalSavings / totalBaseline) * 100).toFixed(1) : "0";

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#071A2E] text-white">
            <BarChart3 className="h-4 w-4 text-[#00C2FF]" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#071A2E]">
              공정별 UPW 사용량 비교 현황
            </h3>
            <span className="text-[11px] text-[#64748B]">
              완료된 {completedResults.length}개 공정 실시간 누적
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-1 text-xs font-bold text-[#166534]">
          <TrendingDown className="h-3.5 w-3.5" />
          <span>
            총 {totalSavings.toFixed(1)}L 절감 (-{savingsRate}%)
          </span>
        </div>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              unit="L"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-[#E2E8F0] bg-[#071A2E] text-white p-3 text-xs shadow-xl space-y-1.5">
                      <div className="font-bold text-[#00C2FF] border-b border-white/10 pb-1">
                        {data.fullName} ({label})
                      </div>
                      <div className="flex justify-between gap-4 text-white/80">
                        <span>기존 UPW:</span>
                        <span className="font-mono font-bold">{data.baselineUPW} L</span>
                      </div>
                      <div className="flex justify-between gap-4 text-[#00C2FF]">
                        <span>AI 추천 UPW:</span>
                        <span className="font-mono font-bold">{data.recommendedUPW} L</span>
                      </div>
                      <div className="flex justify-between gap-4 text-[#22C55E] pt-1 border-t border-white/10">
                        <span>절감량:</span>
                        <span className="font-mono font-bold">-{data.savingsLiters} L</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
              formatter={(value) => {
                if (value === "baselineUPW")
                  return <span className="text-[#64748B]">기존 UPW</span>;
                if (value === "recommendedUPW")
                  return <span className="text-[#071A2E] font-bold">AI 최적화 UPW</span>;
                return value;
              }}
            />
            <Bar dataKey="baselineUPW" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="recommendedUPW" fill="#00C2FF" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
