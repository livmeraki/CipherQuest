import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { Button, PageShell, Panel } from "@/components/ui";

export default function HomePage() {
  return (
    <PageShell>
      <AppNav />
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="py-8">
          <p className="mb-3 text-sm font-black uppercase tracking-wide text-coral">Two-lesson classroom cryptography quest</p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight text-ink sm:text-6xl">CipherQuest</h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-ink/75">
            Students decrypt school mystery clues, combine evidence with teammates, and learn why modern encryption matters.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/teacher/session/create"><Button>Teacher Mode</Button></Link>
            <Link href="/join"><Button variant="secondary">Student Join</Button></Link>
            <Link href="/individual"><Button variant="secondary">Individual Mode</Button></Link>
          </div>
        </div>
        <Panel className="self-start">
          <div className="rounded-md bg-ink p-5 text-white">
            <p className="font-mono text-mint">WKH EDG JXBV ZDQW VWXGHQW SDVVZRUGV.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {["Plaintext", "Ciphertext", "Key", "Caesar"].map((term) => (
              <div key={term} className="rounded-md border border-ink/10 bg-paper p-4">
                <p className="font-black">{term}</p>
                <p className="text-sm text-ink/70">A core idea students meet through play.</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </PageShell>
  );
}

