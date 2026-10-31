import { useEffect } from 'react';
import { href, useRoute, type Route } from './router';
import { applyTheme, useTheme } from './storage';
import Home from './pages/Home';
import TopicPage from './pages/TopicPage';
import Search from './pages/Search';
import Shuffle from './pages/Shuffle';
import Settings from './pages/Settings';

const NAV: { name: Route['name']; label: string; to: string }[] = [
  { name: 'home', label: '一覧', to: href.home() },
  { name: 'search', label: '検索', to: href.search() },
  { name: 'shuffle', label: 'シャッフル', to: href.shuffle() },
  { name: 'settings', label: '設定', to: href.settings() },
];

export default function App() {
  const route = useRoute();
  const theme = useTheme();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // ページが変わったら先頭へ（新しいブラウザでは scrollTo が Promise を返すので値を返さない）
  const routeKey = JSON.stringify(route);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [routeKey]);

  return (
    <>
      <header className="app-header">
        <a className="brand" href={href.home()}>
          <span className="brand-mark">FE</span>
          <span>
            科目A <b>パッと詰め込み</b>
          </span>
        </a>
        <nav className="app-nav" aria-label="メイン">
          {NAV.map((n) => (
            <a
              key={n.name}
              href={n.to}
              aria-current={route.name === n.name || (n.name === 'home' && route.name === 'topic') ? 'page' : undefined}
            >
              {n.label}
            </a>
          ))}
        </nav>
      </header>
      <main className="app-main">
        {route.name === 'home' && <Home />}
        {route.name === 'topic' && <TopicPage key={route.id} id={route.id} />}
        {route.name === 'search' && <Search q={route.q} />}
        {route.name === 'shuffle' && <Shuffle />}
        {route.name === 'settings' && <Settings />}
      </main>
    </>
  );
}
