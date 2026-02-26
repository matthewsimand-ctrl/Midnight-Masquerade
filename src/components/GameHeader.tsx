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

function FactionDots({ count, active, color }: { count: number; active: number; color: string }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{
            backgroundColor: i < active ? color : "transparent",
            border: `1.5px solid ${color}`,
            opacity: i < active ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

interface GameHeaderProps {
  onOpenJournal: () => void;
  journalOpen: boolean;
}

export function GameHeader({ onOpenJournal, journalOpen }: GameHeaderProps) {
  const { gameState } = useGameStore();

  if (!gameState) return null;

  const me = Object.values(gameState.players).find((p) => p.isMe);
  const phaseLabel = PHASE_LABELS[gameState.phase] ?? gameState.phase;

  const totalMajority = Object.values(gameState.players).filter(
    (p) => p.alliance === "Majority"
  ).length;
  const totalMinority = Object.values(gameState.players).filter(
    (p) => p.alliance === "Minority"
  ).length;
  const activeMajority = gameState.remainingMajority;
  const activeMinority = gameState.remainingMinority;

  const totalPlayers = Object.values(gameState.players).length;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 h-[52px] select-none"
      style={{
        background:
          "linear-gradient(180deg, #0f0e0c 0%, #161410 100%)",
        borderBottom: "1px solid rgba(212,175,55,0.18)",
        boxShadow: "0 2px 24px rgba(0,0,0,0.7)",
      }}
    >
      {/* LEFT — Round + Phase */}
      <div className="flex flex-col justify-center min-w-[160px]">
        <span
          className="font-serif uppercase tracking-[0.22em] text-[9px]"
          style={{ color: "rgba(212,175,55,0.55)" }}
        >
          Round {gameState.round}
        </span>
        <span
          className="font-serif italic text-[13px] leading-tight"
          style={{ color: "var(--color-ivory)" }}
        >
          {phaseLabel}
        </span>
      </div>

      {/* CENTER — Timer + Factions */}
      <div className="flex-1 flex items-center justify-center gap-8">
        {/* Timer circle */}
        <div
          className="relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            border: "1.5px solid var(--color-gold)",
            boxShadow: "0 0 10px rgba(212,175,55,0.2)",
          }}
        >
          <span
            className="font-mono text-[11px] font-bold"
            style={{ color: "var(--color-gold)" }}
          >
            {totalPlayers}
          </span>
        </div>

        {/* Faction 1 — Crimson (Majority) */}
        <div className="flex items-center gap-2.5">
          <span
            className="font-serif uppercase tracking-widest text-[9px] max-w-[90px] truncate"
            style={{ color: "rgba(156,28,43,0.9)" }}
          >
            The Scarlet Ord...
          </span>
          <FactionDots
            count={totalMajority}
            active={activeMajority}
            color="#9C1C2B"
          />
          <span
            className="font-serif text-[12px] ml-1"
            style={{ color: "rgba(156,28,43,0.9)" }}
          >
            {activeMajority}
          </span>
        </div>

        {/* Divider */}
        <div
          className="w-px h-5"
          style={{ background: "rgba(212,175,55,0.15)" }}
        />

        {/* Faction 2 — Azure (Minority) */}
        <div className="flex items-center gap-2.5">
          <span
            className="font-serif uppercase tracking-widest text-[9px] max-w-[90px] truncate"
            style={{ color: "rgba(42,74,74,0.95)" }}
          >
            The Azure Coven...
          </span>
          <FactionDots
            count={totalMinority}
            active={activeMinority}
            color="#3D8B8B"
          />
          <span
            className="font-serif text-[12px] ml-1"
            style={{ color: "rgba(42,160,160,0.9)" }}
          >
            {activeMinority}
          </span>
        </div>
      </div>

      {/* RIGHT — Motif + Journal */}
      <div className="flex items-center gap-3 min-w-[200px] justify-end">
        {gameState.currentMotif && (
          <div className="flex flex-col items-end mr-1">
            <span
              className="font-serif uppercase tracking-[0.18em] text-[8px]"
              style={{ color: "rgba(212,175,55,0.5)" }}
            >
              Your Motif
            </span>
            <span
              className="font-serif text-[11px] text-right leading-tight"
              style={{ color: "var(--color-ivory)" }}
            >
              {gameState.currentMotif}
            </span>
          </div>
        )}

        <button
          onClick={onOpenJournal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all"
          style={{
            background: journalOpen
              ? "rgba(212,175,55,0.15)"
              : "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.25)",
            color: "var(--color-gold)",
          }}
        >
          <PenTool size={12} />
          <span className="font-serif uppercase tracking-widest text-[9px]">
            Journal
          </span>
        </button>
      </div>
    </div>
  );
}