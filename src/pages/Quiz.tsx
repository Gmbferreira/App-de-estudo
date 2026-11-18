import { useEffect, useMemo, useRef } from 'react';
import AiNotice from '../components/AiNotice';
import Bubble, { type BubbleState } from '../components/Bubble';
import Markdown from '../components/Markdown';
import ThemeToggle from '../components/ThemeToggle';
import type { Bank } from '../lib/schema';
import {
  confirm,
  currentId,
  isReappearing,
  letter,
  next,
  progress,
  select,
  skip,
  type Session,
} from '../lib/session';

interface Props {
  bank: Bank;
  session: Session;
  onChange: (s: Session) => void;
  onExit: () => void;
}

export default function Quiz({ bank, session, onChange, onExit }: Props) {
  const id = currentId(session);
  const question = useMemo(() => bank.questions.find((q) => q.id === id), [bank, id]);
  const nextButton = useRef<HTMLButtonElement>(null);

  const { answered, total, pendingSkipped } = progress(session);
  const feedback = session.phase === 'feedback';
  const reappearing = isReappearing(session);
  const isLast = session.queue.length === 1;

  // Nova questão: volta ao topo.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Depois de confirmar, o foco vai para "Próxima".
  useEffect(() => {
    if (feedback) nextButton.current?.focus({ preventScroll: true });
  }, [feedback]);

  if (!question) return null;

  const options = session.optionOrder[question.id].map(
    (oid) => question.options.find((o) => o.id === oid)!,
  );
  const chosen = feedback ? session.answers[question.id] : session.selected;
  const correct = chosen === question.answer;
  const correctIndex = options.findIndex((o) => o.id === question.answer);

  function bubbleState(optionId: string): BubbleState {
    if (!feedback) return optionId === session.selected ? 'filled' : 'empty';
    if (optionId === question!.answer) return 'right';
    if (optionId === chosen) return 'wrong';
    return 'faded';
  }

  function rowStyle(optionId: string): string {
    if (!feedback) {
      return optionId === session.selected
        ? 'border-pen bg-pen-soft'
        : 'border-rule bg-sheet hover:border-ink/40 cursor-pointer';
    }
    if (optionId === question!.answer) return 'border-acerto bg-acerto-soft';
    if (optionId === chosen) return 'border-erro bg-erro-soft';
    return 'border-rule bg-sheet text-graphite';
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3">
          <button
            type="button"
            onClick={onExit}
            className="-ml-2 shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-sm font-bold text-pen hover:bg-pen-soft"
          >
            Voltar aos bancos
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm text-graphite">
              {session.mode === 'review' ? `Revisão das erradas: ${bank.title}` : bank.title}
            </p>
            <ThemeToggle />
          </div>
        </div>
        <div
          className="h-1.5 bg-rule"
          role="progressbar"
          aria-label="Progresso"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answered}
        >
          <div
            className="h-full bg-pen transition-[width] duration-300"
            style={{ width: `${total ? (answered / total) * 100 : 0}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pt-6 pb-36">
        <p className="mb-4 flex flex-wrap gap-x-4 text-sm text-graphite">
          <span>
            {answered} de {total} respondidas
          </span>
          {pendingSkipped > 0 && (
            <span>
              {pendingSkipped === 1 ? '1 pulada no final' : `${pendingSkipped} puladas no final`}
            </span>
          )}
          {question.source && <span>{question.source}</span>}
        </p>

        {reappearing && !feedback && (
          <p className="mb-4 rounded-md bg-pen-soft px-3 py-2 text-sm text-pen-strong">
            Você pulou esta questão antes. Se pular de novo, ela conta como erro.
          </p>
        )}

        <article className="rounded-lg border border-rule bg-sheet px-5 py-6 sm:px-8">
          <Markdown text={question.statement} className="text-lg leading-relaxed" />
          {question.image && (
            <img
              src={`${import.meta.env.BASE_URL}images/${question.image}`}
              alt=""
              className="mt-5 max-w-full rounded-md border border-rule"
            />
          )}
        </article>

        <fieldset className="mt-5">
          <legend className="sr-only">Alternativas</legend>
          <ul className="space-y-2.5">
            {options.map((o, i) => (
              <li key={o.id}>
                <button
                  type="button"
                  disabled={feedback}
                  aria-pressed={!feedback ? o.id === session.selected : undefined}
                  onClick={() => onChange(select(session, o.id))}
                  className={`flex w-full items-start gap-3.5 rounded-lg border px-4 py-3 text-left transition-colors duration-150 disabled:cursor-default ${rowStyle(o.id)}`}
                >
                  <Bubble letter={letter(i)} state={bubbleState(o.id)} />
                  <Markdown text={o.text} inline className="min-w-0 flex-1 pt-0.5" />
                  {feedback && o.id === question.answer && (
                    <span className="sr-only">(resposta certa)</span>
                  )}
                  {feedback && o.id === chosen && o.id !== question.answer && (
                    <span className="sr-only">(sua resposta)</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>

        {feedback && (
          <div className="mt-5 space-y-3" role="status">
            <p className={`text-lg font-bold ${correct ? 'text-acerto' : 'text-erro'}`}>
              {correct
                ? 'Você acertou.'
                : `Você errou. A resposta certa é a alternativa ${letter(correctIndex)}.`}
            </p>
            {question.answerSource === 'ai' && <AiNotice />}
          </div>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-rule bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-end gap-3 px-5 py-4">
          {feedback ? (
            <button
              ref={nextButton}
              type="button"
              onClick={() => onChange(next(session))}
              className="rounded-md bg-pen px-6 py-2.5 font-bold text-on-accent hover:bg-pen-strong"
            >
              {isLast ? 'Ver resultado' : 'Próxima questão'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onChange(skip(session))}
                className="rounded-md border border-rule bg-sheet px-5 py-2.5 font-bold text-ink hover:border-ink/40"
              >
                {reappearing ? 'Pular (conta como erro)' : 'Pular'}
              </button>
              <button
                type="button"
                disabled={!session.selected}
                onClick={() => onChange(confirm(session))}
                className="rounded-md bg-pen px-6 py-2.5 font-bold text-on-accent hover:bg-pen-strong disabled:cursor-not-allowed disabled:bg-rule disabled:text-graphite"
              >
                Confirmar
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
