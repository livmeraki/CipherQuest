"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClassSession } from "@/lib/classroom-store";
import { quests } from "@/lib/quest-data";
import { Button, Panel } from "@/components/ui";

export function CreateSessionForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [creatingQuestId, setCreatingQuestId] = useState<string | null>(null);

  return (
    <Panel>
      <h1 className="text-3xl font-black">Create Class Session</h1>
      <p className="mt-2 text-ink/70">Choose a quest. A class code will be created for students.</p>
      <div className="mt-5 grid gap-3">
        {quests.map((quest) => (
          <button
            type="button"
            key={quest.id}
            disabled={Boolean(creatingQuestId)}
            onClick={() => {
              void (async () => {
                try {
                  setError("");
                  setCreatingQuestId(quest.id);
                  const session = await createClassSession(quest.id);
                  router.push(`/teacher/session/${session.id}`);
                } catch (err) {
                  setCreatingQuestId(null);
                  setError(err instanceof Error ? err.message : "Could not create the session.");
                }
              })();
            }}
            className="rounded-lg border border-ink/10 bg-paper p-4 text-left transition hover:border-teal disabled:cursor-wait disabled:opacity-70"
          >
            <p className="text-sm font-bold text-teal">{quest.lesson}</p>
            <p className="flex items-center gap-2 text-xl font-black">
              {quest.title}
              {creatingQuestId === quest.id && <Loader2 className="animate-spin" size={18} />}
            </p>
            <p className="text-sm text-ink/70">{quest.description}</p>
          </button>
        ))}
      </div>
      {error && <p className="mt-4 rounded-md bg-coral/10 p-3 font-semibold text-coral">{error}</p>}
      {creatingQuestId && <p className="mt-4 rounded-md bg-mint p-3 font-semibold text-teal">Creating the class session and class code...</p>}
    </Panel>
  );
}
