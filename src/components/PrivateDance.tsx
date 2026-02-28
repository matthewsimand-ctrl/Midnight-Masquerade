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

  // When partner's card arrives, trigger the reveal animation
  const partnerId = me ? (gameState?.dancePairs[me.id] || Object.keys(gameState?.dancePairs || {}).find(id => gameState?.dancePairs[id] === me.id)) : null;
  const partnerSharedCard = partnerId ? gameState?.sharedCards[partnerId] : null;

  useEffect(() => {
    if (partnerSharedCard && !partnerCardRevealed) {
      // Small delay for dramatic effect
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

  // Renders a card face (used for both my card and partner's card)
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
            <div className="flex-1 flex items-center justify-center p-6 bg-[var(--color-ballroom)] text-[var(--color-ivory)] font-serif italic text-xl text-center break-words border-y border-[var(--color-gold)]/30 my-4 mx-2">
              {card.content}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-midnight)] relative overflow-hidden">
      {/* Curtains */}
      <div className={`absolute inset-y-0 left-0 w-1/2 bg-[var(--color-burgundy)] border-r-4 border-[var(--color-gold)] z-50 transition-transform duration-[1200ms] ease-[cubic-bezier(.4,0,.2,1)] ${curtainsOpen ? '-translate-x-full' : 'translate-x-0'}`}>
        <div className="velvet-texture opacity-20"></div>
      </div>
      <div className={`absolute inset-y-0 right-0 w-1/2 bg-[var(--color-burgundy)] border-l-4 border-[var(--color-gold)] z-50 transition-transform duration-[1200ms] ease-[cubic-bezier(.4,0,.2,1)] ${curtainsOpen ? 'translate-x-full' : 'translate-x-0'}`}>
        <div className="velvet-texture opacity-20"></div>
      </div>

      <div className="velvet-texture"></div>

      <div className="absolute top-2 sm:top-6 left-1/2 -translate-x-1/2 z-20 bg-[var(--color-velvet)] border border-[var(--color-gold)]/30 rounded-full px-4 sm:px-8 py-2 shadow-[0_0_20px_rgba(212,175,55,0.15)] max-w-[92vw]">
        <p className="text-[var(--color-gold)] font-serif text-sm sm:text-lg tracking-widest truncate">"{gameState.currentMotif}"</p>
      </div>

      <div className="w-full h-full flex flex-col sm:flex-row relative z-10 pt-20 sm:pt-24 pb-28 sm:pb-24 overflow-y-auto">
        {!mySharedCard ? (
          /* ── Card selection view ── */
          <div className="w-full flex flex-col items-center px-4 sm:px-12 relative z-10">
            <div className="flex flex-col items-center mb-8">
              <h3 className="text-xl font-serif text-[var(--color-gold)] uppercase tracking-widest">Your Hand</h3>
              <p className="text-[var(--color-ash)] text-sm mt-2">Sharing with {partner?.name}</p>
            </div>

            <div className="w-full max-w-4xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                        <div className="flex-1 flex items-center justify-center p-2 bg-[var(--color-ballroom)] text-[var(--color-ivory)] font-serif italic text-xs text-center break-words border-y border-[var(--color-gold)]/30 my-2 mx-1">
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
          <>
            <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--color-gold)]/50 to-transparent -translate-x-1/2 z-0"></div>

            {/* My card */}
            <div className="w-full sm:w-1/2 flex flex-col items-center px-4 sm:px-12 relative z-10 mb-8 sm:mb-0">
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-[var(--color-charcoal-rich)] border-2 border-[var(--color-gold)]/30 flex items-center justify-center text-4xl mb-4 animate-float overflow-hidden">
                  {me?.avatar?.startsWith('/') ? (
                    <img src={me.avatar} alt="Mask" className="w-full h-full object-cover" />
                  ) : me?.avatar || "🎭"}
                </div>
                <h3 className="text-xl font-serif text-[var(--color-gold)] uppercase tracking-widest">Your Card</h3>
              </div>
              <div className="w-36 sm:w-48 aspect-[2/3] rounded-md border-2 border-[var(--color-gold)] overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                <CardFace card={mySharedCard} />
              </div>
            </div>

            {/* Partner's card */}
            <div className="w-full sm:w-1/2 flex flex-col items-center px-4 sm:px-12 relative z-10 mb-8 sm:mb-0">
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-[var(--color-charcoal-rich)] border-2 border-[var(--color-gold)]/30 flex items-center justify-center text-4xl mb-4 animate-float overflow-hidden" style={{ animationDelay: '1s' }}>
                  {partner?.avatar?.startsWith('/') ? (
                    <img src={partner.avatar} alt="Mask" className="w-full h-full object-cover" />
                  ) : partner?.avatar || "🎭"}
                </div>
                <h3 className="text-xl font-serif text-[var(--color-gold)] uppercase tracking-widest">{partner?.name}'s Card</h3>
              </div>

              <div className="w-36 sm:w-48 aspect-[2/3] relative">
                {/* Card back — slides away upward when revealed */}
                <div
                  className={`absolute inset-0 rounded-md border border-[var(--color-charcoal-rich)] bg-[var(--color-velvet)] flex items-center justify-center transition-all duration-700 ease-in-out ${
                    partnerCardRevealed ? "opacity-0 -translate-y-8 pointer-events-none" : "opacity-100 translate-y-0"
                  }`}
                >
                  <div className="w-32 h-44 border border-[var(--color-gold)]/30 rounded flex items-center justify-center overflow-hidden">
                    {partner?.avatar?.startsWith('/') ? (
                      <img src={partner.avatar} alt="Mask" className="w-full h-full object-cover opacity-20" />
                    ) : (
                      <span className="text-4xl opacity-20">{partner?.avatar || "🎭"}</span>
                    )}
                  </div>
                </div>

                {/* Card front — fades in when revealed */}
                <div
                  className={`absolute inset-0 rounded-md border-2 border-[var(--color-gold)] overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all duration-700 ease-in-out ${
                    partnerCardRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
                  }`}
                >
                  {partnerSharedCard && <CardFace card={partnerSharedCard} />}
                </div>

                {/* Waiting state — shown before partner shares */}
                {!partnerSharedCard && (
                  <div className="absolute inset-0 rounded-md border border-[var(--color-charcoal-rich)] bg-[var(--color-velvet)] flex flex-col items-center justify-center gap-3">
                    <span className="text-3xl opacity-20">{partner?.avatar || "🎭"}</span>
                    <p className="text-[var(--color-ash)] text-xs font-serif italic animate-pulse">Waiting...</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-24 bg-gradient-to-t from-[var(--color-midnight)] to-transparent z-20 flex items-end sm:items-center justify-center pb-4 sm:pb-0 px-4">
        {isHost && gameState.allPairsShared && (
          <button
            onClick={() => advancePhase()}
            className="px-5 sm:px-8 py-3 sm:py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform animate-in slide-in-from-bottom-8"
          >
            Conclude the Dance
          </button>
        )}
        {isHost && !gameState.allPairsShared && mySharedCard && partnerSharedCard && (
          <p className="text-[var(--color-gold)] font-serif italic animate-pulse">Waiting for other pairs to finish...</p>
        )}
      </div>
    </div>
  );
}