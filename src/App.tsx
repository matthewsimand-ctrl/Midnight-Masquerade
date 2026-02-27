import { useEffect, useState } from "react";
import { useGameStore } from "./client/store.js";
import { Lobby } from "./components/Lobby.js";
import { RoleReveal } from "./components/RoleReveal.js";
import { Dealing } from "./components/Dealing.js";
import { MotifReveal } from "./components/MotifReveal.js";
import { PrivateDance } from "./components/PrivateDance.js";
import { GossipSalon } from "./components/GossipSalon.js";
import { EliminationVote } from "./components/EliminationVote.js";
import { GameOver } from "./components/GameOver.js";
import { Journal } from "./components/Journal.js";
import { GameHeader } from "./components/GameHeader.js";

// ─── Room code generation ──────────────────────────────────────────────────
// Uses a timestamp-seeded suffix to prevent collisions when multiple rooms
// are created in quick succession.
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  const timestampPart = Date.now().toString(36).slice(-2).toUpperCase();
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return (random + timestampPart).slice(0, 6); // 6-char code, timestamp-salted
}

function Home({ onJoin }: { onJoin: (roomId: string, name: string) => void }) {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState<"home" | "create" | "join">("home");

  return (
    <div className="min-h-screen bg-[var(--color-midnight)] text-[var(--color-ivory)] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/homescreen.jpg)" }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[var(--color-midnight)]/50 via-[var(--color-midnight)]/70 to-[var(--color-midnight)]"></div>

      <div className="velvet-texture z-0"></div>

      {/* Chandelier SVG */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-80 animate-pulse-glow z-0">
        <svg
          width="200"
          height="150"
          viewBox="0 0 200 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 0L105 40L150 50L110 70L120 120L100 90L80 120L90 70L50 50L95 40L100 0Z"
            fill="var(--color-gold)"
            opacity="0.3"
          />
          <circle cx="100" cy="70" r="20" fill="var(--color-gold)" opacity="0.5" />
        </svg>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--color-gold)] rounded-full blur-[120px] opacity-10 pointer-events-none z-0"></div>

      <div className="z-10 flex flex-col items-center max-w-[480px] w-full px-6 animate-bloom">
        <h1 className="text-5xl md:text-7xl font-serif text-[var(--color-gold)] tracking-[0.2em] text-center mb-2 drop-shadow-lg">
          MIDNIGHT
        </h1>
        <h2 className="text-xl md:text-2xl font-serif text-[var(--color-ivory)] tracking-[0.6em] text-center mb-8 drop-shadow-md">
          MASQUERADE
        </h2>

        <div className="w-full max-w-[200px] h-[1px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mb-8"></div>

        <p className="text-center text-[var(--color-ivory-antique)] text-lg mb-12 drop-shadow-md">
          Two alliances. One masquerade. No one knows who stands beside them.
        </p>

        {mode === "home" && (
          <div className="flex flex-col gap-4 w-full max-w-[280px]">
            <button
              onClick={() => setMode("create")}
              className="w-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold tracking-widest uppercase py-4 px-8 rounded shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform"
            >
              Enter the Ball
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full bg-transparent border border-[var(--color-gold)]/50 text-[var(--color-gold)] font-serif uppercase tracking-widest py-3 px-8 rounded hover:bg-[var(--color-gold)]/10 transition-colors"
            >
              Join a Room
            </button>
          </div>
        )}

        {(mode === "create" || mode === "join") && (
          <div className="w-full bg-[var(--color-ballroom)] border border-[var(--color-charcoal-warm)] p-8 rounded-lg shadow-2xl">
            <div className="flex justify-between mb-8 border-b border-[var(--color-charcoal-warm)]">
              <button
                className={`pb-2 font-serif uppercase tracking-widest ${
                  mode === "create"
                    ? "text-[var(--color-gold)] border-b-2 border-[var(--color-gold)]"
                    : "text-[var(--color-ash)]"
                }`}
                onClick={() => setMode("create")}
              >
                Create Room
              </button>
              <button
                className={`pb-2 font-serif uppercase tracking-widest ${
                  mode === "join"
                    ? "text-[var(--color-gold)] border-b-2 border-[var(--color-gold)]"
                    : "text-[var(--color-ash)]"
                }`}
                onClick={() => setMode("join")}
              >
                Join Room
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[var(--color-ash)] text-sm mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Alessandro Moretti..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--color-velvet)] border border-[var(--color-charcoal-rich)] rounded px-4 py-3 text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              {mode === "join" && (
                <div>
                  <label className="block text-[var(--color-ash)] text-sm mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    placeholder="MQN4A7"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    className="w-full bg-[var(--color-velvet)] border border-[var(--color-charcoal-rich)] rounded px-4 py-3 text-[var(--color-ivory)] font-mono uppercase focus:outline-none focus:border-[var(--color-gold)]"
                  />
                </div>
              )}

              <button
                onClick={() => {
                  if (name) {
                    if (mode === "create") {
                      onJoin(generateRoomCode(), name);
                    } else if (roomId) {
                      onJoin(roomId, name);
                    } else {
                      alert("Please enter a room code.");
                    }
                  } else {
                    alert("Please enter your name.");
                  }
                }}
                className="w-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold tracking-widest uppercase py-4 px-8 rounded shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform mt-4"
              >
                {mode === "create" ? "Create the Ball" : "Enter the Ball"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 text-[var(--color-ash)] text-xs tracking-widest">
        v1.0.0 • ANTHROPIC
      </div>
    </div>
  );
}

export default function App() {
  const { gameState, connect } = useGameStore();
  const [joined, setJoined] = useState(false);
  const [showHand, setShowHand] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  // Journal state lifted up so GameHeader can control it
  const [journalOpen, setJournalOpen] = useState(false);

  if (!joined) {
    return (
      <Home
        onJoin={(roomId, name) => {
          connect(roomId, name, "🎭");
          setJoined(true);
        }}
      />
    );
  }

  if (!gameState)
    return (
      <div className="min-h-screen bg-[var(--color-midnight)] text-[var(--color-ivory)] flex items-center justify-center">
        Loading...
      </div>
    );

  const renderPhase = () => {
    switch (gameState.phase) {
      case "Lobby":
        return <Lobby />;
      case "RoleReveal":
        return <RoleReveal />;
      case "Dealing":
        return <Dealing />;
      case "MotifReveal":
        return <MotifReveal />;
      case "PrivateDance":
        return <PrivateDance />;
      case "GossipSalon":
        return <GossipSalon />;
      case "EliminationVote":
        return <EliminationVote />;
      case "GameOver":
        return <GameOver />;
      default:
        return <div>Unknown Phase</div>;
    }
  };

  const me = Object.values(gameState.players).find((p) => p.isMe);
  const isHost = me?.isHost;

  const showHeader =
    gameState.phase !== "Lobby" &&
    gameState.phase !== "GameOver";

  return (
    <div className="min-h-screen bg-[var(--color-midnight)] text-[var(--color-ivory)] font-sans flex overflow-hidden">
      {/* ── Persistent Game Header ── */}
      {showHeader && (
        <GameHeader
          onOpenJournal={() => setJournalOpen((v) => !v)}
          journalOpen={journalOpen}
        />
      )}

      {isHost && gameState.phase !== "Lobby" && gameState.phase !== "GameOver" && (
        <button
          onClick={() => setShowEndConfirm(true)}
          className="fixed top-16 left-4 z-50 bg-[var(--color-charcoal-rich)] border border-[var(--color-crimson)]/50 text-[var(--color-ash)] hover:text-[var(--color-crimson)] px-3 py-1.5 rounded text-xs font-serif uppercase tracking-widest transition-colors shadow-lg"
        >
          End Game
        </button>
      )}

      {showEndConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[var(--color-velvet)] border border-[var(--color-crimson)] p-8 rounded-lg max-w-md w-full text-center shadow-[0_0_40px_rgba(156,28,43,0.3)]">
            <h3 className="text-2xl font-serif text-[var(--color-ivory)] mb-4">
              End the Game?
            </h3>
            <p className="text-[var(--color-ash)] mb-8">
              Are you sure you want to end the current game and return to the
              lobby?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="px-6 py-2 rounded border border-[var(--color-charcoal-warm)] text-[var(--color-ash)] hover:bg-[var(--color-charcoal-rich)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  useGameStore.getState().endGame();
                  setShowEndConfirm(false);
                }}
                className="px-6 py-2 rounded bg-[var(--color-crimson)] text-[var(--color-ivory)] hover:bg-[var(--color-crimson-active)] transition-colors"
              >
                End Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content — push down when header is visible */}
      <div
        className="flex-1 flex flex-col relative"
        style={{ paddingTop: showHeader ? "52px" : "0" }}
      >
        {renderPhase()}
      </div>

      {/* Journal — controlled by header button */}
      {gameState.phase !== "Lobby" &&
        gameState.phase !== "Dealing" && (
          <Journal isOpen={journalOpen} onClose={() => setJournalOpen(false)} />
        )}

      {/* Hand Drawer */}
      {gameState.phase !== "Lobby" &&
        gameState.phase !== "Dealing" &&
        me &&
        me.hand &&
        me.hand.length > 0 && (
          <>
            <button
              onClick={() => setShowHand(!showHand)}
              className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] px-6 py-3 rounded font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform"
            >
              {showHand ? "Hide Hand" : "View Hand"}
            </button>

            <div
              className={`fixed bottom-0 left-0 right-0 bg-[var(--color-ballroom)] border-t border-[var(--color-charcoal-warm)] p-6 z-40 transition-transform duration-300 ease-in-out ${
                showHand ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="max-w-6xl mx-auto">
                <h3 className="text-xl font-serif text-[var(--color-gold)] mb-4">
                  Your Hand
                </h3>
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {me.hand.map((card) => (
                    <div
                      key={card.id}
                      className="w-48 flex-shrink-0 aspect-[2/3] rounded-md border border-[var(--color-charcoal-rich)] bg-[var(--color-velvet)] overflow-hidden flex flex-col shadow-lg"
                    >
                      {card.type === "Image" ? (
                        <>
                          <div className="h-7 bg-gradient-to-r from-[var(--color-gold)] to-transparent flex items-center px-2">
                            <span className="font-serif text-[9px] text-[var(--color-midnight)] tracking-widest">
                              ✶ IMAGE
                            </span>
                          </div>
                          <img
                            src={card.content}
                            alt="Card"
                            className="w-full flex-1 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </>
                      ) : (
                        <>
                          <div className="h-7 bg-[var(--color-burgundy)] flex items-center px-2">
                            <span className="font-serif text-[9px] text-[var(--color-ivory)] tracking-widest">
                              ⦿ WORD
                            </span>
                          </div>
                          <div className="flex-1 flex items-center justify-center p-6 bg-[var(--color-ballroom)] text-[var(--color-ivory)] font-serif italic text-xl text-center break-words border-y border-[var(--color-gold)]/30 my-4 mx-2">
                            {card.content}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
