# InvenTree Parts Module — API Manual Test Cases

> Generated: 2026-04-14
> Auth: Token authentication (`Authorization: Token <token>` header required on all requests)
> Base URL: `http://<host>/api`

---

## Legend

| Column | Description |
|--------|-------------|
| TC-ID | Unique test case identifier |
| Title | Short description of what is being tested |
| Method | HTTP method |
| Endpoint | API path (relative to base URL) |
| Expected Status | HTTP response status code(s) |
| Priority | Critical / High / Medium / Low |

---

## 1. Authentication

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-AUTH-001 | Request without auth token | GET | /api/part/ | 401 | Critical |
| TC-AUTH-002 | Request with invalid token | GET | /api/part/ | 401 | Critical |
| TC-AUTH-003 | Request with valid token | GET | /api/part/ | 200 | Critical |

**TC-AUTH-001 Steps:**
1. Send `GET /api/part/` with no `Authorization` header.
2. Verify response status is `401`.
3. Verify response body contains an error/detail message.

**TC-AUTH-002 Steps:**
1. Send `GET /api/part/` with header `Authorization: Token invalidtoken123`.
2. Verify response status is `401`.

**TC-AUTH-003 Steps:**
1. Send `GET /api/part/` with valid token.
2. Verify response status is `200`.
3. Verify response body contains `results` array and pagination fields.

---

## 2. Part CRUD — Create (REQ-PART-001, REQ-PART-002, REQ-PART-003, REQ-PART-004)

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-PART-C-001 | Create part with all required fields | POST | /api/part/ | 201 | Critical |
| TC-PART-C-002 | Create part with all optional fields | POST | /api/part/ | 201 | Critical |
| TC-PART-C-003 | Create part without category | POST | /api/part/ | 400 | Critical |
| TC-PART-C-004 | Create part without name | POST | /api/part/ | 400 | Critical |
| TC-PART-C-005 | Name exactly 100 characters | POST | /api/part/ | 201 | Critical |
| TC-PART-C-006 | Name 101 characters (over limit) | POST | /api/part/ | 400 | Critical |
| TC-PART-C-007 | Description exactly 250 characters | POST | /api/part/ | 201 | High |
| TC-PART-C-008 | Description 251 characters (over limit) | POST | /api/part/ | 400 | High |
| TC-PART-C-009 | Create part with empty name | POST | /api/part/ | 400 | Critical |
| TC-PART-C-010 | Create part with non-existent category ID | POST | /api/part/ | 400 | Critical |
| TC-PART-C-011 | Create part with duplicate IPN | POST | /api/part/ | 400 | High |
| TC-PART-C-012 | Create part with valid variant_of reference | POST | /api/part/ | 201 | High |
| TC-PART-C-013 | Create part with non-existent variant_of ID | POST | /api/part/ | 400 | High |
| TC-PART-C-014 | Create part with valid revision_of reference | POST | /api/part/ | 201 | High |
| TC-PART-C-015 | Create part with boolean flags set to true | POST | /api/part/ | 201 | High |
| TC-PART-C-016 | Create part with name containing special characters | POST | /api/part/ | 201 | Medium |
| TC-PART-C-017 | Create part with name containing only whitespace | POST | /api/part/ | 400 | Medium |
| TC-PART-C-018 | Create part with empty request body | POST | /api/part/ | 400 | High |

**TC-PART-C-001 Steps:**
1. Ensure a valid category exists (note its ID, e.g., `1`).
2. POST `/api/part/` with body:
   ```json
   {
     "name": "Test Resistor",
     "category": 1
   }
   ```
3. Verify status `201`.
4. Verify response body contains `id` field (numeric).
5. Verify `name` equals `"Test Resistor"` and `category` equals `1`.
6. Note the returned `id` for use in subsequent tests.

**TC-PART-C-003 Steps:**
1. POST `/api/part/` with body:
   ```json
   { "name": "No Category Part" }
   ```
2. Verify status `400`.
3. Verify response body contains error referencing `category` field.

**TC-PART-C-005 Steps:**
1. POST `/api/part/` with `name` field set to exactly 100 characters (e.g., `"A" * 100`).
2. Verify status `201`.
3. Verify returned `name` length equals `100`.

**TC-PART-C-006 Steps:**
1. POST `/api/part/` with `name` field set to 101 characters.
2. Verify status `400`.
3. Verify response body references `name` field constraint.

**TC-PART-C-015 Steps:**
1. POST `/api/part/` with body:
   ```json
   {
     "name": "Boolean Test Part",
     "category": 1,
     "active": true,
     "assembly": true,
     "component": true,
     "virtual": true,
     "is_template": true,
     "trackable": true,
     "purchaseable": true,
     "salable": true,
     "testable": true
   }
   ```
2. Verify status `201`.
3. Verify all boolean fields in response match submitted values.

---

## 3. Part CRUD — Read (REQ-PART-005)

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-PART-R-001 | Retrieve existing part by ID | GET | /api/part/{id}/ | 200 | Critical |
| TC-PART-R-002 | Retrieve non-existent part ID | GET | /api/part/999999/ | 404 | Critical |
| TC-PART-R-003 | Retrieve part — verify all fields present | GET | /api/part/{id}/ | 200 | Critical |
| TC-PART-R-004 | Retrieve part with string ID (invalid) | GET | /api/part/abc/ | 404 | Medium |
| TC-PART-R-005 | Retrieve part with negative ID | GET | /api/part/-1/ | 404 | Medium |

**TC-PART-R-001 Steps:**
1. Use the `id` from TC-PART-C-001 (or create a known part first).
2. GET `/api/part/{id}/`.
3. Verify status `200`.
4. Verify `id` in response matches requested ID.

**TC-PART-R-003 Steps:**
1. GET `/api/part/{id}/` for a known part.
2. Verify response contains all documented fields:
   `id`, `name`, `description`, `category`, `IPN`, `active`, `assembly`, `component`, `virtual`, `is_template`, `trackable`, `purchaseable`, `salable`, `testable`, `variant_of`, `revision_of`, `units`, `keywords`, `link`, `tags`.

---

## 4. Part CRUD — Update (REQ-PART-006)

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-PART-U-001 | Full update (PUT) of existing part | PUT | /api/part/{id}/ | 200 | Critical |
| TC-PART-U-002 | Partial update (PATCH) — update name only | PATCH | /api/part/{id}/ | 200 | Critical |
| TC-PART-U-003 | Partial update (PATCH) — update description | PATCH | /api/part/{id}/ | 200 | Critical |
| TC-PART-U-004 | Partial update (PATCH) — update category | PATCH | /api/part/{id}/ | 200 | Critical |
| TC-PART-U-005 | Update name to 100 characters (boundary) | PATCH | /api/part/{id}/ | 200 | Critical |
| TC-PART-U-006 | Update name to 101 characters (over limit) | PATCH | /api/part/{id}/ | 400 | Critical |
| TC-PART-U-007 | Update description to 250 characters (boundary) | PATCH | /api/part/{id}/ | 200 | High |
| TC-PART-U-008 | Update description to 251 characters (over limit) | PATCH | /api/part/{id}/ | 400 | High |
| TC-PART-U-009 | Update non-existent part ID | PUT | /api/part/999999/ | 404 | Critical |
| TC-PART-U-010 | Update category to non-existent ID | PATCH | /api/part/{id}/ | 400 | Critical |
| TC-PART-U-011 | Update — set active to false | PATCH | /api/part/{id}/ | 200 | High |
| TC-PART-U-012 | Update — toggle assembly flag | PATCH | /api/part/{id}/ | 200 | High |
| TC-PART-U-013 | Update — set variant_of to valid template part | PATCH | /api/part/{id}/ | 200 | High |
| TC-PART-U-014 | PUT without required name field | PUT | /api/part/{id}/ | 400 | High |
| TC-PART-U-015 | PUT without required category field | PUT | /api/part/{id}/ | 400 | Critical |

**TC-PART-U-001 Steps:**
1. GET `/api/part/{id}/` to retrieve current state.
2. PUT `/api/part/{id}/` with full updated body (all required fields + changes).
3. Verify status `200`.
4. Verify response reflects updated values.
5. GET `/api/part/{id}/` again and confirm persisted changes.

**TC-PART-U-002 Steps:**
1. PATCH `/api/part/{id}/` with body:
   ```json
   { "name": "Updated Part Name" }
   ```
2. Verify status `200`.
3. Verify response `name` equals `"Updated Part Name"`.
4. Verify other fields are unchanged.

---

## 5. Part CRUD — Delete (REQ-PART-007)

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-PART-D-001 | Delete existing part with no stock/BOM | DELETE | /api/part/{id}/ | 204 | Critical |
| TC-PART-D-002 | Delete non-existent part ID | DELETE | /api/part/999999/ | 404 | Critical |
| TC-PART-D-003 | Delete part with active stock | DELETE | /api/part/{id}/ | 400 | Critical |
| TC-PART-D-004 | Delete part with BOM references | DELETE | /api/part/{id}/ | 400 | Critical |
| TC-PART-D-005 | Verify deleted part is no longer retrievable | GET | /api/part/{id}/ | 404 | Critical |

**TC-PART-D-001 Steps:**
1. Create a new part (POST) with no stock or BOM references, note its `id`.
2. DELETE `/api/part/{id}/`.
3. Verify status `204` (No Content).
4. GET `/api/part/{id}/` — verify `404`.

**TC-PART-D-003 Steps:**
1. Identify or create a part that has active stock entries.
2. DELETE `/api/part/{id}/`.
3. Verify status `400`.
4. Verify response body explains the deletion was prevented (stock reference).

**TC-PART-D-004 Steps:**
1. Identify or create a part that is referenced in a BOM.
2. DELETE `/api/part/{id}/`.
3. Verify status `400`.
4. Verify response body explains the deletion was prevented (BOM reference).

---

## 6. Part List & Filtering (REQ-PART-008)

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-PART-L-001 | List all parts (default pagination) | GET | /api/part/ | 200 | Critical |
| TC-PART-L-002 | Verify pagination fields in response | GET | /api/part/ | 200 | Critical |
| TC-PART-L-003 | Filter by active=true | GET | /api/part/?active=true | 200 | Critical |
| TC-PART-L-004 | Filter by active=false | GET | /api/part/?active=false | 200 | Critical |
| TC-PART-L-005 | Filter by category ID | GET | /api/part/?category={id} | 200 | Critical |
| TC-PART-L-006 | Filter by assembly=true | GET | /api/part/?assembly=true | 200 | High |
| TC-PART-L-007 | Filter by assembly=false | GET | /api/part/?assembly=false | 200 | High |
| TC-PART-L-008 | Search by name keyword | GET | /api/part/?search={keyword} | 200 | Critical |
| TC-PART-L-009 | Search by IPN | GET | /api/part/?search={IPN} | 200 | High |
| TC-PART-L-010 | Order by name ascending | GET | /api/part/?ordering=name | 200 | High |
| TC-PART-L-011 | Order by name descending | GET | /api/part/?ordering=-name | 200 | High |
| TC-PART-L-012 | Pagination — limit parameter | GET | /api/part/?limit=5 | 200 | Critical |
| TC-PART-L-013 | Pagination — offset parameter | GET | /api/part/?limit=5&offset=5 | 200 | Critical |
| TC-PART-L-014 | Pagination — limit=0 (edge case) | GET | /api/part/?limit=0 | 200 | Medium |
| TC-PART-L-015 | Combine filters — category + active | GET | /api/part/?category={id}&active=true | 200 | High |
| TC-PART-L-016 | Combine filters — assembly + search | GET | /api/part/?assembly=true&search={kw} | 200 | High |
| TC-PART-L-017 | Filter with non-existent category ID | GET | /api/part/?category=999999 | 200 | Medium |
| TC-PART-L-018 | Invalid filter value for active | GET | /api/part/?active=notabool | 200 | Low |
| TC-PART-L-019 | Very large offset (beyond total count) | GET | /api/part/?offset=999999 | 200 | Medium |

**TC-PART-L-001 Steps:**
1. GET `/api/part/`.
2. Verify status `200`.
3. Verify response body is JSON object.

**TC-PART-L-002 Steps:**
1. GET `/api/part/`.
2. Verify response contains: `count` (integer), `next` (URL or null), `previous` (URL or null), `results` (array).

**TC-PART-L-003 Steps:**
1. GET `/api/part/?active=true`.
2. Verify status `200`.
3. Verify every item in `results` has `active: true`.

**TC-PART-L-005 Steps:**
1. Note an existing category ID.
2. GET `/api/part/?category={id}`.
3. Verify status `200`.
4. Verify every item in `results` has `category` matching queried ID.

**TC-PART-L-012 Steps:**
1. GET `/api/part/?limit=5`.
2. Verify status `200`.
3. Verify `results` array length is at most `5`.

**TC-PART-L-013 Steps:**
1. GET `/api/part/?limit=5&offset=0` — note first result `id`.
2. GET `/api/part/?limit=5&offset=5` — note first result `id`.
3. Verify the two first `id` values are different (non-overlapping pages).

**TC-PART-L-017 Steps:**
1. GET `/api/part/?category=999999`.
2. Verify status `200`.
3. Verify `results` is an empty array and `count` is `0`.

---

## 7. Category CRUD (REQ-CAT-001, REQ-CAT-002)

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-CAT-C-001 | Create root category (no parent) | POST | /api/part/category/ | 201 | Critical |
| TC-CAT-C-002 | Create child category with valid parent | POST | /api/part/category/ | 201 | Critical |
| TC-CAT-C-003 | Create category without name | POST | /api/part/category/ | 400 | Critical |
| TC-CAT-C-004 | Create category with non-existent parent | POST | /api/part/category/ | 400 | Critical |
| TC-CAT-R-001 | Retrieve category by ID | GET | /api/part/category/{id}/ | 200 | Critical |
| TC-CAT-R-002 | Retrieve non-existent category | GET | /api/part/category/999999/ | 404 | Critical |
| TC-CAT-U-001 | Update category name (PATCH) | PATCH | /api/part/category/{id}/ | 200 | Critical |
| TC-CAT-U-002 | Update category parent (PATCH) | PATCH | /api/part/category/{id}/ | 200 | High |
| TC-CAT-U-003 | Set category parent to itself (circular) | PATCH | /api/part/category/{id}/ | 400 | High |
| TC-CAT-D-001 | Delete empty category | DELETE | /api/part/category/{id}/ | 204 | Critical |
| TC-CAT-D-002 | Delete category with child categories | DELETE | /api/part/category/{id}/ | 400 | Critical |
| TC-CAT-D-003 | Delete category with assigned parts | DELETE | /api/part/category/{id}/ | 400 | Critical |
| TC-CAT-L-001 | List all categories | GET | /api/part/category/ | 200 | Critical |
| TC-CAT-L-002 | Verify part_count field in category list | GET | /api/part/category/ | 200 | Medium |

**TC-CAT-C-001 Steps:**
1. POST `/api/part/category/` with body:
   ```json
   { "name": "Root Category" }
   ```
2. Verify status `201`.
3. Verify `parent` is `null` in response.

**TC-CAT-C-002 Steps:**
1. Use root category `id` from TC-CAT-C-001.
2. POST `/api/part/category/` with body:
   ```json
   { "name": "Child Category", "parent": {root_id} }
   ```
3. Verify status `201`.
4. Verify `parent` equals `{root_id}`.

**TC-CAT-U-003 Steps:**
1. Note a category's own `id`.
2. PATCH `/api/part/category/{id}/` with body `{ "parent": {same_id} }`.
3. Verify status `400` (circular reference rejected).

---

## 8. Category Hierarchy & Tree (REQ-CAT-001, REQ-CAT-002)

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-TREE-001 | Retrieve category tree | GET | /api/part/category/tree/ | 200 | Critical |
| TC-TREE-002 | Tree includes root-level categories | GET | /api/part/category/tree/ | 200 | Critical |
| TC-TREE-003 | Tree includes nested child categories | GET | /api/part/category/tree/ | 200 | Critical |
| TC-TREE-004 | Tree — 3-level deep hierarchy visible | GET | /api/part/category/tree/ | 200 | High |

**TC-TREE-001 Steps:**
1. GET `/api/part/category/tree/`.
2. Verify status `200`.
3. Verify response is a JSON array.

**TC-TREE-002 Steps:**
1. GET `/api/part/category/tree/`.
2. Identify root categories (those without a parent).
3. Verify at least one root category appears in the tree response.

**TC-TREE-003 Steps:**
1. Create a 3-level hierarchy: `Root → Child → Grandchild`.
2. GET `/api/part/category/tree/`.
3. Verify `Root` appears with a `children` list containing `Child`.
4. Verify `Child` contains `Grandchild` in its `children`.

---

## 9. Category Filtering (REQ-CAT-003, REQ-CAT-005)

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-CAT-F-001 | Filter parts by direct category | GET | /api/part/?category={id} | 200 | High |
| TC-CAT-F-002 | Filter parts includes descendant categories | GET | /api/part/?category={parent_id} | 200 | High |
| TC-CAT-F-003 | Category list includes part_count (direct) | GET | /api/part/category/ | 200 | Medium |
| TC-CAT-F-004 | Category part_count is accurate after adding part | GET | /api/part/category/{id}/ | 200 | Medium |

**TC-CAT-F-002 Steps:**
1. Create parent category `P` and child category `C` (parent = `P`).
2. Create a part assigned to `C`.
3. GET `/api/part/?category={P_id}`.
4. Verify the part assigned to `C` appears in results (recursive filtering).

**TC-CAT-F-004 Steps:**
1. Note a category `id` and GET `/api/part/category/{id}/` — record initial `part_count` (or `parts_count`).
2. Create a new part assigned to this category.
3. GET `/api/part/category/{id}/` again.
4. Verify `part_count` increased by `1`.

---

## 10. Part Attributes (REQ-ATTR-001 through REQ-ATTR-004)

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-ATTR-001 | Create virtual part (virtual=true) | POST | /api/part/ | 201 | High |
| TC-ATTR-002 | Virtual flag defaults to false | POST | /api/part/ | 201 | High |
| TC-ATTR-003 | Create template part (is_template=true) | POST | /api/part/ | 201 | High |
| TC-ATTR-004 | is_template defaults to false | POST | /api/part/ | 201 | High |
| TC-ATTR-005 | Create assembly part (assembly=true) | POST | /api/part/ | 201 | High |
| TC-ATTR-006 | assembly defaults to false | POST | /api/part/ | 201 | Critical |
| TC-ATTR-007 | Create component part (component=true) | POST | /api/part/ | 201 | Critical |
| TC-ATTR-008 | component defaults to true | POST | /api/part/ | 201 | Critical |
| TC-ATTR-009 | Toggle virtual flag via PATCH | PATCH | /api/part/{id}/ | 200 | High |
| TC-ATTR-010 | Toggle is_template via PATCH | PATCH | /api/part/{id}/ | 200 | High |
| TC-ATTR-011 | Toggle assembly via PATCH | PATCH | /api/part/{id}/ | 200 | High |
| TC-ATTR-012 | Toggle component via PATCH | PATCH | /api/part/{id}/ | 200 | High |
| TC-ATTR-013 | Set variant_of on non-template parent | PATCH | /api/part/{id}/ | 400 | High |
| TC-ATTR-014 | Set variant_of on valid template parent | PATCH | /api/part/{id}/ | 200 | High |
| TC-ATTR-015 | Verify non-boolean value rejected for assembly | POST | /api/part/ | 400 | Medium |

**TC-ATTR-001 Steps:**
1. POST `/api/part/` with body `{ "name": "Virtual Service", "category": 1, "virtual": true }`.
2. Verify status `201`.
3. Verify response `virtual` equals `true`.

**TC-ATTR-013 Steps:**
1. Create part `A` with `is_template: false`.
2. Create part `B`.
3. PATCH `/api/part/{B_id}/` with body `{ "variant_of": {A_id} }`.
4. Verify status `400` (parent must be a template).

**TC-ATTR-014 Steps:**
1. Create part `T` with `is_template: true`.
2. Create part `V`.
3. PATCH `/api/part/{V_id}/` with body `{ "variant_of": {T_id} }`.
4. Verify status `200`.
5. Verify response `variant_of` equals `{T_id}`.

---

## 11. Edge Cases & Boundary Conditions

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-EDGE-001 | Name with Unicode characters | POST | /api/part/ | 201 | Medium |
| TC-EDGE-002 | Name with emoji characters | POST | /api/part/ | 201 | Low |
| TC-EDGE-003 | Description is null (omitted) | POST | /api/part/ | 201 | Medium |
| TC-EDGE-004 | Description is empty string | POST | /api/part/ | 201 | Medium |
| TC-EDGE-005 | Link field with valid URL | POST | /api/part/ | 201 | Medium |
| TC-EDGE-006 | Link field with invalid URL format | POST | /api/part/ | 400 | Medium |
| TC-EDGE-007 | Tags field with multiple tags | POST | /api/part/ | 201 | Medium |
| TC-EDGE-008 | Keywords field with long string | POST | /api/part/ | 201 | Low |
| TC-EDGE-009 | Units field with standard unit string | POST | /api/part/ | 201 | Medium |
| TC-EDGE-010 | IPN field — maximum length boundary | POST | /api/part/ | 201 | Medium |
| TC-EDGE-011 | List parts — no parts exist (empty DB state) | GET | /api/part/ | 200 | Medium |
| TC-EDGE-012 | Large limit value (e.g., limit=10000) | GET | /api/part/?limit=10000 | 200 | Low |
| TC-EDGE-013 | Invalid ordering field | GET | /api/part/?ordering=nonexistent | 200 | Low |
| TC-EDGE-014 | Category tree when no categories exist | GET | /api/part/category/tree/ | 200 | Medium |

**TC-EDGE-001 Steps:**
1. POST `/api/part/` with `"name": "コンデンサ — 100µF"`.
2. Verify status `201`.
3. Verify `name` in response is stored exactly as submitted.

**TC-EDGE-011 Steps:**
1. (Run in isolation or ensure no parts exist.)
2. GET `/api/part/`.
3. Verify status `200`, `count` is `0`, `results` is `[]`.

**TC-EDGE-014 Steps:**
1. GET `/api/part/category/tree/` when no categories are configured.
2. Verify status `200`.
3. Verify response body is an empty array `[]`.

---

## 12. Referential Integrity & Cross-Resource

| TC-ID | Title | Method | Endpoint | Expected Status | Priority |
|-------|-------|--------|----------|-----------------|----------|
| TC-REF-001 | Delete category referenced by a part | DELETE | /api/part/category/{id}/ | 400 | Critical |
| TC-REF-002 | Part category field shows category detail | GET | /api/part/{id}/ | 200 | High |
| TC-REF-003 | Part variant chain — 2-level depth | GET | /api/part/{id}/ | 200 | Medium |
| TC-REF-004 | Part revision_of references original part | GET | /api/part/{id}/ | 200 | Medium |

**TC-REF-001 Steps:**
1. Create category `C` and assign a part to it.
2. DELETE `/api/part/category/{C_id}/`.
3. Verify status `400` (category in use).
4. Verify part still exists and is assigned to `C`.

**TC-REF-003 Steps:**
1. Create template part `T`.
2. Create variant part `V1` with `variant_of: T`.
3. GET `/api/part/{V1_id}/`.
4. Verify `variant_of` references `T`'s ID.

---

*Total test cases: 103*
*Coverage: Authentication (3), Create (18), Read (5), Update (15), Delete (5), List/Filter (19), Category CRUD (14), Tree (4), Category Filtering (4), Attributes (15), Edge Cases (14), Referential Integrity (4)*