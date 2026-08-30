import type { UiMessages } from '../i18n/messages';

const PRODUCTION_URL = 'https://tensift.pages.dev';

export interface ShareResultInput {
  readonly theme: string;
  readonly puzzleDate: string;
  readonly attempts: number;
  readonly solved: boolean;
  readonly hintUsed: boolean;
}

export interface SharePayload {
  readonly title: string;
  readonly text: string;
  readonly url: string;
}

export type ShareResultOutcome = 'shared' | 'copied' | 'cancelled';

export function buildSharePayload(input: ShareResultInput, copy: UiMessages): SharePayload {
  const status = input.solved
    ? interpolate(copy.shareSolved, { attempts: input.attempts })
    : copy.shareRevealed;
  const lines = [
    `Tensift · ${input.theme}`,
    input.puzzleDate,
    status,
  ];

  if (input.hintUsed) {
    lines.push(copy.shareHintUsed);
  }

  return {
    title: copy.shareTitle,
    text: lines.join('\n'),
    url: getShareUrl(),
  };
}

export async function shareResult(payload: SharePayload): Promise<ShareResultOutcome> {
  const shareNavigator = getShareNavigator();
  if (shareNavigator?.share) {
    try {
      await shareNavigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      return 'shared';
    } catch (error: unknown) {
      if (isAbortError(error)) {
        return 'cancelled';
      }
    }
  }

  await copyToClipboard(`${payload.text}\n${payload.url}`);
  return 'copied';
}

function getShareNavigator(): Pick<Navigator, 'share' | 'clipboard'> | null {
  if (typeof navigator === 'undefined') {
    return null;
  }
  return navigator;
}

function getShareUrl(): string {
  // Keep shared links on the canonical public site, even when a result is
  // shared from a local build or a temporary Pages preview.
  return PRODUCTION_URL;
}

async function copyToClipboard(value: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Try the legacy DOM path below before reporting a share failure.
    }
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard is not available in this environment.');
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) {
    throw new Error('Clipboard copy was not accepted.');
  }
}

function isAbortError(error: unknown): boolean {
  return (typeof DOMException !== 'undefined'
    && error instanceof DOMException
    && error.name === 'AbortError')
    || (error instanceof Error && error.name === 'AbortError');
}

function interpolate(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}
