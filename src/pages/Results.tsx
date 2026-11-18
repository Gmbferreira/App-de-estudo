import { useMemo } from 'react';
import AiNotice from '../components/AiNotice';
import Bubble from '../components/Bubble';
import Markdown from '../components/Markdown';
import type { Bank } from '../lib/schema';
import { computeResult, letter, type Session, type WrongItem } from '../lib/session';

interface Props {
  bank: Bank;
  session: Session;
  onRetryWrong: (ids: string[]) => void;
  onRetryAll: () => void;
  onExit: () => void;
}

function formatPercent(n: number) {
  const rounded = Math.round(n * 10) / 10;
  return `${rounded.toLocaleString('pt-BR')}%`;
}

function AnswerLine({
  label,
  item,
  optionId,
  tone,
}: {
  label: string;
  item: WrongItem;
  optionId: string;
  tone: 'right' | 'wrong';
}) {
  const index = item.optionOrder.indexOf(optionId);
  const option = item.question.options.find((o) => o.id === optionId)!;
  return (
    <div className="flex items-start gap-3">
      <Bubble letter={letter(index)} state={tone} size="sm" />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${tone === 'right' ? 'text-acerto' : 'text-erro'}`}>
          {label}
        </p>
        <Markdown text={option.text} inline />
      </div>
    </div>
  );
}

export default function Results({ bank, session, onRetryWrong, onRetryAll, onExit }: Props) {
  const result = useMemo(() => computeResult(session, bank), [session, bank]);
  const wrongIds = result.wrong.map((w) => w.question.id);

  return (
    <main className="mx-auto max-w-3xl px-5 pt-12 pb-20 sm:pt-16">
      <header>
        <p className="text-graphite">
          {session.mode === 'review' ? `Revisão das erradas: ${bank.title}` : bank.title}
        </p>
        <h1 className="mt-3 text-7xl font-bold tracking-tight tabular-nums sm:text-8xl">
          {formatPercent(result.percent)}
        </h1>
        <p className="mt-3 text-xl">
          Você acertou {result.correct} de {result.total}{' '}
          {result.total === 1 ? 'questão' : 'questões'}.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-3">
        {wrongIds.length > 0 && (
          <button
            type="button"
            onClick={() => onRetryWrong(wrongIds)}
            className="rounded-md bg-pen px-5 py-2.5 font-bold text-white hover:bg-pen-dark"
          >
            Refazer as erradas ({wrongIds.length})
          </button>
        )}
        <button
          type="button"
          onClick={onRetryAll}
          className="rounded-md border border-rule bg-sheet px-5 py-2.5 font-bold text-ink hover:border-ink/40"
        >
          Refazer o banco inteiro
        </button>
        <button
          type="button"
          onClick={onExit}
          className="rounded-md px-3 py-2.5 font-bold text-pen hover:bg-pen-soft"
        >
          Voltar aos bancos
        </button>
      </div>

      {result.wrong.length > 0 ? (
        <section className="mt-14" aria-labelledby="erradas">
          <h2 id="erradas" className="text-2xl font-bold">
            {result.wrong.length === 1
              ? 'A questão que você errou'
              : `As ${result.wrong.length} questões que você errou`}
          </h2>
          <ul className="mt-5 space-y-5">
            {result.wrong.map((item) => (
              <li
                key={item.question.id}
                className="rounded-lg border border-rule bg-sheet px-5 py-6 sm:px-8"
              >
                {item.question.source && (
                  <p className="mb-2 text-sm text-graphite">{item.question.source}</p>
                )}
                <Markdown text={item.question.statement} />
                {item.question.image && (
                  <img
                    src={`${import.meta.env.BASE_URL}images/${item.question.image}`}
                    alt=""
                    className="mt-4 max-w-full rounded-md border border-rule"
                  />
                )}

                <div className="mt-5 space-y-3 border-t border-rule pt-5">
                  {item.chosen ? (
                    <AnswerLine label="Sua resposta" item={item} optionId={item.chosen} tone="wrong" />
                  ) : (
                    <p className="text-sm font-bold text-erro">
                      Sem resposta: você pulou esta questão duas vezes.
                    </p>
                  )}
                  <AnswerLine
                    label="Resposta certa"
                    item={item}
                    optionId={item.question.answer}
                    tone="right"
                  />
                  {item.question.answerSource === 'ai' && <AiNotice />}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mt-14 text-lg text-graphite">Nenhum erro nesta rodada.</p>
      )}
    </main>
  );
}
