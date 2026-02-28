import { useGameStore } from "../client/store.js";

const isImageAvatar = (avatar?: string) =>
  Boolean(avatar && (avatar.startsWith("/") || avatar.startsWith("http")));

const isEmojiAvatar = (avatar?: string) =>
  Boolean(avatar && /\p{Extended_Pictographic}/u.test(avatar));

const getDisplayAvatar = (avatar?: string) => {
  if (isImageAvatar(avatar) || isEmojiAvatar(avatar)) return avatar;
  return "🎭";
};

export function CipherReveal() {
  const { gameState, advancePhase } = useGameStore();
  if (!gameState) return null;

  const me = Object.values(gameState.players).find(p => p.isMe);
  const isHost = me?.isHost;

  // Eliminated players should not see the cipher
  if (me?.isEliminated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        <div className="velvet-texture"></div>
        <h2 className="text-xl sm:text-2xl text-[var(--color-ash)] font-serif mb-4 uppercase tracking-widest z-10 text-center">You are eliminated.</h2>
        <p className="text-[var(--color-ivory-antique)] z-10 text-center">The next round is beginning...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="velvet-texture"></div>

      <div className="w-full max-w-3xl z-10 flex flex-col items-center gap-6 sm:gap-8">
        <h2 className="text-xl sm:text-2xl text-[var(--color-gold)] font-serif uppercase tracking-widest text-center">
          Round {gameState.round} Begins
        </h2>

        {/* Cipher banner */}
        <div className="w-full bg-gradient-to-r from-[var(--color-velvet)] via-[var(--color-charcoal-rich)] to-[var(--color-velvet)] border-y border-[var(--color-gold)]/30 relative flex items-center px-4 sm:px-8 py-4 sm:py-0 sm:h-[120px] animate-bloom overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] rounded-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-gold)]/10 to-transparent animate-shimmer w-[200%]"></div>

          <div className="flex items-center gap-4 sm:gap-8 w-full relative z-10">
            {/* Player Avatar */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex-shrink-0 flex items-center justify-center shadow-inner border border-black/50 bg-[var(--color-burgundy)] overflow-hidden text-xl sm:text-2xl">
              {isImageAvatar(getDisplayAvatar(me?.avatar)) ? (
                <img src={getDisplayAvatar(me?.avatar)} alt={me?.name || "Mask"} className="w-full h-full object-cover" />
              ) : (
                getDisplayAvatar(me?.avatar)
              )}
            </div>

            <div className="flex-1 text-left min-w-0">
              <p className="text-[var(--color-ash)] text-xs uppercase tracking-widest mb-1">
                Your Cipher
              </p>
              <h1 className="text-xl sm:text-3xl font-serif text-[var(--color-gold)] font-bold mb-1 break-words leading-tight">
                "{gameState.currentCipher}"
              </h1>
              <p className="text-[var(--color-ash)] text-xs sm:text-sm font-sans">
                Your secret allegiance — share nothing directly
              </p>
            </div>
          </div>
        </div>

        {isHost && (
          <button
            onClick={() => advancePhase()}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-midnight)] font-serif font-bold uppercase tracking-widest shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform"
          >
            Start Private Dances
          </button>
        )}
      </div>
    </div>
  );
}
