/**
 * Common locators shared across all pages.
 * InvenTree PUI uses Mantine UI components.
 */
export const CommonLocators = {
  // Navigation
  sidebar: '.mantine-Navbar-root, nav[class*="Sidebar"]',
  sidebarItem: (name: string) => `nav a:has-text("${name}")`,
  breadcrumbs: '.mantine-Breadcrumbs-root',

  // Modals
  modal: '.mantine-Modal-root, [role="dialog"]',
  modalTitle: '.mantine-Modal-title',
  modalCloseBtn: '.mantine-Modal-root button[aria-label="Close"]',

  // Buttons
  submitButton: 'button:has-text("Submit"), button:has-text("Save"), button:has-text("Create")',
  cancelButton: 'button:has-text("Cancel")',
  deleteButton: 'button:has-text("Delete")',

  // Tables
  tableBody: '.mantine-Table-root tbody, table tbody',
  tableRow: '.mantine-Table-root tbody tr, table tbody tr',
  tableHeader: '.mantine-Table-root thead th, table thead th',

  // Notifications
  notification: '.mantine-Notification-root, [role="alert"]',
  notificationClose: '.mantine-Notification-root button[aria-label="Close"]',

  // Loading
  loadingOverlay: '.mantine-LoadingOverlay-root',
  spinner: '.mantine-Loader-root',

  // Forms
  inputError: '.mantine-Input-error, .mantine-TextInput-error',
  formField: (name: string) => `[data-field="${name}"], label:has-text("${name}")`,

  // Search
  searchInput: 'input[placeholder*="Search"], input[type="search"]',
} as const;
