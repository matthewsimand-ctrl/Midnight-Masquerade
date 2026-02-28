import { useGameStore } from "../client/store.js";
import { useState, useEffect } from "react";

const ALLIANCE_DISPLAY: Record<string, { label: string; colorClass: string }> = {
  majority: { label: "The Lions", colorClass: "text-[var(--color-gold)]" },
  lion: { label: "The Lions", colorClass: "text-[var(--color-gold)]" },
  lions: { label: "The Lions", colorClass: "text-[var(--color-gold)]" },
  minority: { label: "The Serpents", colorClass: "text-[rgba(42,74,74,0.95)]" },
  serpent: { label: "The Serpents", colorClass: "text-[rgba(42,74,74,0.95)]" },
  serpents: { label: "The Serpents", colorClass: "text-[rgba(42,74,74,0.95)]" },
  snake: { label: "The Serpents", colorClass: "text-[rgba(42,74,74,0.95)]" },
  snakes: { label: "The Serpents", colorClass: "text-[rgba(42,74,74,0.95)]" },
};

const getAllianceDisplay = (alliance?: string) => {
  if (!alliance) return { label: "Unknown Allegiance", colorClass: "text-[var(--color-ash)]" };
  return ALLIANCE_DISPLAY[alliance.toLowerCase()] ?? { label: alliance, colorClass: "text-[var(--color-ivory)]" };
};

const isImageAvatar = (avatar?: string) =>
  Boolean(avatar && (avatar.startsWith("/") || avatar.startsWith("http")));

const getAvatarLabel = (avatar?: string) => {
  if (!avatar || !isImageAvatar(avatar)) return null;
  return avatar.split("/").pop()?.replace(/\.\w+$/, "") || "custom mask";
};

const ALLIANCE_CIPHER_ORDER = ["Majority", "Minority"] as const;

export function EliminationVote() {
  const { gameState, vote, advancePhase, chooseForcedElimination, submitAllianceGuess } = useGameStore();
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<"Majority" | "Minority" | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    setSelectedVote(null);
    setSelectedGuess(null);
  }, [gameState?.tiebreakerStage]);

  useEffect(() => {
    if (gameState?.eliminatedThisRound) {
      setIsRevealing(true);
      const timer = setTimeout(() => setIsRevealing(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.eliminatedThisRound]);

  if (!gameState) return null;

  const me = Object.values(gameState.players).find(p => p.isMe);
  const activePlayers = Object.values(gameState.players).filter(p => !p.isEliminated);
  const isHost = me?.isHost;

  const tiedIds = gameState.tiebreakerTiedPlayerIds || [];
  const isRevote = gameState.tiebreakerStage === "Revote";
  const isAllianceGuess = gameState.tiebreakerStage === "AllianceGuess";
  const amITied = (isRevote || isAllianceGuess) && me ? tiedIds.includes(me.id) : false;

  let allVotesLocked = false;
  if (isAllianceGuess) {
    allVotesLocked = activePlayers.every(p => Boolean(gameState.allianceGuesses?.[p.id]));
  } else if (isRevote) {
    const votingPlayers = activePlayers.filter(p => !tiedIds.includes(p.id));
    allVotesLocked = votingPlayers.every(p => Boolean(gameState.votes[p.id]));
  } else {
    allVotesLocked = activePlayers.every((player) => Boolean(gameState.votes[player.id]));
  }

  const myVote = me ? gameState.votes[me.id] : null;
  const myGuess = me ? gameState.allianceGuesses?.[me.id] : null;
  const isForcedChooser = me && gameState.forcedEliminationChooserId === me.id;

  // ── Forced elimination chooser ──
  if (isForcedChooser && gameState.forcedEliminationCandidates && gameState.forcedEliminationCandidates.length > 0) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--color-midnight)] relative">
        <div className="velvet-texture"></div>
        <div className="z-10 flex flex-col items-center px-4 sm:px-8 py-6 sm:py-8 max-w-3xl w-full mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif text-[var(--color-gold)] mb-3 uppercase tracking-widest text-center">Your Name Was Called</h2>
          <p className="text-[var(--color-ivory-antique)] mb-6 text-center text-sm sm:text-base">As a Majority player in Battle Royale, you survive and must choose another Majority player to eliminate.</p>

          {gameState.revealedAllianceCiphers && (
            <div className="mb-6 rounded-lg border border-[var(--color-charcoal-warm)] bg-[var(--color-ballroom)]/80 p-4 text-left w-full">
              <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-4 text-center">Round Ciphers Revealed</p>
              <div className="space-y-3">
                {ALLIANCE_CIPHER_ORDER.map((alliance) => {
                  const cipher = gameState.revealedAllianceCiphers?.[alliance];
                  if (!cipher) return null;
                  const allianceDisplay = getAllianceDisplay(alliance);
                  return (
                    <div key={alliance}>
                      <p className={`text-xs uppercase tracking-widest ${allianceDisplay.colorClass}`}>{allianceDisplay.label}</p>
                      <p className="text-[var(--color-ivory-antique)] font-serif">{cipher}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
            {gameState.forcedEliminationCandidates.map((candidateId) => {
              const p = gameState.players[candidateId];
              if (!p) return null;
              return (
                <button
                  key={candidateId}
                  onClick={() => chooseForcedElimination(candidateId)}
                  className="rounded-lg border border-[var(--color-crimson)]/50 bg-[var(--color-velvet)] p-4 hover:bg-[var(--color-crimson)]/10 flex flex-col items-center"
                >
                  <div className="text-3xl mb-2">{p.avatar || "🎭"}</div>
                  <p className="font-serif text-[var(--color-ivory)] text-sm">{p.name}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (gameState.forcedEliminationChooserId && !isForcedChooser) {
    const chooser = gameState.players[gameState.forcedEliminationChooserId];
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[var(--color-midnight)]">
        <h2 className="text-xl sm:text-2xl font-serif text-[var(--color-gold)] mb-2 text-center">Battle Royale Twist</h2>
        <p className="text-[var(--color-ivory-antique)] text-center text-sm sm:text-base">{chooser?.name || "A player"} was voted but survives and is selecting another Majority player to eliminate.</p>
      </div>
    );
  }

  // ── Eliminated this round ──
  if (gameState.eliminatedThisRound) {
    if (gameState.eliminatedThisRound === "NONE") {
      return (
        <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--color-midnight)] relative">
          <div className="velvet-texture"></div>
          <div className="z-10 flex flex-col items-center px-4 sm:px-8 py-6 sm:py-8 max-w-2xl w-full mx-auto animate-in fade-in duration-1000">
            <h2 className="text-3xl sm:text-4xl text-[var(--color-gold)] font-serif mb-6 uppercase tracking-widest text-center">No One Eliminated</h2>

            <div className="bg-[var(--color-velvet)] border border-[var(--color-gold)]/50 p-6 sm:p-12 rounded-lg shadow-[0_0_40px_rgba(212,175,55,0.2)] relative overflow-hidden w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent"></div>
              <div className="relative z-10">
                <p className="text-[var(--color-ivory-antique)] text-base sm:text-xl mb-6 font-serif italic text-center">Everyone guessed correctly. The ball continues with all remaining guests.</p>

                {gameState.revealedAllianceCiphers && (
                  <div className="mb-6 rounded-lg border border-[var(--color-charcoal-warm)] bg-[var(--color-ballroom)]/80 p-4 text-left">
                    <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-4 text-center">Round Ciphers Revealed</p>
                    <div className="space-y-3">
                      {ALLIANCE_CIPHER_ORDER.map((alliance) => {
                        const cipher = gameState.revealedAllianceCiphers?.[alliance];
                        if (!cipher) return null;
                        const allianceDisplay = getAllianceDisplay(alliance);
                        return (
                          <div key={alliance}>
                            <p className={`text-xs uppercase tracking-widest ${allianceDisplay.colorClass}`}>{allianceDisplay.label}</p>
                            <p className="text-[var(--color-ivory-antique)] font-serif">{cipher}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-8 sm:gap-12 border-t border-[var(--color-charcoal-warm)] pt-6 sm:pt-8">
                  <div className="text-center">
                    <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-2">Lions</p>
                    <p className="text-3xl sm:text-4xl font-serif text-[var(--color-gold)]">{gameState.remainingMajority}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-2">Serpents</p>
                    <p className="text-3xl sm:text-4xl font-serif text-[rgba(42,160,160,0.9)]">{gameState.remainingMinority}</p>
                  </div>
                </div>
              </div>
            </div>

            {isHost && (
              <button
                onClick={() => advancePhase()}
                className="mt-8 px-6 sm:px-8 py-3 sm:py-4 rounded bg-transparent border border-[var(--color-gold)]/50 text-[var(--color-gold)] font-serif uppercase tracking-widest hover:bg-[var(--color-gold)]/10 transition-colors"
              >
                Continue to Next Round
              </button>
            )}
          </div>
        </div>
      );
    }

    const eliminatedPlayer = gameState.players[gameState.eliminatedThisRound];
    const eliminatedAlliance = getAllianceDisplay(eliminatedPlayer?.alliance);

    if (isRevealing) {
      return (
        <div className="fixed inset-0 z-50 bg-[var(--color-midnight)] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-crimson)]/20 to-transparent pointer-events-none" style={{ boxShadow: 'inset 0 0 150px rgba(156,28,43,0.5)' }}></div>

          <div className="z-10 flex flex-col items-center animate-in fade-in duration-1000 px-6 text-center">
            {/* Title — positioned safely within view, with padding from top */}
            <h2 className="text-3xl sm:text-5xl font-serif text-[var(--color-gold)] tracking-widest uppercase mb-8 animate-in slide-in-from-top-8 fade-in duration-1000">
              The Unmasking
            </h2>

            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-6 sm:mb-8">
              <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl animate-shatter rounded-full bg-[var(--color-charcoal-rich)] overflow-hidden">
                {isImageAvatar(eliminatedPlayer?.avatar) ? (
                  <img src={eliminatedPlayer?.avatar} alt={eliminatedPlayer?.name || "Mask"} className="w-full h-full object-cover" />
                ) : (
                  eliminatedPlayer?.avatar || "🎭"
                )}
              </div>
            </div>

            <h1 className={`text-3xl sm:text-5xl font-serif ${eliminatedAlliance.colorClass} mb-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-1000 fill-mode-both`}>
              {eliminatedPlayer?.name}
            </h1>

            <p className={`text-xl sm:text-2xl font-serif ${eliminatedAlliance.colorClass} animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-[1500ms] fill-mode-both`}>
              "{eliminatedAlliance.label}"
            </p>
          </div>
        </div>
      );
    }

    // ── Revealed screen — scrollable ──
    return (
      <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--color-midnight)] relative">
        <div className="velvet-texture"></div>
        <div className="z-10 flex flex-col items-center px-4 sm:px-8 py-6 sm:py-8 max-w-2xl w-full mx-auto animate-in fade-in duration-1000">
          <h2 className="text-3xl sm:text-4xl text-[var(--color-crimson)] font-serif mb-6 uppercase tracking-widest text-center">Elimination Revealed</h2>

          <div className="bg-[var(--color-velvet)] border border-[var(--color-crimson)]/50 p-6 sm:p-10 rounded-lg shadow-[0_0_40px_rgba(156,28,43,0.2)] relative overflow-hidden w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-crimson)]/5 to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 sm:w-32 sm:h-32 mx-auto rounded-full bg-[var(--color-charcoal-rich)] mb-4 sm:mb-6 flex items-center justify-center text-4xl sm:text-6xl opacity-50 grayscale overflow-hidden">
                {isImageAvatar(eliminatedPlayer?.avatar) ? (
                  <img src={eliminatedPlayer?.avatar} alt={eliminatedPlayer?.name || "Mask"} className="w-full h-full object-cover" />
                ) : (
                  eliminatedPlayer?.avatar || "🎭"
                )}
              </div>
              <h3 className={`text-2xl sm:text-3xl font-serif ${eliminatedAlliance.colorClass} mb-2 text-center`}>{eliminatedPlayer?.name}</h3>
              <p className="text-[var(--color-ash)] text-base sm:text-lg mb-6 font-serif italic text-center">has been eliminated from the ball.</p>

              <div className="mb-6 p-3 sm:p-4 rounded bg-[var(--color-ballroom)] border border-[var(--color-charcoal-warm)] text-center">
                <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-1">True Allegiance</p>
                <p className={`text-lg sm:text-xl font-serif uppercase tracking-widest ${eliminatedAlliance.colorClass}`}>
                  {eliminatedAlliance.label}
                </p>
              </div>

              {gameState.gameMode === "BattleRoyale" && (
                <p className="text-xs sm:text-sm text-[var(--color-ash)] font-serif mb-4 text-center">
                  These counts show how many players will be on each allegiance in the next round.
                </p>
              )}

              {gameState.revealedAllianceCiphers && (
                <div className="mb-6 rounded-lg border border-[var(--color-charcoal-warm)] bg-[var(--color-ballroom)]/80 p-4 text-left w-full">
                  <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-4 text-center">Round Ciphers Revealed</p>
                  <div className="space-y-3">
                    {ALLIANCE_CIPHER_ORDER.map((alliance) => {
                      const cipher = gameState.revealedAllianceCiphers?.[alliance];
                      if (!cipher) return null;
                      const allianceDisplay = getAllianceDisplay(alliance);
                      return (
                        <div key={alliance}>
                          <p className={`text-xs uppercase tracking-widest ${allianceDisplay.colorClass}`}>{allianceDisplay.label}</p>
                          <p className="text-[var(--color-ivory-antique)] font-serif">{cipher}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-8 sm:gap-12 border-t border-[var(--color-charcoal-warm)] pt-6 w-full">
                <div className="text-center">
                  <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-2">Lions</p>
                  <p className="text-3xl sm:text-4xl font-serif text-[var(--color-gold)]">{gameState.remainingMajority}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-2">Serpents</p>
                  <p className="text-3xl sm:text-4xl font-serif text-[rgba(42,160,160,0.9)]">{gameState.remainingMinority}</p>
                </div>
              </div>
            </div>
          </div>

          {isHost && (
            <button
              onClick={() => advancePhase()}
              className="mt-8 px-6 sm:px-8 py-3 sm:py-4 rounded bg-transparent border border-[var(--color-gold)]/50 text-[var(--color-gold)] font-serif uppercase tracking-widest hover:bg-[var(--color-gold)]/10 transition-colors"
            >
              Continue to Next Round
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Eliminated player spectating ──
  if (me?.isEliminated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[var(--color-midnight)] relative overflow-hidden">
        <div className="velvet-texture"></div>
        <h2 className="text-xl sm:text-2xl text-[var(--color-ash)] font-serif mb-4 uppercase tracking-widest z-10 text-center">You are eliminated.</h2>
        <p className="text-[var(--color-ivory-antique)] z-10">Watching the vote...</p>
        {isHost && allVotesLocked && (
          <button onClick={() => advancePhase()} className="mt-12 px-6 sm:px-8 py-3 sm:py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform z-10">
            Resolve Vote
          </button>
        )}
      </div>
    );
  }

  // ── Alliance guess tiebreaker ──
  if (isAllianceGuess && !me?.isEliminated) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--color-midnight)] relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-crimson)]/10 to-transparent pointer-events-none" style={{ boxShadow: 'inset 0 0 100px rgba(156,28,43,0.2)' }}></div>
        <div className="velvet-texture"></div>
        <div className="z-10 flex flex-col items-center px-4 sm:px-8 py-6 sm:py-8 max-w-4xl w-full mx-auto">
          <h2 className="text-2xl sm:text-3xl text-[var(--color-ivory)] font-serif mb-2 uppercase tracking-widest animate-in slide-in-from-top-8 text-center">Final Tiebreaker</h2>
          <p className="text-[var(--color-ash)] mb-6 italic font-serif text-sm sm:text-base text-center">The vote is still tied. Everyone must guess their own alliance. Incorrect guesses will be eliminated.</p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-8 w-full max-w-lg">
            <button
              onClick={() => setSelectedGuess("Majority")}
              className={`flex-1 p-6 sm:p-8 rounded-lg border transition-all flex flex-col items-center ${
                (selectedGuess === "Majority" || myGuess === "Majority")
                  ? 'bg-[var(--color-velvet)] border-[var(--color-gold)] shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105'
                  : (selectedGuess || myGuess)
                    ? 'bg-[var(--color-ballroom)] border-[var(--color-charcoal-warm)] opacity-30 grayscale'
                    : 'bg-[var(--color-velvet)] border-[var(--color-charcoal-rich)] hover:border-[var(--color-gold)]/50'
              }`}
            >
              <span className="text-3xl sm:text-4xl mb-3">🦁</span>
              <h3 className="text-xl sm:text-2xl font-serif text-[var(--color-gold)]">The Lions</h3>
            </button>
            <button
              onClick={() => setSelectedGuess("Minority")}
              className={`flex-1 p-6 sm:p-8 rounded-lg border transition-all flex flex-col items-center ${
                (selectedGuess === "Minority" || myGuess === "Minority")
                  ? 'bg-[var(--color-velvet)] border-[rgba(42,160,160,0.9)] shadow-[0_0_20px_rgba(42,160,160,0.4)] scale-105'
                  : (selectedGuess || myGuess)
                    ? 'bg-[var(--color-ballroom)] border-[var(--color-charcoal-warm)] opacity-30 grayscale'
                    : 'bg-[var(--color-velvet)] border-[var(--color-charcoal-rich)] hover:border-[rgba(42,160,160,0.9)]/50'
              }`}
            >
              <span className="text-3xl sm:text-4xl mb-3">🐍</span>
              <h3 className="text-xl sm:text-2xl font-serif text-[rgba(42,160,160,0.9)]">The Serpents</h3>
            </button>
          </div>

          <div className="flex items-center justify-center min-h-[56px]">
            {selectedGuess && !myGuess && (
              <button onClick={() => submitAllianceGuess(selectedGuess)} className="px-6 sm:px-8 py-3 sm:py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform animate-in slide-in-from-bottom-4">
                Lock In Guess
              </button>
            )}
            {myGuess && !isHost && (
              <div className="flex items-center gap-2 text-[var(--color-ash)] font-serif italic">
                <span className="text-xl">⚖️</span> Guess Locked
              </div>
            )}
            {isHost && !allVotesLocked && <div className="text-[var(--color-ash)] font-serif italic text-sm">Waiting for everyone to lock in...</div>}
            {isHost && allVotesLocked && (
              <button onClick={() => advancePhase()} className="px-6 sm:px-8 py-3 sm:py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform">
                Resolve Guesses
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Tied player waiting ──
  if (isRevote && amITied && !me?.isEliminated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[var(--color-midnight)] relative overflow-hidden">
        <div className="velvet-texture"></div>
        <h2 className="text-2xl sm:text-3xl text-[var(--color-crimson)] font-serif mb-4 uppercase tracking-widest z-10 animate-pulse text-center">You are on the block</h2>
        <p className="text-[var(--color-ivory-antique)] z-10 text-base sm:text-lg text-center">The vote tied. The others are deciding your fate.</p>
        {isHost && allVotesLocked && (
          <button onClick={() => advancePhase()} className="mt-12 px-6 sm:px-8 py-3 sm:py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform z-10">
            Resolve Vote
          </button>
        )}
      </div>
    );
  }

  // ── Main voting screen ──
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--color-midnight)] relative">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-crimson)]/10 to-transparent pointer-events-none" style={{ boxShadow: 'inset 0 0 100px rgba(156,28,43,0.2)' }}></div>
      <div className="velvet-texture"></div>

      <div className="z-10 flex flex-col items-center px-4 sm:px-8 py-6 sm:py-8 max-w-4xl w-full mx-auto">
        <h2 className="text-2xl sm:text-3xl text-[var(--color-ivory)] font-serif mb-1 uppercase tracking-widest animate-in slide-in-from-top-8 text-center">
          Choose Who to Unmask
        </h2>
        <p className="text-[var(--color-ash)] mb-6 italic font-serif text-sm sm:text-base text-center">Cast your vote. Someone must leave the ball.</p>

        {gameState.revealedAllianceCiphers && (
          <div className="mb-6 rounded-lg border border-[var(--color-charcoal-warm)] bg-[var(--color-ballroom)]/80 p-4 text-left w-full max-w-2xl">
            <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-3 text-center">Round Ciphers Revealed</p>
            <div className="space-y-3">
              {ALLIANCE_CIPHER_ORDER.map((alliance) => {
                const cipher = gameState.revealedAllianceCiphers?.[alliance];
                if (!cipher) return null;
                const allianceDisplay = getAllianceDisplay(alliance);
                return (
                  <div key={alliance}>
                    <p className={`text-xs uppercase tracking-widest ${allianceDisplay.colorClass}`}>{allianceDisplay.label}</p>
                    <p className="text-[var(--color-ivory-antique)] font-serif">{cipher}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6 w-full max-w-3xl">
          {activePlayers.map(p => {
            if (isRevote && !tiedIds.includes(p.id)) return null;
            // Cannot vote for yourself
            if (p.isMe) return null;

            const isSelected = selectedVote === p.id || myVote === p.id;
            const isOtherSelected = (selectedVote || myVote) && !isSelected;
            const canSelectTarget = !(isRevote && amITied);

            return (
              <button
                key={p.id}
                onClick={() => canSelectTarget && setSelectedVote(p.id)}
                disabled={!canSelectTarget}
                className={`p-3 sm:p-6 rounded-lg border transition-all flex flex-col items-center ${
                  isSelected
                    ? 'bg-[var(--color-velvet)] border-[var(--color-crimson)] shadow-[0_0_20px_rgba(156,28,43,0.4)] scale-105'
                    : isOtherSelected
                      ? 'bg-[var(--color-ballroom)] border-[var(--color-charcoal-warm)] opacity-30 grayscale'
                      : 'bg-[var(--color-velvet)] border-[var(--color-charcoal-rich)] hover:border-[var(--color-crimson)]/50 hover:shadow-[0_0_15px_rgba(156,28,43,0.2)]'
                } ${!canSelectTarget ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[var(--color-charcoal-rich)] mb-2 sm:mb-4 flex items-center justify-center text-2xl sm:text-3xl transition-all overflow-hidden ${
                  isSelected ? 'border-2 border-[var(--color-crimson)] shadow-[0_0_15px_rgba(156,28,43,0.4)]' : ''
                }`}>
                  {isImageAvatar(p.avatar) ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    p.avatar || "🎭"
                  )}
                </div>
                <h3 className={`text-sm sm:text-lg font-serif mb-1 text-center ${isSelected ? 'text-[var(--color-crimson)]' : 'text-[var(--color-ivory)]'}`}>
                  {p.name}
                </h3>
                {getAvatarLabel(p.avatar) && (
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-ash)] mb-1 hidden sm:block">
                    {getAvatarLabel(p.avatar)}
                  </p>
                )}
                {isSelected && (
                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-crimson)] font-bold animate-pulse">Accused</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-12 flex items-center justify-center min-h-[56px]">
          {selectedVote && !myVote && !(isRevote && amITied) && (
            <button onClick={() => vote(selectedVote)} className="px-6 sm:px-8 py-3 sm:py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform animate-in slide-in-from-bottom-4">
              Cast Accusation
            </button>
          )}
          {myVote && !isHost && (
            <div className="flex items-center gap-2 text-[var(--color-ash)] font-serif italic">
              <span className="text-xl">⚖️</span> Accusation Filed
            </div>
          )}
          {isRevote && amITied && (
            <div className="text-[var(--color-ash)] font-serif italic text-sm text-center">Tied players cannot vote in the revote. Waiting on the rest...</div>
          )}
          {isHost && !allVotesLocked && !selectedVote && !myVote && (
            <div className="text-[var(--color-ash)] font-serif italic text-sm">Waiting for everyone to lock in...</div>
          )}
          {isHost && allVotesLocked && (
            <button onClick={() => advancePhase()} className="px-6 sm:px-8 py-3 sm:py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform">
              Resolve Vote
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
