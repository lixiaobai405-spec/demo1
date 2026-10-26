import { request } from "@/lib/api";

export interface LiteResult {
  id: string;
  company_name: string;
  status: "profile_ready" | "insufficient" | "complete" | "failed";
  version: string;
  generated_at: string;
  profile_generated_at: string | null;
  cache_hit: boolean;
  sources: Array<{ url: string; title: string; excerpt: string; retrieved_at: string; kind: string }>;
  profile: {
    industry: string;
    main_business: string;
    scale: string;
    region: string;
    recent_developments: string;
    summary: string;
    missing_information: string[];
  } | null;
  recommendation: {
    current_situation: string;
    directions: Array<{ title: string; rationale: string; feasibility: string; resources: string[] }>;
    next_steps: string[];
    risks: string[];
  } | null;
  warnings: string[];
}

export function researchCompany(companyName: string, file?: File): Promise<LiteResult> {
  const body = new FormData();
  body.append("company_name", companyName);
  if (file) body.append("file", file);
  // A lost response does not establish whether the server completed the research.
  // Only the user may explicitly retry this potentially chargeable operation.
  return request<LiteResult>("/api/lite/research", { method: "POST", body }, 0);
}

export function getLiteResult(id: string): Promise<LiteResult> {
  return request<LiteResult>(`/api/lite/${encodeURIComponent(id)}`);
}

export function recommendCompany(id: string): Promise<LiteResult> {
  return request<LiteResult>(`/api/lite/${encodeURIComponent(id)}/recommend`, { method: "POST" }, 0);
}
