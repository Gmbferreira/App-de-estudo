import ThemeToggle from '../components/ThemeToggle';
import { bankErrors, banks } from '../lib/banks';
import type { Bank } from '../lib/schema';
import { isSessionValid, progress, type Session } from '../lib/session';
import { clearSession, loadHistory, loadSession, summarizeHistory } from '../lib/storage';

interface Props {
  onStart: (bank: Bank) => void;
  onResume: (bank: Bank, session: Session) => void;
}

const pct = (n: number) => `${Math.round(n)}%`;

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function savedSession(bank: Bank): Session | null {
  const stored = loadSession(bank.id);
  if (!stored) return null;
  if (isSessionValid(stored, bank)) return stored;
  // O banco mudou desde que a sessão foi salva: descarta.
  clearSession(bank.id);
  return null;
}

function BankRow({ bank, onStart, onResume }: { bank: Bank } & Props) {
  const session = savedSession(bank);
  const history = summarizeHistory(loadHistory(bank.id));
  const p = session ? progress(session) : null;

  function restart() {
    if (window.confirm('Descartar o progresso desta rodada e começar de novo?')) {
      clearSession(bank.id);
      onStart(bank);
    }
  }

  return (
    <li className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-bold leading-snug">{bank.title}</h2>
        {bank.description && <p className="mt-1 text-graphite">{bank.description}</p>}

        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-graphite">
          <span>{plural(bank.questions.length, 'questão', 'questões')}</span>
          {history.attempts > 0 && (
            <>
              <span>{plural(history.attempts, 'tentativa', 'tentativas')}</span>
              <span>Última: {pct(history.last!)}</span>
              <span>Melhor: {pct(history.best!)}</span>
            </>
          )}
        </p>

        {session && p && (
          <p className="mt-2 text-sm font-bold text-pen">
            {session.mode === 'review' ? 'Revisão das erradas em andamento' : 'Rodada em andamento'}
            {`: ${p.answered} de ${p.total} respondidas`}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {session ? (
          <>
            <button
              type="button"
              onClick={() => onResume(bank, session)}
              className="rounded-md bg-pen px-4 py-2 font-bold text-on-accent hover:bg-pen-strong"
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={restart}
              className="rounded-md border border-rule bg-sheet px-4 py-2 font-bold text-ink hover:border-ink/40"
            >
              Recomeçar
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onStart(bank)}
            className="rounded-md bg-pen px-4 py-2 font-bold text-on-accent hover:bg-pen-strong"
          >
            Começar
          </button>
        )}
      </div>
    </li>
  );
}

export default function BankList(props: Props) {
  return (
    <main className="mx-auto max-w-3xl px-5 pt-12 pb-20 sm:pt-16">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Bancos de questões</h1>
          <p className="mt-2 text-graphite">
            Questões e alternativas aparecem em ordem aleatória a cada rodada.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {bankErrors.length > 0 && (
        <section
          aria-labelledby="erros"
          className="mb-8 rounded-lg border border-erro/30 bg-erro-soft p-5"
        >
          <h2 id="erros" className="font-bold text-erro">
            {bankErrors.length === 1
              ? 'Um arquivo de banco tem erros e não foi carregado'
              : `${bankErrors.length} arquivos de banco têm erros e não foram carregados`}
          </h2>
          <ul className="mt-3 space-y-3 text-sm">
            {bankErrors.map((e) => (
              <li key={e.file}>
                <p className="font-bold">src/banks/{e.file}</p>
                <ul className="mt-1 list-disc pl-5">
                  {e.messages.slice(0, 8).map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                  {e.messages.length > 8 && <li>e mais {e.messages.length - 8} erros</li>}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {banks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-rule bg-sheet p-8">
          <p className="font-bold">Nenhum banco encontrado</p>
          <p className="mt-1 text-graphite">
            Salve um arquivo .json em src/banks e recarregue a página. O PROMPT.md, na raiz do
            projeto, explica como gerar um com IA.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-rule border-y border-rule">
          {banks.map((bank) => (
            <BankRow key={bank.id} bank={bank} {...props} />
          ))}
        </ul>
      )}
    </main>
  );
}
