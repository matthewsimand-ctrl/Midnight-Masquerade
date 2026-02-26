import { useGameStore } from "../client/store.js";
import { ChevronRight, PenTool } from "lucide-react";
import { useState } from "react";

export function Journal() {
  const { gameState } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!gameState) return null;

  const me = Object.values(gameState.players).find(p => p.isMe);
  if (!me) return null;

  return (
    <div className={`fixed right-0 top-0 bottom-0 bg-[var(--color-velvet)] border-l-2 border-[var(--color-gold)]/40 flex flex-col transition-transform duration-500 ease-in-out z-40 ${
      isOpen ? "translate-x-0" : "translate-x-[320px]"
    }`} style={{ width: '320px' }}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-12 top-24 w-12 h-12 bg-[var(--color-velvet)] border-y-2 border-l-2 border-[var(--color-gold)]/40 rounded-l-lg flex items-center justify-center text-[var(--color-gold)] hover:bg-[var(--color-charcoal-warm)] transition-colors shadow-[-5px_0_15px_rgba(0,0,0,0.3)]"
      >
        <ChevronRight size={24} className={`transition-transform duration-500 ${isOpen ? "rotate-0" : "rotate-180"}`} />
      </button>

      <div className="velvet-texture"></div>

      <div className="p-6 border-b border-[var(--color-charcoal-warm)] relative z-10 flex items-center gap-3">
        <PenTool className="text-[var(--color-gold)]" size={20} />
        <div>
          <h2 className="text-xl font-serif text-[var(--color-ivory)]">My Masque Journal</h2>
          <p className="text-xs text-[var(--color-ash)] uppercase tracking-widest mt-1">Observer's Notes</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {me.journal && me.journal.length > 0 ? (
          me.journal.map((entry, idx) => (
            <div key={idx} className="bg-[var(--color-ballroom)] border border-[var(--color-charcoal-rich)] rounded-lg p-4 shadow-md">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--color-charcoal-warm)]">
                <span className="text-[10px] text-[var(--color-gold)] font-bold uppercase tracking-widest">Round {entry.round}</span>
                <span className="text-xs text-[var(--color-ivory-antique)] font-serif italic">with {entry.partnerName}</span>
              </div>
              
              <div className="aspect-[2/3] w-full rounded border border-[var(--color-charcoal-rich)] overflow-hidden bg-[var(--color-velvet)] flex flex-col">
                {entry.receivedCard.type === "Image" ? (
                  <>
                    <div className="h-5 bg-gradient-to-r from-[var(--color-gold)] to-transparent flex items-center px-1">
                      <span className="font-serif text-[7px] text-[var(--color-midnight)] tracking-widest">✶ IMAGE</span>
                    </div>
                    <img src={entry.receivedCard.content} alt="Card" className="w-full flex-1 object-cover" referrerPolicy="no-referrer" />
                  </>
                ) : (
                  <>
                    <div className="h-5 bg-[var(--color-burgundy)] flex items-center px-1">
                      <span className="font-serif text-[7px] text-[var(--color-ivory)] tracking-widest">⦿ WORD</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-2 bg-[var(--color-ballroom)] text-[var(--color-ivory)] font-serif italic text-sm text-center break-words border-y border-[var(--color-gold)]/30 my-2 mx-1">
                      {entry.receivedCard.content}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
            <PenTool size={32} className="text-[var(--color-ash)] mb-4" />
            <p className="text-[var(--color-ivory-antique)] font-serif italic">
              Your journal is empty. The night is young.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

