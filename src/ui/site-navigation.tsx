import type { Locale } from '../api/contracts';

const labels = {
  en: ['Explore Tensift', 'How to play', 'Past puzzles & explanations', 'About & contact', 'Privacy'],
  'zh-Hans': ['探索 Tensift', '玩法指南', '往期谜题与解析', '关于与联系', '隐私说明'],
  'es-419': ['Explora Tensift', 'Cómo jugar', 'Acertijos anteriores y explicaciones', 'Acerca de y contacto', 'Privacidad'],
} as const;

/** Playmint collects the author's other browser puzzle games. */
export const MORE_GAMES_URL = 'https://playmint.pages.dev/';

const moreGamesLabels = {
  en: 'More games',
  'zh-Hans': '更多游戏',
  'es-419': 'Más juegos',
} as const;

export function SiteNavigation({ locale }: { readonly locale: Locale }) {
  const copy = labels[locale];
  return (
    <nav className="site-navigation" aria-label={copy[0]}>
      {['how-to-play', 'archive', 'about', 'privacy'].map((page, index) => (
        <a key={page} href={`/learn/${locale}/${page}`}>{copy[index + 1]}</a>
      ))}
      <a className="site-navigation__more" href={MORE_GAMES_URL}>
        {moreGamesLabels[locale]}
        <span aria-hidden="true"> ↗</span>
      </a>
    </nav>
  );
}
