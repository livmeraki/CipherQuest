"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { joinClassSession } from "@/lib/classroom-store";
import { Button, Input, Panel } from "@/components/ui";

export function JoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  return (
    <Panel>
      <h1 className="text-3xl font-black">Join Class Quest</h1>
      <p className="mt-2 text-ink/70">Enter the class code from your teacher and choose a nickname.</p>
      <div className="mt-5 grid gap-4">
        <label className="grid gap-1 text-sm font-bold">Class code<Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} /></label>
        <label className="grid gap-1 text-sm font-bold">Nickname<Input value={nickname} onChange={(event) => setNickname(event.target.value)} /></label>
      </div>
      {error && <p className="mt-3 rounded-md bg-coral/10 p-3 font-semibold text-coral">{error}</p>}
      <Button
        className="mt-5"
        onClick={() => {
          void (async () => {
            try {
            const result = await joinClassSession(code, nickname.trim());
            router.push(`/class/${result.session.id}/student/${result.student.id}`);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not join.");
            }
          })();
        }}
        disabled={!code || !nickname.trim()}
      >
        <LogIn size={18} />Join
      </Button>
    </Panel>
  );
}
