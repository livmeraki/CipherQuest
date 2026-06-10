"use client";

import { useState } from "react";
import { CaesarTool } from "./tools/CaesarTool";
import { SubstitutionTool } from "./tools/SubstitutionTool";
import { VigenereTool } from "./tools/VigenereTool";

export function CipherSidePanel() {
  const [tab, setTab] = useState<"caesar" | "substitution" | "vigenere">("caesar");
  return (
    <aside className="space-y-3">
      <div className="grid grid-cols-3 rounded-md border border-ink/15 bg-white p-1 text-sm font-bold">
        {(["caesar", "substitution", "vigenere"] as const).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`rounded px-2 py-2 capitalize ${tab === item ? "bg-teal text-white" : "text-ink/70"}`}>
            {item}
          </button>
        ))}
      </div>
      {tab === "caesar" && <CaesarTool compact />}
      {tab === "substitution" && <SubstitutionTool />}
      {tab === "vigenere" && <VigenereTool compact />}
    </aside>
  );
}

