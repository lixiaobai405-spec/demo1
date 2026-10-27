import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReportExportActions } from "@/app/assessment/[assessmentId]/results/report-export-actions";
import { downloadReportExport, generateAssessmentReport } from "@/lib/api";
import type { ReportDocumentResponse } from "@/lib/types";

vi.stubGlobal("React", React);
vi.mock("@/hooks/use-toast", () => ({ toast: vi.fn() }));
vi.mock("@/lib/api", () => ({
  generateAssessmentReport: vi.fn(), downloadReportExport: vi.fn(),
  openReportPrintPage: vi.fn(), formatMutationError: vi.fn(),
}));

describe("report export action waiting state", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("shows an estimate during report generation and removes it on completion", async () => {
    let finish!: (value: ReportDocumentResponse) => void;
    vi.mocked(generateAssessmentReport).mockReturnValue(new Promise((resolve) => { finish = resolve; }) as ReturnType<typeof generateAssessmentReport>);
    render(<ReportExportActions assessmentId="assessment-1" />);
    fireEvent.click(screen.getByRole("button", { name: "生成导出报告" }));
    const status = screen.queryByRole("status");
    await act(async () => finish({ report_id: "report-1" } as ReportDocumentResponse));

    expect(status).toHaveTextContent("预计 1–2 分钟");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "下载 PDF" })).toBeInTheDocument();
  });

  it("does not label a file download as AI generation", async () => {
    vi.mocked(downloadReportExport).mockResolvedValue(undefined);
    render(<ReportExportActions assessmentId="assessment-1" initialReportId="report-1" />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "下载 PDF" })));

    expect(downloadReportExport).toHaveBeenCalledWith("report-1", "pdf");
    expect(screen.queryByText(/预计 1–2 分钟/)).not.toBeInTheDocument();
  });
});
