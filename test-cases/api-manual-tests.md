# InvenTree Parts Module -- API Manual Test Cases

**API Version:** v477
**Auth Method:** Token-based (obtained via Basic Auth)
**Base URL:** `{BASE_URL}/api/`
**Date:** 2026-04-13

---

## Shared Preconditions

| Code   | Description |
|--------|-------------|
| PC-01  | InvenTree server is running and accessible at `{BASE_URL}` |
| PC-02  | Valid user credentials exist (username/password for Basic Auth) |
| PC-03  | Auth token obtained via `GET /api/user/token/` with Basic Auth and stored as `{TOKEN}` |
| PC-04  | Authorization header set: `Authorization: Token {TOKEN}` |
| PC-05  | At least one Part Category exists (ID stored as `{CAT_ID}`) |
| PC-06  | At least one Part exists (ID stored as `{PART_ID}`) |
| PC-07  | A template Part exists with `is_template=true` (ID stored as `{TEMPLATE_ID}`) |
| PC-08  | A Part with stock items exists (ID stored as `{PART_WITH_STOCK_ID}`) |
| PC-09  | A valid Stock Location exists (ID stored as `{LOCATION_ID}`) |
| PC-10  | A second Part Category exists for reassignment tests (ID stored as `{CAT_ID_2}`) |
| PC-11  | Content-Type header set: `Content-Type: application/json` |

---

## 1. Authentication

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| AUTH-01 | Obtain token with valid Basic Auth | PC-01, PC-02 | GET | `/api/user/token/` | -- (Basic Auth header) | 200 | `{"token": "<non-empty string>", "name": "", "expiry": "<ISO datetime>"}` | Critical | AUTH |
| AUTH-02 | Reject request with no credentials | PC-01 | GET | `/api/part/` | -- (no auth header) | 401 | Error response indicating authentication required | Critical | AUTH |
| AUTH-03 | Reject request with invalid token | PC-01 | GET | `/api/part/` | -- (`Authorization: Token invalidtoken123`) | 401 | Error response indicating invalid token | Critical | AUTH |
| AUTH-04 | Reject request with malformed auth header | PC-01 | GET | `/api/part/` | -- (`Authorization: Bearer {TOKEN}`) | 401 | Error response; Token scheme required | High | AUTH |
| AUTH-05 | Reject Basic Auth on protected endpoint | PC-01, PC-02 | GET | `/api/part/` | -- (Basic Auth header instead of Token) | 200 or 401 | Document actual behavior; verify consistency | Medium | AUTH |

---

## 2. Part CRUD -- Create

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| CRT-01 | Create part with minimum required fields | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Test Resistor", "description": "100 Ohm resistor", "category": {CAT_ID}}` | 201 | Response contains `pk` (integer), `name` = "Test Resistor", `description` = "100 Ohm resistor", `category` = `{CAT_ID}`, `active` = true | Critical | CRUD-C |
| CRT-02 | Create part with all optional fields | PC-01 to PC-05, PC-09, PC-11 | POST | `/api/part/` | `{"name": "Full Part", "description": "Part with all fields", "category": {CAT_ID}, "IPN": "IPN-001", "revision": "A", "active": true, "assembly": true, "component": true, "virtual": false, "is_template": false, "trackable": true, "purchaseable": true, "salable": true, "testable": true, "default_location": {LOCATION_ID}, "minimum_stock": 10.0, "units": "pcs", "keywords": "test, full, all-fields", "link": "https://example.com/datasheet.pdf", "notes": "Detailed notes for this part.", "tags": ["electronics", "resistor"]}` | 201 | All fields reflected in response; boolean fields match input; `pk` assigned | Critical | CRUD-C |
| CRT-03 | Create part -- missing name | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"description": "No name part", "category": {CAT_ID}}` | 400 | Error on `name` field: required | Critical | CRUD-C |
| CRT-04 | Create part -- missing description | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "No Desc Part", "category": {CAT_ID}}` | 400 | Error on `description` field: required | Critical | CRUD-C |
| CRT-05 | Create part -- missing category | PC-01 to PC-04, PC-11 | POST | `/api/part/` | `{"name": "No Cat Part", "description": "Part without category"}` | 400 | Error on `category` field: required | Critical | CRUD-C |
| CRT-06 | Create part -- empty request body | PC-01 to PC-04, PC-11 | POST | `/api/part/` | `{}` | 400 | Errors on `name`, `description`, `category` | High | CRUD-C |
| CRT-07 | Create part with non-existent category ID | PC-01 to PC-04, PC-11 | POST | `/api/part/` | `{"name": "Bad Cat Part", "description": "Invalid category", "category": 999999}` | 400 | Error indicating invalid category reference | High | CRUD-C |
| CRT-08 | Create part with string where integer expected for category | PC-01 to PC-04, PC-11 | POST | `/api/part/` | `{"name": "Type Error Part", "description": "String category", "category": "not-an-int"}` | 400 | Error on `category`: invalid type | High | CRUD-C |

---

## 3. Part CRUD -- Read

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| RD-01  | Get single part by ID | PC-01 to PC-06 | GET | `/api/part/{PART_ID}/` | -- | 200 | JSON object with `pk` = `{PART_ID}`, all 65+ documented fields present, correct data types | Critical | CRUD-R |
| RD-02  | Get non-existent part | PC-01 to PC-04 | GET | `/api/part/999999/` | -- | 404 | Not found error | Critical | CRUD-R |
| RD-03  | List parts -- default (no filters) | PC-01 to PC-04 | GET | `/api/part/` | -- | 200 | `{"count": <int>, "next": <url\|null>, "previous": null, "results": [<array of part objects>]}`; count >= 0 | Critical | CRUD-R |
| RD-04  | Verify response schema of single part | PC-01 to PC-06 | GET | `/api/part/{PART_ID}/` | -- | 200 | Response includes all key fields: `pk`, `name`, `description`, `category`, `IPN`, `active`, `assembly`, `component`, `virtual`, `is_template`, `trackable`, `purchaseable`, `salable`, `testable`, `full_name`, `thumbnail`, `in_stock`, `total_in_stock`, `unallocated_stock`, `pricing_min`, `pricing_max`, `starred` | High | SCHEMA |
| RD-05  | Verify data types in part response | PC-01 to PC-06 | GET | `/api/part/{PART_ID}/` | -- | 200 | `pk`: integer; `name`: string; `active`: boolean; `category`: integer; `in_stock`: decimal/number; `minimum_stock`: decimal; `link`: string or null; `tags`: array | High | SCHEMA |

---

## 4. Part CRUD -- Update

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| UPD-01 | PATCH -- update name only | PC-01 to PC-06, PC-11 | PATCH | `/api/part/{PART_ID}/` | `{"name": "Updated Resistor Name"}` | 200 | `name` = "Updated Resistor Name"; all other fields unchanged | Critical | CRUD-U |
| UPD-02 | PATCH -- update description only | PC-01 to PC-06, PC-11 | PATCH | `/api/part/{PART_ID}/` | `{"description": "Updated description text"}` | 200 | `description` = "Updated description text" | Critical | CRUD-U |
| UPD-03 | PATCH -- update category | PC-01 to PC-06, PC-10, PC-11 | PATCH | `/api/part/{PART_ID}/` | `{"category": {CAT_ID_2}}` | 200 | `category` = `{CAT_ID_2}` | High | CRUD-U |
| UPD-04 | PATCH -- toggle boolean fields | PC-01 to PC-06, PC-11 | PATCH | `/api/part/{PART_ID}/` | `{"active": false, "assembly": true, "trackable": true, "purchaseable": false}` | 200 | Boolean fields reflect new values | High | CRUD-U |
| UPD-05 | PATCH -- update multiple fields at once | PC-01 to PC-06, PC-11 | PATCH | `/api/part/{PART_ID}/` | `{"name": "Multi-Update Part", "IPN": "MU-001", "keywords": "multi, update", "minimum_stock": 25.5}` | 200 | All four fields updated in response | High | CRUD-U |
| UPD-06 | PUT -- full update with all required fields | PC-01 to PC-06, PC-11 | PUT | `/api/part/{PART_ID}/` | `{"name": "PUT Full Update", "description": "Full replacement", "category": {CAT_ID}}` | 200 | All fields reflect new values; optional fields reset to defaults or null | High | CRUD-U |
| UPD-07 | PUT -- missing required field (name) | PC-01 to PC-06, PC-11 | PUT | `/api/part/{PART_ID}/` | `{"description": "Missing name", "category": {CAT_ID}}` | 400 | Error on `name`: required | High | CRUD-U |
| UPD-08 | PATCH -- update non-existent part | PC-01 to PC-04, PC-11 | PATCH | `/api/part/999999/` | `{"name": "Ghost Part"}` | 404 | Not found error | High | CRUD-U |
| UPD-09 | PATCH -- attempt to set read-only field (pk) | PC-01 to PC-06, PC-11 | PATCH | `/api/part/{PART_ID}/` | `{"pk": 999999}` | 200 | `pk` remains unchanged (original value); read-only field silently ignored | High | CRUD-U |
| UPD-10 | PATCH -- attempt to set read-only field (in_stock) | PC-01 to PC-06, PC-11 | PATCH | `/api/part/{PART_ID}/` | `{"in_stock": 9999}` | 200 | `in_stock` remains unchanged; read-only field silently ignored | High | CRUD-U |

---

## 5. Part CRUD -- Delete

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| DEL-01 | Delete an existing part (no stock) | PC-01 to PC-04, PC-11; create a disposable part first | DELETE | `/api/part/{NEW_PART_ID}/` | -- | 204 | Empty body; subsequent GET returns 404 | Critical | CRUD-D |
| DEL-02 | Delete non-existent part | PC-01 to PC-04 | DELETE | `/api/part/999999/` | -- | 404 | Not found error | High | CRUD-D |
| DEL-03 | Delete part that has stock items | PC-01 to PC-04, PC-08 | DELETE | `/api/part/{PART_WITH_STOCK_ID}/` | -- | 400 or 409 | Error indicating part cannot be deleted due to existing stock; document actual status code | High | CRUD-D |
| DEL-04 | Verify part is gone after deletion | PC-01 to PC-04; DEL-01 completed | GET | `/api/part/{DELETED_PART_ID}/` | -- | 404 | Not found | High | CRUD-D |

---

## 6. Field Validation

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| VAL-01 | Name at max length (100 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "<100-char string>", "description": "Boundary test", "category": {CAT_ID}}` | 201 | Part created successfully; name is exactly 100 chars | High | VALID |
| VAL-02 | Name exceeds max length (101 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "<101-char string>", "description": "Boundary test", "category": {CAT_ID}}` | 400 | Error on `name`: max length exceeded | High | VALID |
| VAL-03 | Description at max length (250 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Desc Boundary", "description": "<250-char string>", "category": {CAT_ID}}` | 201 | Part created; description is 250 chars | High | VALID |
| VAL-04 | Description exceeds max length (251 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Desc Over", "description": "<251-char string>", "category": {CAT_ID}}` | 400 | Error on `description`: max length exceeded | High | VALID |
| VAL-05 | IPN at max length (100 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "IPN Boundary", "description": "Test", "category": {CAT_ID}, "IPN": "<100-char string>"}` | 201 | Created; IPN is 100 chars | Medium | VALID |
| VAL-06 | IPN exceeds max length (101 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "IPN Over", "description": "Test", "category": {CAT_ID}, "IPN": "<101-char string>"}` | 400 | Error on `IPN`: max length exceeded | Medium | VALID |
| VAL-07 | Keywords at max length (250 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "KW Boundary", "description": "Test", "category": {CAT_ID}, "keywords": "<250-char string>"}` | 201 | Created; keywords is 250 chars | Medium | VALID |
| VAL-08 | Keywords exceeds max length (251 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "KW Over", "description": "Test", "category": {CAT_ID}, "keywords": "<251-char string>"}` | 400 | Error on `keywords`: max length exceeded | Medium | VALID |
| VAL-09 | Units at max length (20 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Units Boundary", "description": "Test", "category": {CAT_ID}, "units": "12345678901234567890"}` | 201 | Created; units is exactly 20 chars | Medium | VALID |
| VAL-10 | Units exceeds max length (21 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Units Over", "description": "Test", "category": {CAT_ID}, "units": "123456789012345678901"}` | 400 | Error on `units`: max length exceeded | Medium | VALID |
| VAL-11 | Notes at max length (50000 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Notes Max", "description": "Test", "category": {CAT_ID}, "notes": "<50000-char string>"}` | 201 | Created; notes is 50000 chars | Low | VALID |
| VAL-12 | Notes exceeds max length (50001 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Notes Over", "description": "Test", "category": {CAT_ID}, "notes": "<50001-char string>"}` | 400 | Error on `notes`: max length exceeded | Low | VALID |
| VAL-13 | Link with valid URI | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Valid Link", "description": "Test", "category": {CAT_ID}, "link": "https://example.com/doc.pdf"}` | 201 | Part created; `link` = provided URL | High | VALID |
| VAL-14 | Link with invalid URI | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Bad Link", "description": "Test", "category": {CAT_ID}, "link": "not-a-valid-uri"}` | 400 | Error on `link`: not a valid URI | High | VALID |
| VAL-15 | Link exceeds max length (2001 chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Long Link", "description": "Test", "category": {CAT_ID}, "link": "https://example.com/<padding to 2001 chars>"}` | 400 | Error on `link`: max length exceeded | Medium | VALID |
| VAL-16 | Empty string for name | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "", "description": "Test", "category": {CAT_ID}}` | 400 | Error on `name`: blank not allowed | High | VALID |
| VAL-17 | Null value for required field | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": null, "description": "Test", "category": {CAT_ID}}` | 400 | Error on `name`: null not allowed | High | VALID |
| VAL-18 | Special characters in name | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Part <script>alert('xss')</script>", "description": "XSS test", "category": {CAT_ID}}` | 201 or 400 | If 201: name stored/returned safely (HTML-escaped or literal); no script execution on GET. Document actual behavior | High | VALID |
| VAL-19 | Unicode characters in name and description | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Resistor", "description": "100 Om Widerstand", "category": {CAT_ID}}` | 201 | Part created; unicode preserved in response | Medium | VALID |
| VAL-20 | Negative minimum_stock | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Neg Stock", "description": "Test", "category": {CAT_ID}, "minimum_stock": -5}` | 400 | Error on `minimum_stock`: must be >= 0 | Medium | VALID |
| VAL-21 | Boolean field with non-boolean value | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Bool Test", "description": "Test", "category": {CAT_ID}, "active": "yes"}` | 400 | Error on `active`: not a valid boolean | Medium | VALID |

---

## 7. Filtering and Search

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| FLT-01 | Filter by active=true | PC-01 to PC-04 | GET | `/api/part/?active=true` | -- | 200 | All parts in `results` have `active` = true | High | FILTER |
| FLT-02 | Filter by active=false | PC-01 to PC-04; at least one inactive part exists | GET | `/api/part/?active=false` | -- | 200 | All parts in `results` have `active` = false | High | FILTER |
| FLT-03 | Filter by category | PC-01 to PC-05 | GET | `/api/part/?category={CAT_ID}` | -- | 200 | All parts in `results` have `category` = `{CAT_ID}` | High | FILTER |
| FLT-04 | Filter by assembly=true | PC-01 to PC-04 | GET | `/api/part/?assembly=true` | -- | 200 | All parts in `results` have `assembly` = true | High | FILTER |
| FLT-05 | Filter by component=true | PC-01 to PC-04 | GET | `/api/part/?component=true` | -- | 200 | All results have `component` = true | Medium | FILTER |
| FLT-06 | Filter by has_stock=true | PC-01 to PC-04, PC-08 | GET | `/api/part/?has_stock=true` | -- | 200 | All results have `in_stock` > 0 | High | FILTER |
| FLT-07 | Filter by has_stock=false | PC-01 to PC-04 | GET | `/api/part/?has_stock=false` | -- | 200 | All results have `in_stock` = 0 | Medium | FILTER |
| FLT-08 | Filter by is_template=true | PC-01 to PC-04, PC-07 | GET | `/api/part/?is_template=true` | -- | 200 | All results have `is_template` = true | Medium | FILTER |
| FLT-09 | Filter by purchaseable=true | PC-01 to PC-04 | GET | `/api/part/?purchaseable=true` | -- | 200 | All results have `purchaseable` = true | Medium | FILTER |
| FLT-10 | Filter by salable=true | PC-01 to PC-04 | GET | `/api/part/?salable=true` | -- | 200 | All results have `salable` = true | Medium | FILTER |
| FLT-11 | Filter by trackable=true | PC-01 to PC-04 | GET | `/api/part/?trackable=true` | -- | 200 | All results have `trackable` = true | Medium | FILTER |
| FLT-12 | Search by name substring | PC-01 to PC-06 | GET | `/api/part/?search=Resistor` | -- | 200 | Results contain parts whose name or description includes "Resistor" | High | FILTER |
| FLT-13 | Search with no results | PC-01 to PC-04 | GET | `/api/part/?search=zzz_nonexistent_xyz` | -- | 200 | `count` = 0, `results` = [] | Medium | FILTER |
| FLT-14 | Combined filters: active + category | PC-01 to PC-05 | GET | `/api/part/?active=true&category={CAT_ID}` | -- | 200 | All results satisfy both `active` = true AND `category` = `{CAT_ID}` | High | FILTER |
| FLT-15 | Combined filters: purchaseable + has_stock | PC-01 to PC-04 | GET | `/api/part/?purchaseable=true&has_stock=true` | -- | 200 | All results are purchaseable and have stock > 0 | Medium | FILTER |
| FLT-16 | Invalid filter value | PC-01 to PC-04 | GET | `/api/part/?active=notabool` | -- | 200 or 400 | Document behavior: should either ignore invalid filter or return 400 | Medium | FILTER |

---

## 8. Pagination and Ordering

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| PAG-01 | Limit results to 5 | PC-01 to PC-04; at least 6 parts exist | GET | `/api/part/?limit=5` | -- | 200 | `results` array length <= 5; `count` reflects total; `next` is non-null if more exist | High | PAGE |
| PAG-02 | Offset by 5 | PC-01 to PC-04; at least 6 parts exist | GET | `/api/part/?limit=5&offset=5` | -- | 200 | `results` contains next page; `previous` is non-null | High | PAGE |
| PAG-03 | Verify count matches total | PC-01 to PC-04 | GET | `/api/part/?limit=1` | -- | 200 | `count` = total number of parts in system (verify by cross-checking with unfiltered `limit=0` or high limit) | High | PAGE |
| PAG-04 | Offset beyond total count | PC-01 to PC-04 | GET | `/api/part/?limit=10&offset=999999` | -- | 200 | `results` = [], `count` unchanged, `previous` non-null | Medium | PAGE |
| PAG-05 | Limit=0 behavior | PC-01 to PC-04 | GET | `/api/part/?limit=0` | -- | 200 | Document behavior: returns all results or empty; verify against `count` | Medium | PAGE |
| PAG-06 | Negative limit | PC-01 to PC-04 | GET | `/api/part/?limit=-1` | -- | 200 or 400 | Document behavior: should reject or clamp to 0 | Low | PAGE |
| PAG-07 | Order by name ascending | PC-01 to PC-04 | GET | `/api/part/?ordering=name` | -- | 200 | `results` sorted alphabetically by name (A-Z) | High | PAGE |
| PAG-08 | Order by name descending | PC-01 to PC-04 | GET | `/api/part/?ordering=-name` | -- | 200 | `results` sorted reverse alphabetically by name (Z-A) | High | PAGE |
| PAG-09 | Order by creation date | PC-01 to PC-04 | GET | `/api/part/?ordering=creation_date` | -- | 200 | `results` sorted by creation date ascending | Medium | PAGE |
| PAG-10 | Pagination + filtering + ordering combined | PC-01 to PC-05 | GET | `/api/part/?category={CAT_ID}&ordering=-name&limit=3&offset=0` | -- | 200 | Max 3 results; all in `{CAT_ID}`; sorted Z-A by name | High | PAGE |
| PAG-11 | Follow `next` URL to page through all results | PC-01 to PC-04 | GET | `/api/part/?limit=2` then follow `next` | -- | 200 each | No duplicate PKs across pages; union of all pages equals full list; last page `next` = null | High | PAGE |

---

## 9. Relational Integrity

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| REL-01 | Create variant of template part | PC-01 to PC-05, PC-07, PC-11 | POST | `/api/part/` | `{"name": "Variant A", "description": "Variant of template", "category": {CAT_ID}, "variant_of": {TEMPLATE_ID}}` | 201 | `variant_of` = `{TEMPLATE_ID}` in response | High | REL |
| REL-02 | Create variant of non-template part | PC-01 to PC-06, PC-11 | POST | `/api/part/` | `{"name": "Bad Variant", "description": "Variant of non-template", "category": {CAT_ID}, "variant_of": {PART_ID}}` | 400 | Error: referenced part is not a template | High | REL |
| REL-03 | Set variant_of to non-existent part | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Ghost Variant", "description": "Test", "category": {CAT_ID}, "variant_of": 999999}` | 400 | Error: invalid part reference | High | REL |
| REL-04 | Set default_location to valid location | PC-01 to PC-05, PC-09, PC-11 | POST | `/api/part/` | `{"name": "Located Part", "description": "Test", "category": {CAT_ID}, "default_location": {LOCATION_ID}}` | 201 | `default_location` = `{LOCATION_ID}` | Medium | REL |
| REL-05 | Set default_location to non-existent location | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Bad Location", "description": "Test", "category": {CAT_ID}, "default_location": 999999}` | 400 | Error: invalid location reference | Medium | REL |
| REL-06 | Set revision_of to valid part | PC-01 to PC-06, PC-11 | POST | `/api/part/` | `{"name": "Rev B", "description": "Revision of existing", "category": {CAT_ID}, "revision_of": {PART_ID}, "revision": "B"}` | 201 or 400 | Document behavior: may require specific revision settings; verify `revision_of` in response | Medium | REL |
| REL-07 | Set revision_of to non-existent part | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Bad Rev", "description": "Test", "category": {CAT_ID}, "revision_of": 999999}` | 400 | Error: invalid part reference | Medium | REL |
| REL-08 | Verify category change reflects in listing | PC-01 to PC-06, PC-10, PC-11 | PATCH then GET | `/api/part/{PART_ID}/` then `/api/part/?category={CAT_ID_2}` | PATCH: `{"category": {CAT_ID_2}}` | 200 | Part appears in `{CAT_ID_2}` filter results; does not appear in `{CAT_ID}` filter | Medium | REL |

---

## 10. Part Category CRUD

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| CAT-01 | Create category with name only | PC-01 to PC-04, PC-11 | POST | `/api/part/category/` | `{"name": "Test Category", "description": "A test category"}` | 201 | `pk` assigned; `name` = "Test Category"; `parent` = null | Critical | CAT-C |
| CAT-02 | Create sub-category with parent | PC-01 to PC-05, PC-11 | POST | `/api/part/category/` | `{"name": "Sub Category", "description": "Child of existing", "parent": {CAT_ID}}` | 201 | `parent` = `{CAT_ID}` | High | CAT-C |
| CAT-03 | Create category -- missing name | PC-01 to PC-04, PC-11 | POST | `/api/part/category/` | `{"description": "No name"}` | 400 | Error on `name`: required | High | CAT-C |
| CAT-04 | Create category with non-existent parent | PC-01 to PC-04, PC-11 | POST | `/api/part/category/` | `{"name": "Orphan", "description": "Bad parent", "parent": 999999}` | 400 | Error: invalid parent reference | High | CAT-C |
| CAT-05 | Get single category | PC-01 to PC-05 | GET | `/api/part/category/{CAT_ID}/` | -- | 200 | `pk` = `{CAT_ID}`; `name`, `description`, `parent` present | Critical | CAT-R |
| CAT-06 | List categories | PC-01 to PC-04 | GET | `/api/part/category/` | -- | 200 | Paginated response with `count`, `results` array of category objects | Critical | CAT-R |
| CAT-07 | Get category tree | PC-01 to PC-04 | GET | `/api/part/category/tree/` | -- | 200 | Hierarchical or flat tree structure returned | Medium | CAT-R |
| CAT-08 | Update category name (PATCH) | PC-01 to PC-05, PC-11 | PATCH | `/api/part/category/{CAT_ID}/` | `{"name": "Renamed Category"}` | 200 | `name` = "Renamed Category" | High | CAT-U |
| CAT-09 | Delete empty category | PC-01 to PC-04, PC-11; create a disposable empty category first | DELETE | `/api/part/category/{NEW_CAT_ID}/` | -- | 204 | Empty body; GET returns 404 | High | CAT-D |
| CAT-10 | Delete category that contains parts | PC-01 to PC-05, PC-06 | DELETE | `/api/part/category/{CAT_ID}/` | -- | 400 or 409 | Error: category has parts; cannot delete. Document actual behavior | High | CAT-D |

---

## 11. Category Filtering

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| CFLT-01 | Filter categories by top_level=true | PC-01 to PC-04 | GET | `/api/part/category/?top_level=true` | -- | 200 | All results have `parent` = null | High | CAT-F |
| CFLT-02 | Filter categories by parent | PC-01 to PC-05 | GET | `/api/part/category/?parent={CAT_ID}` | -- | 200 | All results have `parent` = `{CAT_ID}` | High | CAT-F |
| CFLT-03 | Filter by cascade (include sub-categories) | PC-01 to PC-05 | GET | `/api/part/category/?parent={CAT_ID}&cascade=true` | -- | 200 | Results include direct children and their descendants | Medium | CAT-F |
| CFLT-04 | Filter by structural=true | PC-01 to PC-04 | GET | `/api/part/category/?structural=true` | -- | 200 | All results have `structural` = true | Medium | CAT-F |
| CFLT-05 | Search categories by name | PC-01 to PC-04 | GET | `/api/part/category/?search=Test` | -- | 200 | Results contain categories whose name matches "Test" | Medium | CAT-F |
| CFLT-06 | Filter by depth | PC-01 to PC-04 | GET | `/api/part/category/?depth=1` | -- | 200 | Results limited to specified nesting depth | Low | CAT-F |
| CFLT-07 | Exclude tree from results | PC-01 to PC-05 | GET | `/api/part/category/?exclude_tree={CAT_ID}` | -- | 200 | `{CAT_ID}` and its descendants not in results | Low | CAT-F |

---

## 12. Part Sub-Endpoints

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| SUB-01 | Get part pricing info | PC-01 to PC-06 | GET | `/api/part/{PART_ID}/pricing/` | -- | 200 | Pricing object returned (may be empty if no pricing data); verify structure | Medium | SUB |
| SUB-02 | Get pricing for non-existent part | PC-01 to PC-04 | GET | `/api/part/999999/pricing/` | -- | 404 | Not found | Medium | SUB |
| SUB-03 | Get serial numbers for trackable part | PC-01 to PC-04, PC-11; part with `trackable=true` | GET | `/api/part/{TRACKABLE_PART_ID}/serial-numbers/` | -- | 200 | Serial number data or empty list | Medium | SUB |
| SUB-04 | Validate BOM for assembly part | PC-01 to PC-04; part with `assembly=true` and BOM items | GET | `/api/part/{ASSEMBLY_PART_ID}/bom-validate/` | -- | 200 | BOM validation result | Medium | SUB |
| SUB-05 | Copy BOM from another part | PC-01 to PC-04, PC-11; two assembly parts exist | POST | `/api/part/{TARGET_PART_ID}/bom-copy/` | `{"part": {SOURCE_PART_ID}, "remove_existing": true}` | 200 | BOM copied successfully | Medium | SUB |
| SUB-06 | Get pricing for non-existent part | PC-01 to PC-04 | GET | `/api/part/999999/serial-numbers/` | -- | 404 | Not found | Low | SUB |

---

## 13. Schema Contract Validation

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| SCH-01 | List response has pagination envelope | PC-01 to PC-04 | GET | `/api/part/` | -- | 200 | Top-level keys are exactly: `count` (integer), `next` (string or null), `previous` (string or null), `results` (array) | High | SCHEMA |
| SCH-02 | Part object contains all documented read-only fields | PC-01 to PC-06 | GET | `/api/part/{PART_ID}/` | -- | 200 | Response includes: `pk`, `full_name`, `thumbnail`, `in_stock`, `total_in_stock`, `unallocated_stock`, `allocated_to_build_orders`, `allocated_to_sales_orders`, `external_stock`, `building`, `pricing_min`, `pricing_max`, `pricing_updated`, `starred` | High | SCHEMA |
| SCH-03 | Part object contains all writable fields | PC-01 to PC-06 | GET | `/api/part/{PART_ID}/` | -- | 200 | Response includes: `name`, `description`, `category`, `IPN`, `active`, `assembly`, `component`, `virtual`, `is_template`, `trackable`, `purchaseable`, `salable`, `testable`, `variant_of`, `revision_of`, `default_location`, `minimum_stock`, `units`, `keywords`, `link`, `notes`, `tags` | High | SCHEMA |
| SCH-04 | Nullable fields can be null | PC-01 to PC-06 | GET | `/api/part/{PART_ID}/` | -- | 200 | `variant_of`, `revision_of`, `default_location` are null or integer; `link` is string or null; `thumbnail` is string or null | Medium | SCHEMA |
| SCH-05 | Boolean fields are actual booleans | PC-01 to PC-06 | GET | `/api/part/{PART_ID}/` | -- | 200 | `active`, `assembly`, `component`, `virtual`, `is_template`, `trackable`, `purchaseable`, `salable`, `testable` are all `true` or `false` (not 0/1, not strings) | High | SCHEMA |
| SCH-06 | Category list response schema | PC-01 to PC-04 | GET | `/api/part/category/` | -- | 200 | Top-level keys: `count`, `next`, `previous`, `results`; each result has at least: `pk`, `name`, `description`, `parent` | High | SCHEMA |
| SCH-07 | Numeric fields are correct type | PC-01 to PC-06 | GET | `/api/part/{PART_ID}/` | -- | 200 | `pk`: integer; `category`: integer; `minimum_stock`: number (decimal); `in_stock`: number; `total_in_stock`: number | Medium | SCHEMA |
| SCH-08 | Tags field is an array | PC-01 to PC-06 | GET | `/api/part/{PART_ID}/` | -- | 200 | `tags` is an array (possibly empty); each element is a string | Medium | SCHEMA |

---

## 14. Edge Cases and Error Handling

| TC-ID   | Title | Preconditions | Method | Endpoint | Request Body | Expected Status | Expected Response | Priority | Req-ID |
|---------|-------|---------------|--------|----------|-------------|-----------------|-------------------|----------|--------|
| EDGE-01 | POST with no Content-Type header | PC-01 to PC-04 | POST | `/api/part/` | raw string (no JSON content type) | 400 or 415 | Error: unsupported media type or parse error | Medium | EDGE |
| EDGE-02 | POST with malformed JSON body | PC-01 to PC-04, PC-11 | POST | `/api/part/` | `{name: "missing quotes"}` (invalid JSON) | 400 | JSON parse error | Medium | EDGE |
| EDGE-03 | GET part with string ID | PC-01 to PC-04 | GET | `/api/part/abc/` | -- | 404 | Not found (route does not match) | Medium | EDGE |
| EDGE-04 | PUT with empty body | PC-01 to PC-06, PC-11 | PUT | `/api/part/{PART_ID}/` | `{}` | 400 | Errors on required fields | Medium | EDGE |
| EDGE-05 | PATCH with empty body | PC-01 to PC-06, PC-11 | PATCH | `/api/part/{PART_ID}/` | `{}` | 200 | Part unchanged; no error (empty update is a no-op) | Medium | EDGE |
| EDGE-06 | Unsupported HTTP method (OPTIONS) | PC-01 to PC-04 | OPTIONS | `/api/part/` | -- | 200 | Returns allowed methods (CORS preflight); document actual response | Low | EDGE |
| EDGE-07 | Duplicate part name in same category | PC-01 to PC-06, PC-11 | POST | `/api/part/` | `{"name": "<existing part name>", "description": "Duplicate", "category": {CAT_ID}}` | 400 | Error: part with this name already exists in category (if uniqueness enforced); document behavior | High | EDGE |
| EDGE-08 | Create part with extra/unknown fields | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Extra Fields", "description": "Test", "category": {CAT_ID}, "unknown_field": "value", "foo": 123}` | 201 | Part created; unknown fields silently ignored; not present in response | Medium | EDGE |
| EDGE-09 | Very large request body (oversized notes at 100K chars) | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Big Part", "description": "Test", "category": {CAT_ID}, "notes": "<100,000 chars>"}` | 400 or 413 | Error: notes too long or payload too large | Low | EDGE |
| EDGE-10 | SQL injection attempt in search | PC-01 to PC-04 | GET | `/api/part/?search=' OR 1=1 --` | -- | 200 | Normal response (empty results or matching); no SQL error; no data leak | High | EDGE |
| EDGE-11 | Concurrent PATCH to same part | PC-01 to PC-06, PC-11 | PATCH x2 | `/api/part/{PART_ID}/` | Client A: `{"name": "Name A"}` Client B: `{"name": "Name B"}` (sent simultaneously) | 200 each | Last write wins; no 500 error; final GET shows one of the two names consistently | Medium | EDGE |
| EDGE-12 | Empty tags array | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "No Tags", "description": "Test", "category": {CAT_ID}, "tags": []}` | 201 | Part created; `tags` = [] | Low | EDGE |
| EDGE-13 | Tags with special characters | PC-01 to PC-05, PC-11 | POST | `/api/part/` | `{"name": "Tag Special", "description": "Test", "category": {CAT_ID}, "tags": ["tag with spaces", "tag/slash", "tag&amp"]}` | 201 | Part created; tags preserved as provided | Low | EDGE |

---

## Test Execution Notes

### Environment Setup
1. Deploy InvenTree instance or use an existing staging server.
2. Create a test user with appropriate permissions.
3. Obtain token: `curl -u username:password {BASE_URL}/api/user/token/`
4. Create prerequisite data (categories, parts, stock items, locations) per PC codes above.

### Boundary String Generation
For max-length tests, generate strings with:
- 100 chars: `python3 -c "print('A' * 100)"`
- 250 chars: `python3 -c "print('B' * 250)"`
- 50000 chars: `python3 -c "print('C' * 50000)"`

### Cleanup
- Delete test parts and categories created during test execution.
- Run tests in order: Categories first (needed as preconditions), then Parts.
- Use unique prefixes (e.g., `[TEST]`) in names to identify and clean up test data.

### Defect Logging
When a test fails, record:
- TC-ID
- Actual status code vs expected
- Actual response body
- Timestamp and environment details
- Screenshots of request/response (Postman, curl output)

---

**Total test cases: 97**

| Category | Count |
|----------|-------|
| Authentication | 5 |
| Part Create | 8 |
| Part Read | 5 |
| Part Update | 10 |
| Part Delete | 4 |
| Field Validation | 21 |
| Filtering and Search | 16 |
| Pagination and Ordering | 11 |
| Relational Integrity | 8 |
| Category CRUD | 10 |
| Category Filtering | 7 |
| Part Sub-Endpoints | 6 |
| Schema Contract | 8 |
| Edge Cases | 13 |
