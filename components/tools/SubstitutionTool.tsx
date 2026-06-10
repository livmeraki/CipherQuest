"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Shuffle } from "lucide-react";
import { ALPHABET, randomSubstitutionAlphabet, substitutionTransform } from "@/lib/ciphers";
import { Button, Panel, TextArea } from "@/components/ui";

export function SubstitutionTool() {
  const [input, setInput] = useState("THE LIBRARY NOTE IS SECRET");
  const [alphabet, setAlphabet] = useState("QWERTYUIOPASDFGHJKLZXCVBNM");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const output = useMemo(() => {
    try {
      return substitutionTransform(input, alphabet, mode);
    } catch {
      return "Enter 26 unique letters for the substitution alphabet.";
    }
  }, [alphabet, input, mode]);

  return (
    <Panel>
      <div className="mb-4">
        <h2 className="text-xl font-black">Substitution Cipher</h2>
        <p className="text-sm text-ink/70">Each plaintext letter is replaced by another letter. Caesar is one special substitution pattern.</p>
      </div>
      <div className="flex rounded-md border border-ink/15 bg-white p-1">
        {(["encrypt", "decrypt"] as const).map((item) => (
          <button key={item} onClick={() => setMode(item)} className={`rounded px-3 py-1.5 text-sm font-bold ${mode === item ? "bg-teal text-white" : "text-ink/70"}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="my-4 grid gap-3 overflow-x-auto font-mono text-sm">
        <div>Original: {ALPHABET}</div>
        <label className="grid gap-1 font-sans text-sm font-bold">
          Substitution alphabet
          <input className="rounded-md border border-ink/15 px-3 py-2 font-mono" value={alphabet} onChange={(event) => setAlphabet(event.target.value.toUpperCase())} />
        </label>
      </div>
      <TextArea value={input} onChange={(event) => setInput(event.target.value)} />
      <div className="mt-4 min-h-20 rounded-md border border-ink/15 bg-mint/60 p-3 font-mono">{output}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setAlphabet(randomSubstitutionAlphabet())}><Shuffle size={18} />Random</Button>
        <Button variant="secondary" onClick={() => setAlphabet(ALPHABET)}><RotateCcw size={18} />Reset</Button>
      </div>
    </Panel>
  );
}

