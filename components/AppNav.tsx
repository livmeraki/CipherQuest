import Link from "next/link";
import { KeyRound } from "lucide-react";

export function AppNav() {
  return (
    <nav className="mx-auto mb-6 flex max-w-7xl items-center justify-between">
      <Link href="/" className="flex items-center gap-2 text-xl font-black text-ink">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-teal text-white">
          <KeyRound size={22} />
        </span>
        CipherQuest
      </Link>
      <div className="hidden items-center gap-2 text-sm font-semibold sm:flex">
        <Link className="rounded-md px-3 py-2 hover:bg-white" href="/tools/caesar">Caesar</Link>
        <Link className="rounded-md px-3 py-2 hover:bg-white" href="/tools/substitution">Substitution</Link>
        <Link className="rounded-md px-3 py-2 hover:bg-white" href="/tools/vigenere">Vigenere</Link>
      </div>
    </nav>
  );
}

