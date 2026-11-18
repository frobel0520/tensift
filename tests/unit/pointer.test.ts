import { describe, expect, it } from 'vitest';
import { getMessages } from '../../src/i18n/messages';
import { placementRule } from '../../src/ui/pointer';

describe('placementRule', () => {
  it('omits drag instructions on coarse pointers in every locale', () => {
    for (const locale of ['en', 'zh-Hant', 'es-419'] as const) {
      const copy = getMessages(locale);
      expect(placementRule(copy, false)).toBe(copy.ruleTap);
      expect(placementRule(copy, true)).toBe(copy.ruleTapTouch);
      expect(copy.ruleTapTouch).not.toMatch(/drag|拖曳|arrástr/i);
    }
  });
});
