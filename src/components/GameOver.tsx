import { useGameStore } from "../client/store.js";

export function GameOver() {
  const { gameState } = useGameStore();
  if (!gameState) return null;

  const isMajorityWin = gameState.winner === "Majority";
  const me = Object.values(gameState.players).find(p => p.isMe);
  const myAlliance = me?.alliance;
  const iWon = gameState.gameMode === "BattleRoyale"
    ? Boolean(me && (gameState.coWinners || []).includes(me.id))
    : myAlliance === gameState.winner;
  const isBattleRoyale = gameState.gameMode === "BattleRoyale";
  const coWinners = (gameState.coWinners || []).map((id) => gameState.players[id]).filter(Boolean);

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden ${
      isMajorityWin ? "bg-[var(--color-midnight)]" : "bg-[var(--color-midnight)]"
    }`}>
      {/* Background Effects */}
      <div className="velvet-texture"></div>
      
      {isMajorityWin ? (
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-gold)]/20 to-transparent pointer-events-none animate-bloom" style={{ boxShadow: 'inset 0 0 150px rgba(212,175,55,0.3)' }}></div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-teal-shadow)]/40 to-transparent pointer-events-none animate-bloom" style={{ boxShadow: 'inset 0 0 150px rgba(42,74,74,0.5)' }}></div>
      )}

      {/* Chandelier Sparkle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-80 animate-pulse-glow">
        <svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M150 0L160 60L220 75L165 105L180 180L150 135L120 180L135 105L80 75L140 60L150 0Z" fill={isMajorityWin ? "var(--color-gold)" : "var(--color-ivory)"} opacity="0.4"/>
          <circle cx="150" cy="105" r="30" fill={isMajorityWin ? "var(--color-gold)" : "var(--color-ivory)"} opacity="0.6"/>
        </svg>
      </div>

      <div className="text-center max-w-4xl w-full z-10 animate-in slide-in-from-top-12 duration-1000">
        <h1 className={`text-5xl md:text-7xl font-serif uppercase tracking-[0.1em] mb-4 ${
          isMajorityWin || isBattleRoyale ? "text-[var(--color-gold)] drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" : "text-[var(--color-ivory)] drop-shadow-[0_0_20px_rgba(245,240,232,0.5)]"
        }`}>
          {isBattleRoyale ? "BATTLE ROYALE COMPLETE" : isMajorityWin ? "CRIMSON PROTOCOL VICTORIOUS" : "THE OBSIDIAN DIRECTIVE PREVAILS"}
        </h1>
        
        {!isBattleRoyale && !isMajorityWin && (
          <p className="text-xl font-serif italic text-[var(--color-ivory-antique)] mb-12">
            Against all odds, the shadow alliance claimed victory
          </p>
        )}
        {!isBattleRoyale && isMajorityWin && (
          <p className="text-xl font-serif italic text-[var(--color-gold-light)] mb-12">
            The majority has purged the masquerade
          </p>
        )}
        {isBattleRoyale && (
          <p className="text-xl font-serif italic text-[var(--color-gold-light)] mb-12">
            Two survivors remain. They are declared co-winners.
          </p>
        )}

        {isBattleRoyale && coWinners.length > 0 && (
          <div className="mb-8 text-[var(--color-ivory)]">
            Co-Winners: {coWinners.map((p) => p.name).join(" & ")}
          </div>
        )}

        {me && !me.isHost && (
          <div className={`inline-block px-8 py-3 rounded-full border mb-12 font-serif tracking-widest uppercase ${
            iWon ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10" : "border-[var(--color-ash)] text-[var(--color-ash)] bg-[var(--color-charcoal-warm)]/50"
          }`}>
            {iWon ? "You Survived the Night" : "Your Alliance Has Fallen"}
          </div>
        )}
        
        <div className="bg-[var(--color-velvet)]/80 backdrop-blur-md border border-[var(--color-charcoal-rich)] p-8 rounded-lg shadow-2xl mb-12 flex flex-col md:flex-row gap-8">
          {/* Majority Column */}
          <div className={`flex-1 flex flex-col ${isMajorityWin ? "opacity-100" : "opacity-60 grayscale"}`}>
            <h3 className={`text-xl font-serif mb-6 border-b pb-4 uppercase tracking-widest ${
              isMajorityWin ? "text-[var(--color-gold)] border-[var(--color-gold)]/30" : "text-[var(--color-ash)] border-[var(--color-charcoal-warm)]"
            }`}>
              Crimson Protocol
            </h3>
            <ul className="space-y-4 text-left">
              {Object.values(gameState.players).filter(p => p.alliance === "Majority").map(p => (
                <li key={p.id} className={`flex items-center gap-4 p-3 rounded bg-[var(--color-ballroom)] border ${
                  isMajorityWin ? "border-[var(--color-gold)]/20" : "border-[var(--color-charcoal-warm)]"
                }`}>
                  <div className="w-10 h-10 rounded-full bg-[var(--color-charcoal-rich)] flex items-center justify-center text-lg">
                    {p.avatar || "🎭"}
                  </div>
                  <div className="flex-1">
                    <p className={`font-serif ${p.isEliminated ? "text-[var(--color-ash)] line-through" : "text-[var(--color-ivory)]"}`}>
                      {p.name} {p.isMe && <span className="text-[10px] uppercase tracking-widest ml-2 text-[var(--color-gold)]">You</span>}
                    </p>
                    <p className="text-[10px] text-[var(--color-ash)] uppercase tracking-widest mt-1">
                      {p.isEliminated ? "Eliminated" : "Survived"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-px bg-gradient-to-b from-transparent via-[var(--color-charcoal-warm)] to-transparent hidden md:block"></div>

          {/* Minority Column */}
          <div className={`flex-1 flex flex-col ${!isMajorityWin ? "opacity-100" : "opacity-60 grayscale"}`}>
            <h3 className={`text-xl font-serif mb-6 border-b pb-4 uppercase tracking-widest ${
              !isMajorityWin ? "text-[var(--color-ivory)] border-[var(--color-ivory)]/30" : "text-[var(--color-ash)] border-[var(--color-charcoal-warm)]"
            }`}>
              Obsidian Directive
            </h3>
            <ul className="space-y-4 text-left">
              {Object.values(gameState.players).filter(p => p.alliance === "Minority").map(p => (
                <li key={p.id} className={`flex items-center gap-4 p-3 rounded bg-[var(--color-ballroom)] border ${
                  !isMajorityWin ? "border-[var(--color-ivory)]/20" : "border-[var(--color-charcoal-warm)]"
                }`}>
                  <div className="w-10 h-10 rounded-full bg-[var(--color-charcoal-rich)] flex items-center justify-center text-lg">
                    {p.avatar || "🎭"}
                  </div>
                  <div className="flex-1">
                    <p className={`font-serif ${p.isEliminated ? "text-[var(--color-ash)] line-through" : "text-[var(--color-ivory)]"}`}>
                      {p.name} {p.isMe && <span className="text-[10px] uppercase tracking-widest ml-2 text-[var(--color-gold)]">You</span>}
                    </p>
                    <p className="text-[10px] text-[var(--color-ash)] uppercase tracking-widest mt-1">
                      {p.isEliminated ? "Eliminated" : "Survived"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform"
          >
            Return to the Ball
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-4 rounded bg-transparent border border-[var(--color-gold)]/50 text-[var(--color-gold)] font-serif uppercase tracking-widest hover:bg-[var(--color-gold)]/10 transition-colors"
          >
            New Masquerade
          </button>
        </div>
      </div>
    </div>
  );
}
