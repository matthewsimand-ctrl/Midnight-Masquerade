import { useGameStore } from "../client/store.js";
import { PenTool } from "lucide-react";

const PHASE_LABELS: Record<string, string> = {
  PrivateDance: "The Private Dance",
  GossipSalon: "The Gossip Salon",
  EliminationVote: "The Unmasking",
  MotifReveal: "Motif Revealed",
  RoleReveal: "The Alliances",
  Dealing: "Dealing Cards",
};

const PHASE_LABELS_SHORT: Record<string, string> = {
  PrivateDance: "Private Dance",
  GossipSalon: "Gossip Salon",
  EliminationVote: "Unmasking",
  MotifReveal: "Motif",
  RoleReveal: "Alliances",
  Dealing: "Dealing",
};

interface GameHeaderProps {
  onOpenJournal: () => void;
  journalOpen: boolean;
}

export function GameHeader({ onOpenJournal, journalOpen }: GameHeaderProps) {
  const { gameState } = useGameStore();

  if (!gameState) return null;

  const me = Object.values(gameState.players).find((p) => p.isMe);
  const phaseLabel = PHASE_LABELS[gameState.phase] ?? gameState.phase;
  const phaseLabelShort = PHASE_LABELS_SHORT[gameState.phase] ?? gameState.phase;

  const activeMajority = gameState.remainingMajority;
  const activeMinority = gameState.remainingMinority;
  const totalPlayers = Object.values(gameState.players).length;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center px-3 sm:px-6 select-none"
      style={{
        background: "linear-gradient(180deg, #0f0e0c 0%, #161410 100%)",
        borderBottom: "1px solid rgba(212,175,55,0.18)",
        boxShadow: "0 2px 24px rgba(0,0,0,0.7)",
      }}
    >
      {/* LEFT — Round + Phase */}
      <div className="flex flex-col justify-center flex-shrink-0">
        <span className="font-serif uppercase tracking-[0.15em] text-[8px]" style={{ color: "rgba(212,175,55,0.55)" }}>
          Rnd {gameState.round}
        </span>
        <span className="font-serif italic text-[11px] leading-tight hidden sm:block" style={{ color: "var(--color-ivory)" }}>
          {phaseLabel}
        </span>
        <span className="font-serif italic text-[11px] leading-tight sm:hidden" style={{ color: "var(--color-ivory)" }}>
          {phaseLabelShort}
        </span>
      </div>

      {/* CENTER — Factions */}
      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-6 mx-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="font-serif uppercase tracking-widest text-[8px] sm:text-[9px]" style={{ color: "var(--color-gold)" }}>
            🦁
          </span>
          <span className="font-serif text-[10px] sm:text-[12px]" style={{ color: "var(--color-gold)" }}>
            <span className="hidden sm:inline">Lions </span>{activeMajority}
          </span>
        </div>

        <div className="w-px h-4" style={{ background: "rgba(212,175,55,0.15)" }} />

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="font-serif uppercase tracking-widest text-[8px] sm:text-[9px]" style={{ color: "rgba(42,160,160,0.9)" }}>
            🐍
          </span>
          <span className="font-serif text-[10px] sm:text-[12px]" style={{ color: "rgba(42,160,160,0.9)" }}>
            <span className="hidden sm:inline">Serpents </span>{activeMinority}
          </span>
        </div>

        {/* Motif — desktop only */}
        {gameState.currentMotif && (
          <>
            <div className="hidden sm:block w-px h-4" style={{ background: "rgba(212,175,55,0.15)" }} />
            <div className="hidden sm:flex flex-col items-center">
              <span className="font-serif uppercase tracking-[0.18em] text-[8px]" style={{ color: "rgba(212,175,55,0.5)" }}>
                Motif
              </span>
              <span className="font-serif text-[11px] leading-tight max-w-[120px] truncate" style={{ color: "var(--color-ivory)" }}>
                {gameState.currentMotif}
              </span>
            </div>
          </>
        )}
      </div>

      {/* RIGHT — Journal */}
      <div className="flex items-center flex-shrink-0">
        <button
          onClick={onOpenJournal}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded transition-all"
          style={{
            background: journalOpen ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.25)",
            color: "var(--color-gold)",
          }}
        >
          <PenTool size={12} />
          <span className="font-serif uppercase tracking-widest text-[9px] hidden sm:inline">Journal</span>
        </button>
      </div>
    </div>
  );
}
