import { describe, expect, it } from "vitest";
import { createInitialAssessmentForm } from "@/lib/assessment-utils";

describe("full assessment initial company name", () => {
  it("carries the trimmed company name into an otherwise blank questionnaire", () => {
    const form = createInitialAssessmentForm({ companyName: "  测试有限公司  " });
    expect(form.company_name).toBe("测试有限公司");
    expect(form.industry).toBe("");
  });
  it("leaves an import session authoritative over the company-name hint", () => {
    expect(createInitialAssessmentForm({ companyName: "提示名称", prefillSessionId: "session-1" }).company_name).toBe("");
  });
  it("does not seed an existing assessment from a URL company name", () => {
    expect(createInitialAssessmentForm({ companyName: "提示名称", assessmentId: "assessment-1" }).company_name).toBe("");
  });
});
