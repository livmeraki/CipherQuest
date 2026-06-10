import { AppNav } from "@/components/AppNav";
import { PageShell } from "@/components/ui";
import { StudentQuest } from "./StudentQuest";

export default async function StudentClassPage({ params }: { params: Promise<{ sessionId: string; studentId: string }> }) {
  const { sessionId, studentId } = await params;
  return (
    <PageShell>
      <AppNav />
      <StudentQuest sessionId={sessionId} studentId={studentId} />
    </PageShell>
  );
}
