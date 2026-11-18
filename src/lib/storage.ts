import type { Session, SessionMode } from './session';

const PREFIX = 'app-estudo:';
const MAX_HISTORY = 50;

// Se o navegador bloquear o localStorage (ex.: aba anônima em alguns navegadores),
// o app continua funcionando, só sem salvar.
function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* sem armazenamento disponível */
  }
}

function remove(key: string) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* sem armazenamento disponível */
  }
}

/* Sessão em andamento (uma por banco) */

export function loadSession(bankId: string): unknown {
  return read(`session:${bankId}`);
}

export function saveSession(session: Session) {
  write(`session:${session.bankId}`, session);
}

export function clearSession(bankId: string) {
  remove(`session:${bankId}`);
}

/* Histórico de tentativas */

export interface HistoryEntry {
  date: number;
  mode: SessionMode;
  correct: number;
  total: number;
  wrongIds: string[];
}

export function loadHistory(bankId: string): HistoryEntry[] {
  const data = read<HistoryEntry[]>(`history:${bankId}`);
  return Array.isArray(data) ? data : [];
}

export function addHistory(bankId: string, entry: HistoryEntry) {
  const list = [...loadHistory(bankId), entry].slice(-MAX_HISTORY);
  write(`history:${bankId}`, list);
}

export function summarizeHistory(entries: HistoryEntry[]) {
  const full = entries.filter((e) => e.mode === 'full' && e.total > 0);
  const pct = (e: HistoryEntry) => (e.correct / e.total) * 100;
  return {
    attempts: full.length,
    reviews: entries.length - full.length,
    last: full.length ? pct(full[full.length - 1]) : null,
    best: full.length ? Math.max(...full.map(pct)) : null,
  };
}
