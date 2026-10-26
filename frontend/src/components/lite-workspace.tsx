"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getLiteResult, recommendCompany, researchCompany, type LiteResult } from "@/lib/lite-api";

function Timestamp({ value }: { value: string }) {
  const date = new Date(value);
  return <time dateTime={value}>{Number.isNaN(date.getTime()) ? value : date.toLocaleString("zh-CN")}</time>;
}

function ErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "暂时无法完成，请稍后重试。";
}

export function LiteWorkspace({ resultId }: { resultId?: string }) {
  const [companyName, setCompanyName] = useState("");
  const [file, setFile] = useState<File>();
  const [result, setResult] = useState<LiteResult | null>(null);
  const [busy, setBusy] = useState<"restore" | "research" | "recommend" | null>(resultId ? "restore" : null);
  const [error, setError] = useState<string | null>(null);
  const [supplement, setSupplement] = useState(false);
  const loadedId = useRef<string>();
  const requestEpoch = useRef(0);
  const mounted = useRef(true);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (loadedId.current === resultId) return;
    const epoch = ++requestEpoch.current;
    loadedId.current = undefined;
    if (!resultId) {
      setResult(null);
      setCompanyName("");
      setFile(undefined);
      setSupplement(false);
      setError(null);
      setBusy(null);
      return;
    }
    let cancelled = false;
    setBusy("restore");
    setError(null);
    setResult(null);
    getLiteResult(resultId).then((saved) => {
      if (cancelled || epoch !== requestEpoch.current) return;
      loadedId.current = saved.id;
      setResult(saved);
      setCompanyName(saved.company_name);
      setSupplement(false);
    }).catch((cause: unknown) => {
      if (!cancelled && epoch === requestEpoch.current) setError(ErrorMessage(cause));
    }).finally(() => {
      if (!cancelled && epoch === requestEpoch.current) setBusy(null);
    });
    return () => { cancelled = true; };
  }, [resultId]);

  function acceptResult(next: LiteResult) {
    loadedId.current = next.id;
    setResult(next);
    setCompanyName(next.company_name);
    setSupplement(false);
    setFile(undefined);
    const url = new URL(window.location.href);
    url.searchParams.set("id", next.id);
    window.history.replaceState(null, "", url.pathname + url.search);
  }

  async function submitResearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const name = companyName.trim();
    if (!name) {
      setError("请填写公司工商全称。");
      return;
    }
    const epoch = ++requestEpoch.current;
    setBusy("research");
    setError(null);
    try {
      const next = await researchCompany(name, file);
      if (mounted.current && epoch === requestEpoch.current) acceptResult(next);
    } catch (cause) {
      if (mounted.current && epoch === requestEpoch.current) setError(ErrorMessage(cause));
    } finally {
      if (mounted.current && epoch === requestEpoch.current) setBusy(null);
    }
  }

  async function submitRecommendation() {
    if (busy || result?.status !== "profile_ready") return;
    const epoch = ++requestEpoch.current;
    setBusy("recommend");
    setError(null);
    try {
      const next = await recommendCompany(result.id);
      if (mounted.current && epoch === requestEpoch.current) acceptResult(next);
    } catch (cause) {
      if (mounted.current && epoch === requestEpoch.current) setError(ErrorMessage(cause));
    } finally {
      if (mounted.current && epoch === requestEpoch.current) setBusy(null);
    }
  }

  function openSupplement() {
    setCompanyName(result?.company_name ?? companyName);
    setSupplement(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      formRef.current?.querySelector<HTMLInputElement>("input[type=file]")?.focus();
    });
  }

  const fullHref = `/assessment?company_name=${encodeURIComponent(result?.company_name ?? companyName.trim())}`;
  const showInput = !result || supplement;
  const recommendation = result?.status === "complete" ? result.recommendation : null;
  const stage = busy === "research" ? 1 : recommendation ? 3 : result ? 2 : 0;

  return (
    <div className="space-y-6">
      <ol aria-label="精简版流程" className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {["填写公司信息", "联网生成画像", "确认画像与建议", "查看结果"].map((label, index) => (
          <li key={label} aria-current={stage === index ? "step" : undefined}
            className={`rounded-xl border p-3 ${stage === index ? "border-warm-accent bg-warm-inset text-warm-text" : "border-warm-border text-warm-muted"}`}>
            <span className="mr-2 font-semibold">{index + 1}</span>{label}
          </li>
        ))}
      </ol>

      {showInput && busy !== "restore" && (
        <form ref={formRef} onSubmit={submitResearch} className="rounded-2xl border border-warm-border bg-white p-6 sm:p-8">
          <h2 className="font-heading text-2xl font-bold text-warm-text">{supplement ? "补充公司资料" : "从公司名称开始"}</h2>
          <p className="mt-2 text-sm leading-6 text-warm-secondary">只需填写公司工商全称。系统先搜集公开资料、整理企业画像，待你确认后再生成 AI 创新建议。</p>
          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="lite-company-name" className="mb-2 block text-sm font-medium text-warm-text">公司工商全称 <span className="text-warm-accent">（必填）</span></label>
              <input id="lite-company-name" className="input-field w-full" required maxLength={200}
                autoComplete="organization" value={companyName} disabled={Boolean(busy)}
                placeholder="例如：某某科技有限公司"
                onChange={(event) => setCompanyName(event.target.value)} />
            </div>
            <div>
              <label htmlFor="lite-company-file" className="mb-2 block text-sm font-medium text-warm-text">公司资料（选填）</label>
              <input id="lite-company-file" type="file" className="input-field w-full" disabled={Boolean(busy)}
                accept=".pdf,.docx,.txt,.md"
                aria-describedby="lite-file-help"
                onChange={(event) => setFile(event.target.files?.[0])} />
              <p id="lite-file-help" className="mt-2 text-xs text-warm-muted">可上传公司介绍、业务说明或年报（PDF、DOCX、TXT、Markdown）。</p>
            </div>
            <button type="submit" className="btn-primary disabled:cursor-wait disabled:opacity-60" disabled={Boolean(busy) || !companyName.trim()}>
              {busy === "research" ? "正在搜集公开信息…" : "联网生成企业画像"}
            </button>
          </div>
        </form>
      )}

      {busy && (
        <div role="status" aria-live="polite" className="rounded-2xl border border-warm-border bg-warm-inset p-6">
          <p className="font-semibold text-warm-text">
            {busy === "restore" ? "正在读取已保存的结果…" : busy === "research" ? "正在搜集信息并生成企业画像…" : "正在根据已确认画像生成建议…"}
          </p>
          <p className="mt-2 text-sm text-warm-secondary">{busy === "restore" ? "读取完成后可继续原有步骤。" : "预计 1–2 分钟，实际时间取决于资料量与网络状况，请稍候。"}</p>
        </div>
      )}

      {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

      {result && busy !== "research" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-warm-border bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="badge badge-accent">企业画像</span>
                <h2 className="mt-3 font-heading text-2xl font-bold text-warm-text">{result.company_name}</h2>
              </div>
              <div className="space-y-1 text-xs text-warm-muted">
                <p>版本：<span>{result.version}</span></p>
                <p>AI 生成时间：<Timestamp value={result.generated_at} /></p>
                {result.profile_generated_at && <p>画像生成时间：<Timestamp value={result.profile_generated_at} /></p>}
              </div>
            </div>
            {result.cache_hit && <p className="mt-4 rounded-lg bg-warm-inset p-3 text-sm text-warm-secondary">已复用该公司 7 天内的已保存结果，本次未重新检索公开信息。</p>}
            {result.profile && (
              <div className="mt-5 space-y-5">
                <p className="leading-7 text-warm-secondary">{result.profile.summary}</p>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  {[["所属行业", result.profile.industry], ["主营业务", result.profile.main_business], ["企业规模", result.profile.scale], ["所在地区", result.profile.region], ["近期动态", result.profile.recent_developments]].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-warm-inset p-4"><dt className="text-warm-muted">{label}</dt><dd className="mt-1 leading-6 text-warm-text">{value || "公开资料未披露"}</dd></div>
                  ))}
                </dl>
                {result.profile.missing_information.length > 0 && <div className="text-sm text-warm-secondary"><h3 className="font-semibold">仍待补充的信息</h3><ul className="mt-2 list-disc space-y-1 pl-5">{result.profile.missing_information.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
              </div>
            )}
            {result.warnings.length > 0 && <ul className="mt-5 list-disc space-y-2 rounded-xl bg-warm-inset p-5 pl-10 text-sm text-warm-secondary">{result.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul>}

            {result.status === "insufficient" && <div className="mt-6 rounded-xl border border-warm-border p-5"><h3 className="text-lg font-semibold text-warm-text">公开信息不足</h3><p className="mt-2 text-sm leading-6 text-warm-secondary">当前资料不足以支持可靠建议。请补充公司资料，或转到完整版填写问卷，继续完善分析依据。</p></div>}
            {result.status === "failed" && <div role="alert" className="mt-6 text-sm text-destructive">本次分析未完成，请查看提示后补充资料重试，或转到完整版。</div>}
            <div className="mt-6 flex flex-wrap gap-3">
              {result.status === "profile_ready" && <button type="button" className="btn-primary disabled:opacity-60" disabled={Boolean(busy)} onClick={submitRecommendation}>{busy === "recommend" ? "正在生成建议…" : "确认画像并生成建议"}</button>}
              <button type="button" className="btn-secondary disabled:opacity-60" disabled={Boolean(busy)} onClick={openSupplement}>补充公司资料</button>
              <Link href={fullHref} className="btn-secondary">转到完整版</Link>
            </div>
          </section>

          {recommendation && (
            <section aria-label="精简版分析结果" className="space-y-6 rounded-2xl border border-warm-border bg-white p-6 sm:p-8">
              <div><h2 className="font-heading text-xl font-bold text-warm-text">1. 企业现状</h2><p className="mt-3 leading-7 text-warm-secondary">{recommendation.current_situation}</p></div>
              <section aria-label="AI 创新方向"><h2 className="font-heading text-xl font-bold text-warm-text">2. AI 创新方向</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{recommendation.directions.map((direction, index) => (
                <article key={index} className="rounded-xl border border-warm-border p-5">
                  <h3 className="font-semibold text-warm-text">{direction.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-warm-secondary"><span className="font-medium">推荐依据：</span>{direction.rationale}</p>
                </article>
              ))}</div></section>
              <section aria-label="各方向可行性与资源"><h2 className="font-heading text-xl font-bold text-warm-text">3. 各方向可行性与资源</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{recommendation.directions.map((direction, index) => (
                <article key={index} className="rounded-xl border border-warm-border p-5">
                  <h3 className="font-semibold text-warm-text">{direction.title}：可行性与资源</h3>
                  <p className="mt-2 text-sm leading-6 text-warm-secondary"><span className="font-medium">可行性：</span>{direction.feasibility}</p>
                  <p className="mt-3 text-sm font-medium text-warm-text">所需资源</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-warm-secondary">{direction.resources.map((resource, i) => <li key={i}>{resource}</li>)}</ul>
                </article>
              ))}</div></section>
              <div><h2 className="font-heading text-xl font-bold text-warm-text">4. 下一步行动</h2><ol className="mt-3 list-decimal space-y-2 pl-5 leading-7 text-warm-secondary">{recommendation.next_steps.map((step, i) => <li key={i}>{step}</li>)}</ol></div>
              <div className="rounded-xl bg-warm-inset p-5"><h2 className="font-heading text-xl font-bold text-warm-text">风险与局限</h2><ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-warm-secondary">{recommendation.risks.map((risk, i) => <li key={i}>{risk}</li>)}</ul><p className="mt-3 text-sm text-warm-muted">AI 建议基于当前可得资料，实施前请核实企业实际情况、数据权限与成本收益。</p></div>
            </section>
          )}

          <section className="rounded-2xl border border-warm-border bg-white p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold text-warm-text">信息来源</h2>
            <p className="mt-2 text-sm text-warm-muted">可查看原始页面与检索时保留的摘录，核对画像依据。</p>
            <ul className="mt-5 space-y-5">
              {result.sources.map((source, index) => (
                <li key={`${source.url}-${index}`} className="border-t border-warm-border pt-4">
                  {/^https?:\/\//i.test(source.url)
                    ? <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-medium text-warm-accent underline underline-offset-4">{source.title || source.url}</a>
                    : <span className="font-medium text-warm-text">{source.title || "上传资料"}</span>}
                  <p className="mt-1 break-all text-xs text-warm-muted">{source.url}</p>
                  <p className="mt-2 text-sm leading-6 text-warm-secondary">{source.excerpt}</p>
                  <p className="mt-2 text-xs text-warm-muted">检索时间：<Timestamp value={source.retrieved_at} /> · {source.kind === "upload" ? "用户提供资料" : "公开资料"}</p>
                </li>
              ))}
            </ul>
            {result.sources.length === 0 && <p className="mt-4 text-sm text-warm-secondary">尚无可用来源，请补充资料。</p>}
          </section>
        </div>
      )}
    </div>
  );
}
