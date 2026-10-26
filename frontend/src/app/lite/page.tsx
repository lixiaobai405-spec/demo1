"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { LiteWorkspace } from "@/components/lite-workspace";
import styles from "@/components/lite-theme.module.css";

function LitePageContent() {
  const searchParams = useSearchParams();
  const resultId = searchParams.get("id")?.trim() || undefined;
  return <LiteWorkspace resultId={resultId} />;
}

export default function LitePage() {
  return (
    <AuthGuard>
      <main className={`${styles.theme} min-h-screen px-6 py-10`}>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <section className="page-header space-y-4">
            <Link href="/start" className="btn-secondary text-xs">返回版本选择</Link>
            <span className="badge badge-accent">精简版 · 企业画像与 AI 创新建议</span>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-warm-text">发现企业的 AI 创新机会</h1>
            <p className="text-base leading-7 text-warm-secondary">先了解企业，再选择行动方向。所有建议均保留资料依据与生成信息。</p>
          </section>
          <Suspense fallback={<p role="status">正在加载精简版…</p>}>
            <LitePageContent />
          </Suspense>
        </div>
      </main>
    </AuthGuard>
  );
}
