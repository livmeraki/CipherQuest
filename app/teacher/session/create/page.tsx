import { AppNav } from "@/components/AppNav";
import { PageShell } from "@/components/ui";
import { CreateSessionForm } from "./CreateSessionForm";

export default function CreateSessionPage() {
  return (
    <PageShell>
      <AppNav />
      <div className="mx-auto max-w-3xl"><CreateSessionForm /></div>
    </PageShell>
  );
}

