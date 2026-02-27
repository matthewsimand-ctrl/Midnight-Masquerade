import { useMemo, useState } from "react";
import { GameMode } from "../shared/types.js";

const GAME_MODE_RULES: Record<GameMode, { title: string; bullets: string[] }> = {
  BattleRoyale: {
    title: "Battle Royale",
    bullets: [
      "Alliances are hidden and reshuffled among the surviving players after every round.",
      "If the voted player is a Serpent (minority), they are eliminated immediately.",
      "If the voted player is a Lion (majority), they survive and must choose another Lion to eliminate.",
      "First Tiebreaker: if two or more players are tied in votes, a revote takes place where only the tied players can be voted for by the non-tied players.",
      "Final Tiebreaker: if two or more players are still tied, each player will guess their aliance for the round. All players who guess incorrectly are eliminated even if there's more than one. If no one guesses incorrectly, no one is eliminated.",
      "Win condition: the game ends when exactly two players remain, and those two are co-winners.",
    ],
  },
  LionsVsSnakes: {
    title: "The Lions vs. The Serpents",
    bullets: [
      "Alliances are hidden and fixed for the entire game.",
      "Any player who receives the most votes is eliminated immediately.",
      "First Tiebreaker: if two or more players are tied in votes, a revote takes place where only the tied players can be voted for by the non-tied players.",
      "Final Tiebreaker: if two or more players are still tied, if one or more of the tied players is a Lion, one of them will be randomly eliminated. If all players are Serpents, one of them will be randomly eliminated.",
      "Win condition (Lions): all Serpents are eliminated.",
      "Win condition (Serpents): orchestrate two Lion eliminations in a row.",
    ],
  },
};

const HOW_TO_PLAY_SECTIONS: Array<{ title: string; body: string[] }> = [
  {
    title: "Core Gameplay",
    body: [
      "Welcome to the Masquerade Network. In this high-stakes game of hidden agendas, glamour hides betrayal.",
      "You are attending a Venetian ball where players must share secrets to determine who is on their side, while Serpents bluff their way to victory.",
      "This game contains two Game Modes: Battle Royale and The Lions vs. The Serpents.",
      "While this Instruction Manual applies to both Game Modes, please refer to the Game Modes section for game-specific details.",
    ],
  },
  {
    title: "Game Phases",
    body: [
      "Phase 1: Role Assignment — Each player is assigned one of two hidden roles: Lions (majority) or Serpents (minority). Every player receives 10 cards (a random mix of single words and images).",
      "Phase 2: Motifs — Each player receives a secret motif phrase. Teammates share the same motif, and the opposing team receives a different one.",
      "Phase 3: The Dance — Players are randomly paired to share one card. You will not receive a card from the same player you share with. Play a card that signals your allegiance through your motif.",
      "Phase 4: The Gossip Salon — Discuss the cards and identify likely allies. Important: players cannot repeat words from their motif and should focus on card-to-motif fit and alliance reads.",
      "Phase 5: The Voting Phase — Vote to eliminate a suspected opponent. If there is a tie, players not tied revote between tied players. If tied again, follow the game mode's final tiebreaker.",
      "Phase 6: The Reset — After elimination, motifs are reset. Depending on game mode, alliances either stay fixed or are reshuffled. Repeat phases until a win condition is met.",
    ],
  },
  {
    title: "How to Win",
    body: [
      "Winning conditions differ by game mode. At its core, victory is determined by the surviving alliance or players.",
      "See the Game Modes tab for exact, mode-specific win conditions.",
      "Great, you're all set! Now go get to partying!",
    ],
  },
];

export function RulesModal({
  isOpen,
  onClose,
  selectedMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedMode: GameMode;
}) {
  const [activeTab, setActiveTab] = useState<"HowToPlay" | "GameModes">("HowToPlay");

  const orderedModes = useMemo(() => {
    const allModes = ["BattleRoyale", "LionsVsSnakes"] as GameMode[];
    return [selectedMode, ...allModes.filter((mode) => mode !== selectedMode)];
  }, [selectedMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/75 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-xl border border-[var(--color-charcoal-warm)] bg-[var(--color-ballroom)] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
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

        <div className="mb-6 border-b border-[var(--color-charcoal-warm)]">
          <div className="flex gap-2">
            {[
              { id: "HowToPlay", label: "How to Play" },
              { id: "GameModes", label: "Game Modes" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`px-4 py-2 rounded-t-lg border border-b-0 text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-[var(--color-gold)]/50 bg-[var(--color-velvet)] text-[var(--color-ivory)]"
                    : "border-[var(--color-charcoal-warm)] bg-[var(--color-velvet)]/35 text-[var(--color-ash)] hover:text-[var(--color-ivory-antique)]"
                }`}
                onClick={() => setActiveTab(tab.id as "HowToPlay" | "GameModes")}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "HowToPlay" ? (
          <div className="space-y-6 text-[var(--color-ivory-antique)]">
            {HOW_TO_PLAY_SECTIONS.map((section) => (
              <section key={section.title} className="rounded-lg border border-[var(--color-charcoal-warm)] bg-[var(--color-velvet)]/30 p-4">
                <h4 className="font-serif text-lg text-[var(--color-ivory)] mb-2">{section.title}</h4>
                <div className="space-y-2 text-sm leading-relaxed">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-4 text-[var(--color-ivory-antique)]">
            {orderedModes.map((mode) => (
              <section
                key={mode}
                className={`rounded-lg border p-4 ${
                  selectedMode === mode
                    ? "border-[var(--color-gold)]/50 bg-[var(--color-velvet)]"
                    : "border-[var(--color-charcoal-warm)] bg-[var(--color-velvet)]/40"
                }`}
              >
                <h4 className="font-serif text-lg text-[var(--color-ivory)] mb-2">{GAME_MODE_RULES[mode].title}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
                  {GAME_MODE_RULES[mode].bullets.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
