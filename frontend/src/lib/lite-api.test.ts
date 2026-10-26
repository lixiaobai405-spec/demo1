import { afterEach, describe, expect, it, vi } from "vitest";
import { researchCompany, getLiteResult, recommendCompany } from "@/lib/lite-api";

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

describe("lite API boundary", () => {
  it("sends authenticated multipart input with an optional document", async () => {
    localStorage.setItem("auth_token", "test-token");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "lite-1" })));
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["test"], "company.txt");
    await researchCompany("测试有限公司", file);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/lite\/research$/);
    expect(init.headers.Authorization).toBe("Bearer test-token");
    expect(init.headers["Content-Type"]).toBeUndefined();
    expect(init.body.get("company_name")).toBe("测试有限公司");
    expect(init.body.get("file")).toBe(file);
  });

  it("does not automatically replay a research request after an ambiguous network failure", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("network failed"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(researchCompany("测试有限公司")).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("addresses the exact saved result for reading and recommendation", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    await getLiteResult("id with space");
    await recommendCompany("id with space");
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/lite\/id%20with%20space$/);
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/api\/lite\/id%20with%20space\/recommend$/);
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");
  });
});
