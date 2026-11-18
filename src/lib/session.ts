import type { Bank, Question } from './schema';
import { shuffle } from './shuffle';

export type SessionMode = 'full' | 'review';

/**
 * Estado completo de uma rodada. É salvo inteiro no localStorage a cada ação,
 * então tudo aqui precisa ser serializável em JSON.
 */
export interface Session {
  v: 1;
  bankId: string;
  bankVersion: number;
  mode: SessionMode;
  /** Todas as questões da rodada, na ordem sorteada. */
  questionIds: string[];
  /** Questões pendentes. A atual é sempre queue[0]. */
  queue: string[];
  /** Ordem sorteada das alternativas de cada questão. */
  optionOrder: Record<string, string[]>;
  /** Questões já puladas uma vez (foram para o fim da fila). */
  skipped: string[];
  /** Resposta final de cada questão: id da alternativa, ou null se pulada duas vezes. */
  answers: Record<string, string | null>;
  /** Ordem em que as questões foram resolvidas. */
  answeredOrder: string[];
  selected: string | null;
  phase: 'answering' | 'feedback';
  startedAt: number;
}

export function createSession(bank: Bank, mode: SessionMode = 'full', onlyIds?: string[]): Session {
  const wanted = onlyIds ? new Set(onlyIds) : null;
  const questions = wanted ? bank.questions.filter((q) => wanted.has(q.id)) : bank.questions;
  const questionIds = shuffle(questions.map((q) => q.id));

  const optionOrder: Record<string, string[]> = {};
  for (const q of questions) optionOrder[q.id] = shuffle(q.options.map((o) => o.id));

  return {
    v: 1,
    bankId: bank.id,
    bankVersion: bank.version,
    mode,
    questionIds,
    queue: [...questionIds],
    optionOrder,
    skipped: [],
    answers: {},
    answeredOrder: [],
    selected: null,
    phase: 'answering',
    startedAt: Date.now(),
  };
}

export function select(s: Session, optionId: string): Session {
  if (s.phase !== 'answering') return s;
  return { ...s, selected: optionId };
}

export function confirm(s: Session): Session {
  if (s.phase !== 'answering' || !s.selected || s.queue.length === 0) return s;
  const id = s.queue[0];
  return {
    ...s,
    answers: { ...s.answers, [id]: s.selected },
    answeredOrder: [...s.answeredOrder, id],
    phase: 'feedback',
  };
}

export function next(s: Session): Session {
  if (s.phase !== 'feedback') return s;
  return { ...s, queue: s.queue.slice(1), selected: null, phase: 'answering' };
}

export function skip(s: Session): Session {
  if (s.phase !== 'answering' || s.queue.length === 0) return s;
  const [id, ...rest] = s.queue;

  if (s.skipped.includes(id)) {
    // Segunda vez pulando: conta como erro.
    return {
      ...s,
      queue: rest,
      answers: { ...s.answers, [id]: null },
      answeredOrder: [...s.answeredOrder, id],
      selected: null,
    };
  }

  return { ...s, queue: [...rest, id], skipped: [...s.skipped, id], selected: null };
}

export function isFinished(s: Session): boolean {
  return s.queue.length === 0;
}

export function currentId(s: Session): string | undefined {
  return s.queue[0];
}

/** A questão atual já foi pulada uma vez (está reaparecendo no final). */
export function isReappearing(s: Session): boolean {
  const id = currentId(s);
  return id !== undefined && s.skipped.includes(id) && !(id in s.answers);
}

export function progress(s: Session) {
  return {
    answered: s.answeredOrder.length,
    total: s.questionIds.length,
    pendingSkipped: s.skipped.filter((id) => !(id in s.answers)).length,
  };
}

/** Confere se uma sessão salva ainda bate com o banco atual. */
export function isSessionValid(s: unknown, bank: Bank): s is Session {
  if (!s || typeof s !== 'object') return false;
  const session = s as Partial<Session>;
  if (session.v !== 1 || session.bankId !== bank.id || session.bankVersion !== bank.version) {
    return false;
  }
  if (!Array.isArray(session.questionIds) || !Array.isArray(session.queue)) return false;
  if (!session.optionOrder || !session.answers || !Array.isArray(session.answeredOrder)) {
    return false;
  }
  if (!Array.isArray(session.skipped)) return false;

  const byId = new Map(bank.questions.map((q) => [q.id, q]));
  for (const id of session.questionIds) {
    const q = byId.get(id);
    const order = session.optionOrder[id];
    if (!q || !Array.isArray(order) || order.length !== q.options.length) return false;
    if (!q.options.every((o) => order.includes(o.id))) return false;
  }
  return session.queue.every((id) => byId.has(id));
}

export interface WrongItem {
  question: Question;
  chosen: string | null;
  optionOrder: string[];
}

export function computeResult(s: Session, bank: Bank) {
  const byId = new Map(bank.questions.map((q) => [q.id, q]));
  const total = s.questionIds.length;
  let correct = 0;
  const wrong: WrongItem[] = [];

  for (const id of s.answeredOrder) {
    const q = byId.get(id);
    if (!q) continue;
    const chosen = s.answers[id] ?? null;
    if (chosen === q.answer) correct++;
    else wrong.push({ question: q, chosen, optionOrder: s.optionOrder[id] });
  }

  return { correct, total, percent: total ? (correct / total) * 100 : 0, wrong };
}

/** Letra exibida para a alternativa na posição i (A, B, C...). */
export function letter(i: number): string {
  return String.fromCharCode(65 + i);
}
