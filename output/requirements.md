# InvenTree Parts Module — Requirements Specification

## Summary

| Module | Critical | High | Medium | Low | Total |
|--------|----------|------|--------|-----|-------|
| CRUD | 8 | 7 | 5 | 3 | 23 |
| Categories | 4 | 5 | 4 | 2 | 15 |
| Parameters | 3 | 5 | 4 | 2 | 14 |
| Templates/Variants | 4 | 4 | 3 | 2 | 13 |
| Revisions | 5 | 4 | 2 | 1 | 12 |
| Stock | 4 | 5 | 3 | 2 | 14 |
| BOM | 5 | 5 | 4 | 2 | 16 |
| Attributes | 3 | 5 | 4 | 2 | 14 |
| Units | 2 | 3 | 3 | 2 | 10 |
| **Total** | **38** | **43** | **32** | **18** | **131** |

---

## CRUD Requirements

| REQ-ID | Title | Description | Type | Priority | Module |
|--------|-------|-------------|------|----------|--------|
| REQ-CRUD-001 | Create Part via API | `POST /api/part/` must create a new part and return HTTP 201 with the full part object including auto-assigned `pk`. | Functional | Critical | CRUD |
| REQ-CRUD-002 | Read Part by ID | `GET /api/part/{id}/` must return the complete part object (all 65+ fields) with HTTP 200 for a valid `id`. | Functional | Critical | CRUD |
| REQ-CRUD-003 | Update Part via PATCH | `PATCH /api/part/{id}/` must apply partial updates and return the updated object with HTTP 200. | Functional | Critical | CRUD |
| REQ-CRUD-004 | Update Part via PUT | `PUT /api/part/{id}/` must replace the full part representation and return HTTP 200. | Functional | Critical | CRUD |
| REQ-CRUD-005 | Delete Part | `DELETE /api/part/{id}/` must remove the part and return HTTP 204; subsequent GET must return HTTP 404. | Functional | Critical | CRUD |
| REQ-CRUD-006 | List Parts | `GET /api/part/` must return a paginated list of parts with `count`, `next`, `previous`, and `results` fields. | Functional | Critical | CRUD |
| REQ-CRUD-007 | Required Field — name | Part creation must fail with HTTP 400 if `name` is absent or empty. | Functional | Critical | CRUD |
| REQ-CRUD-008 | Part name max length | `name` field must be rejected with HTTP 400 if it exceeds 100 characters. | Functional | Critical | CRUD |
| REQ-CRUD-009 | IPN max length | `IPN` (Internal Part Number) must be rejected with HTTP 400 if it exceeds 100 characters. | Functional | High | CRUD |
| REQ-CRUD-010 | Description max length | `description` must be rejected with HTTP 400 if it exceeds 250 characters. | Functional | High | CRUD |
| REQ-CRUD-011 | Keywords max length | `keywords` must be rejected with HTTP 400 if it exceeds 250 characters. | Functional | High | CRUD |
| REQ-CRUD-012 | Notes max length | `notes` must be rejected with HTTP 400 if it exceeds 50000 characters. | Functional | High | CRUD |
| REQ-CRUD-013 | Link field URI validation | `link` must be a valid URI and rejected with HTTP 400 if it exceeds 2000 characters or is not a valid URL format. | Functional | High | CRUD |
| REQ-CRUD-014 | Units max length | `units` must be rejected with HTTP 400 if it exceeds 20 characters. | Functional | High | CRUD |
| REQ-CRUD-015 | Pagination — limit/offset | `GET /api/part/` must support `limit` and `offset` query parameters for pagination. | Functional | High | CRUD |
| REQ-CRUD-016 | Non-existent Part returns 404 | `GET /api/part/{id}/` for a non-existent `id` must return HTTP 404. | Functional | Medium | CRUD |
| REQ-CRUD-017 | Search filter | `GET /api/part/?search=<term>` must return only parts where `name`, `description`, `IPN`, or `keywords` match the search term. | Functional | Medium | CRUD |
| REQ-CRUD-018 | Ordering filter | `GET /api/part/?ordering=<field>` must return results sorted by the specified field; descending order via `-<field>`. | Functional | Medium | CRUD |
| REQ-CRUD-019 | Import from file | The system must support bulk part creation via file import (CSV/spreadsheet). | Functional | Medium | CRUD |
| REQ-CRUD-020 | Import from supplier | The system must support creating parts by importing from a supplier catalog. | Functional | Medium | CRUD |
| REQ-CRUD-021 | Part pk immutability | The `pk` field must not be modifiable after creation; PATCH/PUT attempts to change `pk` must be ignored or rejected. | Functional | Low | CRUD |
| REQ-CRUD-022 | Part list response time | `GET /api/part/` with default pagination must respond within 2 seconds for up to 10,000 parts. | Non-Functional | Low | CRUD |
| REQ-CRUD-023 | Concurrent update safety | Concurrent PATCH requests on the same part must not produce data corruption; last-write-wins or optimistic locking must apply. | Non-Functional | Low | CRUD |

---

## Categories Requirements

| REQ-ID | Title | Description | Type | Priority | Module |
|--------|-------|-------------|------|----------|--------|
| REQ-CAT-001 | Create Category via API | `POST /api/part/category/` must create a new category and return HTTP 201 with the category object. | Functional | Critical | Categories |
| REQ-CAT-002 | Hierarchical parent-child | A category must support a `parent` FK reference to another category, enabling multi-level hierarchy. | Functional | Critical | Categories |
| REQ-CAT-003 | List Categories | `GET /api/part/category/` must return all categories with hierarchy metadata (`parent`, `pathstring`). | Functional | Critical | Categories |
| REQ-CAT-004 | Delete Category cascade | Deleting a category must either cascade-delete or re-parent its child categories; orphaned categories must not be allowed. | Functional | Critical | Categories |
| REQ-CAT-005 | Filter parts by category | `GET /api/part/?category=<id>` must return only parts belonging to the specified category. | Functional | High | Categories |
| REQ-CAT-006 | Filter parts by category subtree | The category filter must support an option to include parts from all descendant categories, not just direct children. | Functional | High | Categories |
| REQ-CAT-007 | Category name required | Category creation must fail with HTTP 400 if `name` is absent or empty. | Functional | High | Categories |
| REQ-CAT-008 | Circular parent prevention | The API must reject with HTTP 400 any attempt to set a category's `parent` to itself or to one of its own descendants. | Functional | High | Categories |
| REQ-CAT-009 | Parametric table for category | Each category must support a parametric table view listing all parts in the category alongside their parameter values. | Functional | High | Categories |
| REQ-CAT-010 | Category path string | Each category must expose a computed `pathstring` (e.g., `Electronics / Resistors / SMD`) derived from its ancestor chain. | Functional | Medium | Categories |
| REQ-CAT-011 | Move parts between categories | Updating a part's `category` FK must correctly reassign the part without data loss. | Functional | Medium | Categories |
| REQ-CAT-012 | Category part count | Each category object must expose the count of parts directly and/or transitively assigned to it. | Functional | Medium | Categories |
| REQ-CAT-013 | Default category parameters | A category may define default parameter templates that are automatically suggested when creating parts in that category. | Functional | Medium | Categories |
| REQ-CAT-014 | Category without parent | A category with no `parent` must be treated as a root-level category; `parent` must be nullable. | Functional | Low | Categories |
| REQ-CAT-015 | Category deletion with assigned parts | Deleting a category that has assigned parts must warn or require re-assignment of parts before deletion proceeds. | Functional | Low | Categories |

---

## Parameters Requirements

| REQ-ID | Title | Description | Type | Priority | Module |
|--------|-------|-------------|------|----------|--------|
| REQ-PARAM-001 | Create parameter template | The system must support creating parameter templates with `name`, `units`, and optional `description`. | Functional | Critical | Parameters |
| REQ-PARAM-002 | Assign parameter to part | A parameter value must be assignable to a part by referencing a parameter template and providing a value. | Functional | Critical | Parameters |
| REQ-PARAM-003 | Parameter value required | Assigning a parameter to a part must fail if no value is provided (unless the template marks value as optional). | Functional | Critical | Parameters |
| REQ-PARAM-004 | List part parameters | `GET /api/part/{id}/` or a sub-endpoint must return all parameters assigned to a part. | Functional | High | Parameters |
| REQ-PARAM-005 | Delete parameter from part | Removing a parameter assignment from a part must not affect the parameter template or other parts. | Functional | High | Parameters |
| REQ-PARAM-006 | Parameter units linkage | A parameter template may reference a unit of measure; assigned values must be validated against that unit type. | Functional | High | Parameters |
| REQ-PARAM-007 | Selection list for parameters | Parameter templates must support a constrained list of allowed values (selection list); values outside the list must be rejected. | Functional | High | Parameters |
| REQ-PARAM-008 | Parametric sorting | The parts list must support sorting by a specific parameter value column in the parametric table view. | Functional | High | Parameters |
| REQ-PARAM-009 | Parametric filter | `GET /api/part/` must support filtering by parameter template and value range or exact match. | Functional | Medium | Parameters |
| REQ-PARAM-010 | Duplicate parameter prevention | A part must not have two parameter values assigned for the same parameter template. | Functional | Medium | Parameters |
| REQ-PARAM-011 | Parameter template name unique | Parameter template names must be unique across the system to avoid ambiguity. | Functional | Medium | Parameters |
| REQ-PARAM-012 | Bulk parameter assignment | The system should support assigning the same parameter value to multiple parts in a single operation. | Functional | Medium | Parameters |
| REQ-PARAM-013 | Parameter value update | An existing parameter value on a part must be updatable via PATCH without deleting and re-creating it. | Functional | Low | Parameters |
| REQ-PARAM-014 | Parameter display in part detail | The part detail view must display all assigned parameters in a dedicated Parameters tab. | Functional | Low | Parameters |

---

## Templates/Variants Requirements

| REQ-ID | Title | Description | Type | Priority | Module |
|--------|-------|-------------|------|----------|--------|
| REQ-TMPL-001 | Template part flag | Setting `is_template=true` on a part must designate it as a template; it must not itself be treated as a stockable item. | Functional | Critical | Templates/Variants |
| REQ-TMPL-002 | Create variant from template | A variant must be created by setting `variant_of=<template_pk>`; the system must validate the referenced part is a template. | Functional | Critical | Templates/Variants |
| REQ-TMPL-003 | Template cannot be variant | A part with `is_template=true` must not simultaneously have `variant_of` set; the API must reject such a configuration with HTTP 400. | Functional | Critical | Templates/Variants |
| REQ-TMPL-004 | Stock rollup across variants | The system must aggregate stock quantities across all variants of a template part and expose the total on the template. | Functional | Critical | Templates/Variants |
| REQ-TMPL-005 | List variants for template | `GET /api/part/?variant_of=<id>` (or equivalent) must return all variant children of a given template. | Functional | High | Templates/Variants |
| REQ-TMPL-006 | Variant inherits template parameters | Variants must optionally inherit parameter templates defined on their parent template. | Functional | High | Templates/Variants |
| REQ-TMPL-007 | Template part in BOM | A template part may be used in a BOM line item to allow any of its variants to satisfy the requirement. | Functional | High | Templates/Variants |
| REQ-TMPL-008 | Variants tab in part detail | The part detail view for a template part must display a Variants tab listing all child variants with their stock levels. | Functional | High | Templates/Variants |
| REQ-TMPL-009 | Variant-of FK validation | Setting `variant_of` to a non-existent part `pk` must return HTTP 400. | Functional | Medium | Templates/Variants |
| REQ-TMPL-010 | Variant cannot have sub-variants | A variant part (`variant_of` is set) must not itself be set as `is_template` to prevent multi-level variant trees (unless explicitly supported). | Functional | Medium | Templates/Variants |
| REQ-TMPL-011 | Unlink variant from template | Clearing `variant_of` on a variant must convert it to a standalone part without deleting its stock or parameters. | Functional | Medium | Templates/Variants |
| REQ-TMPL-012 | Template part not directly purchaseable | Template parts should not be directly purchaseable/salable at the template level; purchases must be against a specific variant. | Functional | Low | Templates/Variants |
| REQ-TMPL-013 | Filter is_template | `GET /api/part/?is_template=true` must return only template parts; `?is_template=false` must exclude templates. | Functional | Low | Templates/Variants |

---

## Revisions Requirements

| REQ-ID | Title | Description | Type | Priority | Module |
|--------|-------|-------------|------|----------|--------|
| REQ-REV-001 | Create revision | A revision must be created by setting `revision_of=<part_pk>` and a unique `revision` code on the new part. | Functional | Critical | Revisions |
| REQ-REV-002 | Unique revision code per part | Two revisions of the same part must not share the same `revision` code; the API must reject duplicates with HTTP 400. | Functional | Critical | Revisions |
| REQ-REV-003 | No template revision | Setting `revision_of` on a part that has `is_template=true` must be rejected with HTTP 400. | Functional | Critical | Revisions |
| REQ-REV-004 | No revision-of-revision | Setting `revision_of` to a part that is itself a revision (already has `revision_of` set) must be rejected with HTTP 400 to prevent chaining. | Functional | Critical | Revisions |
| REQ-REV-005 | Circular revision prevention | The system must detect and reject circular `revision_of` references (e.g., A → B → A) with HTTP 400. | Functional | Critical | Revisions |
| REQ-REV-006 | List revisions for a part | The system must provide a way to list all revisions associated with a base part. | Functional | High | Revisions |
| REQ-REV-007 | Revisions tab in part detail | The part detail view must display a Revisions tab listing all revision variants with their `revision` code and status. | Functional | High | Revisions |
| REQ-REV-008 | Revision code field | The `revision` field must be a non-empty string when `revision_of` is set; combination of (`revision_of`, `revision`) must be unique. | Functional | High | Revisions |
| REQ-REV-009 | Revision inherits base attributes | When creating a revision, the system should optionally copy attributes from the base part to the new revision. | Functional | High | Revisions |
| REQ-REV-010 | Revision active status independent | Each revision must have its own `active` flag independently of the base part or other revisions. | Functional | Medium | Revisions |
| REQ-REV-011 | Delete revision | Deleting a revision must remove only that revision; the base part and other revisions must remain unaffected. | Functional | Medium | Revisions |
| REQ-REV-012 | Revision stock isolation | Stock items must be attached to a specific revision, not to the base part, when revisions are in use. | Functional | Low | Revisions |

---

## Stock Requirements

| REQ-ID | Title | Description | Type | Priority | Module |
|--------|-------|-------------|------|----------|--------|
| REQ-STK-001 | Stock quantity tracking | The system must track the current quantity of each stock item linked to a part, updated on every stock movement. | Functional | Critical | Stock |
| REQ-STK-002 | Serial number tracking | For trackable parts, each stock item must carry a unique serial number that cannot be duplicated for the same part. | Functional | Critical | Stock |
| REQ-STK-003 | Stock location assignment | Each stock item must be assignable to a stock location; the current location must be stored and retrievable. | Functional | Critical | Stock |
| REQ-STK-004 | Stock history | Every stock movement (add, remove, transfer, adjust) must be recorded in the stock item's history log with timestamp and user. | Functional | Critical | Stock |
| REQ-STK-005 | Stock tab in part detail | The part detail view must display a Stock tab summarizing total stock quantity and listing individual stock items. | Functional | High | Stock |
| REQ-STK-006 | Batch code tracking | Stock items must support an optional batch code field for grouping items from the same production batch. | Functional | High | Stock |
| REQ-STK-007 | Minimum stock threshold | If a part has `minimum_stock` set, the system must indicate when current stock falls below that threshold. | Functional | High | Stock |
| REQ-STK-008 | Filter has_stock | `GET /api/part/?has_stock=true` must return only parts with at least one stock item with quantity > 0. | Functional | High | Stock |
| REQ-STK-009 | Stock allocated display | The part detail view must display how much stock is allocated to build orders or sales orders in an Allocated tab. | Functional | High | Stock |
| REQ-STK-010 | Serial numbers endpoint | `GET /api/part/{id}/serial-numbers/` must return the next available serial number and used serial numbers for a trackable part. | Functional | Medium | Stock |
| REQ-STK-011 | Stocktake endpoint | `POST /api/part/{id}/stocktake/` (or equivalent) must support recording a physical stock count with date and quantity. | Functional | Medium | Stock |
| REQ-STK-012 | Stock rollup for template | For template parts, the Stock tab must show aggregated stock across all variants. | Functional | Medium | Stock |
| REQ-STK-013 | Stock item quantity non-negative | Stock item quantity must not be allowed to go below zero for non-serialized items. | Functional | Low | Stock |
| REQ-STK-014 | Stock location hierarchy | Stock locations must support a hierarchical structure; a stock item assigned to a sub-location must be visible in parent location queries. | Functional | Low | Stock |

---

## BOM Requirements

| REQ-ID | Title | Description | Type | Priority | Module |
|--------|-------|-------------|------|----------|--------|
| REQ-BOM-001 | BOM line item creation | `POST` to the BOM endpoint must create a line item linking a sub-part to an assembly part with a specified quantity. | Functional | Critical | BOM |
| REQ-BOM-002 | Assembly flag required | A part must have `assembly=true` to have a BOM; creating BOM lines for a non-assembly part must be rejected. | Functional | Critical | BOM |
| REQ-BOM-003 | BOM validation | `POST /api/part/{id}/bom-validate/` must mark the BOM as validated and record the validation timestamp and user. | Functional | Critical | BOM |
| REQ-BOM-004 | Multi-level BOM traversal | The system must support traversal and reporting of multi-level BOMs (assemblies containing sub-assemblies). | Functional | Critical | BOM |
| REQ-BOM-005 | Circular BOM prevention | The system must detect and reject circular BOM references (e.g., Part A contains Part B which contains Part A) with HTTP 400. | Functional | Critical | BOM |
| REQ-BOM-006 | BOM copy endpoint | `POST /api/part/{id}/bom-copy/` must copy the BOM from another assembly part to the target part. | Functional | High | BOM |
| REQ-BOM-007 | BOM substitutes | A BOM line item must support one or more substitute parts that can be used in place of the primary sub-part. | Functional | High | BOM |
| REQ-BOM-008 | BOM inherited items | Sub-assembly BOM items must be optionally inheritable by parent assemblies in multi-level BOM reporting. | Functional | High | BOM |
| REQ-BOM-009 | Consumable BOM items | BOM line items must support a `consumable` flag indicating the item is consumed during assembly and not returned to stock. | Functional | High | BOM |
| REQ-BOM-010 | BOM tab in part detail | The part detail view must display a BOM tab listing all line items with sub-part, quantity, and reference fields. | Functional | High | BOM |
| REQ-BOM-011 | BOM line item quantity positive | BOM line item quantity must be a positive number; zero or negative quantities must be rejected with HTTP 400. | Functional | Medium | BOM |
| REQ-BOM-012 | Delete BOM line item | Deleting a BOM line item must not affect the referenced sub-part or the assembly part itself. | Functional | Medium | BOM |
| REQ-BOM-013 | BOM pricing endpoint | `GET /api/part/{id}/pricing/` must aggregate pricing data from BOM line items to compute assembly cost. | Functional | Medium | BOM |
| REQ-BOM-014 | BOM requirements endpoint | `GET /api/part/{id}/requirements/` must return the total stock required to build a specified quantity of the assembly. | Functional | Medium | BOM |
| REQ-BOM-015 | BOM invalidation on edit | Editing a BOM line item after validation must mark the BOM as unvalidated until re-validated. | Functional | Low | BOM |
| REQ-BOM-016 | BOM line reference field | BOM line items must support a free-text `reference` field for designator or placement information. | Functional | Low | BOM |

---

## Attributes Requirements

| REQ-ID | Title | Description | Type | Priority | Module |
|--------|-------|-------------|------|----------|--------|
| REQ-ATTR-001 | Active/Inactive toggle | A part must support an `active` boolean field; inactive parts must be filterable and visually distinguishable. | Functional | Critical | Attributes |
| REQ-ATTR-002 | Locked part enforcement | A part with `locked=true` must prevent editing of its fields until explicitly unlocked; the API must return HTTP 400 on modification attempts. | Functional | Critical | Attributes |
| REQ-ATTR-003 | Assembly attribute | Setting `assembly=true` must enable the BOM management feature for that part; the BOM tab must appear in the UI. | Functional | Critical | Attributes |
| REQ-ATTR-004 | Virtual part | Setting `virtual=true` must indicate the part has no physical stock; stock tracking must be disabled or zeroed for virtual parts. | Functional | High | Attributes |
| REQ-ATTR-005 | Component attribute | `component=true` must flag the part as usable as a sub-component in BOMs. | Functional | High | Attributes |
| REQ-ATTR-006 | Testable attribute | `testable=true` must enable test templates and test result recording for stock items of that part. | Functional | High | Attributes |
| REQ-ATTR-007 | Trackable attribute | `trackable=true` must require serial numbers for all stock items of that part; bulk non-serialized stock must be rejected. | Functional | High | Attributes |
| REQ-ATTR-008 | Purchaseable attribute | `purchaseable=true` must enable supplier part linking and purchase order creation for the part. | Functional | High | Attributes |
| REQ-ATTR-009 | Salable attribute | `salable=true` must enable the part to appear in sales orders. | Functional | High | Attributes |
| REQ-ATTR-010 | Filter by active | `GET /api/part/?active=true` must return only active parts; `?active=false` must return only inactive parts. | Functional | Medium | Attributes |
| REQ-ATTR-011 | Filter by assembly | `GET /api/part/?assembly=true` must return only parts flagged as assemblies. | Functional | Medium | Attributes |
| REQ-ATTR-012 | Filter by component | `GET /api/part/?component=true` must return only parts flagged as components. | Functional | Medium | Attributes |
| REQ-ATTR-013 | Filter by purchaseable | `GET /api/part/?purchaseable=true` must return only purchaseable parts. | Functional | Medium | Attributes |
| REQ-ATTR-014 | Default location | `default_location` FK must reference a valid stock location; an invalid FK must be rejected with HTTP 400. | Functional | Low | Attributes |

---

## Units Requirements

| REQ-ID | Title | Description | Type | Priority | Module |
|--------|-------|-------------|------|----------|--------|
| REQ-UNIT-001 | Custom unit definition | The system must support defining custom units of measure beyond SI base units. | Functional | Critical | Units |
| REQ-UNIT-002 | Physical unit validation | When a parameter template references a physical unit, values assigned to that parameter must be convertible to/from that unit. | Functional | Critical | Units |
| REQ-UNIT-003 | Part units field | The `units` field on a part (max 20 chars) must store the unit of measure for the part quantity (e.g., "pcs", "m", "kg"). | Functional | High | Units |
| REQ-UNIT-004 | Supplier part units | Supplier parts must support their own unit of measure, which may differ from the part's base unit (with a defined conversion factor). | Functional | High | Units |
| REQ-UNIT-005 | Unit conversion in stock | When a supplier part unit differs from the part unit, stock received must be converted using the defined conversion factor. | Functional | High | Units |
| REQ-UNIT-006 | Units max length enforced | The `units` field must be rejected with HTTP 400 if it exceeds 20 characters. | Functional | Medium | Units |
| REQ-UNIT-007 | Unit displayed in parametric table | Part units must be displayed alongside values in parametric table views and parameter listings. | Functional | Medium | Units |
| REQ-UNIT-008 | Unit-less parts allowed | `units` must be optional (nullable/blank); parts without a defined unit must behave as dimensionless/count-based. | Functional | Medium | Units |
| REQ-UNIT-009 | Invalid unit rejected for parameter | Assigning a value with an incompatible unit to a parameter template that has a unit defined must return HTTP 400. | Functional | Low | Units |
| REQ-UNIT-010 | Unit persistence on update | Updating a part's `units` field must not affect existing stock quantities; only future stock transactions use the new unit. | Functional | Low | Units |