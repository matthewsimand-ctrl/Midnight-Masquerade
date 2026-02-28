import { Server, Socket } from "socket.io";
import { GameState, Card, ClientGameState } from "../shared/types.js";
import { v4 as uuidv4 } from "uuid";

// Content data loaded at startup
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

type MotifContent = { text: string; keywords: string[] };

type JsonCardContent = string[];

function loadJsonFile<T>(relativePath: string): T {
  const baseDir = dirname(fileURLToPath(import.meta.url));
  const filePath = resolve(baseDir, relativePath);
  const fileContents = readFileSync(filePath, "utf8");
  return JSON.parse(fileContents) as T;
}

const MOTIFS = loadJsonFile<MotifContent[]>("../content/motifs.json");

const IMAGE_CARDS: Card[] = loadJsonFile<JsonCardContent>("../content/images.json").map((url, i) => ({
  id: `i${i}`,
  type: "Image",
  content: url,
}));

const WORD_CARDS: Card[] = loadJsonFile<JsonCardContent>("../content/words.json").map((word, i) => ({
  id: `w${i}`,
  type: "Word",
  content: word,
}));

const rooms: Record<string, GameState> = {};

const AVATARS = ["🎭", "🦊", "🦉", "🦇", "🐺", "🐍", "🦋", "🕷️", "🦚", "🦢"];

function drawReplacementCard(): Card {
  const sourcePool = Math.random() < 0.5 ? IMAGE_CARDS : WORD_CARDS;
  const randomCard = sourcePool[Math.floor(Math.random() * sourcePool.length)];
  return { ...randomCard, id: uuidv4() };
}

function isMajorityAlliance(alliance?: string) {
  return alliance?.toLowerCase() === "majority";
}

export function getForcedMajorityCandidates(game: GameState, votedPlayerId: string) {
  return Object.values(game.players)
    .filter((p) => !p.isEliminated && isMajorityAlliance(p.alliance) && p.id !== votedPlayerId)
    .map((p) => p.id);
}

function getBattleRoyaleSplit(playerCount: number) {
  if (playerCount % 2 === 0) {
    return {
      majority: Math.max(playerCount / 2 + 1, 0),
      minority: Math.max(playerCount / 2 - 1, 0),
    };
  }

  return {
    majority: Math.ceil(playerCount / 2),
    minority: Math.floor(playerCount / 2),
  };
}



function getTiedLeaders(voteCounts: Record<string, number>) {
  let maxVotes = 0;
  for (const targetId in voteCounts) {
    maxVotes = Math.max(maxVotes, voteCounts[targetId]);
  }

  if (maxVotes <= 0) return [];
  return Object.keys(voteCounts).filter((id) => voteCounts[id] === maxVotes);
}

function isPlayerActive(game: GameState, playerId: string) {
  return Boolean(game.players[playerId] && !game.players[playerId].isEliminated);
}

function getAvailableAvatar(game: GameState): string {
  const usedAvatars = Object.values(game.players).map(p => p.avatar);
  const available = AVATARS.filter(a => !usedAvatars.includes(a));
  return available.length > 0 ? available[0] : "🎭";
}

function assignNewAllianceMotifs(game: GameState) {
  const usedMotifs = new Set(game.usedMotifs || []);
  const availableMotifs = MOTIFS.filter((motif) => !usedMotifs.has(motif.text));

  if (availableMotifs.length < 2) {
    game.usedMotifs = [];
    availableMotifs.push(...MOTIFS);
  }

  const shuffledMotifs = [...availableMotifs].sort(() => Math.random() - 0.5);
  game.allianceMotifs["Majority"] = shuffledMotifs[0].text;
  game.allianceKeywords["Majority"] = shuffledMotifs[0].keywords;
  game.allianceMotifs["Minority"] = shuffledMotifs[1].text;
  game.allianceKeywords["Minority"] = shuffledMotifs[1].keywords;
  game.usedMotifs = [
    ...(game.usedMotifs || []),
    shuffledMotifs[0].text,
    shuffledMotifs[1].text,
  ];
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
          gameMode: "BattleRoyale",
          forcedEliminationChooserId: null,
          forcedEliminationCandidates: [],
          coWinners: [],
          consecutiveMajorityEliminations: 0,
          usedMotifs: [],
          tiebreakerStage: "None",
          tiebreakerTiedPlayerIds: [],
          allianceGuesses: {},
          revealMotifDuringDiscussion: false,
          revealMotifDuringElimination: false,
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

    socket.on("setGameMode", ({ roomId, gameMode }: { roomId: string, gameMode: "BattleRoyale" | "LionsVsSnakes" }) => {
      const game = rooms[roomId];
      if (game && game.hostId === socket.id && game.phase === "Lobby") {
        game.gameMode = gameMode;
        broadcastState(io, roomId);
      }
    });


    socket.on("setRevealMotifDuringDiscussion", ({ roomId, enabled }: { roomId: string, enabled: boolean }) => {
      const game = rooms[roomId];
      if (game && game.hostId === socket.id && game.phase === "Lobby") {
        game.revealMotifDuringDiscussion = enabled;
        broadcastState(io, roomId);
      }
    });

    socket.on("setRevealMotifDuringElimination", ({ roomId, enabled }: { roomId: string, enabled: boolean }) => {
      const game = rooms[roomId];
      if (game && game.hostId === socket.id && game.phase === "Lobby") {
        game.revealMotifDuringElimination = enabled;
        broadcastState(io, roomId);
      }
    });

    socket.on("leaveRoom", ({ roomId }: { roomId: string }) => {
      const game = rooms[roomId];
      if (!game || !game.players[socket.id]) return;

      if (game.phase !== "Lobby") return;

      delete game.players[socket.id];
      socket.leave(roomId);

      if (Object.keys(game.players).length === 0) {
        delete rooms[roomId];
        return;
      }

      if (game.hostId === socket.id) {
        game.hostId = Object.keys(game.players)[0];
      }

      broadcastState(io, roomId);
    });

    socket.on("shareCard", ({ roomId, cardId }: { roomId: string, cardId: string }) => {
      const game = rooms[roomId];
      if (game && game.phase === "PrivateDance" && !game.players[socket.id].isEliminated) {
        const player = game.players[socket.id];
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          const card = player.hand[cardIndex];
          game.sharedCards[socket.id] = card;
          player.hand.splice(cardIndex, 1);
          if (game.gameMode === "BattleRoyale") {
            player.hand.push(drawReplacementCard());
          }
          broadcastState(io, roomId);
        }
      }
    });

    socket.on("vote", ({ roomId, targetId }: { roomId: string, targetId: string }) => {
      const game = rooms[roomId];
      if (!game || game.phase !== "EliminationVote" || !isPlayerActive(game, socket.id)) {
        return;
      }

      if (!isPlayerActive(game, targetId)) {
        return;
      }

      const tiedIds = game.tiebreakerTiedPlayerIds || [];
      if (game.tiebreakerStage === "Revote") {
        const isTiedVoter = tiedIds.includes(socket.id);
        const isTiedTarget = tiedIds.includes(targetId);
        if (isTiedVoter || !isTiedTarget) {
          return;
        }
      }

      game.votes[socket.id] = targetId;
      broadcastState(io, roomId);
    });

    socket.on("kickPlayer", ({ roomId, playerId }: { roomId: string, playerId: string }) => {
      const game = rooms[roomId];
      if (game && game.hostId === socket.id && game.players[playerId]) {
        delete game.players[playerId];
        broadcastState(io, roomId);
      }
    });

    socket.on("chooseForcedElimination", ({ roomId, targetId }: { roomId: string, targetId: string }) => {
      const game = rooms[roomId];
      if (
        game &&
        game.phase === "EliminationVote" &&
        game.gameMode === "BattleRoyale" &&
        game.forcedEliminationChooserId === socket.id &&
        game.forcedEliminationCandidates?.includes(targetId)
      ) {
        applyElimination(io, roomId, targetId);
      }
    });

    socket.on("submitAllianceGuess", ({ roomId, alliance }: { roomId: string, alliance: "Majority" | "Minority" }) => {
      const game = rooms[roomId];
      if (!game || game.phase !== "EliminationVote" || game.tiebreakerStage !== "AllianceGuess") {
        return;
      }

      if (!isPlayerActive(game, socket.id)) {
        return;
      }

      game.allianceGuesses = game.allianceGuesses || {};
      game.allianceGuesses[socket.id] = alliance;

      broadcastState(io, roomId);
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
        game.usedMotifs = [];
        game.forcedEliminationChooserId = null;
        game.forcedEliminationCandidates = [];
        game.coWinners = [];
        game.tiebreakerStage = "None";
        game.tiebreakerTiedPlayerIds = [];
        game.allianceGuesses = {};
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
      gameMode: game.gameMode,
      forcedEliminationChooserId: game.forcedEliminationChooserId,
      forcedEliminationCandidates: game.forcedEliminationCandidates,
      coWinners: game.coWinners,
      revealMotifDuringDiscussion: game.revealMotifDuringDiscussion,
      revealMotifDuringElimination: game.revealMotifDuringElimination,
      revealedAllianceMotifs: (
        (game.phase === "GossipSalon" && game.revealMotifDuringDiscussion) ||
        ((game.phase === "GameOver" || game.eliminatedThisRound) && game.revealMotifDuringElimination)
      )
        ? game.allianceMotifs
        : undefined,
      tiebreakerStage: game.tiebreakerStage || "None",
      tiebreakerTiedPlayerIds: game.tiebreakerTiedPlayerIds || [],
      allianceGuesses: game.allianceGuesses || {},
      players: {},
    };

    if (game.phase !== "Lobby" && game.phase !== "Dealing" && game.phase !== "GossipSalon" && game.phase !== "GameOver" && player.alliance) {
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
      if (game.gameMode === "BattleRoyale" && game.forcedEliminationChooserId) {
        broadcastState(io, roomId);
        break;
      }
      if (game.eliminatedThisRound) {
        if (game.winner) {
          game.phase = "GameOver";
        } else if (game.gameMode === "BattleRoyale" && (game.coWinners?.length || 0) === 2) {
          game.phase = "GameOver";
        } else {
          game.round++;
          game.eliminatedThisRound = null;
          assignNewAllianceMotifs(game);
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

  if (game.gameMode === "BattleRoyale") {
    const split = getBattleRoyaleSplit(playerCount);
    majSize = split.majority;
    minSize = split.minority;
  } else {
    if (playerCount === 5) { majSize = 3; minSize = 2; }
    else if (playerCount === 6) { majSize = 4; minSize = 2; }
    else if (playerCount === 7) { majSize = 4; minSize = 3; }
    else if (playerCount === 8) { majSize = 5; minSize = 3; }
    else if (playerCount === 9) {
      if (Math.random() > 0.5) { majSize = 5; minSize = 4; }
      else { majSize = 6; minSize = 3; }
    }
    else if (playerCount >= 10) { majSize = 6; minSize = 4; }
  }

  game.remainingMajority = majSize;
  game.remainingMinority = minSize;

  const shuffledIds = [...playerIds].sort(() => Math.random() - 0.5);
  for (let i = 0; i < playerCount; i++) {
    const pid = shuffledIds[i];
    game.players[pid].alliance = i < majSize ? "Majority" : "Minority";
    
    const images = [...IMAGE_CARDS].sort(() => Math.random() - 0.5).slice(0, 7);
    const words = [...WORD_CARDS].sort(() => Math.random() - 0.5).slice(0, 8);
    game.players[pid].hand = [...images, ...words].map(c => ({...c, id: uuidv4()}));
  }

  game.usedMotifs = [];
  assignNewAllianceMotifs(game);

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

  // Bots share a random card and, in Battle Royale, immediately draw a replacement.
  for (const pid of activePlayers) {
    const p = game.players[pid];
    if (p.isBot && p.hand.length > 0 && pairs[pid]) {
      const cardIndex = Math.floor(Math.random() * p.hand.length);
      game.sharedCards[pid] = p.hand[cardIndex];
      p.hand.splice(cardIndex, 1);
      if (game.gameMode === "BattleRoyale") {
        p.hand.push(drawReplacementCard());
      }
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
  game.forcedEliminationChooserId = null;
  game.forcedEliminationCandidates = [];
  game.tiebreakerStage = "None";
  game.tiebreakerTiedPlayerIds = [];
  game.allianceGuesses = {};

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
  if (!game) return;

  const activePlayerIds = Object.values(game.players)
    .filter((player) => !player.isEliminated)
    .map((player) => player.id);

  if (activePlayerIds.length === 0) {
    return;
  }

  const activePlayerIdSet = new Set(activePlayerIds);
  const voteCounts: Record<string, number> = {};
  for (const voterId in game.votes) {
    if (!activePlayerIdSet.has(voterId)) continue;

    const targetId = game.votes[voterId];
    if (!activePlayerIdSet.has(targetId)) continue;

    if (game.tiebreakerStage === "Revote") {
      const tiedIds = game.tiebreakerTiedPlayerIds || [];
      if (tiedIds.includes(voterId) || !tiedIds.includes(targetId)) {
        continue;
      }
    }

    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  }

  const tiedLeaders = getTiedLeaders(voteCounts);

  if (tiedLeaders.length > 1) {
    if (game.tiebreakerStage !== "Revote") {
      game.tiebreakerStage = "Revote";
      game.tiebreakerTiedPlayerIds = tiedLeaders;
      game.votes = {};

      for (const pid of activePlayerIds) {
        const p = game.players[pid];
        const isTiedPlayer = tiedLeaders.includes(pid);
        if (!p.isBot || isTiedPlayer) continue;

        game.votes[pid] = tiedLeaders[Math.floor(Math.random() * tiedLeaders.length)];
      }

      broadcastState(io, roomId);
      return;
    }

    if (game.tiebreakerStage !== "AllianceGuess") {
      if (game.gameMode === "BattleRoyale") {
        game.tiebreakerStage = "AllianceGuess";
        game.tiebreakerTiedPlayerIds = tiedLeaders;
        game.votes = {};
        game.allianceGuesses = {};

        for (const pid of activePlayerIds) {
          const p = game.players[pid];
          if (!p.isBot) continue;
          game.allianceGuesses[pid] = Math.random() < 0.5 ? "Majority" : "Minority";
        }

        broadcastState(io, roomId);
        return;
      }

      const lions = tiedLeaders.filter((id) => game.players[id].alliance === "Majority");
      const pool = lions.length > 0 ? lions : tiedLeaders;
      const eliminatedId = pool[Math.floor(Math.random() * pool.length)];
      applyElimination(io, roomId, eliminatedId);
      return;
    }
  }

  if (game.tiebreakerStage === "AllianceGuess") {
    const guesses = game.allianceGuesses || {};
    const incorrectGuesses = activePlayerIds.filter((id) => {
      const guess = guesses[id];
      const alliance = game.players[id].alliance;
      return guess && alliance && guess !== alliance;
    });

    if (incorrectGuesses.length > 0) {
      applyEliminations(io, roomId, incorrectGuesses);
      return;
    }

    game.eliminatedThisRound = "NONE";
    game.tiebreakerStage = "None";
    game.tiebreakerTiedPlayerIds = [];
    game.allianceGuesses = {};
    broadcastState(io, roomId);
    return;
  }

  let eliminatedId = tiedLeaders[0] || null;
  if (!eliminatedId) {
    eliminatedId = activePlayerIds[Math.floor(Math.random() * activePlayerIds.length)];
  }

  if (game.gameMode === "BattleRoyale") {
    const votedPlayer = game.players[eliminatedId];

    if (votedPlayer.alliance === "Minority") {
      applyElimination(io, roomId, eliminatedId);
      return;
    }

    const activeMajorityIds = getForcedMajorityCandidates(game, eliminatedId);

    game.forcedEliminationChooserId = eliminatedId;
    game.forcedEliminationCandidates = activeMajorityIds;

    if (activeMajorityIds.length === 0) {
      game.forcedEliminationChooserId = null;
      game.forcedEliminationCandidates = [];
      game.votes = {};
      broadcastState(io, roomId);
      return;
    }

    if (game.players[eliminatedId].isBot && activeMajorityIds.length > 0) {
      const selectedTarget = activeMajorityIds[Math.floor(Math.random() * activeMajorityIds.length)];
      applyElimination(io, roomId, selectedTarget);
      return;
    }

    broadcastState(io, roomId);
    return;
  }

  applyElimination(io, roomId, eliminatedId);
}

function applyEliminations(io: Server, roomId: string, eliminatedIds: string[]) {
  const uniqueEliminatedIds = Array.from(new Set(eliminatedIds));
  const game = rooms[roomId];
  if (!game || uniqueEliminatedIds.length === 0) return;

  let lastEliminatedId = uniqueEliminatedIds[0];
  for (const eliminatedId of uniqueEliminatedIds) {
    if (!game.players[eliminatedId] || game.players[eliminatedId].isEliminated) continue;
    game.players[eliminatedId].isEliminated = true;
    lastEliminatedId = eliminatedId;
  }

  game.eliminatedThisRound = lastEliminatedId;
  game.forcedEliminationChooserId = null;
  game.forcedEliminationCandidates = [];
  game.tiebreakerStage = "None";
  game.tiebreakerTiedPlayerIds = [];
  game.allianceGuesses = {};

  const activePlayers = Object.values(game.players).filter((p) => !p.isEliminated);
  const activeCount = activePlayers.length;

  if (game.gameMode === "BattleRoyale" && activeCount <= 2) {
    game.remainingMajority = activePlayers.filter((p) => p.alliance === "Majority").length;
    game.remainingMinority = activePlayers.filter((p) => p.alliance === "Minority").length;
    game.coWinners = activePlayers.map((p) => p.id);
    game.winner = null;
    game.phase = "GameOver";
    broadcastState(io, roomId);
    return;
  }

  if (game.gameMode === "BattleRoyale") {
    const split = getBattleRoyaleSplit(activeCount);
    const shuffledActiveIds = activePlayers.map((p) => p.id).sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffledActiveIds.length; i++) {
      const pid = shuffledActiveIds[i];
      game.players[pid].alliance = i < split.majority ? "Majority" : "Minority";
    }
  }

  const refreshedActivePlayers = Object.values(game.players).filter((p) => !p.isEliminated);
  game.remainingMajority = refreshedActivePlayers.filter((p) => p.alliance === "Majority").length;
  game.remainingMinority = refreshedActivePlayers.filter((p) => p.alliance === "Minority").length;

  if (game.gameMode === "LionsVsSnakes") {
    const eliminatedAllMajority = uniqueEliminatedIds.every((id) => game.players[id]?.alliance === "Majority");
    game.consecutiveMajorityEliminations = eliminatedAllMajority
      ? (game.consecutiveMajorityEliminations || 0) + 1
      : 0;

    if (game.remainingMinority === 0) {
      game.winner = "Majority";
    } else if (game.consecutiveMajorityEliminations >= 2 || game.remainingMajority <= game.remainingMinority) {
      game.winner = "Minority";
    }
  }

  broadcastState(io, roomId);
}

function applyElimination(io: Server, roomId: string, eliminatedId: string) {
  const game = rooms[roomId];
  if (!game || (game.players[eliminatedId].isEliminated && game.eliminatedThisRound !== eliminatedId)) return;

  game.eliminatedThisRound = eliminatedId;
  const eliminatedPlayer = game.players[eliminatedId];
  eliminatedPlayer.isEliminated = true;
  game.forcedEliminationChooserId = null;
  game.forcedEliminationCandidates = [];
  game.tiebreakerStage = "None";
  game.tiebreakerTiedPlayerIds = [];
  game.allianceGuesses = {};

  const activePlayers = Object.values(game.players).filter(p => !p.isEliminated);
  const activeCount = activePlayers.length;

  if (game.gameMode === "BattleRoyale" && activeCount <= 2) {
    game.remainingMajority = activePlayers.filter(p => p.alliance === "Majority").length;
    game.remainingMinority = activePlayers.filter(p => p.alliance === "Minority").length;
    game.coWinners = activePlayers.map((p) => p.id);
    game.winner = null;
    game.phase = "GameOver";
    broadcastState(io, roomId);
    return;
  }

  if (game.gameMode === "BattleRoyale") {
    const split = getBattleRoyaleSplit(activeCount);
    const shuffledActiveIds = activePlayers.map((p) => p.id).sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffledActiveIds.length; i++) {
      const pid = shuffledActiveIds[i];
      game.players[pid].alliance = i < split.majority ? "Majority" : "Minority";
    }
  }

  const refreshedActivePlayers = Object.values(game.players).filter(p => !p.isEliminated);
  const numMajority = refreshedActivePlayers.filter(p => p.alliance === "Majority").length;
  const numMinority = refreshedActivePlayers.filter(p => p.alliance === "Minority").length;

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

  if (game.gameMode === "LionsVsSnakes") {
    if (numMinority === 0) {
      game.winner = "Majority";
    } else if (game.consecutiveMajorityEliminations >= 2 || numMajority <= numMinority) {
      game.winner = "Minority";
    }
  }

  broadcastState(io, roomId);
}