import { useSyncExternalStore } from 'react';
import type { Status } from './types';

// localStorage はプライベートモードや設定によって使えないことがあるので、
// 読み書きはすべて try/catch で包み、失敗してもメモリ上の値で動き続ける。

const PREFIX = 'fe-a-cram:';

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* 保存できなくても画面は動かす */
  }
}

/** 値を持ち、変更を購読できる小さなストア */
function createStore<T>(key: string, fallback: T) {
  let value = readJSON<T>(key, fallback);
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next: T) {
      value = next;
      writeJSON(key, next);
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

// ---- 進捗 ----

type ProgressMap = Record<string, Status>;
const progressStore = createStore<ProgressMap>('progress:v1', {});

export function useProgress(): ProgressMap {
  return useSyncExternalStore(progressStore.subscribe, progressStore.get);
}

export function getStatus(id: string): Status {
  return progressStore.get()[id] ?? 'new';
}

export function setStatus(id: string, status: Status): void {
  const next = { ...progressStore.get() };
  if (status === 'new') delete next[id];
  else next[id] = status;
  progressStore.set(next);
}

export function resetProgress(): void {
  progressStore.set({});
}

// ---- 表示テーマ ----

export type Theme = 'system' | 'light' | 'dark';
const themeStore = createStore<Theme>('theme', 'system');

export function useTheme(): Theme {
  return useSyncExternalStore(themeStore.subscribe, themeStore.get);
}

export function setTheme(t: Theme): void {
  themeStore.set(t);
}

export function applyTheme(t: Theme): void {
  const root = document.documentElement;
  if (t === 'system') delete root.dataset.theme;
  else root.dataset.theme = t;
}

// ---- ツリーの開閉状態（表示の好みなので失われても困らない） ----

const openStore = createStore<Record<string, boolean>>('tree-open', {});

export function useOpenState(): Record<string, boolean> {
  return useSyncExternalStore(openStore.subscribe, openStore.get);
}

export function setOpen(key: string, open: boolean): void {
  openStore.set({ ...openStore.get(), [key]: open });
}
