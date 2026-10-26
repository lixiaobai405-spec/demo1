# Business innovation lite — approved execution scope

User goal: retain the full consulting workflow and add a company-name-first public-evidence assessment. User authorized autonomous implementation on 2026-10-26; this document records implementation decisions, not a new approval gate.

## Composition decision
- SQLite is the acceptance authority for public research cache, each user's frozen profile, recommendations, status, timestamps and version. Frontend renders this state only.
- A company-normalized public cache contains public evidence only; uploaded company material stays in that user's assessment. Never share private uploads through the company cache.
- Research accepts HTTP evidence first, freezes a profile second; recommendation consumes that persisted profile. It cannot skip insufficient evidence or regenerate a different profile invisibly.
- Public cache lasts seven days and survives service recreation/restart. A database lease serializes concurrent search claims. A pending/expired lease is not a successful result.
- At least two distinct relevant public source URLs are required for a normal recommendation. Missing facts are explicit, no invented sources or company claims. Uploads can supplement facts but are not counted as public sources.
- Source text is untrusted data. Fetches accept only public HTTP(S) targets, validate every redirect, pin the validated DNS address, bound response size, time and redirects, and strip executable markup.
- Full assessment, reports, payments, exports and follow-up stay on existing paths. Entry adds a version choice; upgrade pre-fills company name only.

## Approach
Use existing FastAPI/SQLAlchemy/auth and Next.js components. Add additive lite models/routes/service, a small public-search adapter (Bing RSS / DuckDuckGo fallback, optional Brave key), and existing intake file text extraction. Default mock LLM mode builds conservative, evidence-cited profiles and advice from real public content; it never invents mock sources. Live LLM is optional and constrained by the same source/shape gates.

## User flow
/start selects 精简版 or 完整版. /lite accepts legal company name and optional document; research shows a bounded duration hint. Profile review precedes recommendation. Result has current situation, two to three directions with feasibility/resources, next steps, and risks, plus sources, AI generation time/version and cache provenance. Insufficient public evidence displays 公开信息不足 and offers supplement and full upgrade. Query id restores persisted results.

## Self-review / counterexamples
An in-memory cache would pass one-request tests yet search again after restart: test a fresh SQLAlchemy engine/service. A full-company cache containing uploaded text leaks across users: keep uploads only in the user-owned snapshot. DNS validation followed by ordinary hostname connection permits rebinding: connect to validated IP with original TLS SNI. Existing full-chain tests passing do not prove public search: separately capture one real public research run without production writes.

## Completion
Backend boundary tests, frontend interaction tests, frontend typecheck/build, full backend regression and isolated live public-search evidence, followed by independent review and exact Git diff review. Report all environmental failures explicitly.
