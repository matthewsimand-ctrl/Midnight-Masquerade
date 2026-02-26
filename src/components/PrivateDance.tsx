import { useGameStore } from "../client/store.js";
import { useState, useEffect } from "react";

export function PrivateDance() {
  const { gameState, shareCard, advancePhase } = useGameStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [curtainsOpen, setCurtainsOpen] = useState(false);

  useEffect(() => {
    // Open curtains on mount
    const timer = setTimeout(() => setCurtainsOpen(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!gameState) return null;

  const me = Object.values(gameState.players).find(p => p.isMe);
  const isHost = me?.isHost;
  
  if (me?.isEliminated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="velvet-texture"></div>
        <h2 className="text-2xl text-[var(--color-ash)] font-serif mb-4 uppercase tracking-widest z-10">You are eliminated.</h2>
        <p className="text-[var(--color-ivory-antique)] z-10">The private dances are happening behind closed doors...</p>
        {isHost && gameState.allPairsShared && (
          <button
            onClick={() => advancePhase()}
            className="mt-12 px-8 py-4 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform z-10 animate-in slide-in-from-bottom-8"
          >
            End Dances
          </button>
        )}
        {isHost && !gameState.allPairsShared && (
          <p className="mt-12 text-[var(--color-gold)] font-serif italic z-10">Waiting for pairs to finish...</p>
        )}
      </div>
    );
  }

  const receiverId = me ? gameState.dancePairs[me.id] : null;
  const receiver = receiverId ? gameState.players[receiverId] : null;

  const senderId = me ? Object.keys(gameState.dancePairs).find(id => gameState.dancePairs[id] === me.id) : null;
  const sender = senderId ? gameState.players[senderId] : null;

  if (!receiverId || !senderId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="velvet-texture"></div>
        <h2 className="text-2xl text-[var(--color-ash)] font-serif mb-4 uppercase tracking-widest z-10">You are resting this dance.</h2>
        <p className="text-[var(--color-ivory-antique)] z-10">Observe the others as they share their secrets...</p>
        {isHost && gameState.allPairsShared && (
          <button
            onClick={() => advancePhase()}
            className="mt-12 px-8 py-4 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform z-10 animate-in slide-in-from-bottom-8"
          >
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
  const partnerSharedCard = senderId ? gameState.sharedCards[senderId] : null;

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
      
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-[var(--color-velvet)] border border-[var(--color-gold)]/30 rounded-full px-8 py-2 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
        <p className="text-[var(--color-gold)] font-serif text-lg tracking-widest">"{gameState.currentMotif}"</p>
      </div>

      <div className="w-full h-full flex relative z-10 pt-24 pb-24">
        {/* Center Divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--color-gold)]/50 to-transparent -translate-x-1/2 z-0"></div>

        {/* My Side */}
        <div className="w-1/2 flex flex-col items-center px-12 relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-[var(--color-charcoal-rich)] border-2 border-[var(--color-gold)]/30 flex items-center justify-center text-4xl mb-4 animate-float shadow-[0_0_20px_rgba(212,175,55,0.1)]">
              🎭
            </div>
            <h3 className="text-xl font-serif text-[var(--color-gold)] uppercase tracking-widest">Your Hand</h3>
            <p className="text-[var(--color-ash)] text-sm mt-2">Sharing with {receiver?.name}</p>
          </div>

          {!mySharedCard ? (
            <div className="w-full max-w-md">
              <div className="grid grid-cols-3 gap-4 mb-8">
                {me?.hand?.map(card => (
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
                    className="px-8 py-3 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform"
                  >
                    Share This Card
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="text-[var(--color-ash)] text-sm uppercase tracking-widest mb-6">You shared</p>
              <div className="w-48 aspect-[2/3] rounded-md border-2 border-[var(--color-gold)] overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                {mySharedCard.type === "Image" ? (
                  <>
                    <div className="h-7 bg-gradient-to-r from-[var(--color-gold)] to-transparent flex items-center px-2">
                      <span className="font-serif text-[9px] text-[var(--color-midnight)] tracking-widest">✶ IMAGE</span>
                    </div>
                    <img src={mySharedCard.content} alt="Card" className="w-full flex-1 object-cover" referrerPolicy="no-referrer" />
                  </>
                ) : (
                  <>
                    <div className="h-7 bg-[var(--color-burgundy)] flex items-center px-2">
                      <span className="font-serif text-[9px] text-[var(--color-ivory)] tracking-widest">⦿ WORD</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-6 bg-[var(--color-ballroom)] text-[var(--color-ivory)] font-serif italic text-xl text-center break-words border-y border-[var(--color-gold)]/30 my-4 mx-2">
                      {mySharedCard.content}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Partner Side */}
        <div className="w-1/2 flex flex-col items-center px-12 relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-[var(--color-charcoal-rich)] border-2 border-[var(--color-gold)]/30 flex items-center justify-center text-4xl mb-4 animate-float shadow-[0_0_20px_rgba(212,175,55,0.1)]" style={{ animationDelay: '1s' }}>
              🎭
            </div>
            <h3 className="text-xl font-serif text-[var(--color-gold)] uppercase tracking-widest">{sender?.name}'s Card</h3>
          </div>

          <div className="flex flex-col items-center justify-center flex-1">
            {partnerSharedCard ? (
              <div className="w-48 aspect-[2/3] rounded-md border-2 border-[var(--color-gold)] overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.2)] animate-card-flip" style={{ transformStyle: 'preserve-3d' }}>
                {/* Back of card (initially visible, then flips away) */}
                <div className="absolute inset-0 bg-[var(--color-velvet)] border border-[var(--color-charcoal-rich)] flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                  <div className="w-32 h-48 border border-[var(--color-gold)]/30 rounded flex items-center justify-center">
                    <span className="text-4xl opacity-20">🎭</span>
                  </div>
                </div>
                
                {/* Front of card */}
                <div className="absolute inset-0 flex flex-col bg-[var(--color-velvet)]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  {partnerSharedCard.type === "Image" ? (
                    <>
                      <div className="h-7 bg-gradient-to-r from-[var(--color-gold)] to-transparent flex items-center px-2">
                        <span className="font-serif text-[9px] text-[var(--color-midnight)] tracking-widest">✶ IMAGE</span>
                      </div>
                      <img src={partnerSharedCard.content} alt="Card" className="w-full flex-1 object-cover" referrerPolicy="no-referrer" />
                    </>
                  ) : (
                    <>
                      <div className="h-7 bg-[var(--color-burgundy)] flex items-center px-2">
                        <span className="font-serif text-[9px] text-[var(--color-ivory)] tracking-widest">⦿ WORD</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--color-ballroom)] text-[var(--color-ivory)] font-serif italic text-xl text-center break-words border-y border-[var(--color-gold)]/30 my-4 mx-2">
                        {partnerSharedCard.content}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-48 aspect-[2/3] rounded-md border border-[var(--color-charcoal-rich)] bg-[var(--color-velvet)] flex items-center justify-center flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent"></div>
                <div className="w-32 h-48 border border-[var(--color-gold)]/30 rounded flex items-center justify-center">
                  <span className="text-4xl opacity-20">🎭</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-midnight)] to-transparent z-20 flex items-center justify-center">
        {isHost && gameState.allPairsShared && (
          <button
            onClick={() => advancePhase()}
            className="px-8 py-4 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(156,28,43,0.4)] hover:scale-105 transition-transform animate-in slide-in-from-bottom-8"
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


