import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("protected assessment navigation", () => {
  it("preserves the full company-name query before the client auth guard runs", () => {
    const request = new NextRequest("http://localhost:3001/assessment?company_name=Demo%20Company");
    const response = middleware(request);
    const redirect = new URL(response.headers.get("location")!);
    expect(redirect.pathname).toBe("/login");
    expect(redirect.searchParams.get("redirect")).toBe("/assessment?company_name=Demo%20Company");
  });

  it("protects a lite result while preserving its identity through login", () => {
    const response = middleware(new NextRequest("http://localhost:3001/lite?id=saved-result"));
    const location = response.headers.get("location");
    expect(location).not.toBeNull();
    expect(new URL(location!).searchParams.get("redirect")).toBe("/lite?id=saved-result");
  });
});
