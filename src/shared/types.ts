export type Alliance = "Majority" | "Minority";
export type GameMode = "BattleRoyale" | "LionsVsSnakes";
export type CardType = "Image" | "Word";

export interface Card {
  id: string;
  type: CardType;
  content: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  alliance?: Alliance;
  hand: Card[];
  isEliminated: boolean;
  journal: JournalEntry[];
  ready: boolean;
  isBot: boolean;
}

export interface JournalEntry {
  round: number;
  partnerId: string;
  partnerName: string;
  receivedCard: Card;
}

export type GamePhase = "Lobby" | "RoleReveal" | "Dealing" | "MotifReveal" | "DancePairing" | "PrivateDance" | "GossipSalon" | "EliminationVote" | "GameOver";

export interface GameState {
  roomId: string;
  hostId: string;
  players: Record<string, Player>;
  phase: GamePhase;
  round: number;
  maxRounds: number;
  allianceMotifs: Record<string, string>;
  allianceKeywords: Record<string, string[]>;
  currentMotif?: string | null;
  minorityPenaltyRound: boolean;
  dancePairs: Record<string, string>;
  danceRequests: Record<string, string>;
  sharedCards: Record<string, Card>;
  votes: Record<string, string>;
  eliminatedThisRound: string | null;
  winner: Alliance | null;
  remainingMajority: number;
  remainingMinority: number;
  consecutiveMajorityEliminations?: number;
  gameMode: GameMode;
  forcedEliminationChooserId?: string | null;
  forcedEliminationCandidates?: string[];
  coWinners?: string[];
  usedMotifs?: string[];
}

export interface ClientPlayer {
  id: string;
  name: string;
  avatar: string;
  isEliminated: boolean;
  ready: boolean;
  isMe: boolean;
  isBot: boolean;
  isHost: boolean;
  alliance?: Alliance;
  hand?: Card[];
  journal?: JournalEntry[];
}

export interface ClientGameState {
  roomId: string;
  hostId: string;
  players: Record<string, ClientPlayer>;
  phase: GamePhase;
  round: number;
  currentMotif: string | null;
  dancePairs: Record<string, string>;
  danceRequests: Record<string, string>;
  sharedCards: Record<string, Card>;
  votes: Record<string, string>;
  eliminatedThisRound: string | null;
  winner: Alliance | null;
  remainingMajority: number;
  remainingMinority: number;
  allPairsShared?: boolean;
  gameMode: GameMode;
  forcedEliminationChooserId?: string | null;
  forcedEliminationCandidates?: string[];
  coWinners?: string[];
  revealedAllianceMotifs?: Record<string, string>;
}