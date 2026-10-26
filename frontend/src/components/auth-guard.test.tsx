import React from "react";
import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthGuard } from "@/components/auth-guard";
const replace = vi.fn();
afterEach(() => { vi.unstubAllGlobals(); });
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/providers/auth-provider", () => ({ useAuth: () => ({ isAuthenticated: false, isLoading: false }) }));

describe("AuthGuard", () => {
  it("preserves a saved result or company-name query through login", async () => {
    vi.stubGlobal("React", React);
    window.history.replaceState({}, "", "/lite?id=saved-result");
    render(<AuthGuard><p>Protected</p></AuthGuard>);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?redirect=%2Flite%3Fid%3Dsaved-result"));
  });
});
