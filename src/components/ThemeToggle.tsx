import { useState } from 'react';
import { getTheme, setTheme, type Theme } from '../lib/theme';

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 14.1A8.5 8.5 0 1 1 9.9 3.5a6.6 6.6 0 0 0 10.6 10.6z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setState] = useState<Theme>(getTheme);
  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
  const label = nextTheme === 'dark' ? 'Mudar para o modo escuro' : 'Mudar para o modo claro';

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(nextTheme);
        setState(nextTheme);
      }}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-graphite hover:bg-pen-soft hover:text-pen"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
