# InvenTree Parts Module - UI/Manual Test Cases

## Shared Preconditions

| Code   | Precondition |
|--------|-------------|
| PC-01  | User is logged in with admin privileges |
| PC-02  | At least one part category exists (e.g., "Electronic Components > Resistors") |
| PC-03  | At least one part exists with default attributes (active, component, purchaseable) |
| PC-04  | At least one supplier and manufacturer are configured in the system |
| PC-05  | At least one stock location exists (e.g., "Warehouse A > Shelf 1") |
| PC-06  | Part parameter templates exist: "Resistance" (ohm), "Voltage" (V), "Weight" (kg) |
| PC-07  | A template part exists with at least one variant |
| PC-08  | A purchaseable part exists with at least one supplier part linked |
| PC-09  | A salable part exists with at least one sales order |
| PC-10  | An assembly part exists with a BOM containing at least two components |
| PC-11  | A testable part exists with at least one test template defined |
| PC-12  | "IPN duplicate check" setting is enabled in InvenTree configuration |
| PC-13  | A part with stock items exists (quantity > 0) in at least one location |
| PC-14  | A locked part exists (Locked flag enabled) |
| PC-15  | An inactive part exists (Active flag disabled) |

---

## 1. Part Creation - Manual Entry

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-001  | Create part with all required fields | PC-01, PC-02 | 1. Navigate to Parts list. 2. Click "New Part" button. 3. Enter "Test Resistor 10k" in Name field. 4. Enter "10k Ohm 0805 SMD resistor" in Description field. 5. Select "Resistors" in Category dropdown. 6. Click "Submit". | Part is created. Detail view opens showing name, description, and category. Success notification appears. | Critical | REQ-PART-001 |
| TC-002  | Create part with all optional fields populated | PC-01, PC-02 | 1. Click "New Part". 2. Fill Name: "Cap 100nF". 3. Fill Description: "100nF ceramic capacitor". 4. Select Category: "Capacitors". 5. Enter IPN: "CAP-100NF-001". 6. Set Keywords: "capacitor, 100nf, ceramic". 7. Set Units: "pcs". 8. Enable flags: Component, Purchaseable. 9. Click "Submit". | Part created with all fields persisted. Detail view shows IPN, keywords, units, and enabled flags. | High | REQ-PART-002 |
| TC-003  | Fail to create part without Name | PC-01, PC-02 | 1. Click "New Part". 2. Leave Name field empty. 3. Fill Description: "Missing name test". 4. Select Category: "Resistors". 5. Click "Submit". | Form validation error displayed on Name field: "This field is required." Part is not created. | Critical | REQ-PART-003 |
| TC-004  | Fail to create part without Description | PC-01, PC-02 | 1. Click "New Part". 2. Enter Name: "No Desc Part". 3. Leave Description field empty. 4. Select Category: "Resistors". 5. Click "Submit". | Form validation error on Description field: "This field is required." Part is not created. | Critical | REQ-PART-003 |
| TC-005  | Fail to create part without Category | PC-01, PC-02 | 1. Click "New Part". 2. Enter Name: "No Category Part". 3. Enter Description: "Test description". 4. Leave Category unselected. 5. Click "Submit". | Form validation error on Category field. Part is not created. | Critical | REQ-PART-003 |
| TC-006  | Name exceeds max length (>100 chars) | PC-01, PC-02 | 1. Click "New Part". 2. Enter a 101-character string in Name field. 3. Fill other required fields. 4. Click "Submit". | Validation error: name exceeds maximum length. Part is not created. | Medium | REQ-PART-004 |
| TC-007  | Description exceeds max length (>250 chars) | PC-01, PC-02 | 1. Click "New Part". 2. Enter Name: "Boundary Test". 3. Enter a 251-character string in Description field. 4. Select Category. 5. Click "Submit". | Validation error: description exceeds maximum length. Part is not created. | Medium | REQ-PART-004 |
| TC-008  | IPN exceeds max length (>100 chars) | PC-01, PC-02 | 1. Click "New Part". 2. Fill required fields. 3. Enter a 101-character string in IPN field. 4. Click "Submit". | Validation error on IPN field. Part is not created. | Medium | REQ-PART-004 |
| TC-009  | Duplicate IPN rejected | PC-01, PC-02, PC-03, PC-12 | 1. Note the IPN of an existing part (e.g., "RES-001"). 2. Click "New Part". 3. Fill required fields. 4. Enter the same IPN "RES-001". 5. Click "Submit". | Validation error: IPN already exists. Part is not created. | High | REQ-PART-005 |
| TC-010  | Create part at Name boundary (exactly 100 chars) | PC-01, PC-02 | 1. Click "New Part". 2. Enter exactly 100 characters in Name field. 3. Fill Description and Category. 4. Click "Submit". | Part created successfully with full 100-character name displayed correctly. | Low | REQ-PART-004 |

---

## 2. Part Creation - Import

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-011  | Import parts from valid CSV file | PC-01, PC-02 | 1. Navigate to Parts list. 2. Click "Import Parts" button. 3. Upload a CSV file with columns: Name, Description, Category, IPN. 4. Map columns in the wizard. 5. Click "Submit Import". | Import wizard shows preview of rows. After submission, parts are created. Success count matches CSV rows. | High | REQ-PART-010 |
| TC-012  | Import CSV with missing required columns | PC-01, PC-02 | 1. Click "Import Parts". 2. Upload a CSV file missing the "Name" column. 3. Attempt to proceed through wizard. | Wizard displays error indicating required column "Name" is not mapped. Import cannot proceed. | High | REQ-PART-011 |
| TC-013  | Import CSV with duplicate IPNs | PC-01, PC-02, PC-12 | 1. Click "Import Parts". 2. Upload CSV containing rows with IPNs that already exist in the system. 3. Complete wizard and submit. | Rows with duplicate IPNs are flagged as errors. Non-duplicate rows import successfully. Error report shows which rows failed. | Medium | REQ-PART-012 |
| TC-014  | Import empty CSV file | PC-01 | 1. Click "Import Parts". 2. Upload a CSV file with only headers and no data rows. 3. Attempt to proceed. | Wizard indicates no valid data rows found. Import does not proceed. | Medium | REQ-PART-013 |

---

## 3. Part Detail View - Stock Tab

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-015  | View stock items list | PC-01, PC-13 | 1. Navigate to a part with stock. 2. Click "Stock" tab. | Stock items table displays with columns: Location, Quantity, Status, Last Updated. At least one row is visible. | Critical | REQ-STOCK-001 |
| TC-016  | Add new stock item | PC-01, PC-03, PC-05 | 1. Open a part detail page. 2. Click "Stock" tab. 3. Click "New Stock Item" button. 4. Enter Quantity: 100. 5. Select Location: "Warehouse A > Shelf 1". 6. Click "Submit". | Stock item created. Stock tab updates showing new item with quantity 100 at specified location. Total stock quantity increases by 100. | Critical | REQ-STOCK-002 |
| TC-017  | Transfer stock between locations | PC-01, PC-13, PC-05 | 1. Open part with stock in "Warehouse A". 2. Select stock item checkbox. 3. Click "Transfer Stock" action. 4. Select destination: "Warehouse B". 5. Enter quantity to transfer: 10. 6. Click "Confirm". | Stock item at source decreases by 10. New or updated stock item at destination shows +10. Stock history records the transfer. | Critical | REQ-STOCK-003 |
| TC-018  | Count stock (stocktake) | PC-01, PC-13 | 1. Open part with stock item showing quantity 50. 2. Select the stock item. 3. Click "Count Stock" action. 4. Enter new count: 45. 5. Add note: "Inventory adjustment". 6. Confirm. | Stock quantity updates to 45. Stock history shows count adjustment entry with note. | High | REQ-STOCK-004 |
| TC-019  | Add stock with zero quantity | PC-01, PC-03, PC-05 | 1. Open part detail, Stock tab. 2. Click "New Stock Item". 3. Enter Quantity: 0. 4. Select a location. 5. Click "Submit". | Stock item created with quantity 0 (allowed for tracking purposes). Item appears in list with 0 quantity. | Medium | REQ-STOCK-005 |
| TC-020  | Add stock with negative quantity | PC-01, PC-03, PC-05 | 1. Open part detail, Stock tab. 2. Click "New Stock Item". 3. Enter Quantity: -5. 4. Click "Submit". | Validation error: quantity cannot be negative. Stock item is not created. | Medium | REQ-STOCK-006 |

---

## 4. Part Detail View - BOM Tab

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-021  | View BOM for an assembly | PC-01, PC-10 | 1. Navigate to the assembly part. 2. Click "BOM" tab. | BOM table displays with columns: Part, Reference, Quantity, Overage, Note. At least two component rows visible. | Critical | REQ-BOM-001 |
| TC-022  | Add BOM item to assembly | PC-01, PC-10, PC-03 | 1. Open assembly part. 2. Click "BOM" tab. 3. Click "Add BOM Item". 4. Search and select a component part. 5. Enter Quantity: 4. 6. Enter Reference: "R1, R2, R3, R4". 7. Click "Submit". | BOM item added. Table updates showing new component with quantity 4 and reference designators. | Critical | REQ-BOM-002 |
| TC-023  | Edit BOM item quantity | PC-01, PC-10 | 1. Open assembly part BOM tab. 2. Click edit icon on an existing BOM item. 3. Change Quantity from 2 to 5. 4. Click "Submit". | BOM item quantity updates to 5 in the table. | High | REQ-BOM-003 |
| TC-024  | Delete BOM item | PC-01, PC-10 | 1. Open assembly part BOM tab. 2. Click delete icon on a BOM item. 3. Confirm deletion in dialog. | BOM item removed from table. Component count decreases by one. | High | REQ-BOM-004 |
| TC-025  | Validate BOM (check for completeness) | PC-01, PC-10 | 1. Open assembly part BOM tab. 2. Click "Validate BOM" button. 3. Confirm validation. | BOM status changes to "Validated". Validated badge or checkmark appears. | High | REQ-BOM-005 |
| TC-026  | Add substitute for BOM item | PC-01, PC-10 | 1. Open assembly BOM tab. 2. Click on a BOM item to expand details. 3. Click "Add Substitute". 4. Search and select an alternative part. 5. Click "Submit". | Substitute part appears under the BOM item. Substitute count indicator updates. | Medium | REQ-BOM-006 |
| TC-027  | Prevent adding assembly as its own BOM component | PC-01, PC-10 | 1. Open assembly part "Board Assembly". 2. Click BOM tab. 3. Click "Add BOM Item". 4. Search and select "Board Assembly" (the same part). 5. Click "Submit". | Validation error: a part cannot be a component of itself. BOM item is not added. | High | REQ-BOM-007 |

---

## 5. Part Detail View - Allocated Tab

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-028  | View allocations for a component part | PC-01, PC-10 | 1. Navigate to a component part that is used in at least one build order. 2. Click "Allocated" tab. | Allocation table shows build order allocations with columns: Order, Quantity, Status. | High | REQ-ALLOC-001 |
| TC-029  | Allocated tab hidden for non-component non-salable part | PC-01 | 1. Create or navigate to a part with Component=false and Salable=false. 2. Inspect the tab bar. | "Allocated" tab is not visible in the tab bar. | Medium | REQ-ALLOC-002 |

---

## 6. Part Detail View - Build Orders Tab

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-030  | View build orders for an assembly | PC-01, PC-10 | 1. Navigate to assembly part with existing build orders. 2. Click "Build Orders" tab. | Build orders table displays with columns: Reference, Quantity, Status, Target Date. | High | REQ-BUILD-001 |
| TC-031  | Create build order from part detail | PC-01, PC-10 | 1. Open assembly part. 2. Click "Build Orders" tab. 3. Click "New Build Order". 4. Enter Quantity: 10. 5. Set Target Date. 6. Click "Submit". | Build order created. Appears in the build orders table with status "Pending" and quantity 10. | High | REQ-BUILD-002 |

---

## 7. Part Detail View - Parameters Tab

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-032  | Add parameter to part | PC-01, PC-03, PC-06 | 1. Open part detail. 2. Click "Parameters" tab. 3. Click "Add Parameter". 4. Select Template: "Resistance". 5. Enter Value: "10000". 6. Click "Submit". | Parameter added. Parameters table shows "Resistance" = "10000" with unit "ohm". | Critical | REQ-PARAM-001 |
| TC-033  | Edit existing parameter value | PC-01, PC-03, PC-06 | 1. Open part with existing parameter "Resistance" = 10000. 2. Click "Parameters" tab. 3. Click edit on the Resistance parameter. 4. Change value to "4700". 5. Click "Submit". | Parameter value updates to 4700. | High | REQ-PARAM-002 |
| TC-034  | Delete parameter from part | PC-01, PC-03, PC-06 | 1. Open part with a parameter. 2. Click "Parameters" tab. 3. Click delete icon on a parameter. 4. Confirm deletion. | Parameter removed from the table. | High | REQ-PARAM-003 |
| TC-035  | Add parameter with incompatible units | PC-01, PC-03, PC-06 | 1. Open part. 2. Click "Parameters" tab. 3. Click "Add Parameter". 4. Select Template: "Resistance" (expects ohm). 5. Enter Value: "5" with units "kg". 6. Click "Submit". | Validation error: incompatible units. Parameter is not added. | Medium | REQ-PARAM-004 |
| TC-036  | Parametric table sorting by value | PC-01, PC-02, PC-06 | 1. Navigate to a category with multiple parts having "Resistance" parameter. 2. Click "Parameters" tab on the category view. 3. Click the "Resistance" column header to sort. | Parts sort numerically by resistance value (not alphabetically). Unit conversion is applied if values have different unit prefixes. | Medium | REQ-PARAM-005 |

---

## 8. Part Detail View - Variants Tab

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-037  | View variants of a template part | PC-01, PC-07 | 1. Navigate to the template part. 2. Click "Variants" tab. | Variants table displays listing all variant parts derived from this template. | High | REQ-VAR-001 |
| TC-038  | Create variant from template | PC-01, PC-07 | 1. Open template part. 2. Click "Variants" tab. 3. Click "New Variant" (or Duplicate Part). 4. Enter Name: "Variant - Red". 5. Modify Description. 6. Click "Submit". | New variant part created. Appears in Variants tab of the template. Variant's detail shows "Variant Of" linking to template. | Critical | REQ-VAR-002 |
| TC-039  | Variants tab hidden for non-template parts | PC-01, PC-03 | 1. Navigate to a part where Template flag is disabled. 2. Inspect the tab bar. | "Variants" tab is not visible. | Medium | REQ-VAR-003 |

---

## 9. Part Detail View - Revisions Tab

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-040  | Create a revision of a part | PC-01, PC-03 | 1. Open a non-template part. 2. Click "Revisions" tab. 3. Click "New Revision". 4. Enter Revision code: "B". 5. Click "Submit". | Revision "B" created. Appears in Revisions tab. Revision dropdown in part header shows available revisions. | High | REQ-REV-001 |
| TC-041  | Navigate between revisions | PC-01, PC-03 | 1. Open a part that has revisions A and B. 2. Click the revision dropdown in the part header. 3. Select Revision "A". | Page updates to show Revision A details. Revision indicator changes. | High | REQ-REV-002 |
| TC-042  | Prevent revision of a template part | PC-01, PC-07 | 1. Open a template part. 2. Attempt to create a new revision. | Option to create revision is disabled or not available. Error message if attempted via API: "Template parts cannot have revisions." | Medium | REQ-REV-003 |
| TC-043  | Prevent revision-of-revision | PC-01 | 1. Open a part that is itself a revision (e.g., Revision B of Part X). 2. Attempt to create a new revision of this revision. | Operation is blocked. Error: "Cannot create a revision of a revision." | Medium | REQ-REV-004 |
| TC-044  | Duplicate revision code rejected | PC-01, PC-03 | 1. Open a part with existing Revision "B". 2. Click "New Revision". 3. Enter Revision code: "B" again. 4. Click "Submit". | Validation error: revision code must be unique for this part. | Medium | REQ-REV-005 |
| TC-045  | Prevent circular revision references | PC-01 | 1. Part A is revision of Part B. 2. Attempt to set Part B as revision of Part A. | Validation error: circular reference detected. Operation blocked. | Medium | REQ-REV-006 |

---

## 10. Part Detail View - Attachments Tab

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-046  | Upload attachment to part | PC-01, PC-03 | 1. Open part detail. 2. Click "Attachments" tab. 3. Click "Add Attachment". 4. Select a PDF file (e.g., datasheet.pdf). 5. Enter Comment: "Component datasheet". 6. Click "Upload". | File uploads successfully. Appears in attachments table with filename, comment, upload date, and user. | High | REQ-ATT-001 |
| TC-047  | Download attachment | PC-01, PC-03 | 1. Open part with an attachment. 2. Click "Attachments" tab. 3. Click the download icon next to an attachment. | File downloads to browser. File content matches the originally uploaded file. | High | REQ-ATT-002 |
| TC-048  | Delete attachment | PC-01, PC-03 | 1. Open part with an attachment. 2. Click "Attachments" tab. 3. Click delete icon on the attachment. 4. Confirm deletion. | Attachment removed from the table. File no longer downloadable. | High | REQ-ATT-003 |

---

## 11. Part Detail View - Related Parts Tab

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-049  | Add related part | PC-01, PC-03 | 1. Open part "Resistor 10k". 2. Click "Related Parts" tab. 3. Click "Add Related Part". 4. Search and select "Resistor 10k 1%". 5. Click "Submit". | Related part link created. "Resistor 10k 1%" appears in related parts table. Relationship is bidirectional. | Medium | REQ-REL-001 |
| TC-050  | Remove related part link | PC-01, PC-03 | 1. Open part with a related part. 2. Click "Related Parts" tab. 3. Click delete on the relationship. 4. Confirm. | Relationship removed from both parts. | Medium | REQ-REL-002 |

---

## 12. Part Detail View - Test Templates Tab

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-051  | Add test template to testable part | PC-01, PC-11 | 1. Open a testable part. 2. Click "Test Templates" tab. 3. Click "Add Test Template". 4. Enter Test Name: "Visual Inspection". 5. Set Required: true. 6. Enter Description: "Check for physical damage". 7. Click "Submit". | Test template added. Appears in test templates table with name, required status, and description. | High | REQ-TEST-001 |
| TC-052  | Edit test template | PC-01, PC-11 | 1. Open testable part with test templates. 2. Click edit on "Visual Inspection" test. 3. Change Required to false. 4. Click "Submit". | Test template updates. Required column shows false. | Medium | REQ-TEST-002 |
| TC-053  | Delete test template | PC-01, PC-11 | 1. Open testable part. 2. Click delete on a test template. 3. Confirm deletion. | Test template removed from table. | Medium | REQ-TEST-003 |
| TC-054  | Test Templates tab hidden for non-testable parts | PC-01, PC-03 | 1. Navigate to a part with Testable=false. 2. Inspect tab bar. | "Test Templates" tab is not visible. | Medium | REQ-TEST-004 |

---

## 13. Part Detail View - Suppliers & Purchase Orders Tabs

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-055  | View supplier parts for purchaseable part | PC-01, PC-08 | 1. Navigate to a purchaseable part. 2. Click "Suppliers" tab. | Supplier parts table shows linked suppliers with SKU, manufacturer, and pricing info. | High | REQ-SUP-001 |
| TC-056  | Add supplier part | PC-01, PC-08, PC-04 | 1. Open purchaseable part. 2. Click "Suppliers" tab. 3. Click "Add Supplier Part". 4. Select Supplier. 5. Enter SKU: "DIGI-RES-10K". 6. Enter price: 0.05. 7. Click "Submit". | Supplier part created. Appears in suppliers table. | High | REQ-SUP-002 |
| TC-057  | View purchase orders tab | PC-01, PC-08 | 1. Open purchaseable part with existing POs. 2. Click "Purchase Orders" tab. | Purchase orders table displays with order reference, supplier, status, and quantity. | High | REQ-SUP-003 |
| TC-058  | Suppliers tab hidden for non-purchaseable part | PC-01 | 1. Navigate to a part with Purchaseable=false. 2. Inspect tab bar. | "Suppliers" and "Purchase Orders" tabs are not visible. | Medium | REQ-SUP-004 |

---

## 14. Part Detail View - Sales Orders Tab

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-059  | View sales orders for salable part | PC-01, PC-09 | 1. Navigate to a salable part with existing SOs. 2. Click "Sales Orders" tab. | Sales orders table displays with order reference, customer, status, and quantity. | High | REQ-SALE-001 |
| TC-060  | Sales Orders tab hidden for non-salable part | PC-01 | 1. Navigate to a part with Salable=false. 2. Inspect tab bar. | "Sales Orders" tab is not visible. | Medium | REQ-SALE-002 |

---

## 15. Part Detail View - Stock History & Used In Tabs

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-061  | View stock history | PC-01, PC-13 | 1. Navigate to a part with stock transactions. 2. Click "Stock History" tab. | History table shows entries with Date, Action (added, removed, transferred, counted), Quantity Delta, User, and Notes. | High | REQ-HIST-001 |
| TC-062  | Stock history reflects recent transfer | PC-01, PC-13 | 1. Perform a stock transfer (TC-017). 2. Navigate to the part's "Stock History" tab. | Latest entry shows transfer action with correct quantity, source/destination locations, and timestamp. | High | REQ-HIST-002 |
| TC-063  | View "Used In" for component part | PC-01, PC-10 | 1. Navigate to a component part used in an assembly BOM. 2. Click "Used In" tab. | Table shows all assemblies where this part is a BOM component, with assembly name, quantity required, and reference. | High | REQ-USED-001 |

---

## 16. Part Categories

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-064  | Create top-level category | PC-01 | 1. Navigate to Part Categories. 2. Click "New Category". 3. Enter Name: "Mechanical Parts". 4. Leave Parent blank. 5. Click "Submit". | Category created at top level. Appears in category tree. | Critical | REQ-CAT-001 |
| TC-065  | Create subcategory | PC-01, PC-02 | 1. Navigate to "Electronic Components" category. 2. Click "New Subcategory". 3. Enter Name: "Inductors". 4. Confirm Parent is "Electronic Components". 5. Click "Submit". | Subcategory created under "Electronic Components". Tree hierarchy reflects parent-child relationship. | Critical | REQ-CAT-002 |
| TC-066  | Edit category name | PC-01, PC-02 | 1. Navigate to a category. 2. Click "Edit Category". 3. Change Name to "Passive Components". 4. Click "Submit". | Category name updates. Breadcrumb and tree reflect the new name. | High | REQ-CAT-003 |
| TC-067  | Delete empty category | PC-01 | 1. Create a new empty category "Temp Category". 2. Navigate to it. 3. Click "Delete Category". 4. Confirm deletion. | Category is deleted. No longer appears in the tree. | High | REQ-CAT-004 |
| TC-068  | Breadcrumb navigation through category hierarchy | PC-01, PC-02 | 1. Navigate to a deeply nested category (e.g., "Electronic Components > Resistors > SMD"). 2. Click "Electronic Components" in the breadcrumb. | Page navigates to "Electronic Components" category showing its subcategories and parts. | Medium | REQ-CAT-005 |
| TC-069  | Filter parts within category | PC-01, PC-02 | 1. Navigate to a category with multiple parts. 2. Enter a search term in the parts filter/search box. 3. Press Enter or apply filter. | Parts list filters to show only matching parts within the current category. | Medium | REQ-CAT-006 |
| TC-070  | Category parametric table | PC-01, PC-02, PC-06 | 1. Navigate to a category where parts have parameters. 2. Click "Parameters" tab on the category. | Parametric table displays all parts in this category with parameter columns. Values are populated from each part's parameters. | Medium | REQ-CAT-007 |
| TC-071  | Delete category with parts inside | PC-01, PC-02 | 1. Navigate to a category containing parts. 2. Attempt to delete the category. | System warns about existing parts. Deletion requires either moving parts or confirming cascading action. Parts are not orphaned. | High | REQ-CAT-008 |

---

## 17. Part Attributes (Boolean Flags)

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-072  | Enable Assembly flag | PC-01, PC-03 | 1. Open a part. 2. Click "Edit Part". 3. Enable "Assembly" checkbox. 4. Click "Submit". | Part detail shows Assembly=true. "BOM" tab becomes visible. | High | REQ-ATTR-001 |
| TC-073  | Enable Trackable flag | PC-01, PC-03 | 1. Open a part. 2. Click "Edit Part". 3. Enable "Trackable" checkbox. 4. Click "Submit". | Part is now trackable. Serial number fields appear when adding stock. | High | REQ-ATTR-002 |
| TC-074  | Toggle Active to Inactive | PC-01, PC-03 | 1. Open an active part. 2. Click "Edit Part". 3. Uncheck "Active". 4. Click "Submit". | Part marked as inactive. Visual indicator (e.g., badge, greyed styling) shows inactive status. | High | REQ-ATTR-003 |
| TC-075  | Enable Locked flag | PC-01, PC-03 | 1. Open a part. 2. Click "Edit Part". 3. Enable "Locked" checkbox. 4. Click "Submit". | Part is now locked. Subsequent attempts to edit parameters, BOM, or delete the part are blocked. | High | REQ-ATTR-004 |
| TC-076  | Enable Template flag makes Variants tab visible | PC-01, PC-03 | 1. Open a non-template part. 2. Verify "Variants" tab is hidden. 3. Click "Edit Part". 4. Enable "Template" checkbox. 5. Click "Submit". | "Variants" tab now appears in the tab bar. | Medium | REQ-ATTR-005 |
| TC-077  | Enable Testable flag makes Test Templates tab visible | PC-01, PC-03 | 1. Open a part with Testable=false. 2. Verify "Test Templates" tab is hidden. 3. Edit part, enable "Testable". 4. Submit. | "Test Templates" tab now appears. | Medium | REQ-ATTR-006 |
| TC-078  | Virtual part prevents stock creation | PC-01, PC-03 | 1. Open a part. 2. Edit part, enable "Virtual". 3. Submit. 4. Navigate to Stock tab. 5. Attempt to add stock. | Stock creation is restricted for virtual parts. "New Stock Item" button is disabled or hidden. | Medium | REQ-ATTR-007 |

---

## 18. Locked Part Restrictions

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-079  | Cannot edit parameters of locked part | PC-01, PC-14 | 1. Navigate to the locked part. 2. Click "Parameters" tab. 3. Attempt to add or edit a parameter. | Add/edit controls are disabled or hidden. If attempted via direct action, error: "Part is locked." | High | REQ-LOCK-001 |
| TC-080  | Cannot modify BOM of locked part | PC-01, PC-14 | 1. Navigate to the locked part (assembly). 2. Click "BOM" tab. 3. Attempt to add a BOM item. | Add BOM item button is disabled or hidden. Error if forced: "Part is locked." | High | REQ-LOCK-002 |
| TC-081  | Cannot delete locked part | PC-01, PC-14 | 1. Navigate to the locked part. 2. Attempt to delete the part. | Delete option is disabled or returns error: "Cannot delete a locked part." Part remains in the system. | High | REQ-LOCK-003 |

---

## 19. Inactive Part Restrictions

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-082  | Inactive part shows visual indicator | PC-01, PC-15 | 1. Navigate to the inactive part. | Part detail page shows clear inactive indicator (badge, banner, or greyed-out styling). | Medium | REQ-INACT-001 |
| TC-083  | Inactive part excluded from default part searches | PC-01, PC-15 | 1. Navigate to Parts list. 2. Search for the inactive part by name without changing filters. | Inactive part does not appear in default search results. Appears only when "Include Inactive" filter is enabled. | High | REQ-INACT-002 |
| TC-084  | Cannot add inactive part to BOM | PC-01, PC-10, PC-15 | 1. Open an assembly part. 2. Click BOM tab. 3. Attempt to add the inactive part as a BOM component. | Inactive part is not selectable or an error is shown when attempting to add it. | High | REQ-INACT-003 |

---

## 20. Units of Measure

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-085  | Create part with custom units | PC-01, PC-02 | 1. Click "New Part". 2. Fill required fields. 3. Set Units: "metres". 4. Click "Submit". | Part created with units displayed as "metres" on detail page. Stock quantities respect this unit. | High | REQ-UNIT-001 |
| TC-086  | Create part with default units (pcs) | PC-01, PC-02 | 1. Click "New Part". 2. Fill required fields. 3. Leave Units field blank/default. 4. Click "Submit". | Part created. Units default to "pcs" or blank (system default). | Medium | REQ-UNIT-002 |
| TC-087  | Reject incompatible supplier part units | PC-01, PC-08 | 1. Open a part with units "metres". 2. Add a supplier part. 3. Set supplier part pack units to "kg". 4. Submit. | Validation error: supplier part units (kg) are incompatible with part units (metres). | Medium | REQ-UNIT-003 |
| TC-088  | Accept compatible supplier part units | PC-01, PC-08 | 1. Open a part with units "metres". 2. Add a supplier part. 3. Set supplier part pack units to "cm". 4. Submit. | Supplier part created successfully. Compatible unit (cm to metres) is accepted. | Medium | REQ-UNIT-004 |
| TC-089  | Invalid unit string rejected | PC-01, PC-02 | 1. Click "New Part". 2. Fill required fields. 3. Enter Units: "xyzzy". 4. Click "Submit". | Validation error: invalid unit. Part is not created. | Medium | REQ-UNIT-005 |

---

## 21. Part Images

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-090  | Upload image from computer | PC-01, PC-03 | 1. Open part detail. 2. Click the part image placeholder or "Upload Image". 3. Select a JPG image file from local disk. 4. Confirm upload. | Image uploads and displays as the part thumbnail. Image appears in detail view header. | High | REQ-IMG-001 |
| TC-091  | Select image from existing library | PC-01, PC-03 | 1. Open part detail. 2. Click image area. 3. Select "Choose from existing". 4. Pick an image from the gallery. 5. Confirm. | Selected image is set as the part image. Thumbnail updates. | Medium | REQ-IMG-002 |
| TC-092  | Delete part image | PC-01, PC-03 | 1. Open a part with an image set. 2. Click the image area. 3. Click "Delete Image" or "Remove". 4. Confirm. | Image is removed. Part shows default placeholder thumbnail. | Medium | REQ-IMG-003 |
| TC-093  | Thumbnail generation on upload | PC-01, PC-03 | 1. Upload a large image (e.g., 4000x3000 px) to a part. 2. Navigate to Parts list view. | Thumbnail version of the image is displayed in list view. Thumbnail loads quickly (not full-size image). | Low | REQ-IMG-004 |

---

## 22. Part Detail View - Supplier Data on Creation

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-094  | Create purchaseable part with initial supplier data | PC-01, PC-02, PC-04 | 1. Click "New Part". 2. Fill required fields. 3. Enable "Purchaseable" flag. 4. In the supplier section (if shown), select a Supplier. 5. Enter SKU: "SUP-001". 6. Enter Manufacturer Part Number: "MFG-001". 7. Click "Submit". | Part created with purchaseable flag. Supplier part is automatically created and linked. Visible in the Suppliers tab. | High | REQ-PART-020 |

---

## 23. Part Detail View - Initial Stock on Creation

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-095  | Create part with initial stock (setting enabled) | PC-01, PC-02, PC-05 | 1. Ensure "Create initial stock" setting is enabled in InvenTree config. 2. Click "New Part". 3. Fill required fields. 4. In initial stock section, enter Quantity: 50. 5. Select Location: "Warehouse A". 6. Click "Submit". | Part created. Stock tab immediately shows stock item with quantity 50 at "Warehouse A". | High | REQ-PART-021 |

---

## 24. Multi-Level BOM

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-096  | View multi-level BOM (sub-assemblies) | PC-01, PC-10 | 1. Create Assembly "Top Board" with BOM containing "Sub-Assembly A". 2. "Sub-Assembly A" has its own BOM with components. 3. Navigate to "Top Board" BOM tab. 4. Expand or toggle multi-level BOM view. | Multi-level BOM displays hierarchically: Top Board > Sub-Assembly A > Sub-Assembly A's components. Total component quantities are aggregated. | High | REQ-BOM-010 |

---

## 25. Templates & Variants - Advanced

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-097  | Stock reporting across template and variants | PC-01, PC-07 | 1. Navigate to the template part. 2. Check the stock summary/overview area. | Total stock displayed includes stock from all variants. Individual variant stock is also visible or expandable. | High | REQ-VAR-010 |
| TC-098  | Serial number uniqueness across template and variants | PC-01, PC-07 | 1. Open template part with Trackable enabled. 2. Add stock to a variant with Serial Number "SN-001". 3. Attempt to add stock to another variant with Serial Number "SN-001". | Validation error: serial number "SN-001" already exists within this template family. | High | REQ-VAR-011 |

---

## 26. Negative & Boundary - Cross-Cutting

| TC-ID   | Title | Preconditions | Steps | Expected Result | Priority | Req-ID |
|---------|-------|---------------|-------|-----------------|----------|--------|
| TC-099  | XSS in part name field | PC-01, PC-02 | 1. Click "New Part". 2. Enter Name: `<script>alert('xss')</script>`. 3. Fill other required fields. 4. Submit. | Script tag is escaped/sanitized. Part name displays as literal text, not executed. No alert dialog appears. | High | REQ-SEC-001 |
| TC-100  | SQL injection in search field | PC-01 | 1. Navigate to Parts list. 2. Enter `'; DROP TABLE part; --` in the search field. 3. Press Enter. | Search returns no results or handles input safely. No database error. System remains functional. | High | REQ-SEC-002 |
| TC-101  | Concurrent edit conflict | PC-01 | 1. Open part detail in two browser tabs. 2. In Tab 1, edit Description to "Version A" and submit. 3. In Tab 2, edit Description to "Version B" and submit. | Second save either succeeds (last-write-wins) or shows conflict warning. No data corruption. Part has a consistent state. | Medium | REQ-SEC-003 |
| TC-102  | Large file upload as attachment | PC-01, PC-03 | 1. Open part detail, Attachments tab. 2. Attempt to upload a file exceeding the server's max upload size (e.g., 100MB+). | Upload fails gracefully with error message about file size limit. No server error or timeout without feedback. | Medium | REQ-ATT-010 |
| TC-103  | Special characters in part name | PC-01, PC-02 | 1. Click "New Part". 2. Enter Name: `Resistor 10kΩ ±5% (0805) "Type-A"`. 3. Fill other required fields. 4. Submit. | Part created successfully. Special characters (Ω, ±, quotes, parentheses) display correctly in all views. | Medium | REQ-PART-030 |
| TC-104  | Rapidly create multiple parts (stress) | PC-01, PC-02 | 1. Create 10 parts in quick succession using the form. 2. Verify each part after creation. | All 10 parts are created with correct data. No duplicate entries, no missing parts, no server errors. | Low | REQ-PERF-001 |
| TC-105  | Access part detail with invalid ID via URL | PC-01 | 1. Manually navigate to URL: `/part/999999999/`. | 404 or "Part not found" page displayed. No server error stack trace exposed. | Medium | REQ-SEC-004 |

---

## Test Case Summary

| Area | Test Cases | Critical | High | Medium | Low |
|------|-----------|----------|------|--------|-----|
| Part Creation - Manual | TC-001 to TC-010 | 4 | 2 | 3 | 1 |
| Part Creation - Import | TC-011 to TC-014 | 0 | 2 | 2 | 0 |
| Stock Tab | TC-015 to TC-020 | 2 | 1 | 2 | 0 |
| BOM Tab | TC-021 to TC-027 | 1 | 4 | 1 | 0 |
| Allocated Tab | TC-028 to TC-029 | 0 | 1 | 1 | 0 |
| Build Orders Tab | TC-030 to TC-031 | 0 | 2 | 0 | 0 |
| Parameters Tab | TC-032 to TC-036 | 1 | 2 | 2 | 0 |
| Variants Tab | TC-037 to TC-039 | 1 | 1 | 1 | 0 |
| Revisions Tab | TC-040 to TC-045 | 0 | 2 | 4 | 0 |
| Attachments Tab | TC-046 to TC-048 | 0 | 3 | 0 | 0 |
| Related Parts Tab | TC-049 to TC-050 | 0 | 0 | 2 | 0 |
| Test Templates Tab | TC-051 to TC-054 | 0 | 1 | 3 | 0 |
| Suppliers & PO Tabs | TC-055 to TC-058 | 0 | 3 | 1 | 0 |
| Sales Orders Tab | TC-059 to TC-060 | 0 | 1 | 1 | 0 |
| Stock History & Used In | TC-061 to TC-063 | 0 | 3 | 0 | 0 |
| Part Categories | TC-064 to TC-071 | 2 | 3 | 3 | 0 |
| Part Attributes (Flags) | TC-072 to TC-078 | 0 | 4 | 3 | 0 |
| Locked Part Restrictions | TC-079 to TC-081 | 0 | 3 | 0 | 0 |
| Inactive Part Restrictions | TC-082 to TC-084 | 0 | 2 | 1 | 0 |
| Units of Measure | TC-085 to TC-089 | 0 | 1 | 4 | 0 |
| Part Images | TC-090 to TC-093 | 0 | 1 | 2 | 1 |
| Supplier Data on Creation | TC-094 | 0 | 1 | 0 | 0 |
| Initial Stock on Creation | TC-095 | 0 | 1 | 0 | 0 |
| Multi-Level BOM | TC-096 | 0 | 1 | 0 | 0 |
| Templates & Variants Adv. | TC-097 to TC-098 | 0 | 2 | 0 | 0 |
| Negative & Boundary | TC-099 to TC-105 | 0 | 2 | 4 | 1 |
| **TOTAL** | **105** | **11** | **48** | **40** | **3** |
