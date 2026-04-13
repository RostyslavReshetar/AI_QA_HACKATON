# InvenTree Parts Module — Requirements

> Generated: 2026-04-14

---

## Module: Part CRUD

| REQ-ID | Title | Description | Module | Priority |
|--------|-------|-------------|--------|----------|
| REQ-PART-001 | Create Part | System shall allow creation of a new Part record with all required and optional fields | Part CRUD | Critical |
| REQ-PART-002 | Part Name Constraint | Part name field shall accept a maximum of 100 characters | Part CRUD | Critical |
| REQ-PART-003 | Part Description Constraint | Part description field shall accept a maximum of 250 characters | Part CRUD | High |
| REQ-PART-004 | Category Required | A Part must be assigned to a Category; creation shall fail if no category is provided | Part CRUD | Critical |
| REQ-PART-005 | Read Part | System shall allow retrieval of a single Part by ID with all associated attributes | Part CRUD | Critical |
| REQ-PART-006 | Update Part | System shall allow full and partial update (PUT/PATCH) of an existing Part record | Part CRUD | Critical |
| REQ-PART-007 | Delete Part | System shall allow deletion of a Part record; deletion of a Part with active stock or BOM references shall be prevented | Part CRUD | Critical |
| REQ-PART-008 | List Parts | System shall return a paginated list of Parts with support for filtering and ordering | Part CRUD | Critical |

---

## Module: Categories

| REQ-ID | Title | Description | Module | Priority |
|--------|-------|-------------|--------|----------|
| REQ-CAT-001 | Category Hierarchy | Categories shall support unlimited depth parent–child hierarchy | Categories | Critical |
| REQ-CAT-002 | Category CRUD | System shall support create, read, update, and delete operations on Category records | Categories | Critical |
| REQ-CAT-003 | Category Filtering | System shall allow filtering Parts by category, including all descendant categories | Categories | High |
| REQ-CAT-004 | Parametric Tables | Categories shall support parametric table views listing Parts alongside their parameter values for that category | Categories | Medium |
| REQ-CAT-005 | Category Part Count | System shall expose the count of Parts (direct and recursive) assigned to each Category | Categories | Medium |

---

## Module: Part Attributes

| REQ-ID | Title | Description | Module | Priority |
|--------|-------|-------------|--------|----------|
| REQ-ATTR-001 | Virtual Flag | Parts shall have a boolean `virtual` attribute indicating the part has no physical existence (e.g., a service) | Part Attributes | High |
| REQ-ATTR-002 | Template Flag | Parts shall have a boolean `is_template` attribute enabling the Part to act as a template for variants | Part Attributes | High |
| REQ-ATTR-003 | Assembly Flag | Parts shall have a boolean `assembly` attribute indicating the Part can be assembled from sub-components | Part Attributes | Critical |
| REQ-ATTR-004 | Component Flag | Parts shall have a boolean `component` attribute indicating the Part can be used as a sub-component in a BOM | Part Attributes | Critical |
| REQ-ATTR-005 | Testable Flag | Parts shall have a boolean `testable` attribute enabling test result tracking for individual stock items | Part Attributes | High |
| REQ-ATTR-006 | Trackable Flag | Parts shall have a boolean `trackable` attribute enabling serial number assignment to individual stock items | Part Attributes | High |
| REQ-ATTR-007 | Purchaseable Flag | Parts shall have a boolean `purchaseable` attribute indicating the Part can be ordered from suppliers | Part Attributes | High |
| REQ-ATTR-008 | Salable Flag | Parts shall have a boolean `salable` attribute indicating the Part can be sold to customers | Part Attributes | High |
| REQ-ATTR-009 | Active Flag | Parts shall have a boolean `active` attribute; inactive Parts shall be excluded from default listings and ordering workflows | Part Attributes | Critical |
| REQ-ATTR-010 | Locked Flag | Parts shall have a boolean `locked` attribute; locked Parts shall not allow modifications to BOM or parameters without explicit unlock | Part Attributes | High |

---

## Module: Parameters

| REQ-ID | Title | Description | Module | Priority |
|--------|-------|-------------|--------|----------|
| REQ-PARAM-001 | Parameter Templates | System shall support ParameterTemplate records defining a named parameter with an optional unit of measure | Parameters | High |
| REQ-PARAM-002 | Parameter Assignment | A Part shall support zero or more PartParameter records linking a ParameterTemplate to a value | Parameters | High |
| REQ-PARAM-003 | Parameter Units | ParameterTemplate shall store the physical unit string (e.g., "Ohm", "V", "mm") associated with parameter values | Parameters | High |
| REQ-PARAM-004 | Selection Lists | ParameterTemplate shall optionally reference a ParameterSelectionList constraining allowed values to a predefined set | Parameters | Medium |
| REQ-PARAM-005 | Parameter Filtering | API shall support filtering Parts by parameter template and value | Parameters | Medium |
| REQ-PARAM-006 | Parameter Inheritance | Variant Parts shall inherit parameter templates defined on the Template Part | Parameters | Medium |

---

## Module: Templates & Variants

| REQ-ID | Title | Description | Module | Priority |
|--------|-------|-------------|--------|----------|
| REQ-VAR-001 | Variant Relationship | A Part shall optionally reference a Template Part via `variant_of` foreign key | Templates & Variants | High |
| REQ-VAR-002 | Template-Only Constraint | Only a Part with `is_template=true` may be referenced as `variant_of` by another Part | Templates & Variants | High |
| REQ-VAR-003 | Variant Listing | System shall provide an endpoint to list all variant Parts for a given Template Part | Templates & Variants | High |
| REQ-VAR-004 | Shared Serial Numbers | Template Parts shall optionally enforce a shared serial number pool across all variants | Templates & Variants | Medium |
| REQ-VAR-005 | Template Stock View | System shall aggregate stock quantities across all variants when viewing stock for a Template Part | Templates & Variants | Medium |

---

## Module: Revisions

| REQ-ID | Title | Description | Module | Priority |
|--------|-------|-------------|--------|----------|
| REQ-REV-001 | Revision Code | Each Part revision shall carry a unique revision code string (e.g., "A", "B", "Rev2") | Revisions | High |
| REQ-REV-002 | No Revision-of-Revision | A Part that is itself a revision shall not be eligible as the base for a further revision (no chained revision relationships) | Revisions | Critical |
| REQ-REV-003 | No Template Revisions | A Part with `is_template=true` shall not be revisable; revision and template flags are mutually exclusive | Revisions | Critical |
| REQ-REV-004 | Revision Listing | System shall provide an endpoint to list all revisions associated with a given base Part | Revisions | High |
| REQ-REV-005 | Revision Uniqueness | Revision codes shall be unique within the set of revisions of the same base Part | Revisions | High |

---

## Module: Stock Tracking

| REQ-ID | Title | Description | Module | Priority |
|--------|-------|-------------|--------|----------|
| REQ-STK-001 | Stock Item Association | Each StockItem shall reference exactly one Part | Stock Tracking | Critical |
| REQ-STK-002 | Quantity Tracking | System shall track current quantity on hand per StockItem | Stock Tracking | Critical |
| REQ-STK-003 | Serial Number Tracking | For Trackable Parts, each StockItem shall be assigned a unique serial number within that Part | Stock Tracking | High |
| REQ-STK-004 | Stock History | System shall maintain an immutable audit log of all stock movements and adjustments per StockItem | Stock Tracking | High |
| REQ-STK-005 | Stock Level Summary | Part detail shall expose aggregated in-stock, allocated, and available quantities | Stock Tracking | High |

---

## Module: BOM Management

| REQ-ID | Title | Description | Module | Priority |
|--------|-------|-------------|--------|----------|
| REQ-BOM-001 | BOM Line Items | Assembly Parts shall support a Bill of Materials composed of BomItem records referencing component Parts | BOM Management | Critical |
| REQ-BOM-002 | BOM Quantity | Each BomItem shall specify the required quantity of the component per assembly | BOM Management | Critical |
| REQ-BOM-003 | BOM Substitutes | Each BomItem shall optionally list one or more substitute Parts that may be used in place of the primary component | BOM Management | Medium |
| REQ-BOM-004 | BOM Validation | System shall validate BOM completeness and flag missing or insufficient stock for each BomItem | BOM Management | High |
| REQ-BOM-005 | Recursive BOM | System shall support multi-level (recursive) BOM resolution for nested assemblies | BOM Management | High |
| REQ-BOM-006 | BOM Export | System shall allow export of a Part's BOM in CSV and PDF formats | BOM Management | Medium |

---

## Module: Units of Measure

| REQ-ID | Title | Description | Module | Priority |
|--------|-------|-------------|--------|----------|
| REQ-UOM-001 | Part UOM | Each Part shall reference a unit of measure defining how quantities are expressed | Units of Measure | High |
| REQ-UOM-002 | UOM Compatibility | System shall validate that BOM quantities use compatible units when assembling Parts with differing UOM | Units of Measure | High |
| REQ-UOM-003 | Custom UOM | System shall allow administrators to define custom units of measure | Units of Measure | Medium |

---

## Module: Images

| REQ-ID | Title | Description | Module | Priority |
|--------|-------|-------------|--------|----------|
| REQ-IMG-001 | Part Image Upload | System shall allow uploading one or more images for a Part | Images | Medium |
| REQ-IMG-002 | Primary Image | System shall designate one image as the primary/thumbnail image for display in listings | Images | Medium |
| REQ-IMG-003 | Image Formats | System shall accept JPEG, PNG, and WebP image formats | Images | Medium |
| REQ-IMG-004 | Image Delete | System shall allow removal of Part images individually | Images | Low |

---

## Module: API

| REQ-ID | Title | Description | Module | Priority |
|--------|-------|-------------|--------|----------|
| REQ-API-001 | Endpoint Count | API shall expose a minimum of 68 endpoints covering all Part module resources | API | Critical |
| REQ-API-002 | Token Authentication | All API endpoints shall require and validate Token-based authentication via the `Authorization: Token <token>` header | API | Critical |
| REQ-API-003 | Pagination | All list endpoints shall support pagination via `limit` and `offset` query parameters | API | Critical |
| REQ-API-004 | Filter Parameter Coverage | List endpoints shall collectively support 50+ distinct filter query parameters across the Part module | API | High |
| REQ-API-005 | Part Filter — Name | API shall support filtering Parts by exact and partial match on `name` | API | High |
| REQ-API-006 | Part Filter — Category | API shall support filtering Parts by `category` ID (single and ancestor traversal) | API | High |
| REQ-API-007 | Part Filter — Active | API shall support filtering Parts by `active` boolean flag | API | High |
| REQ-API-008 | Part Filter — Assembly | API shall support filtering Parts by `assembly` boolean flag | API | High |
| REQ-API-009 | Part Filter — Component | API shall support filtering Parts by `component` boolean flag | API | High |
| REQ-API-010 | Part Filter — Trackable | API shall support filtering Parts by `trackable` boolean flag | API | High |
| REQ-API-011 | Part Filter — Purchaseable | API shall support filtering Parts by `purchaseable` boolean flag | API | High |
| REQ-API-012 | Part Filter — Salable | API shall support filtering Parts by `salable` boolean flag | API | High |
| REQ-API-013 | Part Filter — Virtual | API shall support filtering Parts by `virtual` boolean flag | API | Medium |
| REQ-API-014 | Part Filter — Locked | API shall support filtering Parts by `locked` boolean flag | API | Medium |
| REQ-API-015 | Part Filter — Template | API shall support filtering Parts by `is_template` boolean flag | API | Medium |
| REQ-API-016 | Part Filter — Has Stock | API shall support filtering Parts by whether they have any stock on hand | API | Medium |
| REQ-API-017 | Part Filter — Low Stock | API shall support filtering Parts that are below their minimum stock threshold | API | Medium |
| REQ-API-018 | Ordering | All list endpoints shall support ordering by relevant fields (e.g., name, creation date, stock level) | API | High |
| REQ-API-019 | Response Envelope | List responses shall include `count`, `next`, `previous`, and `results` fields conforming to DRF pagination envelope | API | High |
| REQ-API-020 | Error Responses | API shall return structured error responses with HTTP status codes and field-level validation messages | API | Critical |
| REQ-API-021 | BOM Endpoints | API shall provide dedicated endpoints for BOM item CRUD and BOM validation operations | API | Critical |
| REQ-API-022 | Parameter Endpoints | API shall provide dedicated endpoints for ParameterTemplate and PartParameter CRUD | API | High |
| REQ-API-023 | Category Tree Endpoint | API shall provide an endpoint returning the full category tree or sub-tree from a given root | API | High |
| REQ-API-024 | Stock Summary Endpoint | API shall provide a Part-level endpoint returning aggregated stock quantities | API | High |
| REQ-API-025 | Image Upload Endpoint | API shall provide a multipart/form-data endpoint for uploading Part images | API | Medium |