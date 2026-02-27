import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { ClientGameState } from "../shared/types.js";

interface GameStore {
  socket: Socket | null;
  gameState: ClientGameState | null;
  connect: (roomId: string, name: string, avatar: string) => void;
  updatePlayer: (name: string, avatar: string, ready: boolean) => void;
  addBot: () => void;
  advancePhase: () => void;
  requestDance: (targetId: string) => void;
  shareCard: (cardId: string) => void;
  vote: (targetId: string) => void;
  kickPlayer: (playerId: string) => void;
  endGame: () => void;
  setGameMode: (gameMode: "BattleRoyale" | "LionsVsSnakes") => void;
  chooseForcedElimination: (targetId: string) => void;
  submitAllianceGuess: (alliance: "Majority" | "Minority") => void;
  setRevealMotifDuringDiscussion: (enabled: boolean) => void;
  setRevealMotifDuringElimination: (enabled: boolean) => void;
  leaveRoom: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  gameState: null,
  connect: (roomId, name, avatar) => {
    console.log("Connecting to socket...");
    const socket = io();
    
    socket.on("connect", () => {
      console.log("Socket connected! Joining room:", roomId);
      socket.emit("joinRoom", { roomId, name, avatar });
    });
    
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    socket.on("gameState", (state: ClientGameState) => {
      console.log("Received game state:", state);
      set({ gameState: state });
    });
    
    set({ socket });
  },
  updatePlayer: (name, avatar, ready) => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("updatePlayer", { roomId: gameState.roomId, name, avatar, ready });
    }
  },
  addBot: () => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("addBot", { roomId: gameState.roomId });
    }
  },
  advancePhase: () => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("advancePhase", { roomId: gameState.roomId });
    }
  },
  requestDance: (targetId) => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("danceRequest", { roomId: gameState.roomId, targetId });
    }
  },
  shareCard: (cardId) => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("shareCard", { roomId: gameState.roomId, cardId });
    }
  },
  vote: (targetId) => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("vote", { roomId: gameState.roomId, targetId });
    }
  },
  kickPlayer: (playerId) => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("kickPlayer", { roomId: gameState.roomId, playerId });
    }
  },
  endGame: () => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("endGame", { roomId: gameState.roomId });
    }
  },
  setGameMode: (gameMode) => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("setGameMode", { roomId: gameState.roomId, gameMode });
    }
  },
  chooseForcedElimination: (targetId) => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("chooseForcedElimination", { roomId: gameState.roomId, targetId });
    }
  },
  submitAllianceGuess: (alliance) => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("submitAllianceGuess", { roomId: gameState.roomId, alliance });
    }
  },

  setRevealMotifDuringDiscussion: (enabled) => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("setRevealMotifDuringDiscussion", { roomId: gameState.roomId, enabled });
    }
  },
  setRevealMotifDuringElimination: (enabled) => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("setRevealMotifDuringElimination", { roomId: gameState.roomId, enabled });
    }
  },
  leaveRoom: () => {
    const { socket, gameState } = get();
    if (socket && gameState) {
      socket.emit("leaveRoom", { roomId: gameState.roomId });
      socket.disconnect();
    }
    set({ socket: null, gameState: null });
  },
}));
