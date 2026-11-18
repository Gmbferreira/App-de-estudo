export type Theme = 'light' | 'dark';

const KEY = 'app-estudo:theme';

/** Tema atual, já aplicado pelo script do index.html. */
export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#121722' : '#eef1f5');
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* sem armazenamento: vale só até recarregar */
  }
}
