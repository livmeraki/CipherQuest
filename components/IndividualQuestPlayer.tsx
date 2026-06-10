"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Lightbulb } from "lucide-react";
import { isAnswerAccepted, normalizeAnswer } from "@/lib/ciphers";
import type { Quest } from "@/lib/types";
import { Button, Panel, TextArea } from "@/components/ui";
import { CipherSidePanel } from "./CipherSidePanel";

export function IndividualQuestPlayer({ quest }: { quest: Quest }) {
  const [nickname, setNickname] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hintLevel, setHintLevel] = useState<Record<string, number>>({});
  const [finalAnswer, setFinalAnswer] = useState("");
  const [finalCorrect, setFinalCorrect] = useState(false);
  const round = quest.rounds[roundIndex];
  const clue = round.clues[clueIndex];
  const clueSolved = checked[clue.id];
  const allCluesSolved = round.clues.every((item) => checked[item.id]);
  const progress = useMemo(() => {
    const total = quest.rounds.reduce((sum, item) => sum + item.clues.length, 0);
    const done = Object.values(checked).filter(Boolean).length;
    return Math.round((done / total) * 100);
  }, [checked, quest.rounds]);

  if (!hasStarted) {
    return (
      <div className="mx-auto max-w-xl">
        <Panel>
          <p className="text-sm font-bold text-teal">{quest.lesson}</p>
          <h1 className="text-3xl font-black">{quest.title}</h1>
          <p className="mt-2 text-ink/70">Enter a nickname to begin your personal investigation.</p>
          <label className="mt-5 grid gap-1 text-sm font-bold">
            Nickname
            <input
              className="min-h-11 rounded-md border border-ink/15 bg-white px-3 py-2 outline-none ring-teal/20 focus:ring-4"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
          </label>
          <Button className="mt-5" disabled={!nickname.trim()} onClick={() => setHasStarted(true)}>Start quest</Button>
        </Panel>
      </div>
    );
  }

  function checkClue() {
    setChecked((current) => ({
      ...current,
      [clue.id]: normalizeAnswer(drafts[clue.id] || "") === normalizeAnswer(clue.plaintextText)
    }));
  }

  function nextStep() {
    if (clueIndex < round.clues.length - 1) {
      setClueIndex(clueIndex + 1);
      return;
    }
    if (roundIndex < quest.rounds.length - 1) {
      setRoundIndex(roundIndex + 1);
      setClueIndex(0);
      setFinalAnswer("");
      setFinalCorrect(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-5">
        <Panel>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-teal">{quest.lesson}</p>
              <h1 className="text-2xl font-black">{quest.title}</h1>
              <p className="text-sm text-ink/60">Investigator: {nickname}</p>
            </div>
            <div className="rounded-md bg-mint px-3 py-2 text-sm font-black">{progress}% complete</div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full bg-teal transition-all" style={{ width: `${progress}%` }} />
          </div>
        </Panel>

        <Panel>
          <p className="text-sm font-bold text-coral">Round {round.orderIndex}</p>
          <h2 className="text-2xl font-black">{round.title}</h2>
          <p className="mt-2 text-ink/75">{round.story}</p>
        </Panel>

        <Panel>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-xl font-black">Clue {clue.clueIndex}</h3>
            <span className="rounded bg-gold/20 px-2 py-1 text-sm font-bold">{clue.cipherType} key: {clue.cipherKey}</span>
          </div>
          <div className="rounded-md bg-ink p-4 font-mono text-lg text-white">{clue.encryptedText}</div>
          <label className="mt-4 block text-sm font-bold">Your decrypted clue</label>
          <TextArea value={drafts[clue.id] || ""} onChange={(event) => setDrafts({ ...drafts, [clue.id]: event.target.value })} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={checkClue}>Submit clue</Button>
            <Button variant="secondary" onClick={() => setHintLevel({ ...hintLevel, [clue.id]: Math.min((hintLevel[clue.id] || 0) + 1, 3) })}>
              <Lightbulb size={18} />Hint
            </Button>
            {clueSolved && <Button variant="secondary" onClick={nextStep}>Next clue</Button>}
          </div>
          {hintLevel[clue.id] ? <p className="mt-3 rounded-md bg-gold/15 p-3 text-sm font-semibold">{clue.hints[(hintLevel[clue.id] || 1) - 1]}</p> : null}
          {checked[clue.id] === false && <p className="mt-3 rounded-md bg-coral/10 p-3 font-semibold text-coral">Not quite. Check the cipher key and try again.</p>}
          {clueSolved && <p className="mt-3 flex items-center gap-2 rounded-md bg-mint p-3 font-semibold text-teal"><CheckCircle2 size={18} />Correct. Add this to your case board.</p>}
        </Panel>

        {allCluesSolved && (
          <Panel>
            <h3 className="text-xl font-black">Final Team Case Answer</h3>
            <p className="mt-2 text-ink/75">{round.finalQuestion}</p>
            <TextArea value={finalAnswer} onChange={(event) => setFinalAnswer(event.target.value)} />
            <Button className="mt-3" onClick={() => setFinalCorrect(isAnswerAccepted(finalAnswer, round.acceptedAnswers))}>Submit final answer</Button>
            {finalCorrect && (
              <div className="mt-4 rounded-md bg-mint p-4">
                <p className="font-black text-teal">Case solved.</p>
                <p className="mt-1">{round.explanation}</p>
                {roundIndex < quest.rounds.length - 1 && <Button className="mt-3" onClick={nextStep}>Continue</Button>}
              </div>
            )}
          </Panel>
        )}
      </div>
      <CipherSidePanel />
    </div>
  );
}
