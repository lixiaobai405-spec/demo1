import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AssessmentWorkspace } from "@/components/assessment-workspace";
import { useAssessmentStore } from "@/stores/assessment-store";
import type { AssessmentResponse } from "@/lib/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/assessment-form-section", () => ({ AssessmentFormSection: () => null }));
vi.mock("@/hooks", async () => {
  const actual = await vi.importActual<typeof import("@/hooks")>("@/hooks");
  const idle = () => ({ mutateAsync: vi.fn(), isPending: false });
  return {
    ...actual,
    useAssessmentDetail: () => ({ data: undefined, isLoading: false }),
    useIntakeSession: () => ({ data: undefined }),
    useGenerateProfile: () => ({ mutateAsync: vi.fn(), isPending: true }),
    useGenerateCanvas: idle, useExpandDirections: idle, useSelectDirections: idle,
    useGenerateScenarios: idle, useGenerateCompetitiveness: idle, useGenerateEndgame: idle,
  };
});

describe("assessment workspace generation", () => {
  beforeEach(() => {
    useAssessmentStore.getState().resetAll();
    useAssessmentStore.getState().setAssessment({
      id: "assessment-1", company_name: "测试企业", industry: "制造业",
      company_size: "", region: "", annual_revenue_range: "", core_products: "",
      target_customers: "", current_challenges: "", ai_goals: "", available_data: "",
      notes: null, class_group: null, instructor_comment: null, has_profile: false,
      profile_generation_mode: null, profile_generated_at: null,
      created_at: "2026-10-26T08:00:00Z", updated_at: "2026-10-26T08:00:00Z",
    } satisfies AssessmentResponse);
  });

  afterEach(() => {
    cleanup();
    useAssessmentStore.getState().resetAll();
  });

  it("keeps an estimated wait visible while a full profile is generating", () => {
    const client = new QueryClient();
    render(<QueryClientProvider client={client}><AssessmentWorkspace assessmentId="assessment-1" /></QueryClientProvider>);

    expect(screen.getByRole("status")).toHaveTextContent("正在生成企业画像");
    expect(screen.getByRole("status")).toHaveTextContent("预计 1–2 分钟");
  });
});
