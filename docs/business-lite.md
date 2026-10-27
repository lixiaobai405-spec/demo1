# Business innovation lite

## Adversarial follow-up — 2026-10-27

The four reproduced extraction failures are corrected at the existing evidence/profile boundary: explicit mother-company/competitor subjects do not supply target facts; undisclosed clauses do not establish known business/scale; event dates are read from the event clause rather than a later archival clause. New results identify this extraction revision as `lite-1.1-extractive`. Normal subject-omitted uploads and business objects such as competitor-analysis software remain usable. Public-cache hits revalidate cached sources and rebuild the profile, so no cache migration is needed; historical assessment snapshots remain frozen.

Backend verification on the corrected source: 250 passed, 2 existing skips, with an isolated database and a fresh `--basetemp` under `E:/codex-acceptance/optimization-20261027/`. The earlier run's 38 setup errors were permissions on the shared Windows temporary directory; all passed using the task-owned directory. The frozen 15-case adversarial replay now has13 PASS and2 PARTIAL (syndication independence and the old schema-only full-metadata probe). All four failing extraction cases now pass; the original audit artifacts are retained.

Full result pages project saved generation mode and module timestamps, preferring `updated_at` on regeneration. The profile uses its dedicated `profile_generated_at`; direction timestamps are projected from the existing database row into POST/GET/detail responses without a database migration. Naive ISO datetimes from the UTC database convention are interpreted as UTC; explicit offsets are retained. “报告格式版本：完整版 v1” identifies the product format, not a historical model/build version. Unknown generation mode is shown as unmarked rather than real.

Final frontend: 29 files / 80 tests, typecheck and production build passed. Ten existing full generation entry points share a presentation-only ETA; save/download/confirmation and immediate rule scoring are excluded. The build has a durable exit-zero/quiescent receipt at `E:/codex-acceptance/optimization-20261027/root/frontend-build-receipt.json`. Actual Chrome in Asia/Shanghai passed profile and canvas pending ETA, mock/time/format-version display, UTC instant/local-time equality, the existing new-tab canvas flow, and320/390 viewport widths with no horizontal overflow or page errors. The isolated server independently reported its QA database and mock/RAG/report settings. Independent final review found no remaining blocking finding within this change. Harness URL/new-tab/strict-selector corrections are not product defects. Final requirement evidence remains in the task's updated audit.

## Run locally

Use the existing Python `rag-env` environment and frontend dependencies. Start from the repository root. Explicit process variables take precedence over `.env`, then `mykey.py`, then defaults. Do not point acceptance runs at the normal business database.

```powershell
$env:DATABASE_URL='sqlite:///E:/demo-lite-local.db'
$env:LLM_MODE='mock'
$env:RAG_ENABLED='false'
$env:LLM_REPORT_ENABLED='false'
cd backend
python -c "from pathlib import Path; from app.core.config import settings; from app.db.session import engine; print(Path(engine.url.database).resolve(), settings.llm_mode)"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In another shell, run `npm run dev` in `frontend` (port 3001). Open `/start`, choose 精简版, and sign in with a local test account. The existing 完整版 remains at `/assessment`.

The optional `LITE_SEARCH_PROVIDER=brave` and `BRAVE_SEARCH_API_KEY` select Brave Search. The default is real Bing RSS search with public DuckDuckGo HTML fallback and no key. No source is fabricated in mock mode. Search services may block traffic or return insufficient relevant pages; that produces an explicit insufficient-information result. RAG is not used for public evidence.

## Contract and ownership

- `POST /api/lite/research`: authenticated multipart `company_name`, optional PDF/DOCX/TXT/MD `file` (10 MB max; extracted text 60,000 characters max).
- `GET /api/lite/{id}`: restore the same user's persisted snapshot.
- `POST /api/lite/{id}/recommend`: consume the frozen profile only; refuse insufficient evidence; repeated completion reads the same result.
- SQLite owns sources, profile, recommendations, state, timestamps and version. The browser owns no separate result cache. Private uploads stay on the user's record and never enter the company-wide public cache.
- Company cache keys use normalized full names. Successful public results last seven days; transient transport/parser failures are retryable. A database lease prevents competing searches. A separate-process regression proves that a fresh process reuses the cache without searching.
- Public pages require factual prose about the requested legal entity. Copyright/navigation identity, explicit other-company/subsidiary facts, duplicate URLs and near-identical mirrored excerpts do not qualify as independent sources. Two sources and a main-business fact are required before advice.
- HTTP fetches reject private/reserved/mixed DNS addresses, pin the checked address while retaining TLS hostname validation, recheck redirects, strip redirect credentials, and bound page size/time. Source content is data, not executable instructions.

## Requirement evidence

| Requirement | Implementation and verification |
| --- | --- |
| R5 unified lite/full choice; preserve full | `frontend/src/app/start/page.tsx`; full company prefill in assessment utilities; full backend regression includes report/export contracts and 14-section generation. |
| R6 name only + optional document | `backend/app/api/routes/lite.py`; existing intake extraction; frontend form/API tests. |
| R6 genuine sources + profile then advice | `public_research.py` → committed `LiteAssessment.profile_json` → `lite_service.recommend`; source-minimum, identity, ownership and immutable-profile tests. |
| R6 insufficiency and upgrade | `insufficient` result with explicit warning; two UI exits; company query retained through authentication and server middleware. |
| R6 seven-day reuse | `LitePublicCache` and lease CAS; expiry, contention, stale-session and separate-process tests. |
| R10 stages, duration, provenance | New scoped start/lite pages, busy/ETA state, server `generated_at`, `profile_generated_at`, `version`; frontend interaction tests and desktop/mobile browser checks. |

## Verification record — 2026-10-26

- Backend full suite on the final implementation: 238 passed, 2 skipped; focused lite/config suite: 44 passed. Commands use `python -m pytest tests -q -p no:cacheprovider --basetemp=<fresh temporary directory>` with an explicit isolated database and mock environment.
  The existing skips are the discontinued manual-scenario LLM re-packaging check and opt-in paid live-LLM report test; neither is reported as passed.
- Frontend on the final four-section presentation: 25 files / 69 tests, typecheck and production build passed. `npm run test -- --dir src` avoids an existing inaccessible `.pytest_cache` directory during discovery while discovering the entire source test tree.
- Actual Chrome read-only entry checks at 1440 px and 390 px: no horizontal overflow, no page errors or write requests; new blue/white theme matches the shared reference. Screenshots were saved outside Git.
- Real HTTP research initially returned insufficient evidence for BYD/CATL and no evidence for several other companies. Investigation showed that adding generic search terms diluted the exact legal name. A failing query-contract test preceded the minimal exact-name query correction; factual identity gates stayed strict. An independent direct call on 2026-10-26 08:14 UTC then found three distinct sources for 科大讯飞股份有限公司: `https://www.xfyun.cn/introduction`, Eastmoney company encyclopedia, and `https://aiqicha.baidu.com/company_basic_67402498736303`. Official/registry excerpts identified the same legal company and were not mirrored text. Browser end-to-end acceptance is recorded in the task completion report; source/network coverage remains provider-dependent.
- The first browser run correctly stopped for missing main-business evidence even with three sources. The official introduction's adjacent same-paragraph “自成立以来” business sentence had been dropped. A RED test reproduced both missing continuation and identity loss on excerpt revalidation. Extraction now preserves quote order and accepts that bounded continuation only inside the established legal-entity paragraph; other entities, unrelated sentences and paragraph boundaries end its scope. Another RED test caught “上市企业” falsely matching the old region rule. Real research + source validation + profile extraction at 09:17 UTC then returned three sources and a ready profile: core speech/language/vision research and AI products quoted from the official introduction; the Hefei registered address quoted from the registry. No DB writes or LLM calls were used for this check.
- Independent review added RED-to-GREEN checks for a shorter company name matching a different company's suffix, source-page HTTP-200 CAPTCHA responses being mistaken for no evidence, and business keywords inside a legal name being mistaken for business facts. The exact entity boundary and fact classifier now reject those cases. After these fixes, direct real research still produced three sources and a ready profile.
- To retest the fixed extraction without bypassing normal seven-day cache semantics, only the known QA cache row for 科大讯飞股份有限公司 in `E:/demo-lite-isolated-20261026.db` was expired once (key `08b2bee55925373c3ef2ea62f6f4a3753bdcd31defa12240a617ec4f3c78c4fc`; prior expiry `2026-11-02 08:50:16.871109`). The original insufficient snapshot was retained. Subsequent first-request/second-request behavior is tested without any further cache mutation.
- Final independent Chrome acceptance passed against the isolated mock server, recorded outside Git at `E:/codex-acceptance/demo-1019/browser-report.json`. 科大讯飞 had three real sources; profile confirmation preceded two-direction advice, four result sections and separate risks. Refresh restored the saved result; a 390 px viewport had 390 px scroll width; upgrade actually prefilled the full questionnaire's enterprise-name input. A second research request returned `cache_hit=true` with identical sources. A nonexistent-company query returned `insufficient` with zero sources and no recommendation button, and supplement retained its company name. Browser errors were empty. Positive snapshot: `8eed655f-e050-4796-939e-b76dba40e4c6`; negative snapshot: `be8c9c10-e333-4049-b029-e90363d32bcf`.
- Independent reviewer rechecked all three blocking findings after correction, ran the 41 lite boundary tests successfully, and reported no remaining blocking findings. Configuration tests account for the additional three tests in the 44-test focused run.
- Two pre-existing full regression failures were repaired minimally: pass-through `selected_directions` was missing from the called report-writer signature; a test fixture lacked the existing `industry_essence` model field.

## Acceptance isolation correction

An initial local acceptance server inherited `.env` over explicit process settings and therefore used the ordinary database and live mode. It was stopped before further calls. Only the single task-created user, its two lite rows and the demonstrably new unshared public-cache row were transactionally removed after an exact four-row backup outside Git. All other business references for that user were zero; the three owned row counts after cleanup were zero. The backup SHA-256 is `36120c6c4974fac3349af75a418d6fdb51a88d5542bf6c0ed897a53d65193855`. No table or unrelated data was removed.

The configuration owner now uses `setdefault`; a regression first reproduced the override and then passed. The replacement acceptance service asserted the intended path before startup and independently read SQLite `PRAGMA database_list` inside the server: `E:/demo-lite-isolated-20261026.db`, mock mode, RAG/report enhancement disabled. This diagnostic route exists only in the temporary launch process, not production source. Existing admin hot-reload behavior was not refactored in this task.
