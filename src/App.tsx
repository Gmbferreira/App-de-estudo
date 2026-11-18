import { useState } from 'react';
import type { Bank } from './lib/schema';
import { computeResult, createSession, isFinished, type Session } from './lib/session';
import { addHistory, clearSession, saveSession } from './lib/storage';
import BankList from './pages/BankList';
import Quiz from './pages/Quiz';
import Results from './pages/Results';

type View =
  | { name: 'list' }
  | { name: 'quiz'; bank: Bank; session: Session }
  | { name: 'results'; bank: Bank; session: Session };

export default function App() {
  const [view, setView] = useState<View>({ name: 'list' });

  function open(bank: Bank, session: Session) {
    saveSession(session);
    setView({ name: 'quiz', bank, session });
    window.scrollTo(0, 0);
  }

  function update(bank: Bank, session: Session) {
    if (!isFinished(session)) {
      saveSession(session);
      setView({ name: 'quiz', bank, session });
      return;
    }

    const result = computeResult(session, bank);
    addHistory(bank.id, {
      date: Date.now(),
      mode: session.mode,
      correct: result.correct,
      total: result.total,
      wrongIds: result.wrong.map((w) => w.question.id),
    });
    clearSession(bank.id);
    setView({ name: 'results', bank, session });
    window.scrollTo(0, 0);
  }

  function backToList() {
    setView({ name: 'list' });
    window.scrollTo(0, 0);
  }

  if (view.name === 'quiz') {
    return (
      <Quiz
        bank={view.bank}
        session={view.session}
        onChange={(s) => update(view.bank, s)}
        onExit={backToList}
      />
    );
  }

  if (view.name === 'results') {
    return (
      <Results
        bank={view.bank}
        session={view.session}
        onRetryWrong={(ids) => open(view.bank, createSession(view.bank, 'review', ids))}
        onRetryAll={() => open(view.bank, createSession(view.bank, 'full'))}
        onExit={backToList}
      />
    );
  }

  return (
    <BankList
      onStart={(bank) => open(bank, createSession(bank, 'full'))}
      onResume={(bank, session) => open(bank, session)}
    />
  );
}
