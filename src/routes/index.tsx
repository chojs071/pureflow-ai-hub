import { createFileRoute } from "@tanstack/react-router";
import App from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PureFlow AI — 반도체 초순수(UPW) 최적화 시스템" },
      {
        name: "description",
        content: "AI 기반 반도체 제조 공정 초순수 최적화 시스템 및 ESG 모니터링",
      },
      { property: "og:title", content: "PureFlow AI — 반도체 초순수(UPW) 최적화 시스템" },
      {
        property: "og:description",
        content: "품질은 유지하고, 불필요한 UPW 사용은 줄입니다.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});
