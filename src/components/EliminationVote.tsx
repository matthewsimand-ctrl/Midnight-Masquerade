import { useGameStore } from "../client/store.js";
import { useState, useEffect } from "react";

const ALLIANCE_DISPLAY: Record<string, { label: string; colorClass: string }> = {
  majority: { label: "The Lions", colorClass: "text-[rgba(156,28,43,0.9)]" },
  lion: { label: "The Lions", colorClass: "text-[rgba(156,28,43,0.9)]" },
  lions: { label: "The Lions", colorClass: "text-[rgba(156,28,43,0.9)]" },
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

export function EliminationVote() {
  const { gameState, vote, advancePhase } = useGameStore();
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  
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
  
  const myVote = me ? gameState.votes[me.id] : null;

  if (gameState.eliminatedThisRound) {
    const eliminatedPlayer = gameState.players[gameState.eliminatedThisRound];
    const eliminatedAlliance = getAllianceDisplay(eliminatedPlayer?.alliance);
    
    if (isRevealing) {
      return (
        <div className="fixed inset-0 z-50 bg-[var(--color-midnight)] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-crimson)]/20 to-transparent pointer-events-none" style={{ boxShadow: 'inset 0 0 150px rgba(156,28,43,0.5)' }}></div>
          
          <div className="z-10 flex flex-col items-center animate-in fade-in duration-1000">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 flex items-center justify-center text-6xl animate-shatter rounded-full bg-[var(--color-charcoal-rich)] overflow-hidden">
                {isImageAvatar(eliminatedPlayer?.avatar) ? (
                  <img
                    src={eliminatedPlayer?.avatar}
                    alt={eliminatedPlayer?.name || "Mask"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  eliminatedPlayer?.avatar || "🎭"
                )}
              </div>
            </div>
            
            <h1 className={`text-5xl font-serif ${eliminatedAlliance.colorClass} mb-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-1000 fill-mode-both`}>
              {eliminatedPlayer?.name}
            </h1>
            
            <p className={`text-2xl font-serif ${eliminatedAlliance.colorClass} animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-[1500ms] fill-mode-both`}>
              "{eliminatedAlliance.label}"
            </p>
            
            <h2 className="absolute top-12 text-5xl font-serif text-[var(--color-gold)] tracking-widest uppercase animate-in slide-in-from-top-8 fade-in duration-1000">
              The Unmasking
            </h2>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--color-midnight)] relative overflow-hidden">
        <div className="velvet-texture"></div>
        
        <div className="text-center max-w-2xl w-full z-10 animate-in fade-in duration-1000">
          <h2 className="text-4xl text-[var(--color-crimson)] font-serif mb-8 uppercase tracking-widest">Elimination Revealed</h2>
          
          <div className="bg-[var(--color-velvet)] border border-[var(--color-crimson)]/50 p-12 rounded-lg shadow-[0_0_40px_rgba(156,28,43,0.2)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-crimson)]/5 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="w-32 h-32 mx-auto rounded-full bg-[var(--color-charcoal-rich)] mb-6 flex items-center justify-center text-6xl opacity-50 grayscale">
                {isImageAvatar(eliminatedPlayer?.avatar) ? (
                  <img
                    src={eliminatedPlayer?.avatar}
                    alt={eliminatedPlayer?.name || "Mask"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  eliminatedPlayer?.avatar || "🎭"
                )}
              </div>
              <h3 className={`text-3xl font-serif ${eliminatedAlliance.colorClass} mb-2`}>{eliminatedPlayer?.name}</h3>
              <p className="text-[var(--color-ash)] text-lg mb-8 font-serif italic">has been eliminated from the ball.</p>
              
              <div className="mb-8 p-4 rounded bg-[var(--color-ballroom)] border border-[var(--color-charcoal-warm)] inline-block">
                <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-1">True Allegiance</p>
                <p className={`text-xl font-serif uppercase tracking-widest ${eliminatedAlliance.colorClass}`}>
                  {eliminatedAlliance.label}
                </p>
              </div>
              
              <div className="flex justify-center gap-12 border-t border-[var(--color-charcoal-warm)] pt-8">
                <div>
                  <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-2">Lions Remaining</p>
                  <p className="text-4xl font-serif text-[var(--color-gold)]">{gameState.remainingMajority}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mb-2">Serpents Remaining</p>
                  <p className="text-4xl font-serif text-[rgba(42,160,160,0.9)]">{gameState.remainingMinority}</p>
                </div>
              </div>
            </div>
          </div>

          {isHost && (
            <button
              onClick={() => advancePhase()}
              className="mt-12 px-8 py-4 rounded bg-transparent border border-[var(--color-gold)]/50 text-[var(--color-gold)] font-serif uppercase tracking-widest hover:bg-[var(--color-gold)]/10 transition-colors"
            >
              Continue to Next Round
            </button>
          )}
        </div>
      </div>
    );
  }

  if (me?.isEliminated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--color-midnight)] relative overflow-hidden">
        <div className="velvet-texture"></div>
        <h2 className="text-2xl text-[var(--color-ash)] font-serif mb-4 uppercase tracking-widest z-10">You are eliminated.</h2>
        <p className="text-[var(--color-ivory-antique)] z-10">Watching the vote...</p>
        {isHost && (
          <button
            onClick={() => advancePhase()}
            className="mt-12 px-8 py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform z-10"
          >
            Resolve Vote
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--color-midnight)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-crimson)]/10 to-transparent pointer-events-none" style={{ boxShadow: 'inset 0 0 100px rgba(156,28,43,0.2)' }}></div>
      <div className="velvet-texture"></div>
      
      <div className="text-center max-w-4xl w-full z-10">
        <h2 className="text-3xl text-[var(--color-ivory)] font-serif mb-2 uppercase tracking-widest animate-in slide-in-from-top-8">Choose Who to Unmask</h2>
        <p className="text-[var(--color-ash)] mb-12 italic font-serif">Cast your vote. Someone must leave the ball.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center max-w-3xl mx-auto">
          {activePlayers.map(p => {
            const isSelected = selectedVote === p.id || myVote === p.id;
            const isOtherSelected = (selectedVote || myVote) && !isSelected;
            
            return (
              <button
                key={p.id}
                onClick={() => setSelectedVote(p.id)}
                className={`p-6 rounded-lg border transition-all flex flex-col items-center ${
                  isSelected 
                    ? 'bg-[var(--color-velvet)] border-[var(--color-crimson)] shadow-[0_0_20px_rgba(156,28,43,0.4)] scale-105' 
                    : isOtherSelected
                      ? 'bg-[var(--color-ballroom)] border-[var(--color-charcoal-warm)] opacity-30 grayscale'
                      : 'bg-[var(--color-velvet)] border-[var(--color-charcoal-rich)] hover:border-[var(--color-crimson)]/50 hover:shadow-[0_0_15px_rgba(156,28,43,0.2)]'
                }`}
              >
                <div className={`w-20 h-20 rounded-full bg-[var(--color-charcoal-rich)] mb-4 flex items-center justify-center text-3xl transition-all ${
                  isSelected ? 'border-2 border-[var(--color-crimson)] shadow-[0_0_15px_rgba(156,28,43,0.4)]' : ''
                }`}>
                  {isImageAvatar(p.avatar) ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    p.avatar || "🎭"
                  )}
                </div>
                <h3 className={`text-lg font-serif mb-1 ${isSelected ? 'text-[var(--color-crimson)]' : 'text-[var(--color-ivory)]'}`}>
                  {p.name}
                </h3>
                {getAvatarLabel(p.avatar) && (
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-ash)] mb-1">
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

        <div className="h-24 mt-12 flex items-center justify-center">
          {selectedVote && !myVote && (
            <button
              onClick={() => vote(selectedVote)}
              className="px-8 py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform animate-in slide-in-from-bottom-4"
            >
              Cast Accusation
            </button>
          )}
          
          {myVote && !isHost && (
            <div className="flex items-center gap-2 text-[var(--color-ash)] font-serif italic">
              <span className="text-xl">⚖️</span> Accusation Filed
            </div>
          )}

          {isHost && (
            <button
              onClick={() => advancePhase()}
              className="px-8 py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform"
            >
              Resolve Vote
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
