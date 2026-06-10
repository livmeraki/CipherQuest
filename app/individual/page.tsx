import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { Button, PageShell, Panel } from "@/components/ui";
import { quests } from "@/lib/quest-data";

export default function IndividualPage() {
  return (
    <PageShell>
      <AppNav />
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black">Choose an Individual Quest</h1>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {quests.map((quest) => (
            <Panel key={quest.id}>
              <p className="text-sm font-bold text-teal">{quest.lesson}</p>
              <h2 className="text-xl font-black">{quest.title}</h2>
              <p className="mt-2 text-ink/70">{quest.description}</p>
              <Link href={`/individual/${quest.id}`}><Button className="mt-4">Start quest</Button></Link>
            </Panel>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

