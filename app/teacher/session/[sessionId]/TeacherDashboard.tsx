"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Lock, Play, RotateCcw, SkipForward, Unlock } from "lucide-react";
import {
  advanceRoundCloud,
  assignStudentToTeamCloud,
  assignTeamsCloud,
  startSessionCloud,
  subscribeClassSession,
  updateLockCloud,
  updateStatusCloud
} from "@/lib/classroom-store";
import { getQuest } from "@/lib/quest-data";
import type { ClassSession } from "@/lib/types";
import { Button, Panel } from "@/components/ui";

export function TeacherDashboard({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<ClassSession | null>(null);

  useEffect(() => {
    return subscribeClassSession(sessionId, setSession);
  }, [sessionId]);

  const quest = session ? getQuest(session.questId) : null;
  const round = quest?.rounds.find((item) => item.id === session?.currentRoundId);
  const stats = useMemo(() => {
    const submitted = session?.students.filter((student) => student.status === "submitted" || student.status === "correct").length ?? 0;
    return { submitted, total: session?.students.length ?? 0 };
  }, [session]);

  if (!session || !quest || !round) {
    return (
      <div className="mx-auto max-w-2xl">
        <Panel>
          <p className="text-sm font-bold text-coral">No saved class session found</p>
          <h1 className="mt-1 text-3xl font-black">Create a new class session</h1>
          <p className="mt-3 text-ink/70">
            Class sessions in this MVP demo are stored in this browser. If you opened an old dashboard link, used a different browser, or cleared browser storage, the app cannot find that session.
          </p>
          <Link href="/teacher/session/create">
            <Button className="mt-5">Create session</Button>
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-5">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-teal">Class code</p>
            <h1 className="font-mono text-5xl font-black">{session.code}</h1>
            <p className="mt-2 text-ink/70">{quest.title} · {round.title}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void startSessionCloud(session.id)} disabled={!session.students.length}><Play size={18} />Start quest</Button>
            <Button variant="secondary" onClick={() => void updateStatusCloud(session.id, "paused")}>Pause</Button>
            <Button variant="secondary" onClick={() => void updateStatusCloud(session.id, "active")}>Resume</Button>
            <Button variant={session.isLocked ? "secondary" : "danger"} onClick={() => void updateLockCloud(session.id, !session.isLocked)}>
              {session.isLocked ? <Unlock size={18} /> : <Lock size={18} />}{session.isLocked ? "Unlock" : "Lock"}
            </Button>
            <Button variant="secondary" onClick={() => void advanceRoundCloud(session.id)}><SkipForward size={18} />Next level</Button>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel>
          <p className="text-sm font-bold text-ink/60">Students</p>
          <p className="text-4xl font-black">{session.students.length}</p>
        </Panel>
        <Panel>
          <p className="text-sm font-bold text-ink/60">Clues submitted</p>
          <p className="text-4xl font-black">{stats.submitted}/{stats.total}</p>
        </Panel>
        <Panel>
          <p className="text-sm font-bold text-ink/60">Screen lock</p>
          <p className="text-4xl font-black">{session.isLocked ? "On" : "Off"}</p>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Team Setup</h2>
            <p className="mt-1 text-sm text-ink/70">
              Students wait in staging until you split teams and start the quest.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void assignTeamsCloud(session.id, 2)} disabled={session.status === "active" || session.students.length < 2}>Split into 2</Button>
            <Button variant="secondary" onClick={() => void assignTeamsCloud(session.id, 3)} disabled={session.status === "active" || session.students.length < 3}>Split into 3</Button>
            <Button variant="secondary" onClick={() => void assignTeamsCloud(session.id, 4)} disabled={session.status === "active" || session.students.length < 4}>Split into 4</Button>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black">Progress Table</h2>
          <Button variant="secondary" onClick={() => void updateStatusCloud(session.id, "active")}>
            <RotateCcw size={18} />Reset level
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10">
                {["student name", "connection", "team", "current level", "clue assigned", "clue submitted?", "final answer?", "status"].map((head) => (
                  <th key={head} className="p-3 font-black">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {session.students.map((student) => {
                const team = session.teams.find((item) => item.id === student.teamId);
                const clue = round.clues.find((item) => item.id === student.clueId);
                const final = team?.finalAnswers[round.id];
                return (
                  <tr key={student.id} className="border-b border-ink/5">
                    <td className="p-3">{student.nickname}</td>
                    <td className="p-3">
                      <span className={`rounded px-2 py-1 font-bold ${student.connectionStatus === "online" ? "bg-mint text-teal" : "bg-coral/10 text-coral"}`}>
                        {student.connectionStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      {session.status === "active" ? (
                        team?.name ?? "Unassigned"
                      ) : (
                        <select
                          className="min-h-10 rounded-md border border-ink/15 bg-white px-2 py-1 font-semibold"
                          value={student.teamId ?? ""}
                          onChange={(event) => void assignStudentToTeamCloud(session.id, student.id, event.target.value || null)}
                        >
                          <option value="">Unassigned</option>
                          {session.teams.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="p-3">{round.orderIndex}</td>
                    <td className="p-3">{clue?.clueIndex ?? "Waiting"}</td>
                    <td className="p-3">{student.status === "submitted" || student.status === "correct" ? "yes" : "no"}</td>
                    <td className="p-3">{final ? (final.isCorrect ? "correct" : "submitted") : "no"}</td>
                    <td className="p-3"><span className="rounded bg-mint px-2 py-1 font-bold">{student.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        {session.teams.map((team) => (
          <Panel key={team.id}>
            <h3 className="text-xl font-black">{team.name}</h3>
            <p className="mt-1 text-sm text-ink/70">{team.memberIds.length} members</p>
            <div className="mt-3 space-y-2">
              {team.memberIds.map((id) => {
                const student = session.students.find((item) => item.id === id);
                return <p key={id} className="rounded-md bg-paper p-2">{student?.nickname}</p>;
              })}
            </div>
            <div className="mt-4 rounded-md bg-ink p-3 text-white">
              <Eye size={18} />
              <p className="mt-2 text-sm">Team answer: {team.finalAnswers[round.id]?.answer || "Not submitted yet"}</p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
