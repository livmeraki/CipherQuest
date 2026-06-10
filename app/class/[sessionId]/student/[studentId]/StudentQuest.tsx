"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Lightbulb } from "lucide-react";
import {
  setStudentConnectionStatusCloud,
  setStudentStatusCloud,
  subscribeClassSession,
  updateTeamAnswerCloud
} from "@/lib/classroom-store";
import { getQuest } from "@/lib/quest-data";
import { isAnswerAccepted, normalizeAnswer } from "@/lib/ciphers";
import type { ClassSession } from "@/lib/types";
import { Button, Panel, TextArea } from "@/components/ui";
import { CipherSidePanel } from "@/components/CipherSidePanel";

export function StudentQuest({ sessionId, studentId }: { sessionId: string; studentId: string }) {
  const [session, setSession] = useState<ClassSession | null>(null);
  const [decrypted, setDecrypted] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    return subscribeClassSession(sessionId, setSession);
  }, [sessionId]);

  useEffect(() => {
    void setStudentConnectionStatusCloud(sessionId, studentId, "online");
    const markOffline = () => {
      void setStudentConnectionStatusCloud(sessionId, studentId, "offline");
    };
    window.addEventListener("pagehide", markOffline);
    window.addEventListener("beforeunload", markOffline);
    return () => {
      window.removeEventListener("pagehide", markOffline);
      window.removeEventListener("beforeunload", markOffline);
    };
  }, [sessionId, studentId]);

  const state = useMemo(() => {
    const quest = session ? getQuest(session.questId) : null;
    const round = quest?.rounds.find((item) => item.id === session?.currentRoundId);
    const student = session?.students.find((item) => item.id === studentId);
    const team = session?.teams.find((item) => item.id === student?.teamId);
    const clue = student?.clueId ? round?.clues.find((item) => item.id === student.clueId) : null;
    return { quest, round, student, team, clue };
  }, [session, studentId]);

  if (!session || !state.quest || !state.round || !state.student) {
    return <Panel>Student session not found. Rejoin with your class code.</Panel>;
  }

  if (session.status !== "active" || !state.team || !state.clue) {
    return (
      <div className="mx-auto max-w-3xl">
        <Panel>
          <p className="text-sm font-bold text-teal">Class code {session.code}</p>
          <h1 className="mt-1 text-3xl font-black">Waiting for the teacher</h1>
          <p className="mt-3 text-ink/70">
            You are in the staging area. Your teacher will split the class into teams and start the quest when everyone is ready.
          </p>
          <div className="mt-5 rounded-md bg-mint p-4">
            <p className="font-black">Your status</p>
            <p className="mt-1">Nickname: {state.student.nickname}</p>
            <p>Team: {state.team?.name ?? "Not assigned yet"}</p>
            <p>Quest: {state.quest.title}</p>
          </div>
        </Panel>
        <Panel className="mt-5">
          <h2 className="text-xl font-black">Joined Students</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {session.students.map((student) => {
              const team = session.teams.find((item) => item.id === student.teamId);
              return (
                <div key={student.id} className="rounded-md border border-ink/10 bg-paper p-3">
                  <p className="font-black">{student.nickname}</p>
                  <p className="text-sm text-ink/60">{team?.name ?? "Waiting for team"}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    );
  }

  const ownClueCorrect = state.student.status === "submitted" || state.student.status === "correct";
  const teamMembers = session.students.filter((student) => state.team?.memberIds.includes(student.id));
  const visibleTeammates = teamMembers.filter((student) => student.status === "submitted" || student.status === "correct");

  return (
    <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      {session.isLocked && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/95 p-6 text-center text-white">
          <div>
            <p className="text-5xl font-black">Quest paused.</p>
            <p className="mt-4 text-2xl text-mint">Eyes on teacher.</p>
          </div>
        </div>
      )}
      <div className="space-y-5">
        <Panel>
          <p className="text-sm font-bold text-teal">{state.team.name}</p>
          <h1 className="text-3xl font-black">{state.quest.title}</h1>
          <p className="mt-2 text-ink/70">{state.round.story}</p>
        </Panel>
        <Panel>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-black">Your encrypted clue</h2>
            <span className="rounded bg-gold/20 px-2 py-1 text-sm font-bold">{state.clue.cipherType} key: {state.clue.cipherKey}</span>
          </div>
          <div className="rounded-md bg-ink p-4 font-mono text-lg text-white">{state.clue.encryptedText}</div>
          <label className="mt-4 block text-sm font-bold">Decrypted clue</label>
          <TextArea disabled={session.isLocked} value={decrypted} onChange={(event) => setDecrypted(event.target.value)} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              disabled={session.isLocked}
              onClick={() => {
                const correct = normalizeAnswer(decrypted) === normalizeAnswer(state.clue!.plaintextText);
                void setStudentStatusCloud(session.id, studentId, correct ? "submitted" : "needs_help");
                setFeedback(correct ? "Correct. Your clue is now available to your team." : "Not quite. Try the cipher tool and check the key.");
              }}
            >
              Submit clue
            </Button>
            <Button disabled={session.isLocked} variant="secondary" onClick={() => setHintLevel(Math.min(hintLevel + 1, 3))}>
              <Lightbulb size={18} />Hint
            </Button>
          </div>
          {hintLevel > 0 && <p className="mt-3 rounded-md bg-gold/15 p-3 text-sm font-semibold">{state.clue.hints[hintLevel - 1]}</p>}
          {feedback && <p className="mt-3 rounded-md bg-mint p-3 font-semibold text-teal">{feedback}</p>}
        </Panel>
        <Panel>
          <h2 className="text-xl font-black">Team Clue Board</h2>
          <div className="mt-3 grid gap-3">
            {teamMembers.map((student) => {
              const clue = state.round?.clues.find((item) => item.id === student.clueId);
              const isVisible = student.status === "submitted" || student.status === "correct";
              return (
                <div key={student.id} className="rounded-md border border-ink/10 bg-paper p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black">{student.nickname}</p>
                    <span className="rounded bg-white px-2 py-1 text-xs font-bold">{isVisible ? "submitted" : "working"}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink/70">
                    {isVisible
                      ? student.id === studentId
                        ? decrypted
                        : clue?.plaintextText
                      : student.id === studentId
                        ? "Submit your clue to share it with the team."
                        : "Waiting for this teammate to submit."}
                  </p>
                </div>
              );
            })}
            {!visibleTeammates.length && teamMembers.length <= 1 && (
              <p className="text-ink/60">No teammates have joined this team yet. Join another student with the same class code.</p>
            )}
          </div>
        </Panel>
        {ownClueCorrect && (
          <Panel>
            <h2 className="text-xl font-black">Final Team Answer</h2>
            <p className="mt-2 text-ink/70">{state.round.finalQuestion}</p>
            <TextArea disabled={session.isLocked} value={finalAnswer} onChange={(event) => setFinalAnswer(event.target.value)} />
            <Button
              disabled={session.isLocked}
              className="mt-3"
              onClick={() => {
                const correct = isAnswerAccepted(finalAnswer, state.round!.acceptedAnswers);
                void updateTeamAnswerCloud(session.id, state.team!.id, state.round!.id, finalAnswer, correct);
              }}
            >
              <CheckCircle2 size={18} />Submit final
            </Button>
            {state.team.finalAnswers[state.round.id] && (
              <p className="mt-3 rounded-md bg-mint p-3 font-semibold text-teal">
                {state.team.finalAnswers[state.round.id].isCorrect ? "Correct. Case solved." : "Submitted. Keep refining your evidence."}
              </p>
            )}
          </Panel>
        )}
      </div>
      <CipherSidePanel />
    </div>
  );
}
