import { useGameStore } from "../client/store.js";

export function RoleReveal() {
  const { gameState, advancePhase } = useGameStore();
  
  if (!gameState) return null;

  const me = Object.values(gameState.players).find(p => p.isMe);
  const isHost = me?.isHost;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--color-midnight)] relative overflow-hidden">
      <div className="velvet-texture"></div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-gold)]/10 to-transparent pointer-events-none animate-bloom" style={{ boxShadow: 'inset 0 0 150px rgba(212,175,55,0.1)' }}></div>

      <div className="text-center max-w-2xl w-full z-10 animate-in fade-in duration-1000">
        <h2 className="text-3xl text-[var(--color-ash)] font-serif mb-4 uppercase tracking-widest">The Alliances</h2>
        
        <div className="bg-[var(--color-velvet)] border border-[var(--color-charcoal-rich)] p-12 rounded-lg shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute inset-0 bg-gradient-to-br opacity-10 from-[var(--color-gold)] to-transparent"></div>
          
          <div className="relative z-10">
            <div className="w-32 h-32 mx-auto rounded-full bg-[var(--color-charcoal-rich)] mb-8 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              🎭
            </div>
            
            <h1 className="text-5xl font-serif uppercase tracking-widest mb-4 text-[var(--color-gold)]">
              The Masquerade Begins
            </h1>
            
            <p className="text-[var(--color-ivory-antique)] text-lg font-serif italic mb-8">
              The guests have arrived. The alliances are set. But your true allegiance remains a secret until the dance begins.
            </p>

            <div className="flex justify-center gap-12 border-t border-[var(--color-charcoal-warm)] pt-8">
              <div>
                <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-2">Lion Members</p>
                <p className="text-4xl font-serif text-[var(--color-gold)]">{gameState.remainingMajority}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-2">Serpent Members</p>
                <p className="text-4xl font-serif text-[var(--color-ivory)]">{gameState.remainingMinority}</p>
              </div>
            </div>
          </div>
        </div>

        {isHost && (
          <button
            onClick={() => advancePhase()}
            className="px-8 py-4 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform"
          >
            Enter the Ball
          </button>
        )}
        {!isHost && (
          <p className="text-[var(--color-ash)] font-serif italic animate-pulse">Waiting for host to open the doors...</p>
        )}
      </div>
    </div>
  );
}