# Manual Test Case Format Standard

## Test Case Structure

Every test case must include these fields:

| Field | Description |
|-------|-------------|
| **TC-ID** | Unique identifier: `{Area}-TC-{NNN}` (e.g., `UI-TC-001`, `API-TC-015`) |
| **Title** | Concise action-oriented description |
| **Preconditions** | Required state before test execution (reference shared preconditions) |
| **Steps** | Numbered, specific user actions |
| **Expected Result** | Observable, measurable outcomes |
| **Priority** | Critical / High / Medium / Low |
| **Linked Requirement** | Requirement ID or user story reference |

## Shared Preconditions

Define reusable preconditions once and reference them by ID:

| PC-ID | Description |
|-------|-------------|
| PC-01 | User is logged in as admin (`admin@example.com`) |
| PC-02 | User is logged in as standard user (`user@example.com`) |
| PC-03 | At least 3 items exist in the inventory |
| PC-04 | Browser is Chrome latest, viewport 1920x1080 |
| PC-05 | Test environment is seeded with default dataset |
| PC-06 | User is on the Dashboard page |

Reference in test cases: `Preconditions: PC-01, PC-03, PC-06`

## Step Format

Steps must be numbered, with specific actions — never vague:

**Good steps:**
1. Click the "Add Item" button in the top-right corner
2. Enter "Test Widget" in the "Item Name" field
3. Enter "29.99" in the "Price" field
4. Select "Electronics" from the "Category" dropdown
5. Click the "Save" button

**Bad steps:**
1. Add an item *(too vague — which button? which fields?)*
2. Fill in the form *(what values?)*
3. Save *(how?)*

## Expected Results

Results must be observable and measurable:

**Good expected results:**
- Success toast appears with text "Item created successfully"
- New item "Test Widget" appears in the item list with price "$29.99"
- Item count in the header increases by 1
- URL changes to `/items/{new-id}`

**Bad expected results:**
- Item is created *(how do you verify?)*
- Page updates *(what changes?)*

## Priority Levels

| Priority | Criteria | Examples |
|----------|----------|---------|
| **Critical** | Data integrity, core CRUD, authentication, authorization | Login, create/delete records, payment processing |
| **High** | Key business flows, integrations | Search + filter, export, bulk operations |
| **Medium** | UI validation, form rules, edge cases | Input length limits, date format validation |
| **Low** | Cosmetic, tooltips, non-functional polish | Font consistency, hover states, placeholder text |

## Markdown Table Format

### Feature: Item Management

| TC-ID | Title | Preconditions | Steps | Expected Result | Priority | Linked Req |
|-------|-------|---------------|-------|-----------------|----------|------------|
| UI-TC-001 | Create item with valid data | PC-01, PC-06 | 1. Click "Add Item" button 2. Enter "Widget A" in Name field 3. Enter "19.99" in Price field 4. Click "Save" | Success toast "Item created successfully" appears; item visible in list with correct name and price | Critical | REQ-101 |
| UI-TC-002 | Create item with empty name | PC-01, PC-06 | 1. Click "Add Item" button 2. Leave Name field empty 3. Enter "19.99" in Price field 4. Click "Save" | Validation error "Name is required" appears below Name field; item is not created | High | REQ-101 |
| UI-TC-003 | Edit existing item | PC-01, PC-03 | 1. Click item "Widget A" in list 2. Click "Edit" button 3. Change Name to "Widget B" 4. Click "Save" | Success toast "Item updated successfully" appears; list shows "Widget B" | Critical | REQ-102 |
| UI-TC-004 | Delete item with confirmation | PC-01, PC-03 | 1. Click item "Widget A" in list 2. Click "Delete" button 3. Click "Confirm" in dialog | Item removed from list; item count decreases by 1; success toast appears | Critical | REQ-103 |
| UI-TC-005 | Cancel item deletion | PC-01, PC-03 | 1. Click item "Widget A" in list 2. Click "Delete" button 3. Click "Cancel" in dialog | Dialog closes; item remains in list unchanged | Medium | REQ-103 |

## Grouping by Feature Area

Organize test cases under feature headings:

```
## Feature: Authentication
  UI-TC-001 ... UI-TC-010

## Feature: Item Management
  UI-TC-011 ... UI-TC-025

## Feature: Search & Filter
  UI-TC-026 ... UI-TC-035

## Feature: User Settings
  UI-TC-036 ... UI-TC-042
```

Use sequential TC-IDs within each area. Reserve ID ranges per feature for future additions.

## Full Test Case Example

---

**TC-ID:** UI-TC-012

**Title:** Create item with all optional fields populated

**Preconditions:** PC-01, PC-06

**Priority:** High

**Linked Requirement:** REQ-101

**Steps:**
1. Click the "Add Item" button in the top-right corner
2. Enter "Premium Widget" in the "Item Name" field
3. Enter "149.99" in the "Price" field
4. Select "Electronics" from the "Category" dropdown
5. Enter "High-quality premium widget with warranty" in the "Description" field
6. Upload `test-image.png` via the "Image" file input
7. Toggle "Featured" switch to ON
8. Click the "Save" button

**Expected Result:**
- Success toast appears: "Item created successfully"
- Redirect to item detail page at `/items/{id}`
- All fields display entered values correctly
- Image thumbnail is visible
- "Featured" badge is shown on the item card
- Item appears in the main list on the Dashboard

---
