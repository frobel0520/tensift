import { describe, expect, it, vi } from 'vitest';
import { getMessages } from '../../src/i18n/messages';
import { buildSharePayload, shareResult } from '../../src/ui/share';

describe('share result payload', () => {
  it('builds a spoiler-free solved result with the production link', () => {
    const payload = buildSharePayload({
      theme: 'Countries',
      puzzleDate: '2026-08-29',
      attempts: 3,
      solved: true,
      hintUsed: false,
    }, getMessages('en'));

    expect(payload.title).toBe('Tensift result');
    expect(payload.text).toBe('Tensift · Countries\n2026-08-29\nSolved in 3 attempts.');
    expect(payload.url).toBe('https://tensift.pages.dev');
    expect(payload.text).not.toContain('hidden lens');
  });

  it('marks a revealed answer and hint use without exposing the solution', () => {
    const payload = buildSharePayload({
      theme: 'Países',
      puzzleDate: '2026-08-29',
      attempts: 2,
      solved: false,
      hintUsed: true,
    }, getMessages('es-419'));

    expect(payload.text).toContain('Respuesta revelada.');
    expect(payload.text).toContain('Usé una pista.');
    expect(payload.text).not.toContain('Europa');
  });

  it('uses the native share sheet when it is available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    await withNavigator({ share }, async () => {
      await expect(shareResult({ title: 'Tensift', text: 'result', url: 'https://tensift.pages.dev' }))
        .resolves.toBe('shared');
    });
    expect(share).toHaveBeenCalledWith({
      title: 'Tensift',
      text: 'result',
      url: 'https://tensift.pages.dev',
    });
  });

  it('falls back to clipboard sharing when the native sheet is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await withNavigator({ clipboard: { writeText } as unknown as Clipboard }, async () => {
      await expect(shareResult({ title: 'Tensift', text: 'result', url: 'https://tensift.pages.dev' }))
        .resolves.toBe('copied');
    });
    expect(writeText).toHaveBeenCalledWith('result\nhttps://tensift.pages.dev');
  });

  it('does not copy anything when the player cancels the native share sheet', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('dismissed', 'AbortError'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    await withNavigator({ share, clipboard: { writeText } as unknown as Clipboard }, async () => {
      await expect(shareResult({ title: 'Tensift', text: 'result', url: 'https://tensift.pages.dev' }))
        .resolves.toBe('cancelled');
    });
    expect(writeText).not.toHaveBeenCalled();
  });
});

async function withNavigator(
  value: Partial<Navigator>,
  callback: () => Promise<void>,
): Promise<void> {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value,
  });
  try {
    await callback();
  } finally {
    if (descriptor) {
      Object.defineProperty(globalThis, 'navigator', descriptor);
    } else {
      delete (globalThis as { navigator?: Navigator }).navigator;
    }
  }
}
