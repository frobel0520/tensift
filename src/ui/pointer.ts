import { useSyncExternalStore } from 'react';

const COARSE_POINTER_QUERY = '(pointer: coarse)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined;
  }
  const query = window.matchMedia(COARSE_POINTER_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(COARSE_POINTER_QUERY).matches;
}

/** 主要指標是手指（手機、平板）時為 true；HTML5 拖曳在這些裝置上無法使用。 */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** 觸控裝置不提拖曳，只說明點選操作。 */
export function placementRule(copy: { readonly ruleTap: string; readonly ruleTapTouch: string }, coarsePointer: boolean): string {
  return coarsePointer ? copy.ruleTapTouch : copy.ruleTap;
}
