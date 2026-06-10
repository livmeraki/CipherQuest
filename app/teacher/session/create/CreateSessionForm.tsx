"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play } from "lucide-react";
import { createClassSession } from "@/lib/classroom-store";
import { quests } from "@/lib/quest-data";
import { Button, Panel } from "@/components/ui";

export function CreateSessionForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <Panel>
      <h1 className="text-3xl font-black">Create Class Session</h1>
      <p className="mt-2 text-ink/70">Choose a quest. A class code will be created for students.</p>
      <div className="mt-5 grid gap-3">
        {quests.map((quest) => (
          <button
            type="button"
            key={quest.id}
            onClick={() => {
              void (async () => {
                try {
                const session = await createClassSession(quest.id);
                router.push(`/teacher/session/${session.id}`);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Could not create the session.");
                }
              })();
            }}
            className="rounded-lg border border-ink/10 bg-paper p-4 text-left hover:border-teal"
          >
            <p className="text-sm font-bold text-teal">{quest.lesson}</p>
            <p className="text-xl font-black">{quest.title}</p>
            <p className="text-sm text-ink/70">{quest.description}</p>
          </button>
        ))}
      </div>
      {error && <p className="mt-4 rounded-md bg-coral/10 p-3 font-semibold text-coral">{error}</p>}
      <Button className="mt-5" disabled><Play size={18} />Supabase auth ready for production setup</Button>
    </Panel>
  );
}
