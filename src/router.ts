import { useEffect, useState } from 'react';

// サーバー設定なしで静的ホスティングできるよう、ハッシュ（#/...）でページを切り替える

export type Route =
  | { name: 'home' }
  | { name: 'topic'; id: string }
  | { name: 'search'; q: string }
  | { name: 'shuffle' }
  | { name: 'settings' };

function parse(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 't' && parts[1]) return { name: 'topic', id: decodeURIComponent(parts[1]) };
  if (parts[0] === 'search') return { name: 'search', q: new URLSearchParams(query).get('q') ?? '' };
  if (parts[0] === 'shuffle') return { name: 'shuffle' };
  if (parts[0] === 'settings') return { name: 'settings' };
  return { name: 'home' };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parse(location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export const href = {
  home: () => '#/',
  topic: (id: string) => `#/t/${encodeURIComponent(id)}`,
  search: (q = '') => (q ? `#/search?q=${encodeURIComponent(q)}` : '#/search'),
  shuffle: () => '#/shuffle',
  settings: () => '#/settings',
};
