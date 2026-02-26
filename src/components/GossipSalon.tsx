import { useGameStore } from "../client/store.js";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export function GossipSalon() {
  const { gameState, advancePhase } = useGameStore();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{id: string, senderId: string, text: string, time: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  if (!gameState) return null;

  const me = Object.values(gameState.players).find(p => p.isMe);
  const isHost = me?.isHost;
  const players = Object.values(gameState.players);

  const handleSend = () => {
    if (!message.trim() || !me) return;
    
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      senderId: me.id,
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-12 relative overflow-hidden bg-[var(--color-midnight)]">
      <div className="velvet-texture"></div>
      
      {/* Player Arc */}
      <div className="w-full max-w-4xl flex justify-center gap-6 flex-wrap px-8 z-10 mb-8">
        {players.map((p, i) => {
          // Simple arc calculation for visual effect
          const angle = (i / (players.length - 1)) * Math.PI - Math.PI/2;
          const yOffset = Math.abs(Math.sin(angle)) * 40;
          
          return (
            <div 
              key={p.id} 
              className="flex flex-col items-center transition-transform hover:-translate-y-2"
              style={{ transform: `translateY(${yOffset}px)` }}
            >
              <div className={`w-16 h-16 rounded-full bg-[var(--color-charcoal-rich)] border-2 flex items-center justify-center text-2xl mb-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                p.isEliminated ? "border-[var(--color-charcoal-warm)] opacity-50 grayscale" : "border-[var(--color-gold)]/30"
              }`}>
                🎭
              </div>
              <span className={`font-sans text-xs ${p.isEliminated ? "text-[var(--color-ash)] line-through" : "text-[var(--color-ivory)]"}`}>
                {p.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chat Panel */}
      <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-[var(--color-midnight)]/90 backdrop-blur-md border-t border-[var(--color-gold)]/30 z-20 flex flex-col animate-in slide-in-from-bottom-full duration-500">
        <div className="flex justify-between items-center px-8 py-4 border-b border-[var(--color-charcoal-warm)] bg-[var(--color-velvet)]/50">
          <h2 className="text-lg font-serif text-[var(--color-gold)] tracking-widest uppercase">The Gossip Salon — Round {gameState.round}</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[var(--color-gold)]">3:00</span>
            {isHost && (
              <button
                onClick={() => advancePhase()}
                className="px-4 py-2 rounded bg-gradient-to-br from-[var(--color-crimson)] to-[var(--color-crimson-active)] text-[var(--color-ivory)] font-serif text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform"
              >
                End Salon
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[var(--color-ash)] italic font-serif">
              The salon is quiet. Who will speak first?
            </div>
          )}
          
          {messages.map(msg => {
            const isMe = msg.senderId === me?.id;
            const sender = gameState.players[msg.senderId];
            
            return (
              <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? "self-end flex-row-reverse" : "self-start"}`}>
                <div className="w-8 h-8 rounded-full bg-[var(--color-charcoal-rich)] border border-[var(--color-gold)]/30 flex items-center justify-center text-sm flex-shrink-0">
                  🎭
                </div>
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-serif text-[11px] text-[var(--color-gold)] uppercase tracking-wider">{sender?.name}</span>
                    <span className="font-sans text-[10px] text-[var(--color-ash)]">{msg.time}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-sans text-[14px] ${
                    isMe 
                      ? "bg-[var(--color-gold)]/10 text-[var(--color-ivory)] border border-[var(--color-gold)]/20 rounded-tr-none" 
                      : "bg-[var(--color-velvet)] text-[var(--color-ivory)] border border-[var(--color-charcoal-warm)] rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-[var(--color-charcoal-warm)] bg-[var(--color-velvet)]/80">
          <div className="max-w-4xl mx-auto relative flex items-end gap-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Speak your truth... or lie"
              className="flex-1 bg-[var(--color-ballroom)] border border-[var(--color-charcoal-rich)] rounded-lg px-4 py-3 text-[var(--color-ivory)] font-sans italic focus:outline-none focus:border-[var(--color-gold)]/50 resize-none min-h-[48px] max-h-[120px]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:grayscale transition-all hover:scale-105"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


