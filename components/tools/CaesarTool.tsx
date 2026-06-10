"use client";

import { useMemo, useState } from "react";
import { Copy, RotateCcw, Trash2 } from "lucide-react";
import { ALPHABET, caesarDecrypt, caesarEncrypt } from "@/lib/ciphers";
import { Button, Panel, TextArea } from "@/components/ui";

export function CaesarTool({ compact = false }: { compact?: boolean }) {
  const [input, setInput] = useState("HELLO");
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const output = useMemo(() => (mode === "encrypt" ? caesarEncrypt(input, shift) : caesarDecrypt(input, shift)), [input, mode, shift]);
  const shifted = ALPHABET.split("").map((letter) => caesarEncrypt(letter, shift));
  const lastLetter = [...input].reverse().find((letter) => /[a-z]/i.test(letter))?.toUpperCase();

  return (
    <Panel className={compact ? "p-4" : ""}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Caesar Cipher</h2>
          <p className="text-sm text-ink/70">Caesar cipher shifts each letter by the same number.</p>
        </div>
        <div className="flex rounded-md border border-ink/15 bg-white p-1">
          {(["encrypt", "decrypt"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`rounded px-3 py-1.5 text-sm font-bold ${mode === item ? "bg-teal text-white" : "text-ink/70"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <label className="text-sm font-bold">Input</label>
      <TextArea value={input} onChange={(event) => setInput(event.target.value)} />

      <div className="my-4">
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span>Shift key</span>
          <span className="rounded bg-gold/15 px-2 py-1">{shift}</span>
        </div>
        <input className="w-full accent-teal" min={0} max={25} type="range" value={shift} onChange={(event) => setShift(Number(event.target.value))} />
      </div>

      <div className="overflow-x-auto rounded-md border border-ink/10 bg-paper p-3 font-mono text-sm">
        <div className="mb-2 flex gap-2">
          {ALPHABET.split("").map((letter) => (
            <span key={letter} className={`grid h-8 w-8 shrink-0 place-items-center rounded ${lastLetter === letter ? "bg-coral text-white" : "bg-white"}`}>
              {letter}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          {shifted.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded transition ${lastLetter === ALPHABET[index] ? "translate-y-1 bg-teal text-white" : "bg-mint"}`}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      <label className="mt-4 block text-sm font-bold">Output</label>
      <div className="min-h-20 rounded-md border border-ink/15 bg-mint/60 p-3 font-mono">{output || "Output appears here"}</div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(output)}><Copy size={18} />Copy</Button>
        <Button variant="secondary" onClick={() => setInput("HELLO")}><RotateCcw size={18} />Example</Button>
        <Button variant="secondary" onClick={() => setInput("")}><Trash2 size={18} />Clear</Button>
      </div>
    </Panel>
  );
}

