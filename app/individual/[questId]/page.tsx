import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { IndividualQuestPlayer } from "@/components/IndividualQuestPlayer";
import { PageShell } from "@/components/ui";
import { getQuest } from "@/lib/quest-data";

export default async function IndividualQuestPage({ params }: { params: Promise<{ questId: string }> }) {
  const { questId } = await params;
  const quest = getQuest(questId);
  if (!quest) notFound();
  return (
    <PageShell>
      <AppNav />
      <IndividualQuestPlayer quest={quest} />
    </PageShell>
  );
}
