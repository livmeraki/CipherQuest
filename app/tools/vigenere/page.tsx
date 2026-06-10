import { AppNav } from "@/components/AppNav";
import { VigenereTool } from "@/components/tools/VigenereTool";
import { PageShell } from "@/components/ui";

export default function VigenerePage() {
  return <PageShell><AppNav /><div className="mx-auto max-w-4xl"><VigenereTool /></div></PageShell>;
}

