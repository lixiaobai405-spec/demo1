import React from "react";

import { Badge } from "@/components/ui/badge";

const MODE_LABELS: Record<string, string> = {
  mock: "模拟生成",
  live: "真实生成",
  llm: "AI 生成",
  rule_based: "规则生成",
  rule_based_v1: "规则生成",
  four_quadrant_v1: "四象限评分",
  manual_edit: "人工修订",
  template: "模板生成",
};

export function GenerationMetadata({
  generationMode,
  generatedAt,
}: {
  generationMode: string | null;
  generatedAt?: string | null;
}) {
  // SQLite stores UTC datetimes without an offset; preserve explicit offsets.
  const timestamp = generatedAt && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(generatedAt)
    ? `${generatedAt}Z`
    : generatedAt;
  const date = timestamp ? new Date(timestamp) : null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <Badge variant={generationMode === "live" || generationMode === "llm" ? "success" : "accent"}>
        {MODE_LABELS[generationMode ?? ""] ?? "未标注"}
      </Badge>
      <span>报告格式版本：完整版 v1</span>
      <span>
        生成时间：
        {timestamp ? (
          <time dateTime={timestamp}>
            {date && !Number.isNaN(date.getTime()) ? date.toLocaleString("zh-CN") : timestamp}
          </time>
        ) : "未记录"}
      </span>
    </div>
  );
}
