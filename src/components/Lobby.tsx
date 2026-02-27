import { useGameStore } from "../client/store.js";
import { Check, Copy, Crown, UserPlus } from "lucide-react";
import { useState } from "react";
import { RulesModal } from "./RulesModal.js";

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM MASKS
// To add your own mask images:
//   1. Drop your PNG/JPG files into the `public/masks/` folder in your project
//      (e.g. public/masks/wolf.png, public/masks/butterfly.png)
//   2. Add the path (starting with "/masks/") to the CUSTOM_MASK_IMAGES array below
//   3. They'll appear in the mask picker alongside the emoji options
// ─────────────────────────────────────────────────────────────────────────────
export const CUSTOM_MASK_IMAGES: string[] = [
  // "/masks/wolf.png",
  // "/masks/butterfly.png",
  // "/masks/fox.png",
  // "/masks/raven.png",
  // Add your own paths here ↑
  "/masks/Beak.png",
  "/masks/Bird.png",
  "/masks/Black.png",
  "/masks/Blue.png",
  "/masks/Cat.png",
  "/masks/Feather.png",
  "/masks/Gold.png",
  "/masks/Jester.png",
  "/masks/Lion.png",
];

const isImageAvatar = (avatar?: string) =>
  Boolean(avatar && (avatar.startsWith("/") || avatar.startsWith("http")));

const EMOJI_AVATARS = ["🎭", "🦊", "🦉", "🦇", "🐺", "🐍", "🦋", "🕷️", "🦚", "🦢"];

// Combined list: custom images first, then emojis
const AVATARS = [...CUSTOM_MASK_IMAGES, ...EMOJI_AVATARS];

export function Lobby() {
  const { gameState, updatePlayer, addBot, advancePhase, kickPlayer, setGameMode } =
    useGameStore();
  const [showRules, setShowRules] = useState(false);

  if (!gameState) return null;

  const me = Object.values(gameState.players).find((p) => p.isMe);
  const players = Object.values(gameState.players);
  const isHost = me?.isHost;
  const minPlayers = 4;
  const maxPlayers = 10;
  const allReady = players.every((p) => p.ready);
  const canStart = players.length >= minPlayers && allReady;

  const playerCount = players.length;
  let majSize: number | string = 3;
  let minSize: number | string = 1;

  if (gameState.gameMode === "BattleRoyale") {
    if (playerCount % 2 === 0) {
      majSize = Math.max(playerCount / 2 + 1, 0);
      minSize = Math.max(playerCount / 2 - 1, 0);
    } else {
      majSize = Math.ceil(playerCount / 2);
      minSize = Math.floor(playerCount / 2);
    }
  } else {
    if (playerCount === 5) { majSize = 3; minSize = 2; }
    else if (playerCount === 6) { majSize = 4; minSize = 2; }
    else if (playerCount === 7) { majSize = 4; minSize = 3; }
    else if (playerCount === 8) { majSize = 5; minSize = 3; }
    else if (playerCount === 9) { majSize = "5-6"; minSize = "3-4"; }
    else if (playerCount >= 10) { majSize = 6; minSize = 4; }
  }

  const splitText = playerCount < minPlayers ? "TBD" : `${majSize}v${minSize}`;

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
      <div className="velvet-texture"></div>

      <div className="z-10 w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Player List */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-[var(--color-gold)]">
              Guests Arriving
            </h2>
            <div className="bg-[var(--color-crimson)] text-[var(--color-ivory)] px-3 py-1 rounded-full text-xs font-bold tracking-widest">
              {`${players.length} / ${maxPlayers}`}
            </div>
          </div>

          <div className="space-y-3 mb-6 flex-1">
            {players.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  p.ready
                    ? "bg-[var(--color-velvet)] border-[var(--color-gold)]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                    : "bg-[var(--color-ballroom)] border-[var(--color-charcoal-warm)]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-charcoal-rich)] flex items-center justify-center text-2xl animate-float overflow-hidden">
                      {isImageAvatar(p.avatar) ? (
                        <img
                          src={p.avatar}
                          alt="Mask"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        p.avatar || "🎭"
                      )}
                    </div>
                    {p.isHost && (
                      <div className="absolute -top-1 -right-1 text-[var(--color-gold)]">
                        <Crown size={16} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <span className="font-sans text-[15px] text-[var(--color-ivory)]">
                    {p.name}{" "}
                    {p.isMe && (
                      <span className="text-[var(--color-ash)] italic">(You)</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {isHost && !p.isMe && (
                    <button
                      onClick={() => kickPlayer(p.id)}
                      className="text-[var(--color-crimson)] hover:text-[var(--color-crimson-active)] text-xs uppercase tracking-widest font-bold px-2 py-1 border border-[var(--color-crimson)]/30 rounded transition-colors"
                    >
                      Kick
                    </button>
                  )}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 ${
                      p.ready
                        ? "bg-[#2D7A4A]/20 text-[#2D7A4A] border border-[#2D7A4A]/30"
                        : "bg-[var(--color-charcoal-warm)] text-[var(--color-ash)]"
                    }`}
                  >
                    {p.ready && <Check size={12} />}
                    {p.ready ? "Ready" : "Not Ready"}
                  </div>
                </div>
              </div>
            ))}

            {players.length < minPlayers && (
              <div className="p-4 rounded-lg border border-dashed border-[var(--color-charcoal-warm)] flex items-center justify-center text-[var(--color-ash)] italic animate-pulse">
                Waiting for more guests...
              </div>
            )}
          </div>

          <div className="bg-[var(--color-ballroom)] border border-[var(--color-charcoal-warm)] rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-ash)] mb-1">
                Room Invitation
              </p>
              <p className="font-mono text-lg text-[var(--color-ivory)] tracking-widest">
                {gameState.roomId}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(gameState.roomId);
              }}
              className="w-10 h-10 rounded-full bg-[var(--color-velvet)] border border-[var(--color-charcoal-rich)] flex items-center justify-center text-[var(--color-gold)] hover:bg-[var(--color-charcoal-warm)] transition-colors"
              title="Copy Room Code"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* Right Column - Room Controls */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-[var(--color-ballroom)] border border-[var(--color-charcoal-warm)] rounded-xl p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 border-b border-[var(--color-charcoal-warm)] pb-4">
              <h3 className="text-xl font-serif text-[var(--color-ivory)]">The Masquerade</h3>
              <button
                onClick={() => setShowRules(true)}
                className="w-8 h-8 rounded-full border border-[var(--color-gold)]/50 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors"
                title="Game Rules"
              >
                ?
              </button>
            </div>

            <div className="mb-5 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-ash)]">Game Mode</p>
              <ModeOption
                active={gameState.gameMode === "BattleRoyale"}
                title="Battle Royale"
                description="Survivors can swap alliances each round. Last two alive win together."
                onClick={() => isHost && setGameMode("BattleRoyale")}
                disabled={!isHost}
              />
              <ModeOption
                active={gameState.gameMode === "LionsVsSnakes"}
                title="Lions vs. Snakes"
                description="Classic mode with fixed alliances and original win conditions."
                onClick={() => isHost && setGameMode("LionsVsSnakes")}
                disabled={!isHost}
              />
            </div>

            <div className="space-y-4 mb-auto">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--color-ash)]">Alliance Split</span>
                <span className="text-[var(--color-gold)] font-bold">
                  {splitText}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--color-ash)]">Card Hand</span>
                <span className="text-[var(--color-ivory-antique)]">
                  10 Cards
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--color-ash)]">Elimination</span>
                <span className="text-[var(--color-ivory-antique)]">
                  Mandatory
                </span>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              {me && (
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-ash)] mb-3">
                    Choose Your Mask
                  </p>

                  {/* Custom image masks section (only shown if any exist) */}
                  {CUSTOM_MASK_IMAGES.length > 0 && (
                    <>
                      <p className="text-[9px] uppercase tracking-widest text-[var(--color-gold)]/50 mb-2">
                        Custom Masks
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {CUSTOM_MASK_IMAGES.map((avatar) => {
                          const isTaken = players.some(
                            (p) => p.id !== me.id && p.avatar === avatar
                          );
                          return (
                            <button
                              key={avatar}
                              onClick={() => {
                                if (!me.ready && !isTaken)
                                  updatePlayer(me.name, avatar, me.ready);
                              }}
                              disabled={me.ready || isTaken}
                              title={avatar.split("/").pop()?.replace(/\.\w+$/, "")}
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all overflow-hidden ${
                                me.avatar === avatar
                                  ? "border-2 border-[var(--color-gold)] shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                                  : "border border-[var(--color-charcoal-warm)] hover:border-[var(--color-gold)]/50"
                              } ${me.ready ? "opacity-50 cursor-not-allowed" : ""} ${
                                isTaken ? "opacity-20 cursor-not-allowed grayscale" : ""
                              }`}
                            >
                              <img
                                src={avatar}
                                alt="Mask"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[9px] uppercase tracking-widest text-[var(--color-gold)]/50 mb-2">
                        Emoji Masks
                      </p>
                    </>
                  )}

                  {/* Emoji masks */}
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_AVATARS.map((avatar) => {
                      const isTaken = players.some(
                        (p) => p.id !== me.id && p.avatar === avatar
                      );
                      return (
                        <button
                          key={avatar}
                          onClick={() => {
                            if (!me.ready && !isTaken)
                              updatePlayer(me.name, avatar, me.ready);
                          }}
                          disabled={me.ready || isTaken}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                            me.avatar === avatar
                              ? "bg-[var(--color-charcoal-rich)] border-2 border-[var(--color-gold)] shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                              : "bg-[var(--color-velvet)] border border-[var(--color-charcoal-warm)] hover:border-[var(--color-gold)]/50"
                          } ${me.ready ? "opacity-50 cursor-not-allowed" : ""} ${
                            isTaken ? "opacity-20 cursor-not-allowed grayscale" : ""
                          }`}
                        >
                          {avatar}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {me && (
                <button
                  onClick={() => updatePlayer(me.name, me.avatar, !me.ready)}
                  className={`w-full py-4 rounded font-serif font-bold tracking-widest uppercase transition-all ${
                    me.ready
                      ? "bg-transparent border border-[var(--color-gold)]/50 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
                      : "bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-[1.02]"
                  }`}
                >
                  {me.ready ? "Cancel Ready" : "Ready to Dance"}
                </button>
              )}

              {isHost && (
                <>
                  <button
                    onClick={() => addBot()}
                    disabled={players.length >= maxPlayers}
                    className="w-full py-3 rounded bg-[var(--color-velvet)] border border-[var(--color-charcoal-rich)] text-[var(--color-ivory-antique)] font-serif text-sm tracking-widest uppercase hover:bg-[var(--color-charcoal-warm)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus size={16} />
                    Add Bot Guest
                  </button>

                  <div className="pt-6 mt-6 border-t border-[var(--color-charcoal-warm)]">
                    <button
                      onClick={() => advancePhase()}
                      disabled={!canStart}
                      className={`w-full py-4 rounded font-serif font-bold tracking-widest uppercase transition-all ${
                        canStart
                          ? "bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-[1.02]"
                          : "bg-[var(--color-velvet)] text-[var(--color-ash)] cursor-not-allowed"
                      }`}
                    >
                      Start the Masquerade
                    </button>
                    {!canStart && (
                      <p className="text-center text-[11px] text-[var(--color-ash)] mt-3">
                        {players.length < minPlayers
                          ? `Requires at least ${minPlayers} guests`
                          : "Waiting for all guests to be ready"}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        selectedMode={gameState.gameMode}
      />
    </div>
  );
}

function ModeOption({
  active,
  title,
  description,
  onClick,
  disabled,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left rounded-lg border p-3 transition-colors ${
        active
          ? "border-[var(--color-gold)]/60 bg-[var(--color-gold)]/10"
          : "border-[var(--color-charcoal-warm)] bg-[var(--color-velvet)]/40 hover:border-[var(--color-gold)]/30"
      } ${disabled ? "cursor-not-allowed" : ""}`}
    >
      <div className="flex items-center gap-2">
        <p className="font-serif text-[var(--color-ivory)]">{title}</p>
        <span className="group relative inline-flex items-center justify-center w-4 h-4 rounded-full border border-[var(--color-ash)] text-[10px] text-[var(--color-ash)]">
          i
          <span className="absolute left-1/2 top-5 z-20 hidden w-56 -translate-x-1/2 rounded border border-[var(--color-charcoal-warm)] bg-[var(--color-midnight)] px-2 py-1 text-[10px] text-[var(--color-ivory-antique)] group-hover:block">
            {description}
          </span>
        </span>
      </div>
      <p className="text-xs text-[var(--color-ash)] mt-1">{description}</p>
    </button>
  );
}