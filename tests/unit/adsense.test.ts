import { describe, expect, it } from 'vitest';
import {
  isValidAdSenseClientId,
  isValidAdSenseSlotId,
  readAdSenseConfig,
} from '../../src/ui/adsense';

describe('AdSense configuration', () => {
  it('accepts a complete pair of public identifiers', () => {
    expect(readAdSenseConfig({
      VITE_ADSENSE_CLIENT_ID: ' ca-pub-1234567890123456 ',
      VITE_ADSENSE_TOP_SLOT: '9876543210',
    })).toEqual({
      clientId: 'ca-pub-1234567890123456',
      topSlotId: '9876543210',
    });
  });

  it('keeps ads disabled when either identifier is missing or malformed', () => {
    expect(readAdSenseConfig({ VITE_ADSENSE_CLIENT_ID: 'ca-pub-placeholder', VITE_ADSENSE_TOP_SLOT: '9876543210' })).toBeNull();
    expect(readAdSenseConfig({ VITE_ADSENSE_CLIENT_ID: 'ca-pub-1234567890123456' })).toBeNull();
    expect(readAdSenseConfig({ VITE_ADSENSE_CLIENT_ID: 'ca-pub-1234567890123456', VITE_ADSENSE_TOP_SLOT: 'slot' })).toBeNull();
  });

  it('validates the identifier formats independently', () => {
    expect(isValidAdSenseClientId('ca-pub-1234567890123456')).toBe(true);
    expect(isValidAdSenseClientId('pub-1234567890123456')).toBe(false);
    expect(isValidAdSenseSlotId('1234567890')).toBe(true);
    expect(isValidAdSenseSlotId('')).toBe(false);
  });
});
