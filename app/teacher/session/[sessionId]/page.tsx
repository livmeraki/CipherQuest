import { AppNav } from "@/components/AppNav";
import { PageShell } from "@/components/ui";
import { TeacherDashboard } from "./TeacherDashboard";

export default async function TeacherSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return (
    <PageShell>
      <AppNav />
      <TeacherDashboard sessionId={sessionId} />
    </PageShell>
  );
}
