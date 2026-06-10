import { AppNav } from "@/components/AppNav";
import { SubstitutionTool } from "@/components/tools/SubstitutionTool";
import { PageShell } from "@/components/ui";

export default function SubstitutionPage() {
  return <PageShell><AppNav /><div className="mx-auto max-w-4xl"><SubstitutionTool /></div></PageShell>;
}

