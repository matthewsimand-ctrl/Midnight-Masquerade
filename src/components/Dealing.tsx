import { useGameStore } from "../client/store.js";
import { useEffect, useState } from "react";

export function Dealing() {
  const { gameState, advancePhase } = useGameStore();
  const [cardsDealt, setCardsDealt] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCardsDealt(prev => {
        if (prev >= 10) {
          clearInterval(interval);
          return 10;
        }
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  if (!gameState) return null;
  const me = Object.values(gameState.players).find(p => p.isMe);
  const isHost = me?.isHost;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="velvet-texture"></div>
      
      <h2 className="text-3xl font-serif text-[var(--color-gold)] mb-12 z-10 tracking-widest uppercase">Dealing Cards</h2>
      
      <div className="relative w-48 h-72 z-10">
        {/* Deck */}
        <div className="absolute inset-0 bg-[var(--color-velvet)] border-2 border-[var(--color-gold)]/30 rounded-md shadow-[0_0_30px_rgba(212,175,55,0.15)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent"></div>
          <span className="text-4xl opacity-50">🎭</span>
        </div>

        {/* Dealt Cards */}
        {Array.from({ length: 10 }).map((_, i) => {
          const isDealt = i < cardsDealt;
          return (
            <div
              key={i}
              className="absolute inset-0 bg-[var(--color-velvet)] border border-[var(--color-charcoal-rich)] rounded-md shadow-xl transition-all duration-700 ease-in-out"
              style={{
                transform: isDealt 
                  ? `translate(40vw, 40vh) scale(0.2) rotate(180deg)` 
                  : `translateY(${i * 2}px)`,
                opacity: isDealt ? 0 : 1,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent"></div>
            </div>
          );
        })}
      </div>

      <div className="mt-24 z-10 h-16">
        {isHost && cardsDealt === 10 && (
          <button
            onClick={() => advancePhase()}
            className="px-8 py-4 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform animate-in fade-in duration-500"
          >
            Reveal Motif
          </button>
        )}
      </div>
    </div>
  );
}


