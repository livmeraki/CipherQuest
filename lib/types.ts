export type CipherType = "caesar" | "substitution" | "vigenere";

export type HintSet = [string, string, string];

export interface Clue {
  id: string;
  clueIndex: number;
  encryptedText: string;
  plaintextText: string;
  cipherType: CipherType;
  cipherKey: string;
  hints: HintSet;
}

export interface Round {
  id: string;
  orderIndex: number;
  title: string;
  story: string;
  cipherType: CipherType;
  cipherKey: string;
  finalQuestion: string;
  acceptedAnswers: string[];
  explanation: string;
  clues: Clue[];
}

export interface Quest {
  id: string;
  lesson: "Lesson 1" | "Lesson 2";
  title: string;
  description: string;
  rounds: Round[];
}

export interface Student {
  id: string;
  nickname: string;
  teamId: string | null;
  currentRoundId: string;
  clueId: string | null;
  clueIds?: string[];
  solvedClueIds?: string[];
  status: "waiting" | "working" | "submitted" | "correct" | "needs_help";
  connectionStatus: "online" | "offline";
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  memberIds: string[];
  finalAnswers: Record<string, { answer: string; isCorrect: boolean; submittedAt: string }>;
}

export interface ClassSession {
  id: string;
  code: string;
  questId: string;
  currentRoundId: string;
  status: "waiting" | "active" | "paused" | "ended";
  isLocked: boolean;
  students: Student[];
  teams: Team[];
  createdAt: string;
}
