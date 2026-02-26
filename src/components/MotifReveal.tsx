import { useGameStore } from "../client/store.js";

export function MotifReveal() {
  const { gameState, advancePhase } = useGameStore();
  if (!gameState) return null;

  const me = Object.values(gameState.players).find(p => p.isMe);
  const isHost = me?.isHost;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="velvet-texture"></div>
      
      <div className="mt-12 text-center max-w-4xl w-full z-10">
        <h2 className="text-2xl text-[var(--color-gold)] font-serif mb-8 uppercase tracking-widest">Round {gameState.round} Begins</h2>
        
        <div className="w-full h-[120px] bg-gradient-to-r from-[var(--color-velvet)] via-[var(--color-charcoal-rich)] to-[var(--color-velvet)] border-y border-[var(--color-gold)]/30 relative flex items-center px-8 animate-bloom overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-gold)]/10 to-transparent animate-shimmer w-[200%]"></div>
          
          <div className="flex items-center gap-8 w-full relative z-10">
            {/* Wax Seal */}
            <div className={`w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center shadow-inner border border-black/50 ${
              me?.alliance === "Majority" ? "bg-[var(--color-crimson)]" : "bg-[var(--color-burgundy)]"
            }`}>
              <span className="text-[var(--color-ivory)] font-serif text-2xl">M</span>
            </div>
            
            <div className="flex-1 text-left">
              <p className="text-[var(--color-ash)] text-xs uppercase tracking-widest mb-1">
                {me?.alliance === "Majority" ? "Crimson Protocol Motif" : "Obsidian Directive Motif"}
              </p>
              <h1 className="text-2xl md:text-3xl font-serif text-[var(--color-gold)] font-bold mb-1">
                "{gameState.currentMotif}"
              </h1>
              <p className="text-[var(--color-ash)] text-sm font-sans">
                Your secret allegiance — share nothing directly
              </p>
            </div>
          </div>
        </div>
      </div>

      {isHost && (
        <button
          onClick={() => advancePhase()}
          className="mt-16 px-8 py-4 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform z-10"
        >
          Start Private Dances
        </button>
      )}
    </div>
  );
}



