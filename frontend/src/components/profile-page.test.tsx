import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "@/app/assessment/[assessmentId]/profile/page";

vi.stubGlobal("React", React);
const pending = vi.hoisted(() => ({ canvas: false }));

vi.mock("react", async () => ({
  ...await vi.importActual<typeof import("react")>("react"),
  use: <T,>(value: T) => value,
}));
vi.mock("@/components/sync-feedback-panel", () => ({ SyncFeedbackPanel: () => null }));
vi.mock("@/hooks", () => ({
  useGenerateCanvas: () => ({ mutateAsync: vi.fn(), isPending: pending.canvas }),
  useAssessmentDetail: () => ({
    isLoading: false, isError: false,
    data: {
      assessment: {
        company_name: "测试企业", industry: "制造业",
        profile_generation_mode: "mock", profile_generated_at: "2026-10-26T08:00:00Z",
        created_at: "2026-10-25T08:00:00Z",
      },
      company_profile: {
        company_name: "测试企业", company_summary: "企业概览", value_proposition: "价值主张",
        customer_and_market: "客户市场", operations_and_resources: "运营资源",
        digital_and_ai_readiness: "AI 准备度", key_challenges: [], priority_ai_directions: [],
        missing_information: [],
      },
      canvas_diagnosis: null,
    },
  }),
}));

describe("profile page provenance", () => {
  beforeEach(() => { pending.canvas = false; });

  it("shows an estimate when the profile page generates a canvas", () => {
    pending.canvas = true;
    render(<ProfilePage params={{ assessmentId: "assessment-1" } as unknown as Promise<{ assessmentId: string }>} />);
    expect(screen.getByRole("status")).toHaveTextContent("预计 1–2 分钟");
  });
  it("uses the assessment's saved generation mode and profile time", () => {
    render(<ProfilePage params={{ assessmentId: "assessment-1" } as unknown as Promise<{ assessmentId: string }>} />);

    expect(screen.getByText("模拟生成")).toBeInTheDocument();
    expect(document.querySelector("time")).toHaveAttribute("dateTime", "2026-10-26T08:00:00Z");
  });
});
