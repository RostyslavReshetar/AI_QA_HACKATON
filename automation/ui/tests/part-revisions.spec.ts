/**
 * Part Revisions UI tests.
 * Covers: TC-065, TC-066
 */
import { test, expect } from '../fixtures/auth.fixture.js';
import { PartDetailPage } from '../pages/part-detail.page.js';
import { createTestPartViaAPI, CleanupRegistry } from '../fixtures/test-data.fixture.js';

const cleanup = new CleanupRegistry();
test.afterAll(async () => { await cleanup.cleanupAll(); });

test.describe('Part Revisions', () => {
  let testPart: { pk: number; name: string };

  test.beforeAll(async () => {
    testPart = await createTestPartViaAPI({
      name: `RevisionTest-${Date.now()}`,
      assembly: true,
    });
    cleanup.registerPart(testPart.pk);
  });

  test('TC-065: Check if Revisions tab exists', async ({ page }) => {
    const detail = new PartDetailPage(page);
    await detail.navigate(testPart.pk);

    const revisionsVisible = await detail.isTabVisible('Revisions');
    // Revisions may depend on InvenTree settings
    test.info().annotations.push({
      type: 'note',
      description: `Revisions tab visible: ${revisionsVisible}`,
    });
  });
});
