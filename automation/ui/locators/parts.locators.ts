/**
 * Part-specific locators for InvenTree Parts module.
 */
export const PartsLocators = {
  // Part list
  partsList: 'table tbody, .mantine-Table-root tbody',
  partRow: (name: string) => `tr:has-text("${name}")`,
  newPartButton: 'button:has-text("New Part"), button:has-text("Add Part")',
  importButton: 'button:has-text("Import")',

  // Part form fields (in modal)
  form: {
    name: 'input[name="name"], label:has-text("Name") + input',
    description: 'textarea[name="description"], label:has-text("Description") + textarea',
    category: '[data-field="category"], label:has-text("Category")',
    ipn: 'input[name="IPN"], label:has-text("IPN") + input',
    keywords: 'input[name="keywords"], label:has-text("Keywords") + input',
    units: 'input[name="units"], label:has-text("Units") + input',
    link: 'input[name="link"], label:has-text("Link") + input',
  },

  // Part attribute toggles
  attributes: {
    assembly: 'label:has-text("Assembly"), input[name="assembly"]',
    component: 'label:has-text("Component"), input[name="component"]',
    template: 'label:has-text("Template"), input[name="is_template"]',
    virtual: 'label:has-text("Virtual"), input[name="virtual"]',
    trackable: 'label:has-text("Trackable"), input[name="trackable"]',
    purchaseable: 'label:has-text("Purchaseable"), input[name="purchaseable"]',
    salable: 'label:has-text("Salable"), input[name="salable"]',
    testable: 'label:has-text("Testable"), input[name="testable"]',
    active: 'label:has-text("Active"), input[name="active"]',
  },

  // Part detail tabs
  tabs: {
    stock: '[role="tab"]:has-text("Stock")',
    bom: '[role="tab"]:has-text("BOM"), [role="tab"]:has-text("Bill of Materials")',
    allocated: '[role="tab"]:has-text("Allocated")',
    buildOrders: '[role="tab"]:has-text("Build Orders")',
    parameters: '[role="tab"]:has-text("Parameters")',
    variants: '[role="tab"]:has-text("Variants")',
    revisions: '[role="tab"]:has-text("Revisions")',
    attachments: '[role="tab"]:has-text("Attachments")',
    related: '[role="tab"]:has-text("Related")',
    testTemplates: '[role="tab"]:has-text("Test")',
    suppliers: '[role="tab"]:has-text("Suppliers")',
    purchaseOrders: '[role="tab"]:has-text("Purchase Orders")',
    salesOrders: '[role="tab"]:has-text("Sales")',
    usedIn: '[role="tab"]:has-text("Used In")',
  },

  // Part detail actions
  actions: {
    edit: 'button:has-text("Edit")',
    delete: 'button:has-text("Delete")',
    duplicate: 'button:has-text("Duplicate")',
    actionsMenu: 'button[aria-label="Actions"], button:has-text("Actions")',
  },

  // Category
  category: {
    tree: '.mantine-Tree-root, [class*="CategoryTree"]',
    newCategoryButton: 'button:has-text("New Category"), button:has-text("Add Category")',
  },
} as const;
