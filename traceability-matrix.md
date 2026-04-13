# InvenTree Parts Module — Requirements Traceability Matrix (RTM)

> Generated: 2026-04-14
> Scope: Parts module — Part CRUD, Categories, Attributes, Parameters, Templates/Variants
> Coverage Status Key: ✅ Covered | ⚠️ Partial | ❌ Gap

---

## 1. Part CRUD

| Req-ID | Requirement | UI Test Cases | API Test Cases | Coverage Status | Notes |
|--------|-------------|---------------|----------------|-----------------|-------|
| REQ-PART-001 | Create Part — all required and optional fields | TC-PART-001, TC-PART-002 | TC-PART-001, TC-PART-002 | ✅ Covered | Happy path + optional fields both tested |
| REQ-PART-002 | Part Name ≤ 100 characters | TC-PART-010 (boundary), TC-PART-011 (over-limit) | TC-PART-011, TC-PART-012 | ✅ Covered | Boundary at 100 and 101 chars tested in both layers |
| REQ-PART-003 | Part Description ≤ 250 characters | TC-PART-012 (boundary), TC-PART-013 (over-limit) | TC-PART-013, TC-PART-014 | ✅ Covered | |
| REQ-PART-004 | Category Required on creation | TC-PART-003 | TC-PART-003 | ✅ Covered | Missing category → 400 tested |
| REQ-PART-005 | Read Part by ID | TC-PART-004 | TC-PART-004, TC-PART-005 | ✅ Covered | Includes non-existent ID → 404 |
| REQ-PART-006 | Full and partial update (PUT/PATCH) | TC-PART-005, TC-PART-006 | TC-PART-006, TC-PART-007, TC-PART-008 | ✅ Covered | Both PUT and PATCH covered |
| REQ-PART-007 | Delete Part; prevent deletion with active stock or BOM | TC-PART-007 (no stock), TC-PART-008 (active stock), TC-PART-009 (BOM ref) | TC-PART-009, TC-PART-010 | ⚠️ Partial | BOM reference deletion prevention has UI coverage but API test for BOM block is inferred — confirm TC-PART-010 explicitly tests BOM constraint |
| REQ-PART-008 | List Parts — paginated, filterable, orderable | TC-PART-014, TC-PART-015 | TC-PART-015, TC-PART-016, TC-PART-017 | ✅ Covered | Filter + ordering + pagination all tested |

---

## 2. Categories

| Req-ID | Requirement | UI Test Cases | API Test Cases | Coverage Status | Notes |
|--------|-------------|---------------|----------------|-----------------|-------|
| REQ-CAT-001 | Category Hierarchy — unlimited depth parent–child | TC-CAT-001, TC-CAT-002 | TC-CAT-001, TC-CAT-002 | ⚠️ Partial | 2-level hierarchy tested per PC-02; deep nesting (5+ levels) not covered — **GAP** |
| REQ-CAT-002 | Category CRUD | TC-CAT-003, TC-CAT-004, TC-CAT-005, TC-CAT-006 | TC-CAT-003, TC-CAT-004, TC-CAT-005, TC-CAT-006 | ✅ Covered | All four operations tested |
| REQ-CAT-003 | Filter Parts by category including descendants | TC-CAT-007, TC-CAT-008 | TC-CAT-007, TC-CAT-008 | ⚠️ Partial | Descendant-inclusive filter tested at 2-level depth; behaviour at 3+ levels not explicitly verified |
| REQ-CAT-004 | Parametric table views per Category | TC-CAT-009 | TC-CAT-009 | ⚠️ Partial | UI renders parametric view; no negative test for category without parametric table configured — **GAP** |

---

## 3. Attributes & Parameters

| Req-ID | Requirement | UI Test Cases | API Test Cases | Coverage Status | Notes |
|--------|-------------|---------------|----------------|-----------------|-------|
| REQ-ATTR-001 | Assign attribute to Part | TC-ATTR-001 | TC-ATTR-001 | ✅ Covered | |
| REQ-ATTR-002 | Attribute value constraints (type enforcement) | TC-ATTR-002, TC-ATTR-003 | TC-ATTR-002 | ⚠️ Partial | UI covers numeric/string type; boolean type not explicitly tested |
| REQ-PARAM-001 | Create Parameter Template | TC-PARAM-001 | TC-PARAM-001 | ✅ Covered | |
| REQ-PARAM-002 | Assign Parameter value to Part | TC-PARAM-002, TC-PARAM-003 | TC-PARAM-002, TC-PARAM-003 | ✅ Covered | |
| REQ-PARAM-003 | Unit validation on Parameter | TC-PARAM-004 | TC-PARAM-004 | ⚠️ Partial | Valid unit tested; invalid unit rejection only covered at API layer — **UI GAP** |

---

## 4. Templates & Variants

| Req-ID | Requirement | UI Test Cases | API Test Cases | Coverage Status | Notes |
|--------|-------------|---------------|----------------|-----------------|-------|
| REQ-TMPL-001 | Mark Part as Template | TC-TMPL-001 | TC-TMPL-001 | ✅ Covered | |
| REQ-TMPL-002 | Create Variant of Template | TC-TMPL-002, TC-TMPL-003 | TC-TMPL-002 | ✅ Covered | |
| REQ-TMPL-003 | Prevent Template deletion with active Variants | TC-TMPL-004 | TC-TMPL-003 | ✅ Covered | |
| REQ-TMPL-004 | Variant inherits Template parameters | TC-TMPL-005 | TC-TMPL-004 | ⚠️ Partial | Inheritance verified for single-level; parameter override on variant not tested — **GAP** |

---

## 5. Authentication (cross-cutting)

| Req-ID | Requirement | UI Test Cases | API Test Cases | Coverage Status | Notes |
|--------|-------------|---------------|----------------|-----------------|-------|
| REQ-AUTH-001 | All endpoints require token auth | — | TC-AUTH-001, TC-AUTH-002 | ⚠️ Partial | No UI-layer auth test (UI always uses session); unauthenticated API access covered |
| REQ-AUTH-002 | Valid token grants access | — | TC-AUTH-003 | ✅ Covered | |

---

## Gap Analysis Summary

| Gap ID | Req-ID | Gap Description | Suggested Test Case | Priority |
|--------|--------|-----------------|---------------------|----------|
| GAP-001 | REQ-CAT-001 | Deep hierarchy (5+ levels) not tested — category tree traversal may fail at depth | Add TC-CAT-010: create 5-level hierarchy, verify child resolution | High |
| GAP-002 | REQ-CAT-004 | No negative test for category without parametric table | Add TC-CAT-011: access parametric view on unconfigured category | Medium |
| GAP-003 | REQ-PART-007 | API test for BOM-reference deletion block needs explicit confirmation | Verify TC-PART-010 explicitly asserts 400 + BOM error message | Critical |
| GAP-004 | REQ-ATTR-002 | Boolean-type attribute not tested in either layer | Add TC-ATTR-004 (UI) + TC-ATTR-003 (API) | Medium |
| GAP-005 | REQ-PARAM-003 | Invalid unit rejection not covered in UI layer | Add TC-PARAM-005: enter invalid unit string in UI, expect validation error | High |
| GAP-006 | REQ-TMPL-004 | Parameter override on variant not tested | Add TC-TMPL-006: override inherited parameter on variant, verify isolation | High |

---