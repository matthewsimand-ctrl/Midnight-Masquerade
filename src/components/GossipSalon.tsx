import { useGameStore } from "../client/store.js";
import { useEffect, useState, useRef } from "react";

const TALK_DURATION = 3 * 60;

export function GossipSalon() {
  const { gameState, advancePhase } = useGameStore();
  const [secondsLeft, setSecondsLeft] = useState(TALK_DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  if (!gameState) return null;

  const me = Object.values(gameState.players).find(p => p.isMe);
  const isHost = me?.isHost;
  const players = Object.values(gameState.players).filter(p => !p.isEliminated);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const isUrgent = secondsLeft <= 30;
  const progress = secondsLeft / TALK_DURATION;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[var(--color-midnight)]">
      <div className="velvet-texture"></div>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: isUrgent
            ? "radial-gradient(ellipse at center, rgba(156,28,43,0.15) 0%, transparent 70%)"
            : "radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Top bar with End Early — full width, below header (already offset by paddingTop in App.tsx) */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-3 border-b border-[var(--color-gold)]/20 z-10 flex-shrink-0">
        <div>
          <p className="text-[10px] font-serif uppercase tracking-[0.25em] text-[var(--color-ash)]">
            Round {gameState.round}
          </p>
          <h2 className="text-base sm:text-lg font-serif text-[var(--color-gold)] tracking-widest uppercase">
            The Gossip Salon
          </h2>
        </div>

        {isHost && (
          <button
            onClick={() => advancePhase()}
            className="px-3 sm:px-4 py-2 rounded bg-transparent border border-[var(--color-gold)]/40 text-[var(--color-gold)] font-serif text-xs uppercase tracking-widest hover:bg-[var(--color-gold)]/10 transition-colors flex-shrink-0"
          >
            End Early
          </button>
        )}
      </div>

      {/* Scrollable main content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center gap-6 sm:gap-12 py-6 sm:py-8 px-4 z-10">

        {/* Timer ring */}
        <div className="relative flex items-center justify-center">
          <svg width="120" height="120" className="-rotate-90 sm:w-[140px] sm:h-[140px]">
            <circle cx="60" cy="60" r={radius * 60/70} fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="4" className="sm:hidden" />
            <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="4" className="hidden sm:block" />
            <circle cx="60" cy="60" r={radius * 60/70} fill="none"
              stroke={isUrgent ? "var(--color-crimson)" : "var(--color-gold)"}
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circumference * 60/70}
              strokeDashoffset={(circumference * 60/70) * (1 - progress)}
              className="transition-all duration-1000 ease-linear sm:hidden"
              style={{ filter: isUrgent ? "drop-shadow(0 0 6px rgba(156,28,43,0.8))" : "drop-shadow(0 0 6px rgba(212,175,55,0.5))" }}
            />
            <circle cx="70" cy="70" r={radius} fill="none"
              stroke={isUrgent ? "var(--color-crimson)" : "var(--color-gold)"}
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear hidden sm:block"
              style={{ filter: isUrgent ? "drop-shadow(0 0 6px rgba(156,28,43,0.8))" : "drop-shadow(0 0 6px rgba(212,175,55,0.5))" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums transition-colors duration-500 ${
              isUrgent ? "text-[var(--color-crimson)]" : "text-[var(--color-gold)]"
            } ${isUrgent && secondsLeft % 2 === 0 ? "opacity-70" : "opacity-100"}`}>
              {timeStr}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-ash)] mt-1">remaining</span>
          </div>
        </div>

        {/* Instruction */}
        <div className="text-center max-w-sm px-4">
          <p className="font-serif italic text-[var(--color-ivory-antique)] text-base sm:text-lg leading-relaxed">
            Speak freely. Deceive cleverly.
          </p>
          <p className="text-[var(--color-ash)] text-xs uppercase tracking-widest mt-2">
            The vote begins when the salon closes.
          </p>
        </div>

        {/* Revealed Motifs */}
        {gameState.revealedAllianceMotifs && (
          <div className="rounded-lg border border-[var(--color-charcoal-warm)] bg-[var(--color-ballroom)]/80 p-4 sm:p-5 text-left w-full max-w-2xl">
            <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-4 text-center">Round Motifs Revealed</p>
            <div className="space-y-3">
              {["Majority", "Minority"].map((alliance) => {
                const motif = gameState.revealedAllianceMotifs?.[alliance];
                if (!motif) return null;
                const allianceDisplay = alliance === "Majority"
                  ? { label: "The Lions", colorClass: "text-[var(--color-gold)]" }
                  : { label: "The Serpents", colorClass: "text-[rgba(42,74,74,0.95)]" };
                return (
                  <div key={alliance}>
                    <p className={`text-xs uppercase tracking-widest ${allianceDisplay.colorClass}`}>{allianceDisplay.label}</p>
                    <p className="text-[var(--color-ivory-antique)] font-serif">{motif}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Player ring */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 w-full max-w-2xl">
          {players.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--color-charcoal-rich)] border-2 flex items-center justify-center overflow-hidden shadow-lg"
                style={{
                  borderColor: p.isMe ? "var(--color-gold)" : "rgba(212,175,55,0.2)",
                  boxShadow: p.isMe ? "0 0 12px rgba(212,175,55,0.3)" : undefined,
                }}
              >
                {p.avatar?.startsWith("/") ? (
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl sm:text-2xl">{p.avatar || "🎭"}</span>
                )}
              </div>
              <span className="text-xs font-serif text-[var(--color-ivory-antique)] text-center max-w-[60px] truncate">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expired overlay */}
      {secondsLeft === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-[var(--color-midnight)]/80 backdrop-blur-sm animate-in fade-in duration-500 p-6">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-serif text-[var(--color-crimson)] uppercase tracking-widest mb-6">
              The Salon Has Closed
            </p>
            {isHost && (
              <button
                onClick={() => advancePhase()}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform"
              >
                Begin the Vote
              </button>
            )}
            {!isHost && (
              <p className="text-[var(--color-ash)] font-serif italic animate-pulse">
                Waiting for host to call the vote...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
