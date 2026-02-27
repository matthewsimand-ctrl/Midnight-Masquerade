import { Server, Socket } from "socket.io";
import { GameState, Player, Alliance, Card, JournalEntry, GamePhase, ClientGameState, ClientPlayer } from "../shared/types.js";
import { v4 as uuidv4 } from "uuid";

// Mock data for now
const MOTIFS = [
  { text: "Crimson Veil Falls at Midnight", keywords: ["Crimson", "Veil", "Midnight"] },
  { text: "The Thirteenth Raven Clock Strikes", keywords: ["Thirteenth", "Raven", "Clock", "Strikes"] },
  { text: "A Golden Mask Hides the Truth", keywords: ["Golden", "Mask", "Hides", "Truth"] },
  { text: "Shadows Dance in the Grand Hall", keywords: ["Shadows", "Dance", "Grand", "Hall"] },
];

const IMAGE_CARDS: Card[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `img${i}`, type: "Image", content: `https://picsum.photos/seed/img${i}/200/300`
}));

const WORD_CARDS: Card[] = [
  "Veil", "Midnight", "Whisper", "Echo", "Crimson", "Raven", "Clock", "Shatter", "Mask", "Secret",
  "Golden", "Truth", "Shadows", "Dance", "Grand", "Hall", "Silence", "Dagger", "Poison", "Rose"
].map((w, i) => ({ id: `w${i}`, type: "Word", content: w }));

const rooms: Record<string, GameState> = {};

const AVATARS = ["🎭", "🦊", "🦉", "🦇", "🐺", "🐍", "🦋", "🕷️", "🦚", "🦢"];

function getAvailableAvatar(game: GameState): string {
  const usedAvatars = Object.values(game.players).map(p => p.avatar);
  const available = AVATARS.filter(a => !usedAvatars.includes(a));
  return available.length > 0 ? available[0] : "🎭";
}

export function setupGameSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    socket.on("joinRoom", ({ roomId, name, avatar }: { roomId: string, name: string, avatar: string }) => {
      socket.join(roomId);
      
      if (!rooms[roomId]) {
        rooms[roomId] = {
          roomId,
          hostId: socket.id,
          players: {},
          phase: "Lobby",
          round: 0,
          maxRounds: 0,
          allianceMotifs: {},
          allianceKeywords: {},
          minorityPenaltyRound: false,
          dancePairs: {},
          danceRequests: {},
          sharedCards: {},
          votes: {},
          eliminatedThisRound: null,
          winner: null,
          remainingMajority: 0,
          remainingMinority: 0,
          consecutiveMajorityEliminations: 0,
        };
      }

      const game = rooms[roomId];
      if (game.phase !== "Lobby" && !game.players[socket.id]) {
        socket.emit("error", "Game already in progress");
        return;
      }

      if (!game.players[socket.id]) {
        let assignedAvatar = avatar;
        const usedAvatars = Object.values(game.players).map(p => p.avatar);
        if (!assignedAvatar || usedAvatars.includes(assignedAvatar) || assignedAvatar === "mask1") {
          assignedAvatar = getAvailableAvatar(game);
        }

        game.players[socket.id] = {
          id: socket.id,
          name,
          avatar: assignedAvatar,
          hand: [],
          isEliminated: false,
          journal: [],
          ready: false,
          isBot: false,
        };
      }

      broadcastState(io, roomId);
    });

    socket.on("addBot", ({ roomId }: { roomId: string }) => {
      const game = rooms[roomId];
      if (game && game.hostId === socket.id && game.phase === "Lobby") {
        const botId = `bot_${uuidv4()}`;
        const botNames = ["Lord Byron", "Countess Lovelace", "Duke of Wellington", "Lady Hamilton", "Marquis de Sade", "Casanova", "Marie Antoinette", "King Louis XVI"];
        const usedNames = Object.values(game.players).map(p => p.name);
        const availableNames = botNames.filter(n => !usedNames.includes(n));
        const name = availableNames.length > 0 ? availableNames[0] : `Bot ${Object.keys(game.players).length}`;

        game.players[botId] = {
          id: botId,
          name,
          avatar: getAvailableAvatar(game),
          hand: [],
          isEliminated: false,
          journal: [],
          ready: true,
          isBot: true,
        };
        broadcastState(io, roomId);
      }
    });

    socket.on("updatePlayer", ({ roomId, name, avatar, ready }: { roomId: string, name: string, avatar: string, ready: boolean }) => {
      const game = rooms[roomId];
      if (game && game.players[socket.id]) {
        game.players[socket.id].name = name;
        game.players[socket.id].avatar = avatar;
        game.players[socket.id].ready = ready;
        broadcastState(io, roomId);
      }
    });

    socket.on("advancePhase", ({ roomId }: { roomId: string }) => {
      const game = rooms[roomId];
      if (game && game.hostId === socket.id) {
        advancePhase(io, roomId);
      }
    });

    socket.on("shareCard", ({ roomId, cardId }: { roomId: string, cardId: string }) => {
      const game = rooms[roomId];
      if (game && game.phase === "PrivateDance" && !game.players[socket.id].isEliminated) {
        const player = game.players[socket.id];
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          const card = player.hand[cardIndex];
          game.sharedCards[socket.id] = card;
          // ── Remove the card from the player's hand permanently ──
          player.hand.splice(cardIndex, 1);
          broadcastState(io, roomId);
        }
      }
    });

    socket.on("vote", ({ roomId, targetId }: { roomId: string, targetId: string }) => {
      const game = rooms[roomId];
      if (game && game.phase === "EliminationVote" && !game.players[socket.id].isEliminated) {
        game.votes[socket.id] = targetId;
        broadcastState(io, roomId);
      }
    });

    socket.on("kickPlayer", ({ roomId, playerId }: { roomId: string, playerId: string }) => {
      const game = rooms[roomId];
      if (game && game.hostId === socket.id && game.players[playerId]) {
        delete game.players[playerId];
        broadcastState(io, roomId);
      }
    });

    socket.on("endGame", ({ roomId }: { roomId: string }) => {
      const game = rooms[roomId];
      if (game && game.hostId === socket.id) {
        game.phase = "Lobby";
        game.round = 0;
        game.winner = undefined;
        game.eliminatedThisRound = null;
        game.currentMotif = undefined;
        game.dancePairs = {};
        game.sharedCards = {};
        game.votes = {};
        game.consecutiveMajorityEliminations = 0;
        for (const pid in game.players) {
          game.players[pid].isEliminated = false;
          game.players[pid].hand = [];
          game.players[pid].journal = [];
          game.players[pid].alliance = undefined;
          game.players[pid].ready = false;
        }
        broadcastState(io, roomId);
      }
    });

    socket.on("disconnect", () => {
      for (const roomId in rooms) {
        const game = rooms[roomId];
        if (game.players[socket.id]) {
          if (game.phase === "Lobby") {
            delete game.players[socket.id];
            if (Object.keys(game.players).length === 0) {
              delete rooms[roomId];
            } else {
              if (game.hostId === socket.id) {
                game.hostId = Object.keys(game.players)[0];
              }
              broadcastState(io, roomId);
            }
          }
        }
      }
    });
  });
}

function broadcastState(io: Server, roomId: string) {
  const game = rooms[roomId];
  if (!game) return;

  for (const playerId in game.players) {
    const player = game.players[playerId];
    if (player.isBot) continue;

    const clientState: ClientGameState = {
      roomId: game.roomId,
      hostId: game.hostId,
      phase: game.phase,
      round: game.round,
      currentMotif: null,
      dancePairs: game.dancePairs,
      danceRequests: game.danceRequests,
      sharedCards: {},
      votes: game.votes,
      eliminatedThisRound: game.eliminatedThisRound,
      winner: game.winner,
      remainingMajority: game.remainingMajority,
      remainingMinority: game.remainingMinority,
      allPairsShared: false,
      players: {},
    };

    if (game.phase !== "Lobby" && game.phase !== "Dealing" && game.phase !== "GameOver" && player.alliance) {
      clientState.currentMotif = game.allianceMotifs[player.alliance];
    }

    if (game.phase === "PrivateDance") {
      const partnerId = game.dancePairs[playerId] || Object.keys(game.dancePairs).find(id => game.dancePairs[id] === playerId);
      if (game.sharedCards[playerId]) {
        clientState.sharedCards[playerId] = game.sharedCards[playerId];
      }
      if (partnerId && game.sharedCards[partnerId]) {
        clientState.sharedCards[partnerId] = game.sharedCards[partnerId];
      }
      
      const activePlayersInPairs = Object.keys(game.dancePairs);
      clientState.allPairsShared = activePlayersInPairs.length === 0 || activePlayersInPairs.every(pid => {
        const p2 = game.dancePairs[pid];
        return game.sharedCards[pid] && game.sharedCards[p2];
      });
    }

    for (const pid in game.players) {
      const p = game.players[pid];
      const isMe = pid === playerId;
      
      clientState.players[pid] = {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isEliminated: p.isEliminated,
        ready: p.ready,
        isMe,
        isBot: p.isBot,
        isHost: pid === game.hostId,
      };

      if (isMe) {
        clientState.players[pid].alliance = p.alliance;
        clientState.players[pid].hand = p.hand;
        clientState.players[pid].journal = p.journal;
      } else if (p.isEliminated || game.phase === "GameOver") {
        clientState.players[pid].alliance = p.alliance;
      }
    }

    io.to(playerId).emit("gameState", clientState);
  }
}

function advancePhase(io: Server, roomId: string) {
  const game = rooms[roomId];
  if (!game) return;

  switch (game.phase) {
    case "Lobby":
      startGame(io, roomId);
      break;
    case "RoleReveal":
      game.phase = "Dealing";
      broadcastState(io, roomId);
      break;
    case "Dealing":
      game.phase = "MotifReveal";
      broadcastState(io, roomId);
      break;
    case "MotifReveal":
      startPrivateDance(io, roomId);
      break;
    case "PrivateDance":
      startGossipSalon(io, roomId);
      break;
    case "GossipSalon":
      startEliminationVote(io, roomId);
      break;
    case "EliminationVote":
      if (game.eliminatedThisRound) {
        if (game.winner) {
          game.phase = "GameOver";
        } else {
          game.round++;
          game.eliminatedThisRound = null;
          game.phase = "MotifReveal";
        }
        broadcastState(io, roomId);
      } else {
        resolveVote(io, roomId);
      }
      break;
    case "GameOver":
      break;
  }
}

function startGame(io: Server, roomId: string) {
  const game = rooms[roomId];
  const playerIds = Object.keys(game.players);
  const playerCount = playerIds.length;
  
  if (playerCount < 4) return;

  game.round = 1;

  let majSize = 3;
  let minSize = 1;

  if (playerCount === 5) { majSize = 3; minSize = 2; }
  else if (playerCount === 6) { majSize = 4; minSize = 2; }
  else if (playerCount === 7) { majSize = 4; minSize = 3; }
  else if (playerCount === 8) { majSize = 5; minSize = 3; }
  else if (playerCount === 9) { 
    if (Math.random() > 0.5) { majSize = 5; minSize = 4; }
    else { majSize = 6; minSize = 3; }
  }
  else if (playerCount >= 10) { majSize = 6; minSize = 4; }

  game.remainingMajority = majSize;
  game.remainingMinority = minSize;

  const shuffledIds = [...playerIds].sort(() => Math.random() - 0.5);
  for (let i = 0; i < playerCount; i++) {
    const pid = shuffledIds[i];
    game.players[pid].alliance = i < majSize ? "Majority" : "Minority";
    
    const images = [...IMAGE_CARDS].sort(() => Math.random() - 0.5).slice(0, 5);
    const words = [...WORD_CARDS].sort(() => Math.random() - 0.5).slice(0, 5);
    game.players[pid].hand = [...images, ...words].map(c => ({...c, id: uuidv4()}));
  }

  const shuffledMotifs = [...MOTIFS].sort(() => Math.random() - 0.5);
  game.allianceMotifs["Majority"] = shuffledMotifs[0].text;
  game.allianceKeywords["Majority"] = shuffledMotifs[0].keywords;
  game.allianceMotifs["Minority"] = shuffledMotifs[1].text;
  game.allianceKeywords["Minority"] = shuffledMotifs[1].keywords;

  game.phase = "RoleReveal";
  broadcastState(io, roomId);
}

function startPrivateDance(io: Server, roomId: string) {
  const game = rooms[roomId];
  game.phase = "PrivateDance";
  game.sharedCards = {};

  const activePlayers = Object.values(game.players).filter(p => !p.isEliminated).map(p => p.id);
  const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
  const pairs: Record<string, string> = {};
  
  for (let i = 0; i < shuffled.length; i++) {
    pairs[shuffled[i]] = shuffled[(i + 1) % shuffled.length];
  }
  game.dancePairs = pairs;

  // Bots share a random card and remove it from their hand
  for (const pid of activePlayers) {
    const p = game.players[pid];
    if (p.isBot && p.hand.length > 0 && pairs[pid]) {
      const cardIndex = Math.floor(Math.random() * p.hand.length);
      game.sharedCards[pid] = p.hand[cardIndex];
      p.hand.splice(cardIndex, 1);
    }
  }

  broadcastState(io, roomId);
}

function startGossipSalon(io: Server, roomId: string) {
  const game = rooms[roomId];
  game.phase = "GossipSalon";
  
  for (const playerId in game.dancePairs) {
    const senderId = Object.keys(game.dancePairs).find(id => game.dancePairs[id] === playerId);
    if (senderId) {
      const sharedCard = game.sharedCards[senderId];
      if (sharedCard) {
        game.players[playerId].journal.push({
          round: game.round,
          partnerId: senderId,
          partnerName: game.players[senderId].name,
          receivedCard: sharedCard
        });
      }
    }
  }

  broadcastState(io, roomId);
}

function startEliminationVote(io: Server, roomId: string) {
  const game = rooms[roomId];
  game.phase = "EliminationVote";
  game.votes = {};

  const activePlayers = Object.values(game.players).filter(p => !p.isEliminated);
  for (const p of activePlayers) {
    if (p.isBot) {
      const others = activePlayers.filter(other => other.id !== p.id);
      if (others.length > 0) {
        game.votes[p.id] = others[Math.floor(Math.random() * others.length)].id;
      }
    }
  }

  broadcastState(io, roomId);
}

function resolveVote(io: Server, roomId: string) {
  const game = rooms[roomId];
  
  const voteCounts: Record<string, number> = {};
  for (const voterId in game.votes) {
    const targetId = game.votes[voterId];
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  }

  let maxVotes = 0;
  let eliminatedId: string | null = null;
  let tie = false;

  for (const targetId in voteCounts) {
    if (voteCounts[targetId] > maxVotes) {
      maxVotes = voteCounts[targetId];
      eliminatedId = targetId;
      tie = false;
    } else if (voteCounts[targetId] === maxVotes) {
      tie = true;
    }
  }

  if (tie || !eliminatedId) {
    const tied = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);
    eliminatedId = tied[Math.floor(Math.random() * tied.length)];
  }

  game.eliminatedThisRound = eliminatedId;
  const eliminatedPlayer = game.players[eliminatedId];
  eliminatedPlayer.isEliminated = true;

  const activePlayers = Object.values(game.players).filter(p => !p.isEliminated);
  const numMajority = activePlayers.filter(p => p.alliance === "Majority").length;
  const numMinority = activePlayers.filter(p => p.alliance === "Minority").length;

  game.remainingMajority = numMajority;
  game.remainingMinority = numMinority;

  // Track consecutive majority eliminations for minority win condition.
  // Minority wins by eliminating majority twice in a row.
  // Any minority elimination resets the streak.
  if (eliminatedPlayer.alliance === "Majority") {
    game.consecutiveMajorityEliminations = (game.consecutiveMajorityEliminations || 0) + 1;
  } else {
    game.consecutiveMajorityEliminations = 0;
  }

  if (numMinority === 0) {
    // Majority wins: all minority eliminated
    game.winner = "Majority";
  } else if (game.consecutiveMajorityEliminations >= 2) {
    // Minority wins: eliminated majority twice in a row
    game.winner = "Minority";
  }

  broadcastState(io, roomId);
}