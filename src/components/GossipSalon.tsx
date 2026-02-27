import { useGameStore } from "../client/store.js";
import { useEffect, useState, useRef } from "react";

const TALK_DURATION = 3 * 60; // 3 minutes in seconds

export function GossipSalon() {
  const { gameState, advancePhase } = useGameStore();
  const [secondsLeft, setSecondsLeft] = useState(TALK_DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
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
  const progress = secondsLeft / TALK_DURATION; // 1 → 0

  // Circle progress ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[var(--color-midnight)]">
      <div className="velvet-texture"></div>

      {/* Ambient glow that intensifies as time runs out */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: isUrgent
            ? "radial-gradient(ellipse at center, rgba(156,28,43,0.15) 0%, transparent 70%)"
            : "radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-4 border-b border-[var(--color-gold)]/20 z-10">
        <div>
          <p className="text-[10px] font-serif uppercase tracking-[0.25em] text-[var(--color-ash)]">
            Round {gameState.round}
          </p>
          <h2 className="text-lg font-serif text-[var(--color-gold)] tracking-widest uppercase">
            The Gossip Salon
          </h2>
        </div>

        {isHost && (
          <button
            onClick={() => advancePhase()}
            className="px-4 py-2 rounded bg-transparent border border-[var(--color-gold)]/40 text-[var(--color-gold)] font-serif text-xs uppercase tracking-widest hover:bg-[var(--color-gold)]/10 transition-colors"
          >
            End Early
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-12 z-10">

        {/* Timer ring */}
        <div className="relative flex items-center justify-center">
          <svg width="140" height="140" className="-rotate-90">
            {/* Track */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="rgba(212,175,55,0.1)"
              strokeWidth="4"
            />
            {/* Progress */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={isUrgent ? "var(--color-crimson)" : "var(--color-gold)"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
              style={{
                filter: isUrgent
                  ? "drop-shadow(0 0 6px rgba(156,28,43,0.8))"
                  : "drop-shadow(0 0 6px rgba(212,175,55,0.5))",
              }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span
              className={`font-mono text-3xl font-bold tabular-nums transition-colors duration-500 ${
                isUrgent ? "text-[var(--color-crimson)]" : "text-[var(--color-gold)]"
              } ${isUrgent && secondsLeft % 2 === 0 ? "opacity-70" : "opacity-100"}`}
            >
              {timeStr}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-ash)] mt-1">
              remaining
            </span>
          </div>
        </div>

        {/* Instruction */}
        <div className="text-center max-w-sm px-6">
          <p className="font-serif italic text-[var(--color-ivory-antique)] text-lg leading-relaxed">
            Speak freely. Deceive cleverly.
          </p>
          <p className="text-[var(--color-ash)] text-xs uppercase tracking-widest mt-2">
            The vote begins when the salon closes.
          </p>
        </div>

        {/* Player ring */}
        <div className="flex flex-wrap justify-center gap-6 max-w-2xl px-8">
          {players.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-full bg-[var(--color-charcoal-rich)] border-2 flex items-center justify-center overflow-hidden shadow-lg"
                style={{
                  borderColor: p.isMe
                    ? "var(--color-gold)"
                    : "rgba(212,175,55,0.2)",
                  boxShadow: p.isMe
                    ? "0 0 12px rgba(212,175,55,0.3)"
                    : undefined,
                }}
              >
                {p.avatar?.startsWith("/") ? (
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{p.avatar || "🎭"}</span>
                )}
              </div>
              <span className="text-xs font-serif text-[var(--color-ivory-antique)] text-center max-w-[64px] truncate">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expired state */}
      {secondsLeft === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-[var(--color-midnight)]/80 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="text-center">
            <p className="text-3xl font-serif text-[var(--color-crimson)] uppercase tracking-widest mb-6">
              The Salon Has Closed
            </p>
            {isHost && (
              <button
                onClick={() => advancePhase()}
                className="px-8 py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform"
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