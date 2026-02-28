import { useGameStore } from "../client/store.js";

function resolveAvatarSrc(avatar?: string) {
  if (!avatar) return null;
  if (
    avatar.startsWith("/") ||
    avatar.startsWith("http") ||
    avatar.startsWith("data:") ||
    avatar.startsWith("blob:")
  ) {
    return avatar;
  }

  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(avatar)) {
    return `/masks/${avatar}`;
  }

  return null;
}

export function GameOver() {
  const { gameState, endGame } = useGameStore();
  if (!gameState) return null;

  const isMajorityWin = gameState.winner === "Majority";
  const me = Object.values(gameState.players).find(p => p.isMe);
  const myAlliance = me?.alliance;
  const iWon = gameState.gameMode === "BattleRoyale"
    ? Boolean(me && (gameState.coWinners || []).includes(me.id))
    : myAlliance === gameState.winner;
  const isBattleRoyale = gameState.gameMode === "BattleRoyale";
  const coWinners = (gameState.coWinners || []).map((id) => gameState.players[id]).filter(Boolean);
  const coWinnerIds = gameState.coWinners || [];

  const renderPlayerRow = (p: (typeof gameState.players)[string], borderClass: string) => {
    const avatarSrc = resolveAvatarSrc(p.avatar);
    const isCoWinner = isBattleRoyale && coWinnerIds.includes(p.id);

    return (
      <li
        key={p.id}
        className={`flex items-center gap-4 p-3 rounded bg-[var(--color-ballroom)] border ${
          isCoWinner
            ? "co-winner-card border-[var(--color-gold)]/70 shadow-[0_0_24px_rgba(212,175,55,0.35)]"
            : borderClass
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-[var(--color-charcoal-rich)] flex items-center justify-center text-lg">
          {avatarSrc ? (
            <img src={avatarSrc} alt={`${p.name} avatar`} className="w-full h-full object-cover rounded-full" />
          ) : (
            p.avatar || "🎭"
          )}
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
    );
  };

  return (
    <div className={`flex-1 flex flex-col items-center justify-start p-4 sm:p-8 relative overflow-y-auto ${
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

      <div className="text-center max-w-4xl w-full z-10 animate-in slide-in-from-top-12 duration-1000 pt-10 sm:pt-0 pb-8">
        <h1 className={`text-3xl sm:text-5xl md:text-7xl font-serif uppercase tracking-[0.1em] mb-4 ${
          isMajorityWin || isBattleRoyale ? "text-[var(--color-gold)] drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" : "text-[var(--color-ivory)] drop-shadow-[0_0_20px_rgba(245,240,232,0.5)]"
        }`}>
          {isBattleRoyale ? "BATTLE ROYALE COMPLETE" : isMajorityWin ? "LIONS TRIUMPH" : "SERPENTS PREVAIL"}
        </h1>
        
        {!isBattleRoyale && !isMajorityWin && (
          <p className="text-base sm:text-xl font-serif italic text-[var(--color-ivory-antique)] mb-8 sm:mb-12">
            Against all odds, the serpents outmaneuvered the lions
          </p>
        )}
        {!isBattleRoyale && isMajorityWin && (
          <p className="text-base sm:text-xl font-serif italic text-[var(--color-gold-light)] mb-8 sm:mb-12">
            The lions have purged the masquerade
          </p>
        )}
        {isBattleRoyale && (
          <p className="text-base sm:text-xl font-serif italic text-[var(--color-gold-light)] mb-8 sm:mb-12">
            Two survivors remain. They are declared co-winners.
          </p>
        )}

        {isBattleRoyale && coWinners.length > 0 && (
          <div className="mb-8 text-[var(--color-ivory)]">
            Co-Winners: {coWinners.map((p) => p.name).join(" & ")}
          </div>
        )}

        {me && !me.isHost && (
          <div className={`inline-block px-5 sm:px-8 py-3 rounded-full border mb-8 sm:mb-12 font-serif tracking-widest uppercase ${
            iWon ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10" : "border-[var(--color-ash)] text-[var(--color-ash)] bg-[var(--color-charcoal-warm)]/50"
          }`}>
            {iWon ? "You Survived the Night" : "Your Alliance Has Fallen"}
          </div>
        )}

        {gameState.revealedAllianceCiphers && (
          <div className="mb-12 rounded-lg border border-[var(--color-charcoal-warm)] bg-[var(--color-ballroom)]/80 p-5 text-left max-w-2xl mx-auto">
            <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-4 text-center">Round Ciphers Revealed</p>
            <div className="space-y-3">
              {["Majority", "Minority"].map((alliance) => {
                const cipher = gameState.revealedAllianceCiphers?.[alliance];
                if (!cipher) return null;
                const isMajority = alliance === "Majority";
                const label = isMajority ? "The Lions" : "The Serpents";
                const colorClass = isMajority ? "text-[var(--color-gold)]" : "text-[rgba(42,74,74,0.95)]";
                return (
                  <div key={alliance}>
                    <p className={`text-xs uppercase tracking-widest ${colorClass}`}>{label}</p>
                    <p className="text-[var(--color-ivory-antique)] font-serif">{cipher}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="bg-[var(--color-velvet)]/80 backdrop-blur-md border border-[var(--color-charcoal-rich)] p-4 sm:p-8 rounded-lg shadow-2xl mb-8 sm:mb-12 flex flex-col md:flex-row gap-6 sm:gap-8">
          {/* Majority Column */}
          <div className={`flex-1 flex flex-col ${isMajorityWin ? "opacity-100" : "opacity-60 grayscale"}`}>
            <h3 className={`text-xl font-serif mb-6 border-b pb-4 uppercase tracking-widest ${
              isMajorityWin ? "text-[var(--color-gold)] border-[var(--color-gold)]/30" : "text-[var(--color-ash)] border-[var(--color-charcoal-warm)]"
            }`}>
              Lions
            </h3>
            <ul className="space-y-4 text-left">
              {Object.values(gameState.players)
                .filter(p => p.alliance === "Majority")
                .map((p) => renderPlayerRow(p, isMajorityWin ? "border-[var(--color-gold)]/20" : "border-[var(--color-charcoal-warm)]"))}
            </ul>
          </div>

          <div className="w-px bg-gradient-to-b from-transparent via-[var(--color-charcoal-warm)] to-transparent hidden md:block"></div>

          {/* Minority Column */}
          <div className={`flex-1 flex flex-col ${!isMajorityWin ? "opacity-100" : "opacity-60 grayscale"}`}>
            <h3 className={`text-xl font-serif mb-6 border-b pb-4 uppercase tracking-widest ${
              !isMajorityWin ? "text-[var(--color-ivory)] border-[var(--color-ivory)]/30" : "text-[var(--color-ash)] border-[var(--color-charcoal-warm)]"
            }`}>
              Serpents
            </h3>
            <ul className="space-y-4 text-left">
              {Object.values(gameState.players)
                .filter(p => p.alliance === "Minority")
                .map((p) => renderPlayerRow(p, !isMajorityWin ? "border-[var(--color-ivory)]/20" : "border-[var(--color-charcoal-warm)]"))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 pb-6">
          <button
            onClick={() => endGame()}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform"
          >
            Return to the Ball
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded bg-transparent border border-[var(--color-gold)]/50 text-[var(--color-gold)] font-serif uppercase tracking-widest hover:bg-[var(--color-gold)]/10 transition-colors"
          >
            New Masquerade
          </button>
        </div>
      </div>
    </div>
  );
}