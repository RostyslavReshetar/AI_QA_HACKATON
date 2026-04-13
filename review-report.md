# QA Artifacts Review Report — InvenTree Parts Module

> Reviewed: 2026-04-14
> Reviewer: Claude Code
> Scope: requirements.md, test-cases/ui-manual-tests.md, test-cases/api-manual-tests.md, traceability-matrix.md, automation/ui/pages/base.page.ts, automation/api/helpers/auth.ts

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| Major    | 7 |
| Minor    | 6 |

---

## Critical Findings

### C-01 — Hardcoded Base URL in BasePage

**File:** `automation/ui/pages/base.page.ts`
**Finding:** `baseURL: string = 'http://localhost:8080'` is a class-level constant. When this suite runs in CI against a staging or Docker-networked host, every page object silently targets the wrong host. The auth helper correctly reads `process.env.INVENTREE_URL` — BasePage does not.
**Recommendation:** Replace with `readonly baseURL: string = process.env.INVENTREE_URL ?? 'http://localhost:8080';` to stay consistent with the auth helper and make environment promotion zero-friction.

---

### C-02 — Module-Level Token Singleton Breaks Worker Isolation

**File:** `automation/api/helpers/auth.ts`
**Finding:** `let cachedToken: string | null = null` is module-level state. Playwright spawns multiple worker processes; each worker gets its own module instance so the cache never rehydrates across workers. Worse, if a test invalidates the token mid-run (e.g., a logout test), subsequent tests in the same worker silently reuse a dead token without retrying.
**Recommendation:** Move the cache into a `TestInfo`-scoped fixture or use a `Promise`-based singleton with a TTL. At minimum, add a retry: if a request returns 401, clear `cachedToken` and re-authenticate once before failing.

---

### C-03 — REQ-PART-004 (Category Required) Has No Negative API Test Visible in RTM

**File:** `traceability-matrix.md`
**Finding:** REQ-PART-004 (creation must fail without a category) is marked ✅ Covered in the RTM via TC-PART-001/TC-PART-002, but those test IDs are the happy-path create cases. No dedicated negative test (POST /api/part/ with `category` omitted, expect 400) is referenced. The coverage claim is misleading.
**Recommendation:** Create TC-PART-NEG-001: POST /api/part/ with no `category` field, assert HTTP 400, assert response body contains `category` key in the error object. Update the RTM to reference this test explicitly.

---

## Major Findings

### M-01 — Boundary Tests for String Length Constraints Are Missing

**Files:** `requirements.md` (REQ-PART-002, REQ-PART-003), `test-cases/api-manual-tests.md`
**Finding:** REQ-PART-002 specifies a 100-character name limit; REQ-PART-003 specifies 250 characters for description. Neither the API nor the UI test cases include boundary values: length 99 (valid), 100 (valid at-limit), 101 (invalid). Without these, an off-by-one in the DRF serializer or DB constraint would go undetected.
**Recommendation:** Add parametrized boundary test cases for both fields:
- name @ 100 chars → 201 Created
- name @ 101 chars → 400 Bad Request, `name` in error body
- description @ 250 chars → 201 Created
- description @ 251 chars → 400 Bad Request

---

### M-02 — PUT vs PATCH Semantics Not Separately Tested

**File:** `test-cases/api-manual-tests.md`, `requirements.md` REQ-PART-006
**Finding:** REQ-PART-006 covers both full update (PUT) and partial update (PATCH), but they have materially different behavior. PUT with a missing required field should return 400; PATCH with only one field changed should succeed without touching others. A single test ID covering both verbs is insufficient.
**Recommendation:** Split into TC-PART-UPDATE-PUT and TC-PART-UPDATE-PATCH. For PUT: assert that omitting `name` returns 400. For PATCH: assert that updating only `description` does not change `name` or `category` (assert the full response body, not just status).

---

### M-03 — No Schema Validation on API Responses

**File:** `automation/api/helpers/auth.ts`, `test-cases/api-manual-tests.md`
**Finding:** The insight mentions AJV for JSON Schema validation, but none of the visible test code or test case descriptions reference schema assertions. Tests that only check HTTP status codes miss field renames, type changes (e.g., `pk` becoming a string), or newly required fields added by InvenTree upgrades.
**Recommendation:** Define and version JSON Schemas for Part, Category, and Parameter response objects. Assert `ajv.validate(partSchema, responseBody)` on all read and create responses. Store schemas under `automation/api/schemas/` (the directory already exists per git status).

---

### M-04 — Cleanup Registry Ordering Not Enforced

**File:** `automation/api/helpers/auth.ts` and inferred cleanup pattern
**Finding:** The insight describes "delete in reverse order in afterAll." If test cases share a single cleanup array across describe blocks, a test failure mid-suite may leave IDs registered in creation order rather than reverse. If a part is created before its category in a different test, the category delete will 400/404 due to FK constraint.
**Recommendation:** Use a stack (LIFO) not an array (FIFO) for the cleanup registry. Explicitly type it: `const cleanupStack: Array<{ type: 'part' | 'category' | 'parameter'; id: number }> = []`. Pop from the end in `afterAll`.

---

### M-05 — UI Tests Lack Explicit Wait Strategy Documentation

**File:** `automation/ui/pages/base.page.ts`
**Finding:** The BasePage `navigate` method is truncated but the visible design does not show a standardized post-navigation wait (e.g., `waitForLoadState('networkidle')` or a specific sentinel element). Mantine-based SPAs like InvenTree's frontend can have deferred data fetches that cause flaky tests if assertions run before the component hydrates.
**Recommendation:** Add a protected `waitForReady()` method to BasePage that waits for a page-level indicator (e.g., the nav sidebar to be visible). Override in page-specific subclasses. Call this at the end of every `navigate()`.

---

### M-06 — Precondition PC-02 Is Insufficiently Specific for Variant/Template Tests

**File:** `test-cases/ui-manual-tests.md`
**Finding:** PC-02 requires "at least one Category with a two-level hierarchy." Tests for Templates/Variants need a Template part and at least one Variant already existing. Using PC-02 alone as a precondition for those test cases means the tester must infer additional setup, which leads to inconsistent execution.
**Recommendation:** Add PC-04: "At least one Template Part exists with `is_template=True`" and PC-05: "At least one Variant Part exists linked to the Template in PC-04." Reference these in variant test cases explicitly.

---

### M-07 — RTM Coverage Status for Partial Requirements Is Optimistic

**File:** `traceability-matrix.md`
**Finding:** REQ-PART-001 is marked ✅ Covered via TC-PART-001 and TC-PART-002. These cover the happy path and at most one negative path. Optional fields (IPN, revision, keywords, notes, link) are not confirmed as tested. A requirement that says "all required and optional fields" needs coverage of each optional field's behavior (default value, nullable, update-only), not just a single happy-path POST.
**Recommendation:** Decompose REQ-PART-001 into sub-requirements or add a test case matrix column for "optional fields coverage." Mark the current state as ⚠️ Partial until optional fields are explicitly exercised.

---

## Minor Findings

### m-01 — Missing `@playwright/test` Import Type for `expect` in BasePage

**File:** `automation/ui/pages/base.page.ts`
**Finding:** `expect` is imported alongside `Page` and `Locator` from `@playwright/test`. If `expect` is only used in helper assertions inside page objects (not spec files), it bypasses test retry and soft-assertion support. Using `expect` in a POM can hide assertion context in error output.
**Recommendation:** Keep assertions in spec files. Page objects should return values or throw descriptive errors, not call `expect` directly. This keeps stack traces tied to the spec line, not an internal POM method.

---

### m-02 — `cachedToken` Has No Type Guard After Fetch

**File:** `automation/api/helpers/auth.ts`
**Finding:** If the token endpoint returns a 200 but with an unexpected body shape (e.g., `{ "token": null }` during an InvenTree misconfiguration), `cachedToken` would be set to `null` and subsequent calls would re-fetch indefinitely or pass `null` as the header value.
**Recommendation:** Add an assertion after fetching: `if (!token || typeof token !== 'string') throw new Error('Auth failed: token not returned');`

---

### m-03 — No Test for Concurrent Part Creation (Race Condition on Unique Name)

**File:** `test-cases/api-manual-tests.md`
**Finding:** InvenTree Parts do not enforce globally unique names by default, but some deployments configure uniqueness constraints. No test covers concurrent or duplicate name creation behavior. This is particularly relevant for automated test runs that may execute in parallel.
**Recommendation:** Add a Minor-priority test: create two Parts with identical names in the same category, assert either both succeed (if no uniqueness constraint) or second returns 400. Document which behavior is expected based on InvenTree configuration.

---

### m-04 — Environment Variable Fallback Leaks Credentials Into Test Logs

**File:** `automation/api/helpers/auth.ts`
**Finding:** `PASSWORD = process.env.INVENTREE_PASS ?? 'inventree123'` means the literal password appears in the source file. If test output, error logs, or CI artifacts print environment resolution, the fallback value is visible. This is a demo credential but sets a bad precedent.
**Recommendation:** Remove hardcoded fallbacks for credentials. Use `process.env.INVENTREE_PASS ?? (() => { throw new Error('INVENTREE_PASS env var required'); })()` in non-demo environments. For local dev, document usage of a `.env` file with `dotenv`.

---

### m-05 — API Test Legend Is Undefined in Visible Artifact

**File:** `test-cases/api-manual-tests.md`
**Finding:** The file contains a `## Legend` section header but the table content is cut off. If this is the actual file state (not just truncation in this review), testers working from the document lack the key to interpret columns like "Expected Result" codes or priority markers.
**Recommendation:** Ensure the legend table is complete before sharing test artifacts with the QA team.

---

### m-06 — No Test for `GET /api/part/` Pagination

**File:** `test-cases/api-manual-tests.md`
**Finding:** InvenTree's DRF list endpoints return paginated results (`count`, `next`, `previous`, `results`). No test case covers pagination behavior: limit/offset parameters, `next` URL validity, or behavior when requesting a page beyond total count. With a large parts catalog, unpaginated assumptions in test code will break.
**Recommendation:** Add TC-PART-LIST-PAGE-001: GET /api/part/?limit=1&offset=0, assert `count >= 1`, `results.length == 1`, `next` is non-null if count > 1. Add TC-PART-LIST-PAGE-002: offset beyond count, assert `results` is empty array, not 404.

---

## Coverage Gap Summary

| Module Area | API Coverage | UI Coverage | RTM Status |
|-------------|-------------|-------------|------------|
| Part CRUD — Happy Path | Adequate | Adequate | ✅ |
| String Boundary Conditions | **Missing** | **Missing** | ❌ |
| Category Required Negative | **Missing** | Partial | ⚠️ |
| PUT vs PATCH Semantics | **Merged** | N/A | ⚠️ |
| Template/Variant Preconditions | Unknown | **Underspecified** | ⚠️ |
| Pagination | **Missing** | N/A | ❌ |
| Schema Validation | **Missing** | N/A | ❌ |