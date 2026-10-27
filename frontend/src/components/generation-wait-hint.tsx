import React from "react";

export function GenerationWaitHint({
  label = "正在生成分析结果",
}: {
  label?: string;
}) {
  return (
    <p role="status" aria-live="polite" className="mt-4 w-full rounded-xl bg-warm-inset p-4 text-sm leading-7 text-warm-secondary">
      {label}…预计 1–2 分钟，实际时间取决于资料量与网络状况，请稍候。
    </p>
  );
}
