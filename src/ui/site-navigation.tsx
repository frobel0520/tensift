import type { Locale } from '../api/contracts';

const labels = {
  en: ['Explore Tensift', 'How to play', 'Past puzzles & explanations', 'About & contact', 'Privacy'],
  'zh-Hans': ['探索 Tensift', '玩法指南', '往期谜题与解析', '关于与联系', '隐私说明'],
  'es-419': ['Explora Tensift', 'Cómo jugar', 'Acertijos anteriores y explicaciones', 'Acerca de y contacto', 'Privacidad'],
} as const;

export function SiteNavigation({ locale }: { readonly locale: Locale }) {
  const copy = labels[locale];
  return (
    <nav className="site-navigation" aria-label={copy[0]}>
      {['how-to-play', 'archive', 'about', 'privacy'].map((page, index) => (
        <a key={page} href={`/learn/${locale}/${page}`}>{copy[index + 1]}</a>
      ))}
    </nav>
  );
}
