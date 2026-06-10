import { AppNav } from "@/components/AppNav";
import { CaesarTool } from "@/components/tools/CaesarTool";
import { PageShell } from "@/components/ui";

export default function CaesarPage() {
  return <PageShell><AppNav /><div className="mx-auto max-w-4xl"><CaesarTool /></div></PageShell>;
}

