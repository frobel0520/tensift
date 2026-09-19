import { renderSitemap } from '../server/editorial/render';
import type { PagesFunction, TensiftEnvironment } from './types';

export const onRequestGet: PagesFunction<TensiftEnvironment> = () => renderSitemap();
