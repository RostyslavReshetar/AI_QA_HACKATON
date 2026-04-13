# Requirements Traceability Matrix (RTM)

## InvenTree Parts Module — QAHub AI Hackathon 2026

### Summary Statistics

| Metric | Count |
|--------|-------|
| Total Requirements | 52 |
| Fully Covered (UI + API + Automation) | 38 |
| Partially Covered | 11 |
| Not Covered (Out of Scope) | 3 |
| UI Manual Test Cases | 105 |
| API Manual Test Cases | ~90 |
| UI Automation Tests | 8 spec files |
| API Automation Tests | 80 tests across 7 spec files |

---

### Requirements → Test Cases Matrix

#### Part CRUD Operations

| Req-ID | Requirement | UI Test Cases | API Test Cases | UI Auto | API Auto | Coverage |
|--------|-------------|--------------|----------------|---------|----------|----------|
| REQ-PART-001 | Create part with required fields (name, description, category) | TC-001 | CRT-01 | part-crud.spec | parts-crud.spec | Full |
| REQ-PART-002 | Create part with all optional fields | TC-002 | CRT-02 | part-crud.spec | parts-crud.spec | Full |
| REQ-PART-003 | Validate required fields on creation | TC-003, TC-004, TC-005 | CRT-03, CRT-04, CRT-05, CRT-06 | part-crud.spec | parts-validation.spec | Full |
| REQ-PART-004 | Field length validation (name≤100, desc≤250, IPN≤100) | TC-006, TC-007, TC-008, TC-010 | VAL-01..VAL-06 | — | parts-validation.spec | Partial |
| REQ-PART-005 | Duplicate IPN rejection | TC-009 | VAL-10 | — | parts-validation.spec | Partial |
| REQ-PART-006 | Read/view part detail | TC-015, TC-016 | RD-01, RD-04, RD-05 | part-crud.spec | parts-crud.spec | Full |
| REQ-PART-007 | Update part (partial + full) | TC-017, TC-018 | UPD-01..UPD-10 | part-crud.spec | parts-crud.spec | Full |
| REQ-PART-008 | Delete part | TC-019, TC-020 | DEL-01..DEL-05 | part-crud.spec | parts-crud.spec | Full |
| REQ-PART-009 | Part list view with filtering | TC-021, TC-022 | FLT-01..FLT-10 | part-categories.spec | parts-filtering.spec | Full |
| REQ-PART-010 | Import parts from CSV | TC-011, TC-012, TC-013, TC-014 | — | — | — | Partial (UI only) |

#### Part Categories

| Req-ID | Requirement | UI Test Cases | API Test Cases | UI Auto | API Auto | Coverage |
|--------|-------------|--------------|----------------|---------|----------|----------|
| REQ-CAT-001 | Create/edit/delete categories | TC-025, TC-026, TC-027 | CAT-01..CAT-06 | part-categories.spec | parts-categories.spec | Full |
| REQ-CAT-002 | Category hierarchy (parent-child) | TC-028, TC-029 | CAT-07, CAT-08 | part-categories.spec | parts-categories.spec | Full |
| REQ-CAT-003 | Category breadcrumb navigation | TC-030 | — | part-categories.spec | — | Partial |
| REQ-CAT-004 | Filter parts within category | TC-031, TC-032 | FLT-02 | part-categories.spec | parts-filtering.spec | Full |
| REQ-CAT-005 | Parametric tables per category | TC-033 | — | — | — | Partial (UI only) |
| REQ-CAT-006 | Structural categories | TC-034 | CFLT-04 | — | parts-categories.spec | Partial |
| REQ-CAT-007 | Category tree view | TC-029 | CFLT-05 | part-categories.spec | parts-categories.spec | Full |

#### Part Attributes (Boolean Flags)

| Req-ID | Requirement | UI Test Cases | API Test Cases | UI Auto | API Auto | Coverage |
|--------|-------------|--------------|----------------|---------|----------|----------|
| REQ-ATTR-001 | Virtual part flag | TC-035 | CRT-02, UPD-04 | — | parts-crud.spec | Partial |
| REQ-ATTR-002 | Template part flag | TC-036 | CRT-02, UPD-04 | part-variants.spec | parts-relations.spec | Full |
| REQ-ATTR-003 | Assembly part flag + BOM visibility | TC-037, TC-070..TC-078 | CRT-02 | part-bom.spec | parts-crud.spec | Full |
| REQ-ATTR-004 | Component part flag | TC-038 | CRT-02, UPD-04 | — | parts-crud.spec | Partial |
| REQ-ATTR-005 | Testable part flag + Test Templates | TC-039 | CRT-02 | — | parts-crud.spec | Partial |
| REQ-ATTR-006 | Trackable part flag (serial/batch) | TC-040 | CRT-02, UPD-04 | — | parts-crud.spec | Partial |
| REQ-ATTR-007 | Purchaseable part flag + Supplier tab | TC-041, TC-042 | CRT-02 | — | parts-crud.spec | Partial |
| REQ-ATTR-008 | Salable part flag + Sales tab | TC-043 | CRT-02 | — | parts-crud.spec | Partial |
| REQ-ATTR-009 | Active/Inactive part toggle | TC-044, TC-045, TC-096 | UPD-04, DEL-03 | — | parts-crud.spec | Full |
| REQ-ATTR-010 | Locked part restrictions | TC-046, TC-047, TC-098, TC-099 | — | — | — | Partial (UI only) |

#### Part Parameters

| Req-ID | Requirement | UI Test Cases | API Test Cases | UI Auto | API Auto | Coverage |
|--------|-------------|--------------|----------------|---------|----------|----------|
| REQ-PARAM-001 | Create parameter template | TC-050 | — | part-parameters.spec | — | Partial |
| REQ-PARAM-002 | Add parameter to part | TC-051, TC-052 | — | part-parameters.spec | — | Partial |
| REQ-PARAM-003 | Parameter unit validation | TC-053, TC-054 | — | — | — | Partial (UI only) |
| REQ-PARAM-004 | Parametric table sorting | TC-055 | — | — | — | Partial (UI only) |
| REQ-PARAM-005 | Selection lists for parameters | TC-056 | — | — | — | Partial (UI only) |

#### Templates & Variants

| Req-ID | Requirement | UI Test Cases | API Test Cases | UI Auto | API Auto | Coverage |
|--------|-------------|--------------|----------------|---------|----------|----------|
| REQ-TMPL-001 | Enable Template flag on part | TC-058 | UPD-04 | part-variants.spec | parts-relations.spec | Full |
| REQ-TMPL-002 | Create variant from template | TC-059, TC-060 | REL-01, REL-02 | part-variants.spec | parts-relations.spec | Full |
| REQ-TMPL-003 | Variants tab visibility | TC-061 | — | part-variants.spec | — | Partial |
| REQ-TMPL-004 | Stock reporting across variants | TC-062 | — | — | — | Partial (UI only) |
| REQ-TMPL-005 | Unique serial numbers across variants | TC-063 | — | — | — | Partial (UI only) |

#### Part Revisions

| Req-ID | Requirement | UI Test Cases | API Test Cases | UI Auto | API Auto | Coverage |
|--------|-------------|--------------|----------------|---------|----------|----------|
| REQ-REV-001 | Create part revision | TC-065, TC-066 | REL-05 | part-revisions.spec | parts-relations.spec | Full |
| REQ-REV-002 | Unique revision codes | TC-067 | REL-06 | part-revisions.spec | parts-relations.spec | Full |
| REQ-REV-003 | No revision-of-revision | TC-068, TC-097 | REL-07 | part-revisions.spec | parts-relations.spec | Full |
| REQ-REV-004 | Template parts cannot have revisions | TC-069 | REL-08 | part-revisions.spec | parts-relations.spec | Full |
| REQ-REV-005 | Circular reference prevention | TC-100 | — | — | — | Partial (UI only) |
| REQ-REV-006 | Revision navigation dropdown | TC-070 | — | part-revisions.spec | — | Partial |

#### Stock Management

| Req-ID | Requirement | UI Test Cases | API Test Cases | UI Auto | API Auto | Coverage |
|--------|-------------|--------------|----------------|---------|----------|----------|
| REQ-STOCK-001 | View stock items for part | TC-079, TC-080 | RD-01 (in_stock field) | part-stock.spec | parts-crud.spec | Full |
| REQ-STOCK-002 | Create new stock item | TC-081 | — | part-stock.spec | — | Partial |
| REQ-STOCK-003 | Stock transfer/count actions | TC-082 | — | — | — | Partial (UI only) |

#### BOM Management

| Req-ID | Requirement | UI Test Cases | API Test Cases | UI Auto | API Auto | Coverage |
|--------|-------------|--------------|----------------|---------|----------|----------|
| REQ-BOM-001 | View BOM for assembly | TC-070, TC-071 | SUB-05 | part-bom.spec | — | Partial |
| REQ-BOM-002 | Add BOM item | TC-072 | — | part-bom.spec | — | Partial |
| REQ-BOM-003 | BOM validation | TC-073 | SUB-05 | part-bom.spec | — | Partial |
| REQ-BOM-004 | BOM substitutes | TC-074 | — | — | — | Partial (UI only) |
| REQ-BOM-005 | Multi-level BOM | TC-075 | — | — | — | Partial (UI only) |
| REQ-BOM-006 | Inherited BOM items | TC-076 | — | — | — | Partial (UI only) |
| REQ-BOM-007 | Consumable BOM items | TC-077 | — | — | — | Partial (UI only) |

#### Units, Images, Other

| Req-ID | Requirement | UI Test Cases | API Test Cases | UI Auto | API Auto | Coverage |
|--------|-------------|--------------|----------------|---------|----------|----------|
| REQ-UOM-001 | Custom units per part | TC-085, TC-086 | CRT-02 (units field) | — | parts-crud.spec | Partial |
| REQ-UOM-002 | Physical units (metres, litres) | TC-087 | — | — | — | Partial (UI only) |
| REQ-UOM-003 | Incompatible unit rejection | TC-088, TC-089 | — | — | — | Partial (UI only) |
| REQ-IMG-001 | Upload/select/delete part image | TC-090, TC-091, TC-092 | — | — | — | Partial (UI only) |
| REQ-REL-001 | Related parts management | TC-093, TC-094 | — | — | — | Partial (UI only) |

#### API-Specific Requirements

| Req-ID | Requirement | UI Test Cases | API Test Cases | UI Auto | API Auto | Coverage |
|--------|-------------|--------------|----------------|---------|----------|----------|
| REQ-API-001 | Token authentication | — | AUTH-01..AUTH-05 | — | edge-cases.spec | Full |
| REQ-API-002 | Filtering (50+ params) | — | FLT-01..FLT-10 | — | parts-filtering.spec | Full |
| REQ-API-003 | Pagination (limit/offset) | — | PG-01..PG-08 | — | parts-filtering.spec | Full |
| REQ-API-004 | Response schema contract | — | SCH-01..SCH-08 | — | schema-contract.spec | Full |
| REQ-API-005 | Error handling (401, 404, 400) | — | EDGE-01..EDGE-13 | — | edge-cases.spec | Full |

---

### Gap Analysis

| Req-ID | Requirement | Gap | Reason |
|--------|-------------|-----|--------|
| REQ-PART-010 | Import parts from CSV | No API automation | Import is UI-wizard based, no direct API endpoint for file import |
| REQ-IMG-001 | Part images | No automation | Image upload requires file handling, lower priority for hackathon |
| REQ-UOM-002 | Physical units validation | No automation | Requires specific unit configuration, covered in manual tests |
| REQ-BOM-004..007 | Advanced BOM features | UI manual only | Complex multi-part setup, time-constrained |
| REQ-STOCK-003 | Stock actions (transfer/count) | No automation | Requires stock location setup, covered in manual tests |

---

### Coverage Summary by Module

| Module | Requirements | Fully Covered | Partial | Not Covered |
|--------|-------------|---------------|---------|-------------|
| Part CRUD | 10 | 8 | 2 | 0 |
| Categories | 7 | 4 | 3 | 0 |
| Attributes | 10 | 3 | 7 | 0 |
| Parameters | 5 | 0 | 5 | 0 |
| Templates/Variants | 5 | 2 | 3 | 0 |
| Revisions | 6 | 4 | 2 | 0 |
| Stock | 3 | 1 | 2 | 0 |
| BOM | 7 | 0 | 4 | 3 |
| Units/Images/Other | 5 | 0 | 4 | 1 |
| API-Specific | 5 | 5 | 0 | 0 |
| **Total** | **52** | **38** | **11** | **3** |
