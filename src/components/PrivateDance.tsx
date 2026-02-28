import { useGameStore } from "../client/store.js";
import { useState, useEffect } from "react";

export function PrivateDance() {
  const { gameState, shareCard, advancePhase } = useGameStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [shuffledHand, setShuffledHand] = useState<any[]>([]);
  const [partnerCardRevealed, setPartnerCardRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCurtainsOpen(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const me = gameState ? Object.values(gameState.players).find(p => p.isMe) : null;

  useEffect(() => {
    if (me?.hand && shuffledHand.length === 0) {
      setShuffledHand([...me.hand].sort(() => Math.random() - 0.5));
    }
  }, [me?.hand]);

  const partnerId = me ? (gameState?.dancePairs[me.id] || Object.keys(gameState?.dancePairs || {}).find(id => gameState?.dancePairs[id] === me.id)) : null;
  const partnerSharedCard = partnerId ? gameState?.sharedCards[partnerId] : null;

  useEffect(() => {
    if (partnerSharedCard && !partnerCardRevealed) {
      const timer = setTimeout(() => setPartnerCardRevealed(true), 400);
      return () => clearTimeout(timer);
    }
  }, [partnerSharedCard]);

  if (!gameState) return null;

  const isHost = me?.isHost;

  if (me?.isEliminated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        <div className="velvet-texture"></div>
        <h2 className="text-2xl text-[var(--color-ash)] font-serif mb-4 uppercase tracking-widest z-10">You are eliminated.</h2>
        <p className="text-[var(--color-ivory-antique)] z-10">The private dances are happening behind closed doors...</p>
        {isHost && gameState.allPairsShared && (
          <button onClick={() => advancePhase()} className="mt-12 px-8 py-4 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform z-10 animate-in slide-in-from-bottom-8">
            End Dances
          </button>
        )}
        {isHost && !gameState.allPairsShared && (
          <p className="mt-12 text-[var(--color-gold)] font-serif italic z-10">Waiting for pairs to finish...</p>
        )}
      </div>
    );
  }

  const partner = partnerId ? gameState.players[partnerId] : null;

  if (!partnerId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        <div className="velvet-texture"></div>
        <h2 className="text-2xl text-[var(--color-ash)] font-serif mb-4 uppercase tracking-widest z-10">You are resting this dance.</h2>
        <p className="text-[var(--color-ivory-antique)] z-10">Observe the others as they share their secrets...</p>
        {isHost && gameState.allPairsShared && (
          <button onClick={() => advancePhase()} className="mt-12 px-8 py-4 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform z-10 animate-in slide-in-from-bottom-8">
            End Dances
          </button>
        )}
        {isHost && !gameState.allPairsShared && (
          <p className="mt-12 text-[var(--color-gold)] font-serif italic z-10">Waiting for pairs to finish...</p>
        )}
      </div>
    );
  }

  const mySharedCard = me ? gameState.sharedCards[me.id] : null;

  function CardFace({ card }: { card: any }) {
    return (
      <div className="w-full h-full flex flex-col">
        {card.type === "Image" ? (
          <>
            <div className="h-7 bg-gradient-to-r from-[var(--color-gold)] to-transparent flex items-center px-2 flex-shrink-0">
              <span className="font-serif text-[9px] text-[var(--color-midnight)] tracking-widest">✶ IMAGE</span>
            </div>
            <img src={card.content} alt="Card" className="w-full flex-1 object-cover" referrerPolicy="no-referrer" />
          </>
        ) : (
          <>
            <div className="h-7 bg-[var(--color-burgundy)] flex items-center px-2 flex-shrink-0">
              <span className="font-serif text-[9px] text-[var(--color-ivory)] tracking-widest">⦿ WORD</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[var(--color-ballroom)] text-[var(--color-ivory)] font-serif italic text-lg sm:text-xl text-center break-words border-y border-[var(--color-gold)]/30 my-3 sm:my-4 mx-2">
              {card.content}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-midnight)] relative overflow-hidden">
      {/* Curtains */}
      <div className={`absolute inset-y-0 left-0 w-1/2 bg-[var(--color-burgundy)] border-r-4 border-[var(--color-gold)] z-50 transition-transform duration-[1200ms] ease-[cubic-bezier(.4,0,.2,1)] ${curtainsOpen ? '-translate-x-full' : 'translate-x-0'}`}>
        <div className="velvet-texture opacity-20"></div>
      </div>
      <div className={`absolute inset-y-0 right-0 w-1/2 bg-[var(--color-burgundy)] border-l-4 border-[var(--color-gold)] z-50 transition-transform duration-[1200ms] ease-[cubic-bezier(.4,0,.2,1)] ${curtainsOpen ? 'translate-x-full' : 'translate-x-0'}`}>
        <div className="velvet-texture opacity-20"></div>
      </div>

      <div className="velvet-texture"></div>

      {/* Motif pill — sits just below header (top-[52px]) */}
      <div className="absolute top-[60px] sm:top-[60px] left-1/2 -translate-x-1/2 z-20 bg-[var(--color-velvet)] border border-[var(--color-gold)]/30 rounded-full px-4 sm:px-8 py-1.5 sm:py-2 shadow-[0_0_20px_rgba(212,175,55,0.15)] max-w-[88vw]">
        <p className="text-[var(--color-gold)] font-serif text-xs sm:text-lg tracking-widest truncate">"{gameState.currentMotif}"</p>
      </div>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto pt-[108px] sm:pt-[112px] pb-24 sm:pb-20 z-10">
        {!mySharedCard ? (
          /* ── Card selection view ── */
          <div className="flex flex-col items-center px-3 sm:px-12">
            <div className="flex flex-col items-center mb-4 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-serif text-[var(--color-gold)] uppercase tracking-widest">Your Hand</h3>
              <p className="text-[var(--color-ash)] text-sm mt-1">Sharing with {partner?.name}</p>
            </div>

            <div className="w-full max-w-4xl">
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-8">
                {shuffledHand.map(card => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`aspect-[2/3] rounded-md border transition-all overflow-hidden flex flex-col relative ${
                      selectedCardId === card.id
                        ? "border-[var(--color-gold)] shadow-[0_0_15px_rgba(212,175,55,0.4)] -translate-y-2"
                        : "border-[var(--color-charcoal-rich)] bg-[var(--color-velvet)] hover:border-[var(--color-gold)]/50 hover:-translate-y-1"
                    }`}
                  >
                    {card.type === "Image" ? (
                      <>
                        <div className="h-5 bg-gradient-to-r from-[var(--color-gold)] to-transparent flex items-center px-1">
                          <span className="font-serif text-[7px] text-[var(--color-midnight)] tracking-widest">✶ IMAGE</span>
                        </div>
                        <img src={card.content} alt="Card" className="w-full flex-1 object-cover" referrerPolicy="no-referrer" />
                      </>
                    ) : (
                      <>
                        <div className="h-5 bg-[var(--color-burgundy)] flex items-center px-1">
                          <span className="font-serif text-[7px] text-[var(--color-ivory)] tracking-widest">⦿ WORD</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-1.5 sm:p-2 bg-[var(--color-ballroom)] text-[var(--color-ivory)] font-serif italic text-[10px] sm:text-xs text-center break-words border-y border-[var(--color-gold)]/30 my-1.5 mx-1">
                          {card.content}
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>

              {selectedCardId && (
                <div className="flex justify-center animate-in slide-in-from-bottom-4">
                  <button
                    onClick={() => shareCard(selectedCardId)}
                    className="px-6 sm:px-8 py-3 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-105 transition-transform animate-pulse"
                  >
                    Share This Card
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Both cards view ── */
          <div className="flex flex-col sm:flex-row relative">
            <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--color-gold)]/50 to-transparent -translate-x-1/2 z-0"></div>

            {/* My card */}
            <div className="w-full sm:w-1/2 flex flex-col items-center px-4 sm:px-12 py-4 sm:py-0 relative z-10">
              <div className="flex flex-col items-center mb-4 sm:mb-8">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[var(--color-charcoal-rich)] border-2 border-[var(--color-gold)]/30 flex items-center justify-center text-3xl sm:text-4xl mb-3 sm:mb-4 animate-float overflow-hidden">
                  {me?.avatar?.startsWith('/') ? (
                    <img src={me.avatar} alt="Mask" className="w-full h-full object-cover" />
                  ) : me?.avatar || "🎭"}
                </div>
                <h3 className="text-lg sm:text-xl font-serif text-[var(--color-gold)] uppercase tracking-widest">Your Card</h3>
              </div>
              <div className="w-32 sm:w-48 aspect-[2/3] rounded-md border-2 border-[var(--color-gold)] overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                <CardFace card={mySharedCard} />
              </div>
            </div>

            {/* Divider on mobile */}
            <div className="sm:hidden w-full h-px bg-[var(--color-gold)]/20 my-4"></div>

            {/* Partner's card */}
            <div className="w-full sm:w-1/2 flex flex-col items-center px-4 sm:px-12 py-4 sm:py-0 relative z-10">
              <div className="flex flex-col items-center mb-4 sm:mb-8">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[var(--color-charcoal-rich)] border-2 border-[var(--color-gold)]/30 flex items-center justify-center text-3xl sm:text-4xl mb-3 sm:mb-4 animate-float overflow-hidden" style={{ animationDelay: '1s' }}>
                  {partner?.avatar?.startsWith('/') ? (
                    <img src={partner.avatar} alt="Mask" className="w-full h-full object-cover" />
                  ) : partner?.avatar || "🎭"}
                </div>
                <h3 className="text-lg sm:text-xl font-serif text-[var(--color-gold)] uppercase tracking-widest">{partner?.name}'s Card</h3>
              </div>

              <div className="w-32 sm:w-48 aspect-[2/3] relative">
                <div className={`absolute inset-0 rounded-md border border-[var(--color-charcoal-rich)] bg-[var(--color-velvet)] flex items-center justify-center transition-all duration-700 ease-in-out ${
                  partnerCardRevealed ? "opacity-0 -translate-y-8 pointer-events-none" : "opacity-100 translate-y-0"
                }`}>
                  <div className="w-24 sm:w-32 h-36 sm:h-44 border border-[var(--color-gold)]/30 rounded flex items-center justify-center overflow-hidden">
                    {partner?.avatar?.startsWith('/') ? (
                      <img src={partner.avatar} alt="Mask" className="w-full h-full object-cover opacity-20" />
                    ) : (
                      <span className="text-4xl opacity-20">{partner?.avatar || "🎭"}</span>
                    )}
                  </div>
                </div>

                <div className={`absolute inset-0 rounded-md border-2 border-[var(--color-gold)] overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all duration-700 ease-in-out ${
                  partnerCardRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
                }`}>
                  {partnerSharedCard && <CardFace card={partnerSharedCard} />}
                </div>

                {!partnerSharedCard && (
                  <div className="absolute inset-0 rounded-md border border-[var(--color-charcoal-rich)] bg-[var(--color-velvet)] flex flex-col items-center justify-center gap-3">
                    <span className="text-3xl opacity-20">{partner?.avatar || "🎭"}</span>
                    <p className="text-[var(--color-ash)] text-xs font-serif italic animate-pulse">Waiting...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--color-midnight)] to-transparent z-20 flex items-center justify-center py-4 px-4 min-h-[72px]">
        {isHost && gameState.allPairsShared && (
          <button
            onClick={() => advancePhase()}
            className="px-5 sm:px-8 py-3 sm:py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform animate-in slide-in-from-bottom-8"
          >
            Conclude the Dance
          </button>
        )}
        {isHost && !gameState.allPairsShared && mySharedCard && partnerSharedCard && (
          <p className="text-[var(--color-gold)] font-serif italic animate-pulse text-sm">Waiting for other pairs to finish...</p>
        )}
      </div>
    </div>
  );
}
