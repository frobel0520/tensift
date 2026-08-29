import { useEffect, useRef } from 'react';
import type { UiMessages } from '../i18n/messages';

const ADSENSE_SCRIPT_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const ADSENSE_CLIENT_ID_PATTERN = /^ca-pub-\d{16}$/;
const ADSENSE_SLOT_ID_PATTERN = /^\d{4,20}$/;

export interface AdSenseConfig {
  readonly clientId: string;
  readonly topSlotId: string;
}

interface AdsEnvironment {
  readonly VITE_ADSENSE_CLIENT_ID?: unknown;
  readonly VITE_ADSENSE_TOP_SLOT?: unknown;
}

interface AdsenseQueue extends Array<Record<string, unknown>> {}

declare global {
  interface Window {
    adsbygoogle?: AdsenseQueue;
  }
}

export function readAdSenseConfig(environment: AdsEnvironment): AdSenseConfig | null {
  const clientId = readEnvironmentString(environment.VITE_ADSENSE_CLIENT_ID);
  const topSlotId = readEnvironmentString(environment.VITE_ADSENSE_TOP_SLOT);

  if (!clientId || !topSlotId || !isValidAdSenseClientId(clientId) || !isValidAdSenseSlotId(topSlotId)) {
    return null;
  }

  return { clientId, topSlotId };
}

export function isValidAdSenseClientId(value: string): boolean {
  return ADSENSE_CLIENT_ID_PATTERN.test(value);
}

export function isValidAdSenseSlotId(value: string): boolean {
  return ADSENSE_SLOT_ID_PATTERN.test(value);
}

export function TopAdBanner({ copy }: { readonly copy: UiMessages }) {
  const adRef = useRef<HTMLModElement>(null);
  const config = readAdSenseConfig({
    VITE_ADSENSE_CLIENT_ID: import.meta.env.VITE_ADSENSE_CLIENT_ID,
    VITE_ADSENSE_TOP_SLOT: import.meta.env.VITE_ADSENSE_TOP_SLOT,
  });

  useEffect(() => {
    if (!config || !adRef.current) {
      return;
    }

    const adQueue = window.adsbygoogle ?? [];
    window.adsbygoogle = adQueue;
    ensureAdSenseScript(config.clientId);

    if (adRef.current.dataset.tensiftAdInitialized === 'true') {
      return;
    }

    adQueue.push({});
    adRef.current.dataset.tensiftAdInitialized = 'true';
  }, [config?.clientId, config?.topSlotId]);

  if (!config) {
    return import.meta.env.DEV ? (
      <section className="ad-slot ad-slot--top ad-slot--placeholder" aria-label={copy.advertisement}>
        <p className="ad-slot-label">{copy.advertisement}</p>
        <p className="ad-slot-placeholder">{copy.adPlaceholder}</p>
      </section>
    ) : null;
  }

  return (
    <section className="ad-slot ad-slot--top" aria-label={copy.advertisement}>
      <p className="ad-slot-label">{copy.advertisement}</p>
      <ins
        ref={adRef}
        className="adsbygoogle ad-slot-unit"
        data-ad-client={config.clientId}
        data-ad-slot={config.topSlotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </section>
  );
}

function ensureAdSenseScript(clientId: string): void {
  if (document.querySelector('script[data-tensift-adsense]')) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.dataset.tensiftAdsense = 'true';
  script.dataset.clientId = clientId;
  script.src = `${ADSENSE_SCRIPT_URL}?client=${encodeURIComponent(clientId)}`;
  document.head.append(script);
}

function readEnvironmentString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}
