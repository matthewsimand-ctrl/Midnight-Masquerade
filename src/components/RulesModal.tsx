import { GameMode } from "../shared/types.js";

const RULES_BY_MODE: Record<GameMode, { title: string; bullets: string[] }> = {
  BattleRoyale: {
    title: "Battle Royale (Default)",
    bullets: [
      "You begin in hidden alliances, but alliances are reassigned among the survivors after every round.",
      "Round flow stays the same: reveal your motif, dance, share one card, gossip, then vote.",
      "If the voted player is a Serpent (minority), they are eliminated immediately.",
      "If the voted player is a Lion (majority), they survive and must choose another Majority player to eliminate.",
      "After each elimination, alliances rebalance: even survivor counts means there will be 2 more Majority players than Minority. Odd survivors counts results in 1 more Majority player than Minority.",
      "The game ends when exactly two players remain. Those two are co-winners.",
    ],
  },
  LionsVsSnakes: {
    title: "Lions vs. Snakes (Classic)",
    bullets: [
      "Alliances are hidden and fixed for the whole game.",
      "Round flow is unchanged: dance, share, gossip, and vote each round.",
      "Any voted player is eliminated immediately.",
      "Lions (Majority) win if all Snakes (Minority) are eliminated.",
      "Snakes (Minority) win by orchestrating two Lion (Majority) eliminations in a row.",
    ],
  },
};

export function RulesModal({
  isOpen,
  onClose,
  selectedMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedMode: GameMode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/75 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-xl border border-[var(--color-charcoal-warm)] bg-[var(--color-ballroom)] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-serif text-[var(--color-gold)]">Masquerade Rules</h3>
          <button
            className="text-[var(--color-ash)] hover:text-[var(--color-ivory)] transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 text-[var(--color-ivory-antique)]">
          {(["BattleRoyale", "LionsVsSnakes"] as GameMode[]).map((mode) => (
            <div
              key={mode}
              className={`rounded-lg border p-4 ${
                selectedMode === mode
                  ? "border-[var(--color-gold)]/50 bg-[var(--color-velvet)]"
                  : "border-[var(--color-charcoal-warm)] bg-[var(--color-velvet)]/40"
              }`}
            >
              <h4 className="font-serif text-lg text-[var(--color-ivory)] mb-2">{RULES_BY_MODE[mode].title}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {RULES_BY_MODE[mode].bullets.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}