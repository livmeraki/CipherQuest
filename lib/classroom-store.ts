"use client";

import { hasSupabaseConfig, supabase } from "./supabase";
import { quests } from "./quest-data";
import type { Round } from "./types";
import type { ClassSession, Student, Team } from "./types";

const STORAGE_KEY = "cipherquest.sessions";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readSessions(): ClassSession[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as ClassSession[];
}

function writeSessions(sessions: ClassSession[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  window.dispatchEvent(new Event("cipherquest:sessions"));
}

export function subscribeSessions(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cipherquest:sessions", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cipherquest:sessions", callback);
  };
}

export function createDemoSession(questId: string): ClassSession {
  const session = buildSession(questId);
  writeSessions([session, ...readSessions()]);
  return session;
}

function buildSession(questId: string): ClassSession {
  const quest = quests.find((item) => item.id === questId) ?? quests[0];
  return {
    id: createId(),
    code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    questId: quest.id,
    currentRoundId: quest.rounds[0].id,
    phase: "intro",
    status: "waiting",
    isLocked: false,
    students: [],
    teams: [
      { id: createId(), name: "Team Ada", memberIds: [], finalAnswers: {} },
      { id: createId(), name: "Team Turing", memberIds: [], finalAnswers: {} }
    ],
    createdAt: new Date().toISOString()
  };
}

function assignInitialClues(session: ClassSession, round: Round): ClassSession {
  const students: Student[] = session.students.map((student) => ({ ...student, clueId: null, clueIds: [], solvedClueIds: [] }));
  for (const team of session.teams) {
    const members = students.filter((student) => team.memberIds.includes(student.id));
    members.forEach((student, index) => {
      const clue = round.clues[index];
      if (clue) {
        student.clueId = clue.id;
        student.clueIds = [clue.id];
        student.status = "working";
      } else {
        student.status = "waiting";
      }
      student.currentRoundId = round.id;
    });
  }
  return { ...session, students };
}

function completeStudentClue(session: ClassSession, studentId: string): ClassSession {
  const quest = quests.find((item) => item.id === session.questId) ?? quests[0];
  const round = quest.rounds.find((item) => item.id === session.currentRoundId) ?? quest.rounds[0];
  const solver = session.students.find((student) => student.id === studentId);
  const team = solver?.teamId ? session.teams.find((item) => item.id === solver.teamId) : null;
  if (!solver || !team || !solver.clueId) return session;

  const teamStudents = session.students.filter((student) => team.memberIds.includes(student.id));
  const claimed = new Set(teamStudents.flatMap((student) => student.clueIds ?? (student.clueId ? [student.clueId] : [])));
  const solved = new Set([...(solver.solvedClueIds ?? []), solver.clueId]);
  const nextAssignedClueId = (solver.clueIds ?? []).find((clueId) => !solved.has(clueId));
  const nextClue = round.clues.find((clue) => clue.id === nextAssignedClueId) ?? round.clues.find((clue) => !claimed.has(clue.id));

  return {
    ...session,
    students: session.students.map((student) => {
      if (student.id !== studentId) return student;
      const clueIds = Array.from(new Set([...(student.clueIds ?? []), ...(nextClue ? [nextClue.id] : [])]));
      return {
        ...student,
        clueIds,
        solvedClueIds: Array.from(solved),
        clueId: nextClue?.id ?? null,
        status: nextClue ? "working" : "submitted"
      };
    })
  };
}

function removeStudentFromSession(session: ClassSession, studentId: string): ClassSession {
  const removed = session.students.find((student) => student.id === studentId);
  const remainingStudents = session.students.filter((student) => student.id !== studentId);
  const teams = session.teams.map((team) => ({
    ...team,
    memberIds: team.memberIds.filter((memberId) => memberId !== studentId)
  }));

  if (!removed?.teamId) {
    return { ...session, students: remainingStudents, teams };
  }

  const removedUnsolvedClueIds = (removed.clueIds ?? [])
    .filter((clueId) => !(removed.solvedClueIds ?? []).includes(clueId));

  if (!removedUnsolvedClueIds.length) {
    return { ...session, students: remainingStudents, teams };
  }

  const teamMemberIds = teams.find((team) => team.id === removed.teamId)?.memberIds ?? [];
  const teamMembers = remainingStudents.filter((student) => teamMemberIds.includes(student.id));

  if (!teamMembers.length) {
    return { ...session, students: remainingStudents, teams };
  }

  const reassignedStudents = remainingStudents.map((student) => ({ ...student }));
  for (const clueId of removedUnsolvedClueIds) {
    const candidates = reassignedStudents
      .filter((student) => teamMemberIds.includes(student.id))
      .sort((a, b) => (a.clueIds?.length ?? 0) - (b.clueIds?.length ?? 0));
    const recipient = candidates[0];
    if (!recipient) continue;
    recipient.clueIds = Array.from(new Set([...(recipient.clueIds ?? []), clueId]));
    if (!recipient.clueId) {
      recipient.clueId = clueId;
      recipient.status = "working";
    }
  }

  return {
    ...session,
    students: reassignedStudents,
    teams
  };
}

export function getSession(sessionId: string) {
  return readSessions().find((session) => session.id === sessionId) ?? null;
}

export function getSessionByCode(code: string) {
  return readSessions().find((session) => session.code.toUpperCase() === code.toUpperCase()) ?? null;
}

export function updateSession(sessionId: string, updater: (session: ClassSession) => ClassSession) {
  const sessions = readSessions();
  const next = sessions.map((session) => (session.id === sessionId ? updater(session) : session));
  writeSessions(next);
  return next.find((session) => session.id === sessionId) ?? null;
}

export function joinSession(code: string, nickname: string): { session: ClassSession; student: Student } {
  const session = getSessionByCode(code);
  if (!session) throw new Error("No session found for that code.");
  if (session.students.some((student) => student.nickname.toLowerCase() === nickname.toLowerCase())) {
    throw new Error("That nickname is already being used in this session.");
  }
  const quest = quests.find((item) => item.id === session.questId) ?? quests[0];
  const round = quest.rounds.find((item) => item.id === session.currentRoundId) ?? quest.rounds[0];
  const student: Student = {
    id: createId(),
    nickname,
    teamId: null,
    currentRoundId: round.id,
    clueId: null,
    clueIds: [],
    solvedClueIds: [],
    status: "waiting",
    connectionStatus: "online",
    joinedAt: new Date().toISOString()
  };
  const updated = updateSession(session.id, (current) => ({
    ...current,
    students: [...current.students, student]
  }));
  return { session: updated!, student };
}

export function setStudentStatus(sessionId: string, studentId: string, status: Student["status"]) {
  updateSession(sessionId, (session) => ({
    ...session,
    students: session.students.map((student) => (student.id === studentId ? { ...student, status } : student))
  }));
}

export function completeStudentClueSubmission(sessionId: string, studentId: string) {
  updateSession(sessionId, (session) => completeStudentClue(session, studentId));
}

export function removeStudent(sessionId: string, studentId: string) {
  updateSession(sessionId, (session) => removeStudentFromSession(session, studentId));
}

export function setStudentConnectionStatus(sessionId: string, studentId: string, connectionStatus: Student["connectionStatus"]) {
  updateSession(sessionId, (session) => ({
    ...session,
    students: session.students.map((student) => (student.id === studentId ? { ...student, connectionStatus } : student))
  }));
}

export function updateTeamAnswer(sessionId: string, teamId: string, roundId: string, answer: string, isCorrect: boolean) {
  updateSession(sessionId, (session) => ({
    ...session,
    teams: session.teams.map((team) =>
      team.id === teamId
        ? { ...team, finalAnswers: { ...team.finalAnswers, [roundId]: { answer, isCorrect, submittedAt: new Date().toISOString() } } }
        : team
    )
  }));
}

export function assignTeams(sessionId: string, teamCount = 2) {
  updateSession(sessionId, (session) => {
    const count = Math.max(1, Math.min(teamCount, Math.max(session.students.length, 1)));
    const teams: Team[] = Array.from({ length: count }, (_, index) => ({
      id: session.teams[index]?.id ?? createId(),
      name: `Team ${String.fromCharCode(65 + index)}`,
      memberIds: [],
      finalAnswers: session.teams[index]?.finalAnswers ?? {}
    }));
    const students = session.students.map((student, index) => {
      const team = teams[index % teams.length];
      team.memberIds.push(student.id);
      const status: Student["status"] = session.status === "active" ? "working" : "waiting";
      return {
        ...student,
        teamId: team.id,
        status
      };
    });
    return { ...session, teams, students };
  });
}

export function assignStudentToTeam(sessionId: string, studentId: string, teamId: string | null) {
  updateSession(sessionId, (session) => ({
    ...session,
    students: session.students.map((student) =>
      student.id === studentId
        ? {
            ...student,
            teamId,
            status: session.status === "active" && teamId ? "working" : "waiting",
            clueId: session.status === "active" ? student.clueId : null,
            clueIds: session.status === "active" ? student.clueIds : [],
            solvedClueIds: session.status === "active" ? student.solvedClueIds : []
          }
        : student
    ),
    teams: session.teams.map((team) => ({
      ...team,
      memberIds:
        team.id === teamId
          ? Array.from(new Set([...team.memberIds, studentId]))
          : team.memberIds.filter((memberId) => memberId !== studentId)
    }))
  }));
}

export function startSession(sessionId: string) {
  updateSession(sessionId, (session) => {
    const quest = quests.find((item) => item.id === session.questId) ?? quests[0];
    const round = quest.rounds.find((item) => item.id === session.currentRoundId) ?? quest.rounds[0];
    const teams = session.teams.length ? session.teams : [{ id: createId(), name: "Team A", memberIds: [], finalAnswers: {} }];
    const assignedTeams = teams.map((team) => ({ ...team, memberIds: [...team.memberIds] }));
    const students = session.students.map((student, index) => {
      let teamId = student.teamId;
      if (!teamId) {
        const team = assignedTeams[index % assignedTeams.length];
        team.memberIds.push(student.id);
        teamId = team.id;
      }
      const teamMemberIndex = assignedTeams.find((team) => team.id === teamId)?.memberIds.indexOf(student.id) ?? index;
      return {
        ...student,
        teamId,
        currentRoundId: round.id,
        clueId: round.clues[teamMemberIndex % round.clues.length].id,
        clueIds: [],
        solvedClueIds: [],
        status: "working" as const
      };
    });
    return assignInitialClues({ ...session, teams: assignedTeams, students, phase: "intro", status: "active", isLocked: false }, round);
  });
}

export function advanceRound(sessionId: string) {
  updateSession(sessionId, (session) => {
    const quest = quests.find((item) => item.id === session.questId) ?? quests[0];
    const currentIndex = quest.rounds.findIndex((round) => round.id === session.currentRoundId);
    const nextRound = quest.rounds[Math.min(currentIndex + 1, quest.rounds.length - 1)];
    return assignInitialClues({
      ...session,
      currentRoundId: nextRound.id,
      phase: "intro",
      students: session.students.map((student) => ({
        ...student,
        currentRoundId: nextRound.id,
        clueId: null,
        clueIds: [],
        solvedClueIds: [],
        status: student.teamId ? "working" : "waiting"
      }))
    }, nextRound);
  });
}

export function updateLock(sessionId: string, isLocked: boolean) {
  updateSession(sessionId, (session) => ({ ...session, isLocked, status: isLocked ? "paused" : "active" }));
}

export function updateStatus(sessionId: string, status: ClassSession["status"]) {
  updateSession(sessionId, (session) => ({ ...session, status }));
}

export function updatePhase(sessionId: string, phase: ClassSession["phase"]) {
  updateSession(sessionId, (session) => ({ ...session, phase }));
}

async function saveCloudSession(session: ClassSession) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("classroom_snapshots").upsert({
    id: session.id,
    code: session.code,
    state: session,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
  return session;
}

async function updateCloudSession(sessionId: string, updater: (session: ClassSession) => ClassSession) {
  const session = await getClassSession(sessionId);
  if (!session) throw new Error("Session not found.");
  return saveCloudSession(updater(session));
}

export async function createClassSession(questId: string) {
  const session = buildSession(questId);
  if (hasSupabaseConfig) return saveCloudSession(session);
  writeSessions([session, ...readSessions()]);
  return session;
}

export async function getClassSession(sessionId: string) {
  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase.from("classroom_snapshots").select("state").eq("id", sessionId).maybeSingle();
    if (error) throw error;
    return (data?.state as ClassSession | undefined) ?? null;
  }
  return getSession(sessionId);
}

export async function joinClassSession(code: string, nickname: string) {
  if (!hasSupabaseConfig || !supabase) return joinSession(code, nickname);
  const { data, error } = await supabase.from("classroom_snapshots").select("state").eq("code", code.toUpperCase()).maybeSingle();
  if (error) throw error;
  const session = (data?.state as ClassSession | undefined) ?? null;
  if (!session) throw new Error("No session found for that code.");
  if (session.students.some((student) => student.nickname.toLowerCase() === nickname.toLowerCase())) {
    throw new Error("That nickname is already being used in this session.");
  }
  const quest = quests.find((item) => item.id === session.questId) ?? quests[0];
  const round = quest.rounds.find((item) => item.id === session.currentRoundId) ?? quest.rounds[0];
  const student: Student = {
    id: createId(),
    nickname,
    teamId: null,
    currentRoundId: round.id,
    clueId: null,
    clueIds: [],
    solvedClueIds: [],
    status: "waiting",
    connectionStatus: "online",
    joinedAt: new Date().toISOString()
  };
  const updated = { ...session, students: [...session.students, student] };
  await saveCloudSession(updated);
  return { session: updated, student };
}

export function subscribeClassSession(sessionId: string, callback: (session: ClassSession | null) => void) {
  if (hasSupabaseConfig && supabase) {
    const client = supabase;
    void getClassSession(sessionId).then(callback).catch(() => callback(null));
    const channel = client
      .channel(`classroom:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classroom_snapshots", filter: `id=eq.${sessionId}` },
        (payload) => callback(((payload.new as { state?: ClassSession })?.state as ClassSession | undefined) ?? null)
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }
  const refresh = () => callback(getSession(sessionId));
  refresh();
  return subscribeSessions(refresh);
}

export const subscribeClassroomSession = subscribeClassSession;

export async function setStudentStatusCloud(sessionId: string, studentId: string, status: Student["status"]) {
  if (!hasSupabaseConfig) return setStudentStatus(sessionId, studentId, status);
  await updateCloudSession(sessionId, (session) => ({
    ...session,
    students: session.students.map((student) => (student.id === studentId ? { ...student, status } : student))
  }));
}

export async function completeStudentClueSubmissionCloud(sessionId: string, studentId: string) {
  if (!hasSupabaseConfig) return completeStudentClueSubmission(sessionId, studentId);
  await updateCloudSession(sessionId, (session) => completeStudentClue(session, studentId));
}

export async function removeStudentCloud(sessionId: string, studentId: string) {
  if (!hasSupabaseConfig) return removeStudent(sessionId, studentId);
  await updateCloudSession(sessionId, (session) => removeStudentFromSession(session, studentId));
}

export async function setStudentConnectionStatusCloud(sessionId: string, studentId: string, connectionStatus: Student["connectionStatus"]) {
  if (!hasSupabaseConfig) return setStudentConnectionStatus(sessionId, studentId, connectionStatus);
  await updateCloudSession(sessionId, (session) => ({
    ...session,
    students: session.students.map((student) => (student.id === studentId ? { ...student, connectionStatus } : student))
  }));
}

export async function updateTeamAnswerCloud(sessionId: string, teamId: string, roundId: string, answer: string, isCorrect: boolean) {
  if (!hasSupabaseConfig) return updateTeamAnswer(sessionId, teamId, roundId, answer, isCorrect);
  await updateCloudSession(sessionId, (session) => ({
    ...session,
    teams: session.teams.map((team) =>
      team.id === teamId
        ? { ...team, finalAnswers: { ...team.finalAnswers, [roundId]: { answer, isCorrect, submittedAt: new Date().toISOString() } } }
        : team
    )
  }));
}

export async function assignTeamsCloud(sessionId: string, teamCount = 2) {
  if (!hasSupabaseConfig) return assignTeams(sessionId, teamCount);
  await updateCloudSession(sessionId, (session) => {
    const count = Math.max(1, Math.min(teamCount, Math.max(session.students.length, 1)));
    const teams: Team[] = Array.from({ length: count }, (_, index) => ({
      id: session.teams[index]?.id ?? createId(),
      name: `Team ${String.fromCharCode(65 + index)}`,
      memberIds: [],
      finalAnswers: session.teams[index]?.finalAnswers ?? {}
    }));
    const students = session.students.map((student, index) => {
      const team = teams[index % teams.length];
      team.memberIds.push(student.id);
      const status: Student["status"] = session.status === "active" ? "working" : "waiting";
      return { ...student, teamId: team.id, status };
    });
    return { ...session, teams, students };
  });
}

export async function assignStudentToTeamCloud(sessionId: string, studentId: string, teamId: string | null) {
  if (!hasSupabaseConfig) return assignStudentToTeam(sessionId, studentId, teamId);
  await updateCloudSession(sessionId, (session) => ({
    ...session,
    students: session.students.map((student) =>
      student.id === studentId
        ? {
            ...student,
            teamId,
            status: session.status === "active" && teamId ? "working" : "waiting",
            clueId: session.status === "active" ? student.clueId : null,
            clueIds: session.status === "active" ? student.clueIds : [],
            solvedClueIds: session.status === "active" ? student.solvedClueIds : []
          }
        : student
    ),
    teams: session.teams.map((team) => ({
      ...team,
      memberIds: team.id === teamId ? Array.from(new Set([...team.memberIds, studentId])) : team.memberIds.filter((memberId) => memberId !== studentId)
    }))
  }));
}

export async function startSessionCloud(sessionId: string) {
  if (!hasSupabaseConfig) return startSession(sessionId);
  await updateCloudSession(sessionId, (session) => {
    const quest = quests.find((item) => item.id === session.questId) ?? quests[0];
    const round = quest.rounds.find((item) => item.id === session.currentRoundId) ?? quest.rounds[0];
    const teams = session.teams.length ? session.teams : [{ id: createId(), name: "Team A", memberIds: [], finalAnswers: {} }];
    const assignedTeams = teams.map((team) => ({ ...team, memberIds: [...team.memberIds] }));
    const students = session.students.map((student, index) => {
      let teamId = student.teamId;
      if (!teamId) {
        const team = assignedTeams[index % assignedTeams.length];
        team.memberIds.push(student.id);
        teamId = team.id;
      }
      const teamMemberIndex = assignedTeams.find((team) => team.id === teamId)?.memberIds.indexOf(student.id) ?? index;
      return { ...student, teamId, currentRoundId: round.id, clueId: round.clues[teamMemberIndex % round.clues.length].id, status: "working" as const };
    });
    return assignInitialClues({ ...session, teams: assignedTeams, students, phase: "intro", status: "active", isLocked: false }, round);
  });
}

export async function advanceRoundCloud(sessionId: string) {
  if (!hasSupabaseConfig) return advanceRound(sessionId);
  await updateCloudSession(sessionId, (session) => {
    const quest = quests.find((item) => item.id === session.questId) ?? quests[0];
    const currentIndex = quest.rounds.findIndex((round) => round.id === session.currentRoundId);
    const nextRound = quest.rounds[Math.min(currentIndex + 1, quest.rounds.length - 1)];
    return assignInitialClues({
      ...session,
      currentRoundId: nextRound.id,
      phase: "intro",
      students: session.students.map((student) => ({
        ...student,
        currentRoundId: nextRound.id,
        clueId: null,
        clueIds: [],
        solvedClueIds: [],
        status: student.teamId ? "working" : "waiting"
      }))
    }, nextRound);
  });
}

export async function updateLockCloud(sessionId: string, isLocked: boolean) {
  if (!hasSupabaseConfig) return updateLock(sessionId, isLocked);
  await updateCloudSession(sessionId, (session) => ({ ...session, isLocked, status: isLocked ? "paused" : "active" }));
}

export async function updateStatusCloud(sessionId: string, status: ClassSession["status"]) {
  if (!hasSupabaseConfig) return updateStatus(sessionId, status);
  await updateCloudSession(sessionId, (session) => ({ ...session, status }));
}

export async function updatePhaseCloud(sessionId: string, phase: ClassSession["phase"]) {
  if (!hasSupabaseConfig) return updatePhase(sessionId, phase);
  await updateCloudSession(sessionId, (session) => ({ ...session, phase }));
}
