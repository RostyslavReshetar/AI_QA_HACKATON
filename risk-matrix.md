# InvenTree Parts Module — Risk Matrix

> Generated: 2026-04-14
> Coverage % = (Covered test cases / Total requirements in module) × 100
> Risk Score = Impact × Likelihood (1–5 scale; 25 = maximum risk)

---

## Phase 1 — Critical Priority Risks

| # | Module | Risk | Scenario | Impact (1–5) | Likelihood (1–5) | Risk Score | Current Coverage % | Mitigation |
|---|--------|------|----------|-------------|-----------------|------------|--------------------|------------|
| R-01 | Part CRUD | BOM-reference deletion not blocked | Part deleted while referenced in an active BOM; orphan BOM lines break production workflows | 5 | 3 | **15** | 85% | GAP-003: confirm TC-PART-010 tests BOM constraint explicitly; add integration test with real BOM record |
| R-02 | Part CRUD | Category required constraint bypassed | Part created without category via PATCH; referential integrity violated in downstream queries | 5 | 2 | **10** | 90% | Add PATCH-without-category test case to API suite |
| R-03 | Authentication | Token auth bypass on new endpoints | New endpoint added in future without auth decorator; exposes data publicly | 5 | 2 | **10** | 80% | Add automated auth-sweep test that hits all `/api/part/*` routes without token |
| R-04 | Part CRUD | Active-stock deletion allowed | Part with stock deleted; stock records become orphaned, inventory count corrupted | 5 | 2 | **10** | 90% | TC-PART-008 covers this; verify deletion returns 400 not 204 |
| R-05 | Part CRUD | Name field overflow accepted | Name > 100 chars stored silently; UI truncates display causing data mismatch | 4 | 2 | **8** | 95% | TC-PART-011 covers; verify server-side rejection not just client truncation |

---

## Phase 2 — High Priority Risks

| # | Module | Risk | Scenario | Impact (1–5) | Likelihood (1–5) | Risk Score | Current Coverage % | Mitigation |
|---|--------|------|----------|-------------|-----------------|------------|--------------------|------------|
| R-06 | Categories | Deep hierarchy traversal fails | 5-level category tree breaks descendant-inclusive Part filter; Parts not found in deep subcategories | 4 | 3 | **12** | 60% | GAP-001: add TC-CAT-010 with 5-level hierarchy validation |
| R-07 | Parameters | Unit validation only enforced at API layer | UI accepts invalid unit strings silently; data stored with wrong units causes parametric filtering errors | 4 | 3 | **12** | 70% | GAP-005: add TC-PARAM-005 UI negative test |
| R-08 | Templates/Variants | Parameter inheritance break on override | Variant overrides inherited parameter; template parameter unintentionally mutated | 4 | 3 | **12** | 65% | GAP-006: add TC-TMPL-006 isolation test |
| R-09 | Categories | Descendant filter fails at 3+ levels | Parts in grandchild categories not returned when filtering by grandparent; search results incomplete | 4 | 3 | **12** | 65% | Extend TC-CAT-007/008 to 3-level depth |
| R-10 | Part CRUD | Pagination edge case — empty last page | Offset past total count returns 500 or malformed response instead of empty list | 3 | 3 | **9** | 75% | Add TC-PART-018: request page beyond total count |
| R-11 | Part CRUD | Concurrent update race condition | Two users PATCH the same Part simultaneously; last-write-wins silently drops changes | 4 | 2 | **8** | 40% | **Low coverage — no concurrency test exists**; add concurrent PATCH test or document accepted behaviour |
| R-12 | Attributes | Boolean attribute type untested | Boolean attribute value rejected or stored as string; type coercion causes downstream logic errors | 3 | 3 | **9** | 60% | GAP-004: add TC-ATTR-003/004 |

---

## Phase 3 — Medium Priority Risks

| # | Module | Risk | Scenario | Impact (1–5) | Likelihood (1–5) | Risk Score | Current Coverage % | Mitigation |
|---|--------|------|----------|-------------|-----------------|------------|--------------------|------------|
| R-13 | Categories | Parametric view on unconfigured category | UI renders blank or 500 when opening parametric view for category with no table configured | 3 | 3 | **9** | 55% | GAP-002: add TC-CAT-011 negative test |
| R-14 | Templates/Variants | Template marked as non-template with active variants | `is_template=false` accepted on Part with attached variants; variant relationship corrupted | 3 | 2 | **6** | 70% | Add API test: PATCH template to non-template with variant attached, expect 400 |
| R-15 | Part CRUD | Ordering by non-indexed field causes timeout | Large dataset ordered by `description` (non-indexed); slow query degrades production | 3 | 2 | **6** | 50% | Add performance test: list 1000+ parts ordered by description; assert response < 2s |
| R-16 | Part CRUD | Special characters in name break search | Part named `Resistor <10kΩ & ±5%>` corrupts search index or causes XSS in UI | 3 | 2 | **6** | 55% | Add TC-PART-019: create/search part with special characters in name |
| R-17 | Authentication | Session token not invalidated on logout | UI session cookie remains valid after logout; re-use allows unauthorized access | 4 | 1 | **4** | 80% | Out of Parts module scope; flag for auth module test suite |

---

## Phase 4 — Low Priority Risks

| # | Module | Risk | Scenario | Impact (1–5) | Likelihood (1–5) | Risk Score | Current Coverage % | Mitigation |
|---|--------|------|----------|-------------|-----------------|------------|--------------------|------------|
| R-18 | Part CRUD | PUT without all required fields returns unclear error | 400 returned but error message doesn't identify missing field; developer confusion | 2 | 3 | **6** | 70% | Add TC-PART-020: PUT with missing `name`, verify error body identifies field |
| R-19 | Categories | Category deleted while Parts still assigned | Parts become orphaned (no category); list/filter queries may fail or exclude orphans | 4 | 1 | **4** | 75% | Add TC-CAT-012: delete category with Parts assigned, expect 400 or cascade documented |
| R-20 | Parameters | Parameter Template deleted while in use | Parts referencing template lose parameter data silently | 3 | 1 | **3** | 65% | Add TC-PARAM-006: delete in-use template, verify behaviour (400 or documented cascade) |
| R-21 | Part CRUD | Description field accepts HTML | Stored XSS risk if description rendered unescaped in UI | 2 | 2 | **4** | 50% | Add TC-PART-021: enter `<script>alert(1)</script>` in description, verify escaped in UI |
| R-22 | Templates/Variants | Variant of a Variant allowed | Multi-level variant chain creates UI confusion and breaks template aggregation logic | 2 | 2 | **4** | 50% | Add TC-TMPL-007: attempt `variant_of` pointing to another variant, verify rejection or document |

---

## Risk Heatmap Summary

```
Impact
  5 | R-01(15)  R-02(10)  R-03(10)  R-04(10)
  4 | R-06(12)  R-07(12)  R-08(12)  R-09(12)  R-11(8)  R-17(4)  R-19(4)
  3 | R-10(9)   R-12(9)   R-13(9)   R-14(6)   R-15(6)  R-16(6)  R-20(3)
  2 | R-18(6)   R-21(4)   R-22(4)   R-05(8)
  1 |
    +------------------------------------------------------------------
       1         2         3         4         5     Likelihood

Risk Score:  ≥12 = HIGH ■  6–11 = MEDIUM ▲  ≤5 = LOW ●
```

---

## Coverage Summary by Module

| Module | Total Reqs | ✅ Covered | ⚠️ Partial | ❌ Gap | Coverage % |
|--------|-----------|-----------|-----------|-------|------------|
| Part CRUD | 8 | 6 | 2 | 0 | 87% |
| Categories | 4 | 1 | 3 | 0 | 50% |
| Attributes | 2 | 1 | 1 | 0 | 62% |
| Parameters | 3 | 2 | 1 | 0 | 75% |
| Templates/Variants | 4 | 3 | 1 | 0 | 81% |
| Authentication | 2 | 1 | 1 | 0 | 67% |
| **TOTAL** | **23** | **14** | **9** | **0** | **74%** |

> **Release Recommendation:** Address GAP-001, GAP-003, GAP-005, GAP-006 before release (all map to High/Critical risk scores ≥ 12). Remaining gaps (GAP-002, GAP-004) are acceptable post-release with tracking tickets.

---