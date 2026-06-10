"use client";

import { useMemo, useState } from "react";
import { KeyRound } from "lucide-react";
import { repeatedKeywordFor, vigenereTransform } from "@/lib/ciphers";
import { Button, Input, Panel, TextArea } from "@/components/ui";

export function VigenereTool({ compact = false }: { compact?: boolean }) {
  const [input, setInput] = useState("KEY IS LOCK");
  const [keyword, setKeyword] = useState("LOCK");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("decrypt");
  const output = useMemo(() => vigenereTransform(input, keyword, mode), [input, keyword, mode]);
  const repeated = repeatedKeywordFor(input, keyword);

  return (
    <Panel className={compact ? "p-4" : ""}>
      <div className="mb-4">
        <h2 className="text-xl font-black">Vigenere Cipher</h2>
        <p className="text-sm text-ink/70">Each letter shifts according to the matching keyword letter.</p>
      </div>
      <div className="mb-4 flex rounded-md border border-ink/15 bg-white p-1">
        {(["encrypt", "decrypt"] as const).map((item) => (
          <button key={item} onClick={() => setMode(item)} className={`rounded px-3 py-1.5 text-sm font-bold ${mode === item ? "bg-teal text-white" : "text-ink/70"}`}>
            {item}
          </button>
        ))}
      </div>
      <label className="text-sm font-bold">Keyword</label>
      <Input value={keyword} onChange={(event) => setKeyword(event.target.value.toUpperCase())} />
      <label className="mt-4 block text-sm font-bold">Input</label>
      <TextArea value={input} onChange={(event) => setInput(event.target.value)} />
      <div className="mt-3 overflow-x-auto rounded-md bg-paper p-3 font-mono text-sm">
        <div className="text-coral">{repeated || "Keyword row appears here"}</div>
        <div>{input || "Message row appears here"}</div>
      </div>
      <div className="mt-4 min-h-20 rounded-md border border-ink/15 bg-mint/60 p-3 font-mono">{output}</div>
      <Button className="mt-4" variant="secondary" onClick={() => setInput(output)}><KeyRound size={18} />Move output to input</Button>
    </Panel>
  );
}

