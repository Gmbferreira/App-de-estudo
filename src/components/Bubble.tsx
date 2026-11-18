export type BubbleState = 'empty' | 'filled' | 'right' | 'wrong' | 'faded';

const styles: Record<BubbleState, string> = {
  empty: 'border-ink/70 text-ink bg-sheet',
  filled: 'border-pen bg-pen text-white',
  right: 'border-acerto bg-acerto text-white',
  wrong: 'border-erro bg-erro text-white',
  faded: 'border-graphite/40 text-graphite/70 bg-sheet',
};

/** A "bolinha" do cartão-resposta com a letra da alternativa. */
export default function Bubble({
  letter,
  state,
  size = 'md',
}: {
  letter: string;
  state: BubbleState;
  size?: 'sm' | 'md';
}) {
  const dims = size === 'sm' ? 'h-5 w-8 text-xs' : 'h-7 w-11 text-sm';
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] font-bold transition-colors duration-150 ${dims} ${styles[state]}`}
    >
      {letter}
    </span>
  );
}
