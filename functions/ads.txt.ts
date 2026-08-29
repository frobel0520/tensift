import type { PagesFunction, TensiftEnvironment } from './types';

const PUBLISHER_ID_PATTERN = /^pub-\d{16}$/;
const ADS_TXT_LINE = 'google.com, {publisherId}, DIRECT, f08c47fec0942fa0\n';

export const onRequestGet: PagesFunction<TensiftEnvironment> = ({ env }) => {
  const publisherId = env.ADSENSE_PUBLISHER_ID?.trim();

  if (!publisherId) {
    return new Response('AdSense ads.txt is not configured.\n', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  if (!PUBLISHER_ID_PATTERN.test(publisherId)) {
    return new Response('AdSense publisher configuration is invalid.\n', {
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  return new Response(ADS_TXT_LINE.replace('{publisherId}', publisherId), {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
