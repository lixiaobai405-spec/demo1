import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LiteWorkspace } from "@/components/lite-workspace";
import { getLiteResult, researchCompany, recommendCompany } from "@/lib/lite-api";
import type { LiteResult } from "@/lib/lite-api";

vi.mock("@/lib/lite-api", () => ({
  getLiteResult: vi.fn(), researchCompany: vi.fn(), recommendCompany: vi.fn(),
}));

const profile: LiteResult = {
  id: "lite-1", company_name: "测试科技有限公司", status: "profile_ready",
  version: "lite-v1", generated_at: "2026-10-26T08:00:00Z",
  profile_generated_at: "2026-10-26T08:00:00Z", cache_hit: false,
  sources: [
    { url: "https://example.com/company", title: "企业官网", excerpt: "公司提供企业软件服务。", retrieved_at: "2026-10-26T07:59:00Z", kind: "web" },
    { url: "https://example.org/news", title: "行业新闻", excerpt: "新增研发中心。", retrieved_at: "2026-10-26T07:59:00Z", kind: "web" },
  ],
  profile: { industry: "软件", main_business: "企业软件", scale: "规模未披露", region: "上海", recent_developments: "新增研发中心", summary: "专注企业软件服务。", missing_information: ["营收未披露"] },
  recommendation: null, warnings: [],
};
const complete: LiteResult = {
  ...profile, status: "complete",
  recommendation: {
    current_situation: "先从已有客户服务流程开始。",
    directions: [
      { title: "客服知识助手", rationale: "已有服务知识积累", feasibility: "先做内部试点", resources: ["服务文档", "业务负责人"] },
      { title: "销售线索分析", rationale: "缩短线索筛选周期", feasibility: "需要确认 CRM 数据质量", resources: ["CRM 数据"] },
    ],
    next_steps: ["确认试点负责人", "收集样本并设定指标"],
    risks: ["公开信息可能滞后", "需验证数据权限"],
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/lite");
});

describe("LiteWorkspace", () => {
  it("requires only the company name and stops for profile confirmation", async () => {
    vi.mocked(researchCompany).mockResolvedValue(profile);
    render(<LiteWorkspace />);
    expect(screen.getByLabelText(/公司工商全称/)).toBeRequired();
    expect(screen.getByLabelText(/公司资料/)).not.toBeRequired();
    fireEvent.change(screen.getByLabelText(/公司工商全称/), { target: { value: "  测试科技有限公司  " } });
    fireEvent.click(screen.getByRole("button", { name: "联网生成企业画像" }));
    expect(await screen.findByText("专注企业软件服务。")).toBeInTheDocument();
    expect(researchCompany).toHaveBeenCalledWith("测试科技有限公司", undefined);
    expect(recommendCompany).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "确认画像并生成建议" })).toBeEnabled();
    expect(window.location.search).toBe("?id=lite-1");
    expect(screen.getByRole("link", { name: "企业官网" })).toHaveAttribute("href", "https://example.com/company");
  });

  it("shows estimated time while researching, then renders all four result sections", async () => {
    let resolveResearch!: (value: LiteResult) => void;
    vi.mocked(researchCompany).mockReturnValue(new Promise((resolve) => { resolveResearch = resolve; }));
    vi.mocked(recommendCompany).mockResolvedValue(complete);
    render(<LiteWorkspace />);
    fireEvent.change(screen.getByLabelText(/公司工商全称/), { target: { value: profile.company_name } });
    fireEvent.click(screen.getByRole("button", { name: "联网生成企业画像" }));
    expect(screen.getByRole("status")).toHaveTextContent("预计 1–2 分钟");
    expect(screen.getByRole("button", { name: /正在搜集/ })).toBeDisabled();
    await act(async () => { resolveResearch(profile); });
    fireEvent.click(screen.getByRole("button", { name: "确认画像并生成建议" }));
    expect(await screen.findByRole("heading", { name: "风险与局限" })).toBeInTheDocument();
    const analysis = screen.getByRole("region", { name: "精简版分析结果" });
    expect(within(analysis).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual([
      "1. 企业现状",
      "2. AI 创新方向",
      "3. 各方向可行性与资源",
      "4. 下一步行动",
      "风险与局限",
    ]);
    const directions = within(analysis).getByRole("region", { name: "AI 创新方向" });
    expect(within(directions).getByText(/已有服务知识积累/)).toBeInTheDocument();
    expect(within(directions).queryByText(/先做内部试点/)).not.toBeInTheDocument();
    const feasibility = within(analysis).getByRole("region", { name: "各方向可行性与资源" });
    expect(within(feasibility).getByText(/先做内部试点/)).toBeInTheDocument();
    expect(within(feasibility).getByText("服务文档")).toBeInTheDocument();
    expect(within(feasibility).getByText(/需要确认 CRM 数据质量/)).toBeInTheDocument();
    expect(within(feasibility).getByText("CRM 数据")).toBeInTheDocument();
    expect(screen.getByText("公开信息可能滞后")).toBeInTheDocument();
    expect(screen.getByText("lite-v1")).toBeInTheDocument();
    expect(screen.getByText(/AI 生成时间/)).toBeInTheDocument();
  });

  it("restores an insufficient result and offers upload or full with company name", async () => {
    vi.mocked(getLiteResult).mockResolvedValue({ ...profile, status: "insufficient", warnings: ["有效公开来源不足两处"] });
    render(<LiteWorkspace resultId="lite-1" />);
    expect(await screen.findByRole("heading", { name: "公开信息不足" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "确认画像并生成建议" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "转到完整版" })).toHaveAttribute("href", `/assessment?company_name=${encodeURIComponent(profile.company_name)}`);
    fireEvent.click(screen.getByRole("button", { name: "补充公司资料" }));
    expect(screen.getByLabelText(/公司工商全称/)).toHaveValue(profile.company_name);
    const file = new File(["业务介绍"], "company.txt", { type: "text/plain" });
    fireEvent.change(screen.getByLabelText(/公司资料/), { target: { files: [file] } });
    vi.mocked(researchCompany).mockResolvedValue(profile);
    fireEvent.click(screen.getByRole("button", { name: "联网生成企业画像" }));
    await waitFor(() => expect(researchCompany).toHaveBeenCalledWith(profile.company_name, file));
    expect(recommendCompany).not.toHaveBeenCalled();
  });

  it("restores a completed cached result without starting any generation", async () => {
    vi.mocked(getLiteResult).mockResolvedValue({ ...complete, cache_hit: true });
    render(<LiteWorkspace resultId="lite-1" />);
    expect(await screen.findByText("客服知识助手")).toBeInTheDocument();
    expect(screen.getByText(/7 天内/)).toBeInTheDocument();
    expect(researchCompany).not.toHaveBeenCalled();
    expect(recommendCompany).not.toHaveBeenCalled();
  });

  it("keeps the profile visible after recommendation failure for explicit retry", async () => {
    vi.mocked(getLiteResult).mockResolvedValue(profile);
    vi.mocked(recommendCompany).mockRejectedValue(new Error("暂时无法生成建议"));
    render(<LiteWorkspace resultId="lite-1" />);
    fireEvent.click(await screen.findByRole("button", { name: "确认画像并生成建议" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("暂时无法生成建议");
    expect(screen.getByText("专注企业软件服务。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "确认画像并生成建议" })).toBeEnabled();
  });

  it("ignores an old recommendation response after navigating to another saved company", async () => {
    let resolveRecommendation!: (value: LiteResult) => void;
    vi.mocked(getLiteResult).mockResolvedValueOnce(profile).mockResolvedValueOnce({
      ...complete, id: "lite-2", company_name: "另一家公司有限公司",
    });
    vi.mocked(recommendCompany).mockReturnValue(new Promise((resolve) => { resolveRecommendation = resolve; }));
    const view = render(<LiteWorkspace resultId="lite-1" />);
    fireEvent.click(await screen.findByRole("button", { name: "确认画像并生成建议" }));
    view.rerender(<LiteWorkspace resultId="lite-2" />);
    expect(await screen.findByRole("heading", { name: "另一家公司有限公司" })).toBeInTheDocument();
    await act(async () => { resolveRecommendation(complete); });
    expect(screen.getByRole("heading", { name: "另一家公司有限公司" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: profile.company_name })).not.toBeInTheDocument();
  });

  it("clears the saved result when returning to a fresh lite page", async () => {
    vi.mocked(getLiteResult).mockResolvedValue(complete);
    const view = render(<LiteWorkspace resultId="lite-1" />);
    expect(await screen.findByText("客服知识助手")).toBeInTheDocument();
    view.rerender(<LiteWorkspace />);
    expect(screen.queryByText("客服知识助手")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/公司工商全称/)).toHaveValue("");
  });

  it("does not invent a result when restoration fails", async () => {
    vi.mocked(getLiteResult).mockRejectedValue(new Error("结果不存在"));
    render(<LiteWorkspace resultId="missing" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("结果不存在");
    expect(screen.queryByRole("button", { name: "确认画像并生成建议" })).not.toBeInTheDocument();
    expect(researchCompany).not.toHaveBeenCalled();
  });
});
